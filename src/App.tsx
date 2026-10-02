import React, { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { initialMeeting, latestSnapshot, performance } from "./live/model";
import type { Meeting, Race, Runner, Change } from "./live/types";
import { usePWAInstall } from "./hooks/usePWAInstall";
import "./live/live.css";
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
const time = (date: string) =>
  new Date(date).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
const dateTime = (date: string | null) =>
  date
    ? new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : "Not available";
async function request(url: string, body?: unknown) {
  const response = await fetch(url, {
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
      if (
        data.id !== initialMeeting().id ||
        !Array.isArray(data.races) ||
        data.races.length !== 10
      )
        throw new Error("Invalid meeting response");
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
        if (
          data?.id === initialMeeting().id &&
          !client.getQueryData(["meeting"])
        )
          client.setQueryData(["meeting"], data);
      })
      .catch(() => {});
    // Remove keys saved by the previous demo. Secrets belong on the server.
    safeStorage.removeItem("turfpulse_grok_key");
    safeStorage.removeItem("turfpulse_gemini_key");
  }, []);
  return { ...query, meeting: (query.data || initialMeeting()) as LiveMeeting };
}
function RaceCard({
  race,
  meeting,
  watch,
  toggle,
}: {
  race: Race;
  meeting: Meeting;
  watch: string[];
  toggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(race.number === 1);
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const snap = latestSnapshot(meeting, race.id);
  const ranked = [...race.runners]
    .filter((r) => r.status === "declared")
    .sort((a, b) => snap.probabilities[b.id] - snap.probabilities[a.id]);
  const result = race.results.at(-1);
  const show = (runner: Runner) => (
    <div className="tp-runner-info">
      <h4>{runner.name}</h4>
      <ul>
        <li>Declared official rating: {runner.rating}.</li>
        <li>
          Declared weight {runner.weight} kg; draw {runner.draw}.
        </li>
        <li>
          {race.distance} m field has {ranked.length} active runners; estimate
          uses available declarations
          {runner.pace ? ` and verified ${runner.pace} pace` : ""}.
        </li>
      </ul>
      <p>
        <b>Risk:</b> Uncalibrated baseline; historical form, track suitability
        and jockey/trainer strike rates are unavailable.
      </p>
      <p>
        Form: {runner.form || "Awaiting verified form"} · Pace:{" "}
        {runner.pace || "Awaiting verified pace"} · Odds:{" "}
        {runner.odds ?? "Unavailable"}
      </p>
      <button onClick={() => toggle(runner.id)}>
        {watch.includes(runner.id) ? "Remove from watchlist" : "Watch runner"}
      </button>
    </div>
  );
  return (
    <article className="tp-card">
      <button
        className="tp-race-title"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>
          <small>
            R{race.number} · {time(race.scheduledAt)} IST · {race.distance} m
          </small>
          <h2>{race.name}</h2>
        </span>
        <span>
          {race.status}
          <br />
          {open ? "−" : "+"}
        </span>
      </button>
      <div className="tp-summary">
        <span>
          {ranked.length}/{race.runners.length} active · Going:{" "}
          {race.going || "awaiting verification"}
        </span>
        <span>Confidence: Low · uncalibrated</span>
      </div>
      {result ? (
        <p className="tp-result">
          {result.stage} result · v{result.version}:{" "}
          {result.placings
            .map((id) => race.runners.find((r) => r.id === id)?.name)
            .join(" → ")}{" "}
          ·{" "}
          <a href={result.sourceUrl} target="_blank" rel="noreferrer">
            source
          </a>
        </p>
      ) : (
        <p className="tp-pick">
          Baseline leader: {ranked[0]?.name || "No active runners"} · latest
          snapshot {dateTime(snap.at)}
        </p>
      )}
      {open && (
        <>
          <div className="tp-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Runner</th>
                  <th>Jockey / trainer</th>
                  <th>Draw / weight / rating</th>
                  <th>Win estimate</th>
                  <th>Odds</th>
                  {race.number === 8 && <th>Compare</th>}
                </tr>
              </thead>
              <tbody>
                {race.runners.map((r) => (
                  <tr
                    key={r.id}
                    className={r.status === "scratched" ? "tp-scratched" : ""}
                  >
                    <td>
                      <button
                        className="tp-link"
                        onClick={() =>
                          setSelected(selected === r.id ? null : r.id)
                        }
                      >
                        #{r.number} {r.name}
                      </button>
                      <small>
                        {r.status}
                        {watch.includes(r.id) ? " · watching" : ""}
                      </small>
                    </td>
                    <td>
                      {r.jockey}
                      <small>{r.trainer}</small>
                    </td>
                    <td>
                      {r.draw} / {r.weight} kg / {r.rating}
                    </td>
                    <td>{snap.probabilities[r.id].toFixed(2)}%</td>
                    <td>{r.odds ?? "Unavailable"}</td>
                    {race.number === 8 && (
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Compare ${r.name}`}
                          checked={compare.includes(r.id)}
                          onChange={() =>
                            setCompare(
                              compare.includes(r.id)
                                ? compare.filter((id) => id !== r.id)
                                : [...compare.slice(-1), r.id],
                            )
                          }
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && show(race.runners.find((r) => r.id === selected)!)}
          {compare.length === 2 && (
            <div className="tp-compare">
              {compare.map((id) => (
                <div key={id}>
                  {show(race.runners.find((r) => r.id === id)!)}
                </div>
              ))}
            </div>
          )}
          <details>
            <summary>
              Immutable prediction history (
              {meeting.snapshots.filter((s) => s.raceId === race.id).length})
            </summary>
            {meeting.snapshots
              .filter((s) => s.raceId === race.id)
              .map((s) => (
                <p key={s.id}>
                  {dateTime(s.at)} · {s.phase} · {s.model} · {s.evidence}
                </p>
              ))}
          </details>
        </>
      )}
    </article>
  );
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
              await request("/api/ops/logout", {});
              setSigned(false);
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
  const [clock, setClock] = useState(Date.now());
  const [online, setOnline] = useState(navigator.onLine);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [watch, setWatch] = useState<string[]>(() => {
    try {
      return JSON.parse(safeStorage.getItem("tp-watch-v1") || "[]");
    } catch {
      return [];
    }
  });
  const [alert, setAlert] = useState("");
  const [notifications, setNotifications] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();
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
      )
        new Notification("TurfPulse verified changes", { body: text });
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
      setAnswer(
        `${result.answer}\n\n${result.model} · ${dateTime(result.generatedAt)}`,
      );
    } catch (e) {
      setAnswer((e as Error).message);
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
          <p>Race-day intelligence · Kolkata</p>
        </div>
        <div>
          {time(new Date(clock).toISOString())} IST
          <br />
          {isInstallable && <button onClick={install}>Install app</button>}
          {isInstalled && <small>Installed</small>}
        </div>
      </header>
      <main className="tp-main">
        <section className="tp-meeting">
          <small>FIRST MEETING · SATURDAY</small>
          <h1>3 October 2026</h1>
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
              uncalibrated declaration-based estimates, with Low confidence. No
              official results have been assumed.
            </p>
            {meeting.races
              .filter((r) =>
                JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
              )
              .map((r) => (
                <RaceCard
                  key={r.id}
                  race={r}
                  meeting={meeting}
                  watch={watch}
                  toggle={toggle}
                />
              ))}
          </>
        )}
        {tab === "alerts" && (
          <>
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
                if ("Notification" in window) {
                  const granted = await Notification.requestPermission();
                  setNotifications(granted === "granted");
                }
              }}
            >
              Enable alerts while app is open
            </button>
            <p>
              {watch.length} watched runners. Background push delivery is not
              connected.
            </p>
            <h2>Grok change analysis</h2>
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
              <p>Awaiting configured Grok and verified race-day changes.</p>
            )}
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
          </>
        )}
        {tab === "performance" && (
          <>
            <h2>Performance from official results</h2>
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
        <section className="tp-card tp-ai">
          <h2>Ask Grok</h2>
          <p>
            Analysis of the verified meeting; source discovery is enabled only
            by server configuration.
          </p>
          <form onSubmit={ask}>
            <input
              required
              maxLength={3000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Compare the Derby runners"
              aria-label="Question for Grok"
            />
            <button disabled={busy || !online}>
              {busy ? "Analysing…" : "Ask"}
            </button>
          </form>
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
      <TurfPulse />
    </QueryClientProvider>
  );
}
