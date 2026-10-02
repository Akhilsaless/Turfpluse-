import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import dotenv from "dotenv";
import { MeetingStore } from "./server/store";
import { applyChange } from "./server/events";
import { configuredFeeds, publicHealth, syncFeeds } from "./server/sources";
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
  process.env.SESSION_SECRET || randomBytes(32).toString("hex");
const sign = (payload: string) =>
  createHmac("sha256", sessionSecret).update(payload).digest("hex");

const failures = new Map<string, { count: number; until: number }>();
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
  return `ops:${process.env.OPS_ACTOR || "operator"}`;
}
function sameOrigin(req: express.Request) {
  return (
    !req.headers.origin ||
    req.headers.origin === `${req.protocol}://${req.get("host")}`
  );
}
app.post("/api/ops/login", (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: "Access denied" });
  const ip = req.ip || "unknown";
  const attempts = failures.get(ip);
  if (attempts && attempts.until > Date.now() && attempts.count >= 5)
    return res.status(429).json({ error: "Try again later" });
  const secret = process.env.OPS_PASSWORD;
  if (
    (production &&
      (!process.env.SESSION_SECRET ||
        process.env.SESSION_SECRET.length < 32)) ||
    !secret ||
    secret.length < 16 ||
    typeof req.body.password !== "string" ||
    !equal(req.body.password, secret)
  ) {
    failures.set(ip, {
      count: attempts && attempts.until > Date.now() ? attempts.count + 1 : 1,
      until: Date.now() + 900000,
    });
    return res.status(401).json({ error: "Operator authentication required" });
  }
  failures.delete(ip);
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
    res.json({ revision: state.revision });
    void analyseSaved(state);
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
      ...state,
      sources: publicHealth(state, feeds),
      storageMode: store.mode,
      grokConfigured: !!(process.env.XAI_API_KEY || process.env.GROK_API_KEY),
      servedAt: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ error: "Verified meeting temporarily unavailable" });
  }
});
async function analyseSaved(state: Awaited<ReturnType<MeetingStore["read"]>>) {
  if (
    process.env.AUTO_ANALYSE !== "true" ||
    !state.events.length ||
    (!process.env.XAI_API_KEY && !process.env.GROK_API_KEY)
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
  const token = process.env.SYNC_SECRET;
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
const aiLimits = new Map<string, { count: number; until: number }>();
app.post("/api/ai-brain", async (req, res) => {
  if (!sameOrigin(req)) return res.sendStatus(403);
  const question = req.body.message || req.body.question;
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > 3000
  )
    return res
      .status(400)
      .json({ error: "Enter a question up to 3000 characters" });
  const ip = req.ip || "unknown";
  let usage = aiLimits.get(ip);
  if (!usage || usage.until < Date.now()) {
    usage = { count: 0, until: Date.now() + 60000 };
    aiLimits.set(ip, usage);
  }
  if (++usage.count > 5)
    return res.status(429).json({ error: "Please wait before asking again" });
  if (!process.env.XAI_API_KEY && !process.env.GROK_API_KEY)
    return res
      .status(503)
      .json({ error: "Grok analysis is awaiting server configuration" });
  try {
    const analysis = await grokAnalysis(await store.read(), question);
    res.json({
      ...analysis,
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
    res
      .status(status)
      .json({
        error:
          status === 400
            ? "Invalid request body"
            : "Request temporarily unavailable",
      });
  },
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
    process.env.AUTO_SYNC === "true"
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
      Math.max(30000, Number(process.env.SYNC_INTERVAL_MS) || 60000),
    );
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  void start();
export default app;
