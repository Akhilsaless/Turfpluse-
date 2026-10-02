# TurfPulse deployment checkpoint — 2 October 2026

Continue this app and its existing canonical meeting.

- Dedicated Supabase project: `nvhajvtynlxdkoxdkxxs`, TurfPulse, Akhilsaless's Org, Mumbai. Provider quoted $0/month at creation.
- Tables and immutable-history triggers are installed. Function search path is fixed and public execution revoked.
- `turf_meetings` contains `rctc-2026-10-03`: 10 races, 81 runners. This count was queried from PostgreSQL.
- Runtime database role `turf_runtime` has RLS policies and scoped SELECT/INSERT/UPDATE grants; it cannot delete historical rows. Browser roles remain denied.
- Vercel project: `turfpulse`, team `mvs-acmei`, public alias `https://turfpulse-one.vercel.app/`. Git integration follows this repository's main branch.
- DATABASE_URL, SESSION_SECRET and SYNC_SECRET were saved as production secrets. No credential values belong in this file or Git.
- Initial production runtime failed with ERR_UNSUPPORTED_DIR_IMPORT because `../server` resolved to the directory. The backend now builds to `server-build/runtime.mjs`, and the API imports that explicit bundle.
- Native Node import of the built Vercel handler passes. Type checking, all 28 tests and frontend/backend build pass after adding TLS coverage.
- The next production failure was SELF_SIGNED_CERT_IN_CHAIN. The server now trusts the official Supabase Root 2021 CA, downloaded from Database Settings, while keeping certificate and hostname verification enabled.
- The public deployed UI was verified connected to the meeting server at 14:39 IST on 2 October 2026. All ten cards remain available. A real assistant request created a rate-limit record in PostgreSQL, proving restricted runtime writes; without XAI_API_KEY it correctly returned unavailable rather than fabricating analysis.
- Supabase's security advisor returned no findings after the restricted-role policies and function hardening.
- Vercel's connected tools are not usable for this project: deployment returns tool-not-found, project lookup has a schema mismatch, project listing omits the new project, and authenticated URL fetch returns an account-access 403. Website deployment and verification succeeded through the user's authorized browser fallback.
- Chromium installation still fails with a truncated/invalid ZIP; automated browser suite remains blocked.

## Grok configuration verification — 15:11 IST

The user saved XAI_API_KEY as a production secret. Vercel redeployment was ready, but the live assistant returned unavailable. Commit abc7ec0 adds secret-safe HTTP error categories; a real production request at 09:40:41 UTC returned XAI_HTTP_400_INVALID_API_KEY. The provider rejected the saved credential. Raw provider messages, keys and request contents are never logged or returned to the client. Type checking, all 28 tests and the frontend/backend build pass. OPS_PASSWORD is still absent from the production variable list. The user must replace the key with a valid xAI API key and choose the operator password securely.

## Remaining acceptance

Replace the rejected XAI_API_KEY securely in Vercel and verify live Grok model access. OPS_PASSWORD is not configured. No real feed or scheduler is active. Authorized source access, source-specific adapters, physical-phone installation, complete desktop/mobile flows, two-device change propagation and the master-plan feature gaps remain incomplete. Direct browser navigation to /api/health was blocked by the browser client; UI meeting fetch and the database-backed rate-limit write were verified instead.

Do not call this a production-ready live racing service until those checks pass. Grok prose must not mutate race facts. Predictions remain uncalibrated declaration baselines.
