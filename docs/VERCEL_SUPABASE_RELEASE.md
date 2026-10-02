# TurfPulse: Vercel + Supabase release

Continue this repository; the installable Vite PWA and Express API remain intact.
Vercel serves `dist` on its CDN and bundles `api/[...path].ts` for API requests.
No persistent timer, local JSON file or in-memory production rate limiter is used on Vercel.

## Required deployment setup

1. Create a **dedicated TurfPulse Supabase project** in the organization selected by the owner. Do not reuse CareConnect or MVS ACMEI. Confirm any project cost through the provider flow first.
2. Apply `server/schema.sql` using the database owner. RLS is enabled and browser roles have no access to these tables. The existing server API is the only read/write path.
3. Configure backend-only `DATABASE_URL` with the Supabase transaction pooler connection string. Use a restricted server role with SELECT/INSERT/UPDATE on `turf_meetings` and `turf_rate_limits`, SELECT/INSERT on `turf_audit` and `turf_snapshots`, plus required schema usage. Grant no DELETE on historical records. Never expose credentials in `VITE_*` variables.
4. Import this repository into a **new TurfPulse Vercel project** in the connected team; retain the Vite framework and the committed `vercel.json`.
5. Securely configure `XAI_API_KEY`, a random `SESSION_SECRET` (at least 32 characters), `OPS_PASSWORD` (at least 16 characters) and a random `SYNC_SECRET` (at least 24 characters). The saved AI Studio key is not available to this deployment automatically. Generate operator/sync secrets securely; do not ask the owner to invent them or paste them into chat.
6. Configure only permitted source adapters using `RACE_FEEDS_JSON` as described in `LIVE_DATA_HANDOFF.md`. **The current adapter consumes normalized JSON changes; entering an RCTC HTML/PDF URL is not enough. A real source-specific adapter still needs implementation and testing.**
7. Set `AUTO_ANALYSE=true` only after a live Grok check and an acceptable usage budget. Automated analysis is awaited within the request so serverless termination cannot silently discard it.

## Background scheduling

Vercel does not run the app's local `setInterval` updater. Use Supabase Cron with `pg_net` to call the deployed HTTPS `POST /api/sync` endpoint on an agreed race-day schedule. Store the URL and sync secret in Supabase Vault; retrieve them inside the job, without putting secrets in committed SQL or job text. Inspect `cron.job_run_details` and `net._http_response` to prove requests complete, and alert on failed/missed checks. Bound HTTP timeouts and prevent overlapping runs before activating a frequent schedule. Schedule must respect source access limits.

This uses a scheduler separate from Vercel's daily Hobby cron. Provider availability, cost and the owner's organization must be confirmed before provisioning. No scheduler or feed has been activated by this commit.

## Release evidence required

- Verify deployed `/api/meeting` returns all ten races and 81 declarations from PostgreSQL; verify restarts and two devices retain the same revision.
- Verify `/api/health` reports database, operator configuration, Grok configuration and feed health accurately. `integrationsConfigured` means settings/feed checks are present; **it is not a production acceptance certificate**.
- Verify an actual server-side Grok response; no keys or raw provider errors reach the browser.
- Test concurrent requests across separate instances against the shared database rate limits. Delete expired rate-limit rows on a maintenance schedule.
- Apply a sourced withdrawal, delay, provisional result and corrected official result. Verify changes on a second device, immutable history, and frozen pre-result prediction evaluation.
- Verify a real source update is retrieved automatically, plus source outage, reconnect, stale warnings, malformed input and conflict recovery.
- Run desktop/mobile browser tests against the deployed preview before production promotion. Test `/ops`, API routing, manifest, service worker and home-screen installation on physical devices.
- Source licenses/photo identity, background notifications, cross-device user watchlists and historical data coverage still require their own acceptance checks. Local browser tests do not prove these external integrations.

## Beneficial next improvements

- Meeting/date selection: the current seed/store/cache are specific to 3 October 2026. Generalize IDs and ingestion before claiming future-meeting coverage.
- Verified historical form and evaluation: the current prediction model is explicitly an uncalibrated rating/weight baseline, not a proven win-probability model.
- User accounts and server-saved watchlists: current watchlists are local to a browser.
- Push alerts after permission, with duplicate suppression and source timestamps.
- Side-by-side runner comparisons with sourced evidence and missing-data indicators.
- Correctly matched, licensed horse/jockey photos; keep unavailable states where evidence is missing.

This commit prepares deployment. It does not claim a live deployment, connected race source, native APK, or completed production release.
