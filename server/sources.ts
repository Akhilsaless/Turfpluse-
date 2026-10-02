import { optionalSetting } from "./settings";
import { createHash } from "node:crypto";
import type { Change, Meeting, SourceHealth } from "../src/live/types";
import { applyChange, validateChange } from "./events";
import type { MeetingStore } from "./store";
export type Feed = {
  id: string;
  name: string;
  url: string;
  licenseConfirmed: boolean;
  authority: "official" | "licensed";
  evidenceDomains: string[];
  priority: number;
  tokenEnv?: string;
};
export function configuredFeeds(): Feed[] {
  const feeds = JSON.parse(optionalSetting("RACE_FEEDS_JSON") || "[]");
  if (!Array.isArray(feeds) || feeds.length > 30)
    throw new Error("Invalid source configuration");
  const ids = new Set();
  return feeds
    .map((f: Feed) => {
      if (
        !f.id ||
        !f.name ||
        ids.has(f.id) ||
        !["official", "licensed"].includes(f.authority) ||
        !Array.isArray(f.evidenceDomains) ||
        !f.evidenceDomains.length ||
        !Number.isFinite(f.priority) ||
        new URL(f.url).protocol !== "https:"
      )
        throw new Error("Invalid feed configuration");
      ids.add(f.id);
      return f;
    })
    .sort((a, b) => a.priority - b.priority);
}
export function publicHealth(state: Meeting, feeds: Feed[]): SourceHealth[] {
  if (!feeds.length)
    return [
      {
        id: "unconfigured",
        name: "Live sources",
        state: "disabled",
        lastAttempt: null,
        lastSuccess: null,
        publishedAt: null,
        checksum: null,
        message:
          "No permitted live feed connected. Showing verified declarations only.",
        priority: 0,
      },
    ];
  return feeds.map((f) => {
    const health = state.sources.find((s) => s.id === f.id);
    if (!f.licenseConfirmed)
      return {
        id: f.id,
        name: f.name,
        state: "disabled" as const,
        lastAttempt: null,
        lastSuccess: null,
        publishedAt: null,
        checksum: null,
        message: "Automated access permission required",
        priority: f.priority,
      };
    if (!health)
      return {
        id: f.id,
        name: f.name,
        state: "stale" as const,
        lastAttempt: null,
        lastSuccess: null,
        publishedAt: null,
        checksum: null,
        message: "Awaiting first verified update",
        priority: f.priority,
      };
    if (
      health.state === "healthy" &&
      (!health.lastSuccess ||
        Date.now() - Date.parse(health.lastSuccess) > 180000)
    )
      return {
        ...health,
        state: "stale" as const,
        message: "Source has not been checked within three minutes",
      };
    return health;
  });
}
export async function syncFeeds(
  store: MeetingStore,
  feeds: Feed[],
  fetcher = fetch,
) {
  // Fetch independently, apply deterministically by priority. Official sources win conflicting facts.
  const fetched = await Promise.all(
    feeds
      .filter((f) => f.licenseConfirmed === true)
      .map(async (f) => {
        const health: SourceHealth = {
          id: f.id,
          name: f.name,
          state: "healthy",
          lastAttempt: new Date().toISOString(),
          lastSuccess: null,
          publishedAt: null,
          checksum: null,
          message: "Verified feed checked",
          priority: f.priority,
        };
        try {
          const token = f.tokenEnv ? process.env[f.tokenEnv] : null;
          const response = await fetcher(f.url, {
            redirect: "error",
            signal: AbortSignal.timeout(15000),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!response.ok) throw new Error("Source unavailable");
          const body = await response.text();
          if (body.length > 1000000) throw new Error("Source too large");
          health.checksum = createHash("sha256").update(body).digest("hex");
          const data = JSON.parse(body);
          if (
            !Array.isArray(data.changes) ||
            data.changes.length > 500 ||
            typeof data.publishedAt !== "string" ||
            !Number.isFinite(Date.parse(data.publishedAt)) ||
            Date.parse(data.publishedAt) > Date.now() + 300000
          )
            throw new Error("Invalid feed");
          const changes: Change[] = data.changes.map(validateChange);
          for (const c of changes) {
            const host = new URL(c.sourceUrl).hostname;
            if (
              !f.evidenceDomains.some(
                (d) => host === d || host.endsWith(`.${d}`),
              ) ||
              Date.parse(c.publishedAt) > Date.parse(data.publishedAt)
            )
              throw new Error("Unsupported source evidence");
          }
          health.publishedAt = data.publishedAt;
          health.lastSuccess = health.lastAttempt;
          return { f, health, changes };
        } catch {
          health.state = "failed";
          health.message =
            "Source check failed; previous verified data retained";
          return { f, health, changes: [] };
        }
      }),
  );
  return store.mutate((current) => {
    let state = current;
    for (const { f, health, changes } of fetched) {
      try {
        let candidate = state;
        for (const change of changes) {
          const better = state.events.find(
            (e) =>
              e.raceId === change.raceId &&
              e.runnerId === change.runnerId &&
              (e.kind === change.kind ||
                (["scratch", "reinstate"].includes(e.kind) &&
                  ["scratch", "reinstate"].includes(change.kind))) &&
              e.publishedAt === change.publishedAt &&
              feeds.some(
                (source) =>
                  `feed:${source.id}` === e.actor &&
                  source.priority < f.priority,
              ),
          );
          if (better) {
            health.state = "degraded";
            health.message =
              "Conflicting lower-priority evidence held for review";
            continue;
          }
          candidate = applyChange(
            candidate,
            change,
            `feed:${f.id}`,
            health.lastAttempt!,
          );
        }
        state = candidate;
      } catch {
        health.state = "degraded";
        health.message =
          "Invalid or outdated changes held for review; previous data retained";
      }
      state = structuredClone(state);
      const old = current.sources.find((s) => s.id === f.id);
      if (!health.lastSuccess) health.lastSuccess = old?.lastSuccess || null;
      state.sources = state.sources.filter((s) => s.id !== f.id).concat(health);
    }
    if (!fetched.length) return current;
    state.revision++;
    return state;
  });
}
