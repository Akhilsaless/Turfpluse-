import React, { useState } from "react";
import { RunnerPhoto } from "./RunnerPhoto";
import { latestSnapshot } from "../live/model";
import type { Meeting, Race, Runner } from "../live/types";
import { time, dateTime } from "../live/display";
export function RaceCard({
  race,
  meeting,
  watch,
  toggle,
  initialOpen,
  onAsk,
}: {
  race: Race;
  meeting: Meeting;
  watch: string[];
  toggle: (id: string) => void;
  initialOpen?: boolean;
  onAsk?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen ?? race.number === 1);
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const snap = latestSnapshot(meeting, race.id);
  const probability = (id: string) => {
    const value = snap?.probabilities?.[id];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  const chosenRunner = race.runners.find((r) => r.id === selected);
  const comparedRunners = compare.flatMap((id) => {
    const runner = race.runners.find((r) => r.id === id);
    return runner ? [runner] : [];
  });
  const changes = meeting.events.filter((e) => e.raceId === race.id);
  const ranked = [...race.runners]
    .filter((r) => r.status === "declared")
    .sort((a, b) => (probability(b.id) ?? -1) - (probability(a.id) ?? -1));
  const result = race.results.at(-1);
  const show = (runner: Runner) => (
    <div className="tp-runner-info">
      <div className="tp-portrait-pair">
        <RunnerPhoto runner={runner} />
        <RunnerPhoto runner={runner} kind="jockey" />
      </div>
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
    <article className="tp-card" id={`race-${race.id}`}>
      <button
        className="tp-race-title"
        onClick={() => setOpen((value) => !value)}
        aria-controls={`runners-${race.id}`}
        aria-expanded={open}
      >
        <span>
          <small>
            R{race.number} · {time(race.scheduledAt)} IST · {race.distance} m
          </small>
          <span className="tp-card-name">{race.name}</span>
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
          snapshot {dateTime(snap?.at ?? null)}
        </p>
      )}
      {!result && (
        <div className="tp-top-picks">
          {ranked.slice(0, 3).map((runner, index) => (
            <p key={runner.id}>
              <b>{["Top Pick", "Main Danger", "Third candidate"][index]}:</b>{" "}
              {runner.name} ·{" "}
              {probability(runner.id) === null
                ? "Unavailable"
                : `${probability(runner.id)!.toFixed(2)}%`}
            </p>
          ))}
        </div>
      )}
      {!result && ranked[0] && (
        <small>
          Why: available rating and declared weight favour {ranked[0].name} in
          this field; form and track suitability still need verification. Value
          assessment awaits verified odds.
        </small>
      )}
      {changes.length > 0 && (
        <aside className="tp-alert">
          Latest change: {changes.at(-1)!.reason} ·{" "}
          {dateTime(changes.at(-1)!.publishedAt)}
        </aside>
      )}
      {onAsk && (
        <button className="tp-explain" onClick={onAsk}>
          Explain this race
        </button>
      )}
      {open && (
        <div id={`runners-${race.id}`}>
          <div className="tp-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Runner</th>
                  <th>Jockey / trainer</th>
                  <th>Draw / weight / rating</th>
                  <th>Win estimate</th>
                  <th>Odds</th>
                  <th>Compare</th>
                </tr>
              </thead>
              <tbody>
                {race.runners.map((r) => (
                  <tr
                    key={r.id}
                    className={r.status === "scratched" ? "tp-scratched" : ""}
                  >
                    <td>
                      <RunnerPhoto runner={r} />
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
                    <td>
                      {probability(r.id) === null
                        ? "Unavailable"
                        : `${probability(r.id)!.toFixed(2)}%`}
                    </td>
                    <td>{r.odds ?? "Unavailable"}</td>
                    {
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
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chosenRunner && show(chosenRunner)}
          {comparedRunners.length === 2 && (
            <div className="tp-compare">
              {comparedRunners.map((runner) => (
                <div key={runner.id}>{show(runner)}</div>
              ))}
            </div>
          )}
          <details>
            <summary>What changed? ({changes.length})</summary>
            {changes.length === 0 && (
              <p>No verified changes received for this race.</p>
            )}
            {[...changes].reverse().map((event) => (
              <p key={event.id}>
                {dateTime(event.publishedAt)} · {event.kind} · {event.reason} ·{" "}
                <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>
              </p>
            ))}
          </details>
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
        </div>
      )}
    </article>
  );
}
