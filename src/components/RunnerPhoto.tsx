import React, { useState } from "react";
import type { Runner, VerifiedPhoto } from "../live/types";

export function RunnerPhoto({
  runner,
  kind = "horse",
}: {
  runner: Runner;
  kind?: "horse" | "jockey";
}) {
  const photo = kind === "horse" ? runner.horsePhoto : runner.jockeyPhoto;
  return (
    <Photo
      key={photo?.url || `${runner.id}-${kind}`}
      photo={photo}
      label={kind === "horse" ? runner.name : runner.jockey}
      kind={kind}
    />
  );
}
function Photo({
  photo,
  label,
  kind,
}: {
  photo?: VerifiedPhoto;
  label: string;
  kind: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`tp-photo tp-photo-${kind}`}>
      {photo && !failed ? (
        <img
          src={photo.url}
          alt={`${label} — verified ${kind} photograph`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="tp-photo-empty">
          <span>{kind === "horse" ? "Horse photo" : "Jockey photo"}</span>
          <small>Photo unavailable</small>
        </div>
      )}
      {photo && !failed && (
        <figcaption>
          <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
            {photo.credit}
          </a>
        </figcaption>
      )}
    </figure>
  );
}
