import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createMocks } from "node-mocks-http";
import { app } from "../server";
async function invoke(
  method: "GET" | "POST",
  url: string,
  body = {},
  headers: Record<string, string> = {},
) {
  const { req, res } = createMocks(
    {
      method,
      url,
      body,
      headers: {
        host: "localhost",
        "content-type": "application/json",
        ...headers,
      },
    },
    { eventEmitter: EventEmitter },
  );
  const finished = new Promise<void>((resolve, reject) => {
    res.on("end", resolve);
    res.on("error", reject);
  });
  (app as any).handle(req, res);
  await finished;
  let data = res._getData();
  try {
    data = JSON.parse(data);
  } catch {}
  return { status: res.statusCode, data, headers: res._getHeaders() };
}
test("public API exposes all races; unauthenticated writes denied; browser keys never accepted", async () => {
  const meeting = await invoke("GET", "/api/meeting");
  assert.equal(meeting.status, 200);
  assert.equal(meeting.data.races.length, 10);
  assert.equal(meeting.data.races[9].runners.length, 12);
  assert.equal(meeting.data.sources[0].state, "disabled");
  assert.equal((await invoke("POST", "/api/ops/change")).status, 403);
  assert.equal(
    (
      await invoke("POST", "/api/ai-config", {
        grokApiKey: "cannot-replace-server-key",
      })
    ).status,
    410,
  );
  assert.equal((await invoke("POST", "/api/sync")).status, 401);
  const ai = await invoke("POST", "/api/ai-brain", { question: "Who wins?" });
  assert.equal(ai.status, 503);
  assert.match(ai.data.error, /configuration/);
});
test("operator login requires configured strong server credential and denies cross-origin writes", async () => {
  assert.equal(
    (await invoke("POST", "/api/ops/login", { password: "anything" })).status,
    401,
  );
});
test("health reports incomplete integrations honestly and unknown API routes return JSON", async () => {
  const health = await invoke("GET", "/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.data.integrationsConfigured, false);
  assert.equal(health.data.checks.database, false);
  assert.equal(health.data.checks.liveFeedsHealthy, false);
  const missing = await invoke("GET", "/api/missing");
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.data, { error: "Endpoint unavailable" });
});

test("valid operator session uses HttpOnly cookie and denies cross-origin requests", async () => {
  const previous = process.env.OPS_PASSWORD;
  process.env.OPS_PASSWORD = "test-operator-password-very-long";
  try {
    const login = await invoke("POST", "/api/ops/login", {
      password: process.env.OPS_PASSWORD,
    });
    assert.equal(login.status, 200);
    const cookie = String(login.headers["set-cookie"]);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    const denied = await invoke(
      "POST",
      "/api/ops/change",
      {},
      { cookie, origin: "https://untrusted.example" },
    );
    assert.equal(denied.status, 403);
    const invalid = await invoke("POST", "/api/ops/change", {}, { cookie });
    assert.equal(invalid.status, 422);
  } finally {
    if (previous === undefined) delete process.env.OPS_PASSWORD;
    else process.env.OPS_PASSWORD = previous;
  }
});
