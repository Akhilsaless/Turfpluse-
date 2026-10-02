import { createHash } from "node:crypto";
import type { Meeting, Change, Race } from "../src/live/types";
import { snapshot, normalise, latestSnapshot } from "../src/live/model";
export function validateChange(raw: unknown): Change {
  if (!raw || typeof raw !== "object") throw new Error("Invalid change");
  const c = raw as Change;
  for (const key of [
    "id",
    "meetingId",
    "raceId",
    "kind",
    "reason",
    "sourceUrl",
    "publishedAt",
  ] as const)
    if (typeof c[key] !== "string" || !c[key].trim() || c[key].length > 2000)
      throw new Error(`Invalid ${key}`);
  if (
    ![
      "scratch",
      "reinstate",
      "jockey",
      "going",
      "delay",
      "status",
      "odds",
      "pace",
      "form",
      "result",
      "notice",
    ].includes(c.kind)
  )
    throw new Error("Unknown change kind");
  if (
    c.runnerId !== undefined &&
    (typeof c.runnerId !== "string" || c.runnerId.length > 100)
  )
    throw new Error("Invalid runner identity");
  if (new URL(c.sourceUrl).protocol !== "https:")
    throw new Error("HTTPS source evidence required");
  if (
    !Number.isFinite(Date.parse(c.publishedAt)) ||
    Date.parse(c.publishedAt) > Date.now() + 300000
  )
    throw new Error("Invalid publication time");
  return c;
}
export function applyChange(
  current: Meeting,
  raw: unknown,
  actor: string,
  retrievedAt = new Date().toISOString(),
): Meeting {
  const c = validateChange(raw);
  if (c.meetingId !== current.id) throw new Error("Wrong meeting");
  const checksum = createHash("sha256").update(JSON.stringify(c)).digest("hex");
  const duplicate = current.events.find((e) => e.id === c.id);
  if (duplicate) {
    if (duplicate.checksum !== checksum)
      throw new Error("Conflicting event identity");
    return current;
  }
  const next = structuredClone(current);
  const race = next.races.find((r) => r.id === c.raceId);
  if (!race) throw new Error("Unknown race");
  if (Date.parse(c.publishedAt) < Date.parse(current.source.retrievedAt))
    throw new Error("Historical notices cannot mutate this meeting");
  const runner = race.runners.find((r) => r.id === c.runnerId);
  if (
    ["scratch", "reinstate", "jockey", "odds", "pace", "form"].includes(
      c.kind,
    ) &&
    !runner
  )
    throw new Error("Unknown runner");
  if (
    (race.results.length || ["finished", "cancelled"].includes(race.status)) &&
    !["result", "notice"].includes(c.kind)
  )
    throw new Error("Race closed to prediction changes");
  // Reject out-of-order writes to the same fact. Different sources are resolved by adapter priority first.
  if (
    current.events.some(
      (e) =>
        e.raceId === c.raceId &&
        e.runnerId === c.runnerId &&
        (e.kind === c.kind ||
          (["scratch", "reinstate"].includes(e.kind) &&
            ["scratch", "reinstate"].includes(c.kind))) &&
        Date.parse(e.publishedAt) > Date.parse(c.publishedAt),
    )
  )
    throw new Error("Outdated change");
  const before = structuredClone(race);
  const text = () => {
    if (typeof c.value !== "string" || !c.value.trim() || c.value.length > 1000)
      throw new Error("Invalid text value");
    return c.value.trim();
  };
  switch (c.kind) {
    case "scratch":
      if (runner!.status === "scratched") throw new Error("Already scratched");
      runner!.status = "scratched";
      break;
    case "reinstate":
      if (runner!.status !== "scratched") throw new Error("Already declared");
      runner!.status = "declared";
      break;
    case "jockey":
      runner!.jockey = text();
      break;
    case "going":
      race.going = text();
      break;
    case "delay": {
      const time = text();
      if (
        !Number.isFinite(Date.parse(time)) ||
        new Date(time).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }) !== next.date
      )
        throw new Error("Invalid meeting time");
      race.scheduledAt = time;
      race.status = "delayed";
      break;
    }
    case "status":
      if (
        !["scheduled", "delayed", "running", "cancelled"].includes(
          String(c.value),
        )
      )
        throw new Error("Invalid status");
      race.status = c.value as Race["status"];
      break;
    case "odds":
      if (
        typeof c.value !== "number" ||
        !Number.isFinite(c.value) ||
        c.value <= 1 ||
        c.value > 10000
      )
        throw new Error("Invalid decimal odds");
      runner!.odds = c.value;
      break;
    case "pace":
      if (!["leader", "stalker", "closer"].includes(String(c.value)))
        throw new Error("Invalid pace");
      runner!.pace = c.value as "leader" | "stalker" | "closer";
      break;
    case "form":
      runner!.form = text();
      break;
    case "notice":
      text();
      break;
    case "result": {
      const value = c.value as { stage: string; placings: string[] };
      if (
        !value ||
        !["provisional", "official", "corrected"].includes(value.stage) ||
        !Array.isArray(value.placings) ||
        !value.placings.length ||
        new Set(value.placings).size !== value.placings.length ||
        value.placings.some(
          (id) =>
            !race.runners.some((r) => r.id === id && r.status === "declared"),
        )
      )
        throw new Error("Invalid result");
      const previous = race.results.at(-1);
      if (
        previous &&
        Date.parse(c.publishedAt) <= Date.parse(previous.publishedAt)
      )
        throw new Error("Result version must advance publication time");
      if (
        value.stage === "corrected" &&
        (!previous || previous.stage === "provisional")
      )
        throw new Error("Correction requires an official result");
      if (
        previous &&
        previous.stage !== "provisional" &&
        value.stage !== "corrected"
      )
        throw new Error("Official results require a correction version");
      race.results.push({
        eventId: c.id,
        version: race.results.length + 1,
        stage: value.stage as "official",
        placings: value.placings,
        publishedAt: c.publishedAt,
        sourceUrl: c.sourceUrl,
      });
      race.status = "finished";
      break;
    }
  }
  if (c.kind === "scratch") {
    const old = latestSnapshot(current, race.id).probabilities;
    const temporary = {
      ...Object.fromEntries(race.runners.map((r) => [r.id, 0])),
      ...normalise(
        Object.fromEntries(
          race.runners
            .filter((r) => r.status === "declared")
            .map((r) => [r.id, old[r.id]]),
        ),
      ),
    };
    next.snapshots.push(
      snapshot(race, retrievedAt, "temporary", c.id, temporary),
    );
  }
  if (!["result", "notice", "status"].includes(c.kind))
    next.snapshots.push(snapshot(race, retrievedAt, "recalculated", c.id));
  next.events.push({
    ...c,
    actor,
    retrievedAt,
    before,
    after: structuredClone(race),
    checksum,
  });
  next.revision++;
  next.updatedAt = retrievedAt;
  return next;
}
