import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { optionalSetting } from "../server/settings";
import { configuredFeeds } from "../server/sources";
import { withVerifiedPhotos } from "../server/images";
import { initialMeeting } from "../src/live/model";

test("missing optional settings preserve disabled integration defaults", () => {
  const names = [
    "RACE_FEEDS_JSON",
    "RUNNER_PHOTOS_JSON",
    "DATABASE_URL",
    "OPS_PASSWORD",
    "SYNC_SECRET",
  ];
  const previous = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  try {
    for (const name of names) delete process.env[name];
    for (const name of names) assert.equal(optionalSetting(name), undefined);
    assert.deepEqual(configuredFeeds(), []);
    const meeting = withVerifiedPhotos(initialMeeting());
    assert.equal(meeting.races.length, 10);
    assert.ok(
      meeting.races.every((r) =>
        r.runners.every((h) => !h.horsePhoto && !h.jockeyPhoto),
      ),
    );
  } finally {
    for (const name of names)
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
  }
});
test("only XAI_API_KEY is listed in the required starter environment template", async () => {
  const example = await fs.readFile(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  const names = example
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => line.split("=")[0]);
  assert.deepEqual(names, ["XAI_API_KEY"]);
});
