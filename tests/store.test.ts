import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { MeetingStore } from "../server/store";
test("rate limits are atomic under concurrent local requests and independent by scope", async () => {
  const store = new MeetingStore();
  const results = await Promise.all(
    Array.from({ length: 12 }, () =>
      store.consumeRateLimit("ai:user", 5, 60000),
    ),
  );
  assert.equal(results.filter(Boolean).length, 5);
  assert.equal(await store.consumeRateLimit("ops:user", 5, 60000), true);
});
test("Vercel refuses ephemeral storage and rate limits when the database is absent", async () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = "1";
  try {
    const store = new MeetingStore();
    await assert.rejects(store.read(), /Durable database/);
    await assert.rejects(
      store.consumeRateLimit("ai:user", 5, 60000),
      /Shared rate-limit/,
    );
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});
test("persistent file survives a new store and serializes concurrent mutations without lost revisions", async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "turfpulse-store-"),
  );
  const previous = process.env.DATA_DIR;
  process.env.DATA_DIR = directory;
  try {
    const store = new MeetingStore();
    await Promise.all(
      Array.from({ length: 8 }, () =>
        store.mutate((current) => ({
          ...current,
          revision: current.revision + 1,
        })),
      ),
    );
    const recovered = await new MeetingStore().read();
    assert.equal(recovered.revision, 8);
    assert.equal(recovered.races.length, 10);
    await assert.rejects(
      store.mutate(() => {
        throw new Error("Rejected update");
      }),
    );
    assert.equal((await store.read()).revision, 8);
    await fs.writeFile(path.join(directory, "meeting.json"), "{}");
    await assert.rejects(new MeetingStore().read(), /invalid/);
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    await fs.rm(directory, { recursive: true, force: true });
  }
});
