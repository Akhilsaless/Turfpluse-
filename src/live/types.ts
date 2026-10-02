export type VerifiedPhoto = {
  url: string;
  sourceUrl: string;
  credit: string;
  verifiedBy: string;
  verifiedAt: string;
};
export type Runner = {
  horsePhoto?: VerifiedPhoto;
  jockeyPhoto?: VerifiedPhoto;
  id: string;
  number: number;
  name: string;
  weight: number;
  draw: number;
  rating: number;
  jockey: string;
  trainer: string;
  status: "declared" | "scratched";
  odds: number | null;
  pace: "leader" | "stalker" | "closer" | null;
  form: string | null;
};
export type Race = {
  id: string;
  number: number;
  name: string;
  scheduledAt: string;
  distance: number;
  status: "scheduled" | "delayed" | "running" | "finished" | "cancelled";
  going: string | null;
  runners: Runner[];
  results: Result[];
};
export type Result = {
  eventId: string;
  version: number;
  stage: "provisional" | "official" | "corrected";
  placings: string[];
  publishedAt: string;
  sourceUrl: string;
};
export type Change = {
  id: string;
  meetingId: string;
  raceId: string;
  runnerId?: string;
  kind:
    | "scratch"
    | "reinstate"
    | "jockey"
    | "going"
    | "delay"
    | "status"
    | "odds"
    | "pace"
    | "form"
    | "result"
    | "notice";
  value: unknown;
  reason: string;
  sourceUrl: string;
  publishedAt: string;
};
export type Audit = Change & {
  actor: string;
  retrievedAt: string;
  before: unknown;
  after: unknown;
  checksum: string;
};
export type Probabilities = Record<string, number>;
export type Snapshot = {
  id: string;
  raceId: string;
  at: string;
  phase: "initial" | "temporary" | "recalculated";
  eventId: string | null;
  probabilities: Probabilities;
  confidence: "Low";
  model: string;
  evidence: string;
};
export type SourceHealth = {
  id: string;
  name: string;
  state: "healthy" | "degraded" | "stale" | "failed" | "disabled";
  lastAttempt: string | null;
  lastSuccess: string | null;
  publishedAt: string | null;
  checksum: string | null;
  message: string;
  priority: number;
};
export type Analysis = {
  id: string;
  sourceRevision: number;
  latestEventId: string;
  at: string;
  answer: string;
  model: string;
};
export type Meeting = {
  id: string;
  date: string;
  venue: string;
  timezone: string;
  revision: number;
  updatedAt: string | null;
  source: {
    name: string;
    url: string;
    retrievedAt: string;
    publishedAt: string | null;
  };
  races: Race[];
  events: Audit[];
  snapshots: Snapshot[];
  sources: SourceHealth[];
  analyses?: Analysis[];
};
