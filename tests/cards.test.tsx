import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RaceCard } from "../src/components/LiveRaceCard";
import { initialMeeting } from "../src/live/model";
import { isMeeting, readWatchlist } from "../src/live/validation";

test("every October 3 race renders expanded with every declared runner", () => {
  const meeting = initialMeeting();
  assert.equal(isMeeting(meeting), true);
  for (const race of meeting.races) {
    const html = renderToStaticMarkup(
      <RaceCard
        race={race}
        meeting={meeting}
        watch={[]}
        toggle={() => {}}
        initialOpen
      />,
    );
    assert.match(html, /aria-expanded="true"/);
    for (const runner of race.runners)
      assert.ok(html.includes(renderToStaticMarkup(<>{runner.name}</>)));
    assert.match(html, /What changed/);
    assert.match(html, /Main Danger/);
  }
});
test("missing prediction values cannot crash expanded cards", () => {
  const meeting = initialMeeting();
  delete meeting.snapshots[1].probabilities[meeting.races[1].runners[0].id];
  assert.equal(isMeeting(meeting), false);
  const html = renderToStaticMarkup(
    <RaceCard
      race={meeting.races[1]}
      meeting={meeting}
      watch={[]}
      toggle={() => {}}
      initialOpen
    />,
  );
  assert.match(html, /Unavailable/);
  meeting.snapshots = [];
  assert.equal(isMeeting(meeting), false);
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      <RaceCard
        race={meeting.races[1]}
        meeting={meeting}
        watch={[]}
        toggle={() => {}}
        initialOpen
      />,
    ),
  );
});
test("malformed network and cache structures are rejected before rendering", () => {
  for (const corrupt of [
    null,
    {},
    { id: "rctc-2026-10-03" },
    { ...initialMeeting(), events: null },
    { ...initialMeeting(), snapshots: [{ raceId: "r1", probabilities: null }] },
    { ...initialMeeting(), races: [null] },
    { ...initialMeeting(), races: Array(10).fill(null) },
  ]) {
    assert.equal(isMeeting(corrupt), false);
  }
  const meeting = initialMeeting();
  meeting.races[5].runners[0].rating = NaN;
  assert.equal(isMeeting(meeting), false);
});
test("corrupt watchlist storage recovers without mounting invalid values", () => {
  assert.deepEqual(readWatchlist("null"), []);
  assert.deepEqual(readWatchlist("{}"), []);
  assert.deepEqual(readWatchlist("bad json"), []);
  assert.deepEqual(readWatchlist('["r1-h1","r1-h1",null,5,"unknown"]'), [
    "r1-h1",
  ]);
});
