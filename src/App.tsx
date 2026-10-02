import React, { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { initialMeeting, performance } from "./live/model";
import type { Meeting, Change } from "./live/types";
import { usePWAInstall } from "./hooks/usePWAInstall";
import "./live/live.css";
import { isMeeting, readWatchlist } from "./live/validation";
import { RaceCard } from "./components/LiveRaceCard";
import { time, dateTime } from "./live/display";
import {
  HorseDirectory,
  MeetingNews,
  PredictionHistory,
} from "./components/MeetingViews";
import { RecoveryBoundary } from "./components/RecoveryBoundary";
const client = new QueryClient();
type LiveMeeting = Meeting & {
  servedAt?: string;
  storageMode?: string;
  grokConfigured?: boolean;
};
const safeStorage = {
  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
const cacheKey = "turfpulse-verified-rctc-2026-10-03-v1";
async function request(url: string, body?: unknown) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(url === "/api/ai-brain" ? 60000 : 15000),
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request unavailable");
  return data;
}
function useMeeting() {
  const query = useQuery<LiveMeeting>({
    queryKey: ["meeting"],
    queryFn: async () => {
      const data = await request("/api/meeting");
      if (!isMeeting(data))
        throw new Error("Verified race data is temporarily unavailable");
      void set(cacheKey, data).catch(() => {});
      return data;
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
  useEffect(() => {
    void get<LiveMeeting>(cacheKey)
      .then((data) => {
        if (isMeeting(data) && !client.getQueryData(["meeting"]))
          client.setQueryData(["meeting"], data);
      })
      .catch(() => {});
    // Remove keys saved by the previous demo. Secrets belong on the server.
    safeStorage.removeItem("turfpulse_grok_key");
    safeStorage.removeItem("turfpulse_gemini_key");
  }, []);
  return { ...query, meeting: (query.data || initialMeeting()) as LiveMeeting };
}
function Operator({
  meeting,
  onChange,
}: {
  meeting: Meeting;
  onChange: () => void;
}) {
  const [password, setPassword] = useState("");
  const [signed, setSigned] = useState(false);
  const [raceId, setRaceId] = useState("r1");
  const [runnerId, setRunnerId] = useState("r1-h1");
  const [kind, setKind] = useState<Change["kind"]>("scratch");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState("");
  const [message, setMessage] = useState("");
  async function login(event: React.FormEvent) {
    event.preventDefault();
    try {
      await request("/api/ops/login", { password });
      setPassword("");
      setSigned(true);
      setMessage("Authenticated operator");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      let parsed: unknown = value;
      if (kind === "odds") parsed = Number(value);
      if (kind === "result") parsed = JSON.parse(value);
      await request("/api/ops/change", {
        id: crypto.randomUUID(),
        meetingId: meeting.id,
        raceId,
        runnerId: [
          "scratch",
          "reinstate",
          "jockey",
          "odds",
          "pace",
          "form",
        ].includes(kind)
          ? runnerId
          : undefined,
        kind,
        value: parsed,
        reason,
        sourceUrl: url,
        publishedAt: new Date(published).toISOString(),
      });
      setMessage("Verified change saved with audit and snapshots");
      onChange();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <main className="tp-main">
      <h1>Operator console</h1>
      <p>
        Every change requires source evidence and a reason. Historical injury
        reports are not withdrawal notices.
      </p>
      {!signed ? (
        <form onSubmit={login} className="tp-form">
          <label>
            Operator password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button>Sign in</button>
        </form>
      ) : (
        <form className="tp-form" onSubmit={submit}>
          <label>
            Race
            <select
              value={raceId}
              onChange={(e) => {
                setRaceId(e.target.value);
                setRunnerId(
                  meeting.races.find((r) => r.id === e.target.value)!.runners[0]
                    .id,
                );
              }}
            >
              {meeting.races.map((r) => (
                <option key={r.id} value={r.id}>
                  R{r.number} {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Runner
            <select
              value={runnerId}
              onChange={(e) => setRunnerId(e.target.value)}
            >
              {meeting.races
                .find((r) => r.id === raceId)!
                .runners.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Change
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Change["kind"])}
            >
              {[
                "scratch",
                "reinstate",
                "jockey",
                "going",
                "delay",
                "status",
                "odds",
                "pace",
                "form",
                "result",
                "notice",
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Value
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                kind === "result"
                  ? '{"stage":"official","placings":["r1-h1","r1-h2"]}'
                  : "Delay: ISO time with +05:30; odds: decimal; scratch: leave blank"
              }
            />
          </label>
          <label>
            Reason
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label>
            HTTPS evidence URL
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label>
            Source publication time (include timezone)
            <input
              required
              value={published}
              onChange={(e) => setPublished(e.target.value)}
              placeholder="2026-10-03T12:00:00+05:30"
            />
          </label>
          <button>Save verified change</button>
          <button
            type="button"
            onClick={async () => {
              try {
                await request("/api/ops/logout", {});
                setSigned(false);
              } catch {
                setMessage("Sign out failed. Please try again.");
              }
            }}
          >
            Sign out
          </button>
        </form>
      )}
      <p role="status">{message}</p>
    </main>
  );
}
function TurfPulse() {
  const { meeting, isError, dataUpdatedAt, refetch } = useMeeting();
  const [tab, setTab] = useState("races");
  const [search, setSearch] = useState("");
  const [raceView, setRaceView] = useState("cards");
  const [alertView, setAlertView] = useState("updates");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [online, setOnline] = useState(navigator.onLine);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerRevision, setAnswerRevision] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [watch, setWatch] = useState<string[]>(() =>
    readWatchlist(safeStorage.getItem("tp-watch-v1")),
  );
  const [alert, setAlert] = useState("");
  const [notifications, setNotifications] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    const changed = () => setOnline(navigator.onLine);
    window.addEventListener("online", changed);
    window.addEventListener("offline", changed);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", changed);
      window.removeEventListener("offline", changed);
    };
  }, []);
  useEffect(() => {
    const last = safeStorage.getItem("tp-alert-last");
    const newEvents = last
      ? meeting.events.filter(
          (e) =>
            Date.parse(e.retrievedAt) > Date.parse(last) &&
            (!e.runnerId || watch.includes(e.runnerId)),
        )
      : [];
    if (newEvents.length) {
      const text = newEvents
        .map((e) => `${e.raceId.toUpperCase()}: ${e.kind} · ${e.reason}`)
        .join("\n");
      setAlert(text);
      if (
        notifications &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("TurfPulse verified changes", { body: text });
        } catch {
          setNotifications(false);
        }
      }
    }
    if (meeting.events.length)
      safeStorage.setItem("tp-alert-last", meeting.events.at(-1)!.retrievedAt);
  }, [meeting.revision, notifications, watch]);
  const toggle = (id: string) =>
    setWatch((old) => {
      const next = old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id];
      safeStorage.setItem("tp-watch-v1", JSON.stringify(next));
      return next;
    });
  const stale =
    !online ||
    isError ||
    !meeting.servedAt ||
    clock - Date.parse(meeting.servedAt) > 30000;
  const metrics = performance(meeting);
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await request("/api/ai-brain", { question });
      setAnswerRevision(result.sourceRevision);
      setAnswer(
        `${result.answer}\n\nGenerated ${dateTime(result.generatedAt)} · meeting revision ${result.sourceRevision}`,
      );
    } catch (e) {
      setAnswer(
        "Analysis is unavailable right now. Verified race information is still available. Try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (window.location.pathname === "/ops")
    return <Operator meeting={meeting} onChange={() => void refetch()} />;
  return (
    <div className="tp-app">
      <header className="tp-header">
        <div>
          <span className="tp-brand">TurfPulse</span>
          <p>Royal Calcutta Turf Club · Kolkata</p>
        </div>
        <div>
          {time(new Date(clock).toISOString())} IST
          <br />
          {isInstallable && (
            <button
              onClick={async () => {
                try {
                  await install();
                } catch {
                  setAlert(
                    "Installation is unavailable. Please try again from your browser menu.",
                  );
                }
              }}
            >
              Install app
            </button>
          )}
          {isInstalled && <small>Installed</small>}
          {!isInstallable && !isInstalled && (
            <button
              onClick={() =>
                setAlert(
                  isIOS
                    ? "To install TurfPulse, open this link in Safari, tap Share, then Add to Home Screen."
                    : "To install TurfPulse, open your browser menu and choose Install app or Add to Home screen. If unavailable, you can keep using this link in your browser.",
                )
              }
            >
              How to install
            </button>
          )}
        </div>
      </header>
      <main className="tp-main">
        {isError && (
          <aside className="tp-alert" role="status">
            Live updates are temporarily unavailable. Showing the last verified
            meeting; retrying automatically.
          </aside>
        )}
        <section className="tp-meeting">
          <small>THE AUTUMN MEETING · SATURDAY</small>
          <h1>A clearer view of race day.</h1>
          <p className="tp-meeting-date">3 October 2026</p>
          <p>
            {meeting.venue} · 10 races ·{" "}
            {meeting.races.reduce((s, r) => s + r.runners.length, 0)}{" "}
            declarations
          </p>
          <div className="tp-status">
            {stale
              ? "Cached declarations / stale connection"
              : "Connected to meeting server"}{" "}
            ·{" "}
            {!stale &&
            meeting.sources.some(
              (s) =>
                s.state === "healthy" &&
                s.lastSuccess &&
                clock - Date.parse(s.lastSuccess) < 180000,
            )
              ? "Live source connected"
              : "Live sources awaiting connection"}
            <br />
            <small>
              Server fetched:{" "}
              {dataUpdatedAt
                ? dateTime(new Date(dataUpdatedAt).toISOString())
                : "not yet"}{" "}
              · Data changed: {dateTime(meeting.updatedAt)} · Revision{" "}
              {meeting.revision}
            </small>
          </div>
          <a href={meeting.source.url} target="_blank" rel="noreferrer">
            Official declaration card
          </a>
          <small>
            {" "}
            Imported {dateTime(meeting.source.retrievedAt)} · current going,
            rails, penetrometer and weather awaiting verification
          </small>
        </section>
        {(() => {
          const next =
            meeting.races.find((r) => r.status === "running") ||
            meeting.races.find((r) =>
              ["scheduled", "delayed"].includes(r.status),
            );
          if (!next)
            return (
              <section className="tp-card">
                <h2>No pending races</h2>
                <p>
                  Review recorded results, cancellations and prediction history
                  below.
                </p>
              </section>
            );
          const seconds = Math.max(
            0,
            Math.ceil((Date.parse(next.scheduledAt) - clock) / 1000),
          );
          return (
            <section className="tp-card">
              <h2>
                {next.status === "running" ? "Racing now" : "Next race"}: R
                {next.number} · {next.name}
              </h2>
              <p>
                {time(next.scheduledAt)} IST · {next.distance} m ·{" "}
                {next.status === "running"
                  ? "In progress"
                  : seconds === 0
                    ? "Awaiting verified start update"
                    : `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`}
              </p>
              <a
                href={`#race-${next.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setTab("races");
                  setRaceView("cards");
                  setSearch("");
                  requestAnimationFrame(() =>
                    document
                      .getElementById(`race-${next.id}`)
                      ?.scrollIntoView(),
                  );
                }}
              >
                Go to race
              </a>
            </section>
          );
        })()}
        {alert && (
          <aside role="status" className="tp-alert">
            {alert}
            <button onClick={() => setAlert("")}>Dismiss</button>
          </aside>
        )}
        <nav className="tp-nav">
          {[
            ["races", "Races"],
            ["alerts", "Track Alerts"],
            ["performance", "Performance"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === "races" && (
          <>
            <div className="tp-subnav">
              <button
                aria-pressed={raceView === "cards"}
                onClick={() => setRaceView("cards")}
              >
                Race cards
              </button>
              <button
                aria-pressed={raceView === "horses"}
                onClick={() => setRaceView("horses")}
              >
                Horses
              </button>
            </div>
            {raceView === "horses" ? (
              <HorseDirectory meeting={meeting} watch={watch} toggle={toggle} />
            ) : (
              <>
                <div className="tp-tools">
                  <input
                    aria-label="Search races or runners"
                    placeholder="Find a race, runner or jockey"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button onClick={() => void refetch()}>Refresh</button>
                </div>
                <p className="tp-note">
                  Win estimates total 100% across active runners. These are
                  uncalibrated declaration-based estimates, with Low confidence.
                  No official results have been assumed.
                </p>
                {!meeting.races.some((r) =>
                  JSON.stringify(r)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                ) && <p className="tp-empty">No races match your search.</p>}
                {meeting.races
                  .filter((r) =>
                    JSON.stringify(r)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((r) => (
                    <RecoveryBoundary key={r.id} label={`Race ${r.number}`}>
                      <RaceCard
                        race={r}
                        meeting={meeting}
                        watch={watch}
                        toggle={toggle}
                        onAsk={() => {
                          setQuestion(
                            `Explain R${r.number} (${r.name}). Compare the leading candidates, cite supplied evidence and list missing data.`,
                          );
                          document
                            .getElementById("race-assistant")
                            ?.scrollIntoView({ behavior: "smooth" });
                          document
                            .getElementById("assistant-question")
                            ?.focus();
                        }}
                      />
                    </RecoveryBoundary>
                  ))}
              </>
            )}
          </>
        )}
        {tab === "alerts" && (
          <>
            <div className="tp-subnav">
              <button
                aria-pressed={alertView === "updates"}
                onClick={() => setAlertView("updates")}
              >
                Updates & news
              </button>
              <button
                aria-pressed={alertView === "sources"}
                onClick={() => setAlertView("sources")}
              >
                Source status
              </button>
            </div>
            {alertView === "updates" && <MeetingNews meeting={meeting} />}
            <details open={alertView === "sources"}>
              <summary>Source status</summary>
              <h2>Source health</h2>
              {(meeting.sources.length
                ? meeting.sources
                : [
                    {
                      id: "setup",
                      name: "Live sources",
                      state: "disabled",
                      message:
                        "No permitted source connected. Verified declarations remain available.",
                      lastAttempt: null,
                      lastSuccess: null,
                      publishedAt: null,
                      checksum: null,
                    },
                  ]
              ).map((s) => (
                <article className="tp-card" key={s.id}>
                  <h3>
                    {s.name} · {s.state}
                  </h3>
                  <p>{s.message}</p>
                  <small>
                    Attempt: {dateTime(s.lastAttempt)} · Success:{" "}
                    {dateTime(s.lastSuccess)} · Published:{" "}
                    {dateTime(s.publishedAt)}
                  </small>
                </article>
              ))}
              <button
                onClick={async () => {
                  try {
                    if (!("Notification" in window)) {
                      setAlert(
                        "System notifications are unavailable in this browser. Changes still appear in the app.",
                      );
                      return;
                    }
                    const granted = await Notification.requestPermission();
                    setNotifications(granted === "granted");
                    if (granted !== "granted")
                      setAlert(
                        "System notifications are disabled. Changes still appear in the app.",
                      );
                  } catch {
                    setNotifications(false);
                    setAlert(
                      "System notifications are unavailable. Changes still appear in the app.",
                    );
                  }
                }}
              >
                Enable alerts while app is open
              </button>
              <p>
                {watch.length} watched runners. Background push delivery is not
                connected.
              </p>
            </details>
            <h2>Change analysis</h2>
            {meeting.analyses?.length ? (
              <article className="tp-card">
                <p className="tp-answer">{meeting.analyses.at(-1)!.answer}</p>
                <small>
                  AI interpretation · source revision{" "}
                  {meeting.analyses.at(-1)!.sourceRevision} ·{" "}
                  {dateTime(meeting.analyses.at(-1)!.at)} · does not change
                  verified facts
                </small>
              </article>
            ) : (
              <p>Awaiting connected analysis and verified race-day changes.</p>
            )}
            <details>
              <summary>All verified changes</summary>
              <h2>Verified changes</h2>
              {!meeting.events.length && (
                <p>No verified race-day changes received.</p>
              )}
              {[...meeting.events].reverse().map((e) => (
                <article className="tp-card" key={e.id}>
                  <h3>
                    {e.raceId.toUpperCase()} · {e.kind}
                  </h3>
                  <p>{e.reason}</p>
                  <a href={e.sourceUrl} target="_blank" rel="noreferrer">
                    Source evidence
                  </a>
                  <small>
                    {" "}
                    Published {dateTime(e.publishedAt)} · retrieved{" "}
                    {dateTime(e.retrievedAt)} · {e.actor}
                  </small>
                </article>
              ))}
            </details>
          </>
        )}
        {tab === "performance" && (
          <>
            <h2>Performance from official results</h2>
            <button
              aria-expanded={historyOpen}
              onClick={() => setHistoryOpen((v) => !v)}
            >
              Prediction history
            </button>
            {historyOpen && <PredictionHistory meeting={meeting} />}
            <p>
              Scored races: {metrics.records.length} · Top-pick hit rate:{" "}
              {metrics.hitRate === null
                ? "Awaiting official results"
                : `${(metrics.hitRate * 100).toFixed(1)}%`}{" "}
              · Multiclass Brier:{" "}
              {metrics.brier === null
                ? "Awaiting official results"
                : metrics.brier.toFixed(4)}
            </p>
            <p>
              Uses frozen pre-result snapshots and the latest official/corrected
              result. This small pilot does not establish calibration. ROI
              awaits verified odds and a declared staking policy.
            </p>
            {metrics.records.map((r) => (
              <article className="tp-card" key={r.raceId}>
                {r.raceId.toUpperCase()} ·{" "}
                {r.hit ? "Top pick won" : "Top pick missed"} · Brier{" "}
                {r.brier.toFixed(4)} · result v{r.version}
              </article>
            ))}
          </>
        )}
        <section className="tp-card tp-ai" id="race-assistant">
          <small>EXPLAIN · COMPARE · UNDERSTAND</small>
          <h2>Race assistant</h2>
          <p>
            Ask about the meeting, compare runners or understand a sourced
            change. Answers are AI interpretations; race facts come from the
            recorded evidence.
          </p>
          <form onSubmit={ask}>
            <input
              id="assistant-question"
              required
              maxLength={3000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Compare the Derby runners"
              aria-label="Question for race assistant"
            />
            <button disabled={busy || !online}>
              {busy ? "Analysing…" : "Ask"}
            </button>
          </form>
          {answerRevision !== null && answerRevision !== meeting.revision && (
            <p role="status" className="tp-alert">
              The meeting has changed since this answer. Ask again for a current
              interpretation.
            </p>
          )}
          {answer && (
            <p className="tp-answer" role="status">
              {answer}
            </p>
          )}
        </section>
        <footer>
          Model estimates cannot guarantee outcomes. ·{" "}
          <a href="/ops">Operator console</a>
        </footer>
      </main>
    </div>
  );
}
export default function App() {
  return (
    <QueryClientProvider client={client}>
      <RecoveryBoundary label="Race meeting">
        <TurfPulse />
      </RecoveryBoundary>
    </QueryClientProvider>
  );
}
