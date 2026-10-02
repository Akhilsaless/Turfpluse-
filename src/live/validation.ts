import type { Meeting } from "./types";

const object = (x: unknown): x is Record<string, any> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === "string";
const finite = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);
const date = (x: unknown) => text(x) && Number.isFinite(Date.parse(x));
const optionalText = (x: unknown) => x === null || text(x);
const url = (x: unknown) => {
  try {
    return text(x) && new URL(x).protocol === "https:";
  } catch {
    return false;
  }
};
const unique = (items: any[]) =>
  items.every((x) => object(x) && text(x.id)) &&
  new Set(items.map((x) => x.id)).size === items.length;

// Validate both network responses and offline cache before mounting race cards.
// Reject partial/legacy meetings rather than silently inventing missing values.
export function isMeeting(x: unknown): x is Meeting {
  if (
    !object(x) ||
    x.id !== "rctc-2026-10-03" ||
    x.date !== "2026-10-03" ||
    !text(x.venue) ||
    x.timezone !== "Asia/Kolkata" ||
    !Number.isInteger(x.revision) ||
    x.revision < 0 ||
    !(x.updatedAt === null || date(x.updatedAt)) ||
    !object(x.source) ||
    !text(x.source.name) ||
    !url(x.source.url) ||
    !date(x.source.retrievedAt) ||
    !(x.source.publishedAt === null || date(x.source.publishedAt)) ||
    !Array.isArray(x.races) ||
    x.races.length !== 10 ||
    !unique(x.races) ||
    !Array.isArray(x.snapshots) ||
    !Array.isArray(x.events) ||
    !Array.isArray(x.sources)
  )
    return false;
  const runnerIds = new Set<string>();
  for (const [index, race] of x.races.entries()) {
    if (
      !object(race) ||
      race.id !== `r${index + 1}` ||
      race.number !== index + 1 ||
      !text(race.name) ||
      !date(race.scheduledAt) ||
      !finite(race.distance) ||
      race.distance <= 0 ||
      !optionalText(race.going) ||
      !["scheduled", "delayed", "running", "finished", "cancelled"].includes(
        race.status,
      ) ||
      !Array.isArray(race.runners) ||
      !unique(race.runners) ||
      !Array.isArray(race.results)
    )
      return false;
    for (const r of race.runners) {
      if (
        !object(r) ||
        !text(r.id) ||
        !r.id.startsWith(`${race.id}-`) ||
        runnerIds.has(r.id) ||
        !text(r.name) ||
        !finite(r.number) ||
        !finite(r.weight) ||
        !finite(r.draw) ||
        !finite(r.rating) ||
        !text(r.jockey) ||
        !text(r.trainer) ||
        !["declared", "scratched"].includes(r.status) ||
        !(r.odds === null || (finite(r.odds) && r.odds > 1)) ||
        !optionalText(r.form) ||
        !(r.pace === null || ["leader", "stalker", "closer"].includes(r.pace))
      )
        return false;
      for (const photo of [r.horsePhoto, r.jockeyPhoto]) {
        if (
          photo !== undefined &&
          (!object(photo) ||
            !url(photo.url) ||
            !url(photo.sourceUrl) ||
            !text(photo.credit) ||
            !text(photo.verifiedBy) ||
            !date(photo.verifiedAt))
        )
          return false;
      }
      runnerIds.add(r.id);
    }
    for (const result of race.results) {
      if (
        !object(result) ||
        !text(result.eventId) ||
        !finite(result.version) ||
        !["provisional", "official", "corrected"].includes(result.stage) ||
        !date(result.publishedAt) ||
        !url(result.sourceUrl) ||
        !Array.isArray(result.placings) ||
        !result.placings.every((id) =>
          race.runners.some((r: any) => r.id === id),
        )
      )
        return false;
    }
  }
  for (const s of x.snapshots) {
    const race = x.races.find((r) => r.id === s?.raceId);
    if (
      !object(s) ||
      !race ||
      !text(s.id) ||
      !date(s.at) ||
      !text(s.model) ||
      !text(s.evidence) ||
      !["initial", "temporary", "recalculated"].includes(s.phase) ||
      !object(s.probabilities) ||
      !race.runners.every(
        (r: any) =>
          finite(s.probabilities[r.id]) &&
          s.probabilities[r.id] >= 0 &&
          s.probabilities[r.id] <= 100,
      )
    )
      return false;
  }
  if (!x.races.every((r) => x.snapshots.some((s: any) => s.raceId === r.id)))
    return false;
  for (const e of x.events) {
    if (
      !object(e) ||
      !text(e.id) ||
      !x.races.some((r) => r.id === e.raceId) ||
      !text(e.kind) ||
      !text(e.reason) ||
      !text(e.actor) ||
      !date(e.publishedAt) ||
      !date(e.retrievedAt) ||
      !url(e.sourceUrl)
    )
      return false;
  }
  for (const s of x.sources) {
    if (
      !object(s) ||
      !text(s.id) ||
      !text(s.name) ||
      !text(s.message) ||
      !["healthy", "degraded", "stale", "failed", "disabled"].includes(
        s.state,
      ) ||
      ![s.lastAttempt, s.lastSuccess, s.publishedAt].every(
        (t) => t === null || date(t),
      )
    )
      return false;
  }
  return (
    x.analyses === undefined ||
    (Array.isArray(x.analyses) &&
      x.analyses.every(
        (a) =>
          object(a) &&
          text(a.id) &&
          text(a.answer) &&
          text(a.model) &&
          finite(a.sourceRevision) &&
          date(a.at),
      ))
  );
}

export function readWatchlist(raw: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (id): id is string => text(id) && /^r\d+-h\d+$/.test(id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
