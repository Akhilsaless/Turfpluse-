import type { Meeting, VerifiedPhoto } from "../src/live/types";

type PhotoEntry = VerifiedPhoto & {
  runnerId: string;
  kind: "horse" | "jockey";
  identityName: string;
  identityVerified: true;
  rightsConfirmed: true;
};
const https = (value: unknown) => {
  try {
    if (typeof value !== "string") return false;
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
};
const name = (s: string) =>
  s.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
export function withVerifiedPhotos(
  meeting: Meeting,
  raw = process.env.RUNNER_PHOTOS_JSON || "[]",
): Meeting {
  let entries: PhotoEntry[];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 200) return meeting;
    entries = parsed;
  } catch {
    return meeting;
  }
  const result = structuredClone(meeting);
  for (const race of result.races)
    for (const runner of race.runners) {
      // Re-evaluate the jockey association on every response, including after a replacement.
      delete runner.horsePhoto;
      delete runner.jockeyPhoto;
      for (const kind of ["horse", "jockey"] as const) {
        const candidates = entries.filter(
          (p) =>
            p &&
            p.runnerId === runner.id &&
            p.kind === kind &&
            p.identityVerified === true &&
            p.rightsConfirmed === true &&
            typeof p.identityName === "string" &&
            name(p.identityName) ===
              name(kind === "horse" ? runner.name : runner.jockey) &&
            https(p.url) &&
            https(p.sourceUrl) &&
            typeof p.credit === "string" &&
            p.credit.trim() &&
            typeof p.verifiedBy === "string" &&
            p.verifiedBy.trim() &&
            typeof p.verifiedAt === "string" &&
            Number.isFinite(Date.parse(p.verifiedAt)) &&
            Date.parse(p.verifiedAt) <= Date.now(),
        );
        if (candidates.length !== 1) continue; // Conflicting photo identity mappings are held for review.
        const p = candidates[0];
        const photo: VerifiedPhoto = {
          url: p.url,
          sourceUrl: p.sourceUrl,
          credit: p.credit,
          verifiedBy: p.verifiedBy,
          verifiedAt: p.verifiedAt,
        };
        if (kind === "horse") runner.horsePhoto = photo;
        else runner.jockeyPhoto = photo;
      }
    }
  return result;
}
