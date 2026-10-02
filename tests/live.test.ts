import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { initialMeeting, latestSnapshot, performance } from "../src/live/model";
import { applyChange } from "../server/events";
import { syncFeeds, publicHealth, type Feed } from "../server/sources";
import { grokAnalysis } from "../server/grok";
import type { Change, Meeting } from "../src/live/types";
mock.method(Date, "now", () => Date.parse("2026-10-03T14:00:00+05:30"));
const event = (patch: Partial<Change> = {}): Change => ({
  id: "scratch-1",
  meetingId: "rctc-2026-10-03",
  raceId: "r1",
  runnerId: "r1-h1",
  kind: "scratch",
  value: "",
  reason: "Official withdrawal bulletin",
  sourceUrl: "https://rctconline.com/bulletin",
  publishedAt: "2026-10-03T12:00:00+05:30",
  ...patch,
});
const received = "2026-10-03T12:01:00+05:30";
test("official first meeting includes ten races and all 81 declarations, no fake live fields", () => {
  const state = initialMeeting();
  assert.equal(state.races.length, 10);
  assert.equal(
    state.races.reduce((s, r) => s + r.runners.length, 0),
    81,
  );
  assert.equal(state.date, "2026-10-03");
  assert.equal(state.races[0].distance, 1600);
  assert.equal(state.races[0].runners[0].jockey, "Vishal N. Bunde");
  assert.equal(state.races[7].runners.length, 6);
  for (const race of state.races) {
    assert.equal(
      new Set(race.runners.map((r) => r.draw)).size,
      race.runners.length,
    );
    assert.equal(race.going, null);
    assert.equal(race.results.length, 0);
    assert.ok(race.runners.every((r) => r.odds === null && r.form === null));
    assert.equal(
      Object.values(latestSnapshot(state, race.id).probabilities).reduce(
        (s, p) => s + Math.round(p * 100),
        0,
      ),
      10000,
    );
  }
});
test("scratch publishes temporary and recalculated immutable snapshots; duplicate is idempotent", () => {
  const before = initialMeeting();
  const original = JSON.stringify(before);
  const after = applyChange(before, event(), "feed:official", received);
  assert.equal(JSON.stringify(before), original);
  assert.equal(after.snapshots.length, before.snapshots.length + 2);
  assert.deepEqual(
    after.snapshots.slice(-2).map((s) => s.phase),
    ["temporary", "recalculated"],
  );
  for (const snap of after.snapshots.slice(-2)) {
    assert.equal(snap.probabilities["r1-h1"], 0);
    assert.equal(
      Object.values(snap.probabilities).reduce(
        (s, p) => s + Math.round(p * 100),
        0,
      ),
      10000,
    );
  }
  assert.equal(after.events[0].actor, "feed:official");
  assert.ok(after.events[0].checksum);
  assert.equal(applyChange(after, event(), "feed:official", received), after);
  assert.throws(() =>
    applyChange(
      after,
      event({ reason: "Conflicting content" }),
      "ops",
      received,
    ),
  );
});
test("pace interactions recalculate the field after a leader is scratched", () => {
  let state = initialMeeting();
  for (const runnerId of ["r1-h1", "r1-h2"])
    state = applyChange(
      state,
      event({
        id: `pace-${runnerId}`,
        kind: "pace",
        runnerId,
        value: "leader",
      }),
      "ops",
      received,
    );
  state = applyChange(state, event(), "ops", received);
  assert.notDeepEqual(
    state.snapshots.at(-1)!.probabilities,
    state.snapshots.at(-2)!.probabilities,
  );
});
test("rejects unknown identities, fabricated result IDs, duplicate placings, historical injuries and out-of-order changes", () => {
  const state = initialMeeting();
  for (const patch of [
    { raceId: "r11" },
    { runnerId: "fake" },
    { publishedAt: "2026-09-25T12:00:00+05:30" },
    { kind: "odds", value: 0 },
    { kind: "delay", value: "2026-10-04T14:00:00+05:30" },
    {
      kind: "result",
      value: { stage: "official", placings: ["r1-h1", "r1-h1"] },
    },
    { kind: "result", value: { stage: "official", placings: ["fake"] } },
  ] as Partial<Change>[])
    assert.throws(() => applyChange(state, event(patch), "ops", received));
  const next = applyChange(
    state,
    event({ kind: "jockey", value: "A. Sandesh" }),
    "ops",
    received,
  );
  assert.throws(() =>
    applyChange(
      next,
      event({
        id: "older",
        kind: "jockey",
        value: "P. Trevor",
        publishedAt: "2026-10-03T11:00:00+05:30",
      }),
      "ops",
      received,
    ),
  );
});
test("reinstate restores active probability; jockey and going changes capture new snapshots", () => {
  let state = applyChange(initialMeeting(), event(), "ops", received);
  state = applyChange(
    state,
    event({
      id: "reinstate",
      kind: "reinstate",
      publishedAt: "2026-10-03T12:02:00+05:30",
    }),
    "ops",
    "2026-10-03T12:03:00+05:30",
  );
  assert.ok(latestSnapshot(state, "r1").probabilities["r1-h1"] > 0);
  const old = state.snapshots.length;
  state = applyChange(
    state,
    event({ id: "jockey", kind: "jockey", value: "A. Sandesh" }),
    "ops",
    received,
  );
  state = applyChange(
    state,
    event({ id: "going", kind: "going", runnerId: undefined, value: "Soft" }),
    "ops",
    received,
  );
  assert.equal(state.snapshots.length, old + 2);
  assert.equal(latestSnapshot(state, "r1").confidence, "Low");
});
test("result versions append; provisional never scores; corrections use frozen pre-result predictions", () => {
  let state = initialMeeting();
  assert.equal(performance(state).brier, null);
  state = applyChange(
    state,
    event({
      id: "provisional",
      kind: "result",
      runnerId: undefined,
      value: { stage: "provisional", placings: ["r1-h1", "r1-h2"] },
    }),
    "ops",
    received,
  );
  assert.equal(performance(state).records.length, 0);
  state = applyChange(
    state,
    event({
      id: "official",
      kind: "result",
      runnerId: undefined,
      publishedAt: "2026-10-03T12:05:00+05:30",
      value: { stage: "official", placings: ["r1-h1", "r1-h2"] },
    }),
    "ops",
    "2026-10-03T12:06:00+05:30",
  );
  const frozen = performance(state).records[0].probabilities;
  state = applyChange(
    state,
    event({
      id: "corrected",
      kind: "result",
      runnerId: undefined,
      publishedAt: "2026-10-03T12:07:00+05:30",
      value: { stage: "corrected", placings: ["r1-h2", "r1-h1"] },
    }),
    "ops",
    "2026-10-03T12:08:00+05:30",
  );
  assert.equal(state.races[0].results.length, 3);
  assert.deepEqual(performance(state).records[0].probabilities, frozen);
  assert.equal(performance(state).records[0].winner, "r1-h2");
  assert.throws(() => applyChange(state, event(), "ops", received));
});
const feed: Feed = {
  id: "official",
  name: "Official feed",
  url: "https://rctconline.com/feed",
  licenseConfirmed: true,
  authority: "official",
  evidenceDomains: ["rctconline.com"],
  priority: 1,
};
function memoryStore() {
  let state = initialMeeting();
  return {
    read: async () => state,
    mutate: async (fn: (s: Meeting) => Meeting) => (state = fn(state)),
  };
}
test("permitted feed updates any race; failed feed retains verified data; disabled feeds are never requested", async () => {
  const store = memoryStore();
  let calls = 0;
  const payload = {
    publishedAt: "2026-10-03T12:00:00+05:30",
    changes: [event({ id: "r10-update", raceId: "r10", runnerId: "r10-h12" })],
  };
  await syncFeeds(
    store as any,
    [feed, { ...feed, id: "not-permitted", licenseConfirmed: false }],
    async () => {
      calls++;
      return new Response(JSON.stringify(payload));
    },
  );
  assert.equal(calls, 1);
  assert.equal((await store.read()).races[9].runners[11].status, "scratched");
  await syncFeeds(
    store as any,
    [feed],
    async () => new Response("bad", { status: 503 }),
  );
  const state = await store.read();
  assert.equal(state.races[9].runners[11].status, "scratched");
  assert.equal(state.sources[0].state, "failed");
  assert.equal(state.events.length, 1);
  assert.equal(publicHealth(initialMeeting(), [])[0].state, "disabled");
});
test("feed rejects uncited domains and malformed batch without partial mutation", async () => {
  const store = memoryStore();
  await syncFeeds(
    store as any,
    [feed],
    async () =>
      new Response(
        JSON.stringify({
          publishedAt: "2026-10-03T12:00:00+05:30",
          changes: [
            event(),
            event({ id: "bad", sourceUrl: "https://untrusted.example/fake" }),
          ],
        }),
      ),
  );
  assert.equal((await store.read()).events.length, 0);
  assert.equal((await store.read()).sources[0].state, "failed");
});
test("Grok fails explicitly instead of returning invented analysis", async () => {
  const old = process.env.XAI_API_KEY;
  const oldGrok = process.env.GROK_API_KEY;
  delete process.env.XAI_API_KEY;
  delete process.env.GROK_API_KEY;
  await assert.rejects(
    grokAnalysis(initialMeeting(), "analyse"),
    /not configured/,
  );
  process.env.XAI_API_KEY = "test-only";
  await assert.rejects(
    grokAnalysis(
      initialMeeting(),
      "analyse",
      async () => new Response("{}", { status: 500 }),
    ),
    { message: "Grok unavailable", code: "XAI_HTTP_500" },
  );
  const response = await grokAnalysis(
    initialMeeting(),
    "analyse",
    async (_url, options) => {
      const body = JSON.parse(options!.body as string);
      assert.match(body.input[1].content, /r10-h12/);
      const context = JSON.parse(body.input[1].content);
      assert.ok(Number.isFinite(Date.parse(context.currentTime)));
      assert.equal(context.meeting.date, "2026-10-03");
      assert.match(body.input[0].content, /future meeting as today/);
      return new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [{ type: "output_text", text: "Verified analysis" }],
            },
          ],
        }),
      );
    },
  );
  assert.equal(response.answer, "Verified analysis");
  if (old === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = old;
  if (oldGrok) process.env.GROK_API_KEY = oldGrok;
});
