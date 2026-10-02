import React, { useState } from "react";
import type { Meeting, Runner } from "../live/types";
import { RunnerPhoto } from "./RunnerPhoto";
import { latestSnapshot } from "../live/model";
import { dateTime } from "../live/display";

export function HorseDirectory({
  meeting,
  watch,
  toggle,
}: {
  meeting: Meeting;
  watch: string[];
  toggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const entries = meeting.races.flatMap((race) =>
    race.runners.map((runner) => ({ race, runner })),
  );
  const filtered = entries.filter(
    ({ runner, race }) =>
      (!watched || watch.includes(runner.id)) &&
      `${runner.name} ${runner.jockey} ${runner.trainer} R${race.number}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section aria-label="Horse directory">
      <div className="tp-section-heading">
        <div>
          <small>THE FIELD</small>
          <h2>Horses</h2>
        </div>
        <span>{entries.length} declarations</span>
      </div>
      <div className="tp-tools">
        <input
          aria-label="Search horses"
          placeholder="Horse, jockey or trainer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button aria-pressed={watched} onClick={() => setWatched((v) => !v)}>
          {watched ? "Show all" : "Watchlist"}
        </button>
      </div>
      {!filtered.length && (
        <p className="tp-empty">
          No horses match. Try another search or show all horses.
        </p>
      )}
      <div className="tp-directory">
        {filtered.map(({ race, runner }) => (
          <article className="tp-card" key={runner.id}>
            <RunnerPhoto runner={runner} />
            <small>
              R{race.number} · {race.distance} m · {runner.status}
            </small>
            <button
              className="tp-link tp-horse-name"
              aria-expanded={selected === runner.id}
              onClick={() =>
                setSelected((v) => (v === runner.id ? null : runner.id))
              }
            >
              {runner.name}
            </button>
            <p>
              {runner.jockey}
              <small>{runner.trainer}</small>
            </p>
            <div className="tp-summary">
              <span>
                Draw {runner.draw} · {runner.weight} kg
              </span>
              <span>Rating {runner.rating}</span>
            </div>
            {selected === runner.id && (
              <RunnerEvidence
                runner={runner}
                probability={
                  latestSnapshot(meeting, race.id)?.probabilities[runner.id]
                }
                source={meeting.source}
              />
            )}
            <button onClick={() => toggle(runner.id)}>
              {watch.includes(runner.id)
                ? "Remove from watchlist"
                : "Watch runner"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
function RunnerEvidence({
  runner,
  probability,
  source,
}: {
  runner: Runner;
  probability: number | undefined;
  source: Meeting["source"];
}) {
  return (
    <div className="tp-runner-info">
      <RunnerPhoto runner={runner} kind="jockey" />
      <h3>Why this estimate?</h3>
      <p>
        Win estimate:{" "}
        {Number.isFinite(probability)
          ? `${probability!.toFixed(2)}%`
          : "Unavailable"}{" "}
        · Place estimate: awaiting a supported model.
      </p>
      <p>
        The baseline uses declared rating and carried weight, plus sourced pace
        when available. It does not establish distance, course or going
        suitability.
      </p>
      <p>
        Form: {runner.form || "Awaiting verified form"}
        <br />
        Pace: {runner.pace || "Awaiting verified pace"}
        <br />
        Odds: {runner.odds ?? "Awaiting verified odds"}
      </p>
      <p>
        Distance/course/going records, career history, equipment, pedigree and
        jockey/trainer statistics await sourced data.
      </p>
      <a href={source.url} target="_blank" rel="noreferrer">
        Declaration source
      </a>
      <small>Retrieved {dateTime(source.retrievedAt)}</small>
    </div>
  );
}
export function MeetingNews({ meeting }: { meeting: Meeting }) {
  const [filter, setFilter] = useState("all");
  const events = [...meeting.events]
    .reverse()
    .filter(
      (e) =>
        filter === "all" ||
        (filter === "conditions"
          ? ["going", "delay", "status"].includes(e.kind)
          : filter === "results"
            ? e.kind === "result"
            : [
                "scratch",
                "reinstate",
                "jockey",
                "form",
                "pace",
                "odds",
              ].includes(e.kind)),
    );
  return (
    <section aria-label="Meeting news">
      <h2>Meeting updates</h2>
      <p>
        Source-backed notices for this meeting. Publication times and evidence
        stay attached to each update.
      </p>
      <div className="tp-subnav">
        {[
          ["all", "All updates"],
          ["conditions", "Track & timing"],
          ["runners", "Runners"],
          ["results", "Results"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {!events.length && (
        <p className="tp-empty">
          No verified updates in this category yet. Declarations remain
          available; no news has been assumed.
        </p>
      )}
      {events.map((e) => (
        <article className="tp-card" key={e.id}>
          <small>
            R{meeting.races.find((r) => r.id === e.raceId)?.number} · {e.kind}
          </small>
          <h3>{e.reason}</h3>
          <a href={e.sourceUrl} target="_blank" rel="noreferrer">
            Read source evidence
          </a>
          <small>
            Published {dateTime(e.publishedAt)} · Received{" "}
            {dateTime(e.retrievedAt)}
          </small>
        </article>
      ))}
    </section>
  );
}
export function PredictionHistory({ meeting }: { meeting: Meeting }) {
  const [raceId, setRaceId] = useState("r1");
  const race = meeting.races.find((r) => r.id === raceId)!;
  return (
    <section aria-label="Prediction history">
      <h2>Prediction history</h2>
      <label>
        Race
        <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
          {meeting.races.map((r) => (
            <option key={r.id} value={r.id}>
              R{r.number} · {r.name}
            </option>
          ))}
        </select>
      </label>
      {meeting.snapshots
        .filter((s) => s.raceId === raceId)
        .map((s) => (
          <article className="tp-card" key={s.id}>
            <h3>
              {s.phase === "initial"
                ? "Initial estimate"
                : s.phase === "temporary"
                  ? "Scratch redistribution"
                  : "Revised estimate"}
            </h3>
            <small>{dateTime(s.at)} · Low confidence</small>
            <p>{s.evidence}</p>
            <ul>
              {race.runners.map((r) => (
                <li key={r.id}>
                  {r.name}:{" "}
                  {Number.isFinite(s.probabilities[r.id])
                    ? `${s.probabilities[r.id].toFixed(2)}%`
                    : "Unavailable"}
                </li>
              ))}
            </ul>
          </article>
        ))}
    </section>
  );
}
