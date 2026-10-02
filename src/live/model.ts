import type { Race, Probabilities, Snapshot, Meeting } from "./types";
import seed from "./october3.json";
export const MODEL = "declarations-baseline-v1";
// A transparent, uncalibrated baseline. Never fabricates pace/form/market data.
export function normalise(weights: Probabilities): Probabilities {
  const entries = Object.entries(weights);
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  if (!sum) return Object.fromEntries(entries.map(([id]) => [id, 0]));
  const fractions = entries.map(([id, w]) => ({
    id,
    exact: (w / sum) * 10000,
    units: Math.floor((w / sum) * 10000),
  }));
  let remaining = 10000 - fractions.reduce((s, x) => s + x.units, 0);
  const ordered = [...fractions].sort(
    (a, b) =>
      b.exact - b.units - (a.exact - a.units) || a.id.localeCompare(b.id),
  );
  for (const item of ordered) if (remaining-- > 0) item.units++;
  return Object.fromEntries(fractions.map((x) => [x.id, x.units / 100]));
}
export function predict(race: Race): Probabilities {
  const active = race.runners.filter((r) => r.status === "declared");
  const leaders = active.filter((r) => r.pace === "leader").length;
  const scores = Object.fromEntries(
    active.map((r) => {
      // rating less declared weight; no unverified jockey strike rates or going preferences.
      const paceEffect =
        r.pace === "leader"
          ? leaders > 1
            ? -1.5 * (leaders - 1)
            : 1
          : r.pace === "closer" && leaders > 1
            ? 1
            : 0;
      return [r.id, Math.exp((r.rating - 2 * r.weight + paceEffect) / 12)];
    }),
  );
  return {
    ...Object.fromEntries(race.runners.map((r) => [r.id, 0])),
    ...normalise(scores),
  };
}
export function snapshot(
  race: Race,
  at: string,
  phase: Snapshot["phase"],
  eventId: string | null,
  probabilities = predict(race),
): Snapshot {
  return {
    id: `${race.id}:${eventId ?? "declarations"}:${phase}`,
    raceId: race.id,
    at,
    phase,
    eventId,
    probabilities,
    confidence: "Low",
    model: MODEL,
    evidence:
      "Uncalibrated rating/declared-weight baseline. Historical form, market and going suitability unavailable; pace used only when sourced.",
  };
}
export function initialMeeting(): Meeting {
  const meeting = structuredClone(seed) as Meeting;
  meeting.snapshots = meeting.races.map((r) =>
    snapshot(r, meeting.source.retrievedAt, "initial", null),
  );
  return meeting;
}
export function latestSnapshot(meeting: Meeting, raceId: string) {
  return meeting.snapshots.filter((s) => s.raceId === raceId).at(-1)!;
}
export function performance(meeting: Meeting) {
  const records = meeting.races.flatMap((race) => {
    const result = race.results.at(-1);
    if (!result || result.stage === "provisional") return [];
    // Freeze the most recent prediction BEFORE the first result publication, even after corrections.
    const firstResult = race.results[0];
    const frozen = meeting.snapshots
      .filter(
        (s) =>
          s.raceId === race.id &&
          Date.parse(s.at) < Date.parse(firstResult.publishedAt),
      )
      .at(-1);
    if (!frozen) return [];
    const entries = Object.entries(frozen.probabilities).filter(
      ([, p]) => p > 0,
    );
    const winner = result.placings[0];
    if (!entries.some(([id]) => id === winner)) return [];
    const top = [...entries].sort((a, b) => b[1] - a[1])[0];
    return [
      {
        raceId: race.id,
        version: result.version,
        topPick: top[0],
        winner,
        hit: top[0] === winner,
        brier: entries.reduce(
          (s, [id, p]) => s + (p / 100 - (id === winner ? 1 : 0)) ** 2,
          0,
        ),
        probabilities: frozen.probabilities,
      },
    ];
  });
  return {
    records,
    hitRate: records.length
      ? records.filter((r) => r.hit).length / records.length
      : null,
    brier: records.length
      ? records.reduce((s, r) => s + r.brier, 0) / records.length
      : null,
  };
}
