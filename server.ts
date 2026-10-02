import { optionalSetting } from "./server/settings";
import { logFailure } from "./server/diagnostics";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import dotenv from "dotenv";
import { MeetingStore } from "./server/store";
import { applyChange } from "./server/events";
import { configuredFeeds, publicHealth, syncFeeds } from "./server/sources";
import { withVerifiedPhotos } from "./server/images";
import { grokAnalysis } from "./server/grok";
dotenv.config();
export const app = express();
const store = new MeetingStore();
const feeds = configuredFeeds();
const production = process.env.NODE_ENV === "production";
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
const equal = (a: string, b: string) => {
  const aa = Buffer.from(a),
    bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
const sessionSecret =
  optionalSetting("SESSION_SECRET") || randomBytes(32).toString("hex");
const sign = (payload: string) =>
  createHmac("sha256", sessionSecret).update(payload).digest("hex");

function rateLimit(scope: string, maximum: number, windowMs: number) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      if (
        process.env.VERCEL === "1" &&
        (optionalSetting("SESSION_SECRET")?.length || 0) < 32
      )
        throw new Error("Stable signing secret required");
      const ip = req.ip || "unknown";
      const key = `${scope}:${createHmac("sha256", sessionSecret).update(ip).digest("hex")}`;
      if (!(await store.consumeRateLimit(key, maximum, windowMs))) {
        res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
        return res
          .status(429)
          .json({ error: "Please wait before trying again" });
      }
      next();
    } catch {
      res.status(503).json({ error: "Request temporarily unavailable" });
    }
  };
}
function operator(req: express.Request) {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("turf_ops="))
    ?.slice(9);
  if (!cookie) return null;
  const [payload, signature] = cookie.split(".");
  if (!signature || !equal(signature, sign(payload))) return null;
  const expires = Number(payload.split("_")[0]);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  return `ops:${optionalSetting("OPS_ACTOR") || "operator"}`;
}
function sameOrigin(req: express.Request) {
  return (
    !req.headers.origin ||
    req.headers.origin === `${req.protocol}://${req.get("host")}`
  );
}
app.post("/api/ops/login", rateLimit("ops-login", 5, 900000), (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: "Access denied" });
  const secret = optionalSetting("OPS_PASSWORD");
  const signingSecret = optionalSetting("SESSION_SECRET");
  if (
    (production && (!signingSecret || signingSecret.length < 32)) ||
    !secret ||
    secret.length < 16 ||
    typeof req.body?.password !== "string" ||
    !equal(req.body.password, secret)
  ) {
    return res.status(401).json({ error: "Operator authentication required" });
  }
  const payload = `${Date.now() + 3600000}_${randomBytes(24).toString("hex")}`;
  res.setHeader(
    "Set-Cookie",
    `turf_ops=${payload}.${sign(payload)}; HttpOnly; SameSite=Strict; Path=/api/ops; Max-Age=3600${production ? "; Secure" : ""}`,
  );
  res.json({ role: "operator" });
});
app.post("/api/ops/logout", (req, res) => {
  if (!sameOrigin(req)) return res.sendStatus(403);
  res.setHeader(
    "Set-Cookie",
    "turf_ops=; HttpOnly; SameSite=Strict; Path=/api/ops; Max-Age=0",
  );
  res.sendStatus(204);
});
app.post("/api/ops/change", async (req, res) => {
  const actor = operator(req);
  if (!actor || !sameOrigin(req))
    return res.status(403).json({ error: "Operator authentication required" });
  try {
    const state = await store.mutate((current) =>
      applyChange(current, req.body, actor),
    );
    await analyseSaved(state);
    res.json({ revision: (await store.read()).revision });
  } catch {
    res.status(422).json({
      error:
        "Change rejected. Check identities, evidence, publication time and result stage.",
    });
  }
});
app.get("/api/meeting", async (_req, res) => {
  try {
    const state = await store.read();
    res.json({
      ...withVerifiedPhotos(state),
      sources: publicHealth(state, feeds),
      storageMode: store.mode,
      grokConfigured: !!(
        process.env.XAI_API_KEY || optionalSetting("GROK_API_KEY")
      ),
      servedAt: new Date().toISOString(),
    });
  } catch (error) {
    logFailure("meeting-read", error);
    res.status(503).json({ error: "Verified meeting temporarily unavailable" });
  }
});
app.get("/api/health", async (_req, res) => {
  try {
    const state = await store.read();
    const sources = publicHealth(state, feeds);
    const checks = {
      database: store.mode === "postgres",
      grokConfigured: !!(
        process.env.XAI_API_KEY || optionalSetting("GROK_API_KEY")
      ),
      operatorConfigured:
        !!optionalSetting("OPS_PASSWORD") &&
        (optionalSetting("SESSION_SECRET")?.length || 0) >= 32,
      liveFeedsHealthy:
        sources.length > 0 &&
        sources.every((source) => source.state === "healthy"),
    };
    res.json({
      status: "available",
      integrationsConfigured: Object.values(checks).every(Boolean),
      checks,
    });
  } catch (error) {
    logFailure("health-read", error);
    res
      .status(503)
      .json({ status: "unavailable", integrationsConfigured: false });
  }
});
async function analyseSaved(state: Awaited<ReturnType<MeetingStore["read"]>>) {
  if (
    optionalSetting("AUTO_ANALYSE") !== "true" ||
    !state.events.length ||
    (!process.env.XAI_API_KEY && !optionalSetting("GROK_API_KEY"))
  )
    return;
  const latestEventId = state.events.at(-1)!.id;
  if (state.analyses?.some((a) => a.latestEventId === latestEventId)) return;
  try {
    const analysis = await grokAnalysis(
      state,
      "Analyse the newest verified changes for all affected races. Explain scratches, revised conditions, jockey changes and result status; distinguish inference from sourced facts. Do not fabricate missing inputs or publish new race facts.",
    );
    await store.mutate((current) => {
      if (current.analyses?.some((a) => a.latestEventId === latestEventId))
        return current;
      return {
        ...current,
        revision: current.revision + 1,
        analyses: [
          ...(current.analyses || []),
          {
            id: randomBytes(12).toString("hex"),
            sourceRevision: state.revision,
            latestEventId,
            at: new Date().toISOString(),
            ...analysis,
          },
        ],
      };
    });
  } catch {
    console.error(
      "Automatic Grok analysis unavailable; verified state retained",
    );
  }
}
async function runSync() {
  const state = await syncFeeds(store, feeds);
  await analyseSaved(state);
  return await store.read();
}
app.post("/api/sync", async (req, res) => {
  const token = optionalSetting("SYNC_SECRET");
  if (
    !token ||
    token.length < 24 ||
    !equal(req.get("authorization") || "", `Bearer ${token}`)
  )
    return res.sendStatus(401);
  try {
    const state = await runSync();
    res.json({ revision: state.revision, sources: publicHealth(state, feeds) });
  } catch {
    res
      .status(503)
      .json({ error: "Update unavailable; verified data retained" });
  }
});
app.post("/api/ai-brain", rateLimit("ai", 5, 60000), async (req, res) => {
  if (!sameOrigin(req)) return res.sendStatus(403);
  const question = req.body?.message || req.body?.question;
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > 3000
  )
    return res
      .status(400)
      .json({ error: "Enter a question up to 3000 characters" });
  if (!process.env.XAI_API_KEY && !optionalSetting("GROK_API_KEY"))
    return res
      .status(503)
      .json({ error: "Grok analysis is awaiting server configuration" });
  try {
    const state = await store.read();
    const analysis = await grokAnalysis(state, question);
    res.json({
      ...analysis,
      sourceRevision: state.revision,
      meetingDate: state.date,
      response: analysis.answer,
      engine: "grok",
      generatedAt: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      error:
        "Grok analysis is temporarily unavailable. Verified race data is unchanged.",
    });
  }
});
app.post("/api/ai-config", (_req, res) =>
  res.status(410).json({ error: "API keys must be configured on the server" }),
);
app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!req.path.startsWith("/api/")) return next(error);
    const status = (error as { status?: number })?.status === 400 ? 400 : 503;
    res.status(status).json({
      error:
        status === 400
          ? "Invalid request body"
          : "Request temporarily unavailable",
    });
  },
);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Endpoint unavailable" }),
);
async function start() {
  if (!production) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const directory = path.dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(directory, "dist")));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(directory, "dist/index.html")),
    );
  }
  app.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
    console.log("TurfPulse server ready"),
  );
  if (
    feeds.some((f) => f.licenseConfirmed) &&
    optionalSetting("AUTO_SYNC") === "true"
  ) {
    let syncing = false;
    const refresh = async () => {
      if (syncing) return;
      syncing = true;
      try {
        await runSync();
      } catch {
        console.error("Source sync unavailable");
      } finally {
        syncing = false;
      }
    };
    void refresh();
    setInterval(
      () => void refresh(),
      Math.max(30000, Number(optionalSetting("SYNC_INTERVAL_MS")) || 60000),
    );
  }
}
if (
  process.env.VERCEL !== "1" &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  void start();
export default app;
