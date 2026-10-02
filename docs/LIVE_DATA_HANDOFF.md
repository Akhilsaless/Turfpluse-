# TurfPulse live-data handoff for AI Studio

Pull the current `main` branch. Run Node 22+, `npm ci`, `npm run lint`, `npm test`, and `npm run dev`. The app entry point is `src/App.tsx`; canonical verified data is `src/live/october3.json`. Do not restore the previous `RacingProvider`/simulator fixtures. Old components remain as design references but are not mounted or trusted sources.

## First meeting

3 October **2026**, Royal Calcutta Turf Club, Kolkata, Asia/Kolkata. All ten races and 81 declared runners were imported from the official final card. R1/R2 are actual Captain Cook Handicap divisions, both 1600 m, at 12:30 and 13:00 IST. Race 8 has six Derby declarations. R9/R10 each have twelve declarations. Official card provenance is embedded in the data. Verify any revised declarations before race day. Historical injury footnotes are not current withdrawals.

No live odds, results, penetrometer, rails, weather, horse career strike rates, going preferences or jockey statistics have been invented. Missing data remains unavailable. Predictions are explicitly Low-confidence, **uncalibrated**, rating/declared-weight baselines; sourced pace can affect field interactions. This is not a trained or validated forecasting model.

## Changes included

- Sunlight-friendly responsive Races / Track Alerts / Performance tabs; all runners; searchable cards, runner evidence/risk details, watchlist and Derby comparison.
- Every race reads the same server state, polling every ten seconds, reconnecting on focus/network recovery; IndexedDB retains the last verified response offline with stale labels. API responses are never service-worker cached.
- Server-side permitted JSON feed adapters, parallel fetch with deterministic priority, bounded payloads/timeouts, evidence-domain checks, checksum/source timestamps, failure retention and source health.
- Scratch creates both temporary proportional redistribution and a full recalculation snapshot; reinstate/jockey/going/delay/odds/form/pace changes append snapshots. Win estimates sum to 100.00% for active runners (zero active runners => all zero).
- Operator-only `/ops` updates use server authorization, a strong server password, HttpOnly SameSite cookie, origin checks, rate-limited login, reason and HTTPS source evidence. No API keys in browser storage.
- Append-only audit captures actor, before/after, request/event identity, evidence timestamps and checksum. Results have provisional/official/corrected versions. Performance scores official/corrected results against frozen pre-result snapshots, with no fake ROI/calibration.
- Grok uses the xAI Responses API and verified current state, optionally restricted-domain web search. Errors remain explicit; there is no pretend fallback model. AI-generated prose cannot directly mutate race facts.
- Fixed npm peer dependency conflict, added lockfile and GitHub Actions checks. Retained PWA installation.

## Activate real updates in the app's backend

Code is ready for integration; **live source access is not already connected**. Configure backend-only `.env` variables from `.env.example` in AI Studio's runtime/secrets mechanism:

1. `XAI_API_KEY`, optional `GROK_MODEL` (default `grok-4.7`). Confirm this model is available to your account. `GROK_WEB_SEARCH=true` enables discovery on `GROK_SEARCH_DOMAINS` (maximum five domains per request). Broader source coverage requires configured permitted feeds, not an unsupported promise of every website.
2. Dedicated `DATABASE_URL`; apply `server/schema.sql` first. Use a backend-only owner/service database role (with permission to bypass RLS) and a secure DB connection; ordinary browser roles have no table policies. RLS blocks direct browser access; audit/snapshot triggers deny update/delete. PostgreSQL writes lock the meeting row transactionally, so concurrent workers cannot lose changes. Alternatively a single server may use an explicitly persistent `DATA_DIR`. Production refuses writes without either. Local development `.data` is not production persistence.
3. `OPS_PASSWORD` (at least 16 characters), `OPS_ACTOR`, `SESSION_SECRET`, and `SYNC_SECRET` (at least 24 characters). Use individual authenticated identities/SSO before adding multiple operators. Current console supports one configured operator. Do not use a PIN as the only protection.
4. `RACE_FEEDS_JSON` with the permitted source configurations below. An empty registry displays “live sources awaiting connection.” A disabled source is never fetched. RCTC's current disclaimer page says “content awaited”; this does not establish automated access/republication permission. Obtain authorized feed access/terms for each source before marking permission confirmed.
5. `AUTO_SYNC=true` on a continuously running backend, or have your existing scheduler POST `/api/sync` using `Authorization: Bearer <SYNC_SECRET>`. Set `AUTO_ANALYSE=true` to automatically ask Grok to analyse newly verified changes, saving a revision-labelled interpretation to Track Alerts. AI analysis is separate from race fact mutations; provider errors leave facts intact. No deployment, Vercel settings, or platform scheduler is changed by this commit.

### Source configuration

```json
[
  {
    "id": "rctc-authorized",
    "name": "RCTC authorized feed",
    "url": "https://YOUR-PERMITTED-PROVIDER.example/rctc/2026-10-03",
    "licenseConfirmed": false,
    "authority": "official",
    "evidenceDomains": ["rctconline.com"],
    "priority": 1,
    "tokenEnv": "RCTC_FEED_TOKEN"
  }
]
```

Add as many approved official/licensed providers as available (up to 30 per sync). Lower numeric priority wins simultaneous conflicting facts. This is a typed feed integration contract, not a scraper for arbitrary HTML/PDF pages. A provider-specific adapter must convert an authorized provider's actual API format into the envelope below. Source URLs are server-configured; clients cannot supply fetch targets.

### Feed envelope and change schema

```json
{
  "publishedAt": "2026-10-03T12:00:00+05:30",
  "changes": [
    {
      "id": "provider-stable-withdrawal-123",
      "meetingId": "rctc-2026-10-03",
      "raceId": "r1",
      "runnerId": "r1-h1",
      "kind": "scratch",
      "value": "",
      "reason": "Official withdrawal bulletin",
      "sourceUrl": "https://rctconline.com/YOUR-ACTUAL-BULLETIN",
      "publishedAt": "2026-10-03T11:59:00+05:30"
    }
  ]
}
```

IDs are immutable per provider event; reusing an ID with altered content is rejected. Use stable provider-prefixed IDs. Race/runner IDs are in the seed (`r1`…`r10`, `r1-h1`…`r10-h12`), never infer IDs from array position in external data. Only changes published after the initial imported card are accepted. Older injury reports cannot update race state. Newer facts on the same field reject older competing evidence. Invalid batches are held without partial race mutation.

Kinds: `scratch`, `reinstate`, `jockey` (string), `going` (string, race-wide), `delay` (ISO time on meeting date with timezone), `status` (`scheduled`, `delayed`, `running`, `cancelled`), `odds` (decimal >1), `pace` (`leader`, `stalker`, `closer`), `form` (verified string), `notice` (string), `result`.

Result value: `{"stage":"provisional|official|corrected","placings":["r1-h1","r1-h2"]}`. Placings must be distinct active runner IDs. Corrections require a prior official result and a newer publication time. A finished/cancelled race rejects prediction-changing edits; result corrections append rather than overwrite.

## Remaining integration / feature work

- Real credentials and provider access are required to prove end-to-end live ingestion and Grok availability. Neither was available for this change; tests use mocked provider responses.
- Existing legacy 3D components are retained as reference, but are not wired to the canonical live meeting. Avoid binding them back to fabricated local fixtures.
- Browser notifications work while the app is open; background Web Push/SW subscriptions and delivery remain unimplemented.
- Per-user SSO/roles and revocable sessions for multiple operators remain a separate integration; operator password is a single backend account. `SESSION_SECRET` must match across server replicas.
- Historic form ingestion, source-specific PDF/HTML parsing, actual odds providers, model training/calibration, weather/rails/penetrometer inputs, additional meeting imports and richer result finishing times require actual authorized source contracts. The current seed and API are intentionally limited to the requested first meeting, with typed domain models available to extend.
- Never label fetched static declarations as a live odds/results feed or Low confidence as validated confidence. Keep source freshness separate from frontend/server connectivity.


## Race-card reliability follow-up (2 October 2026)

The live race card now lives in `src/components/LiveRaceCard.tsx`. Keep it attached to `src/App.tsx` and the canonical live schema; never replace it with the legacy `RaceDetailModal` and demo context. The legacy modal hook-order issue was also repaired, but that modal remains unmounted.

This follow-up validates complete meeting responses and offline cache structures, rejects corrupt watchlist values, safely handles missing probability/runner selections, isolates card rendering failures, and bounds requests. It also adds a next-race countdown, one-tap race navigation, top-three summaries with explicit baseline limitations, and per-race sourced change timelines. These changes do not activate a provider feed or validate forecasts.

### Reuse the key already entered in AI Studio

Do not ask for the secret in chat, embed it in generated code, or commit it. Confirm that the saved **xAI Grok** credential is exposed to the backend Node process as `XAI_API_KEY` (the existing `GROK_API_KEY` server alias also works). A Google/Gemini credential cannot authenticate xAI. Merely saving a key in an AI Studio UI does not prove that the Express backend receives it.

Run the full app with `npm run dev` or production `npm run build` followed by `NODE_ENV=production npm start`. `npm run preview` serves the frontend alone and is not the application's backend. Verify `/api/meeting` returns JSON with all ten races, and `grokConfigured: true`; this flag means a credential is present, not that authentication or account quota has been verified. Then make one real Ask Grok request from the app. The same backend must expose `/api/ops/*` and `/api/sync`.

Verified against the user's AI Studio preview: clicking Full Card blanks the app with `Rendered more hooks than during the previous render` in `RaceDetailModal`. React reports useContext/useState on the previous render and an extra useState after selection. This is caused by calling `useRaceCountdown` after the early selectedRaceId return. The GitHub fix calls that hook on every render before selection guards. The preview was still using the legacy demo context (R1 Opening Sprint Stakes, 1100 m, five runners), not the latest canonical meeting. It also logged a Vite HMR WebSocket failure and WebGL initialization errors; the WebGL component activated its fallback. These are separate from the reproduced fatal modal hook error. Regression checks cover all ten expanded cards, missing predictions and corrupt storage. Full live-feed acceptance still requires provider access, durable storage and a successful real Grok request. No Vercel configuration or deployment is changed.
