# TurfPulse deployment checkpoint — 2 October 2026

Continue this app and its existing canonical meeting.

- Dedicated Supabase project: `nvhajvtynlxdkoxdkxxs`, TurfPulse, Akhilsaless's Org, Mumbai. Provider quoted $0/month at creation.
- Tables and immutable-history triggers are installed. Function search path is fixed and public execution revoked.
- `turf_meetings` contains `rctc-2026-10-03`: 10 races, 81 runners. This count was queried from PostgreSQL.
- Runtime database role `turf_runtime` has RLS policies and scoped SELECT/INSERT/UPDATE grants; it cannot delete historical rows. Browser roles remain denied.
- Vercel project: `turfpulse`, team `mvs-acmei`, public alias `https://turfpulse-one.vercel.app/`. Git integration follows this repository's main branch.
- DATABASE_URL, SESSION_SECRET and SYNC_SECRET were saved as production secrets. No credential values belong in this file or Git.
- Initial production runtime failed with ERR_UNSUPPORTED_DIR_IMPORT because `../server` resolved to the directory. The backend now builds to `server-build/runtime.mjs`, and the API imports that explicit bundle.
- Type checking, all 25 tests, frontend/backend build and native Node import of the built Vercel handler pass locally.
- Chromium installation still fails with a truncated/invalid ZIP; automated browser suite remains blocked.

## Remaining acceptance

Verify redeployed API and actual runtime database TLS connection; test desktop and mobile flows. Configure XAI_API_KEY securely in Vercel and verify live Grok model access. OPS_PASSWORD is not configured. No real feed or scheduler is active. Authorized source access, source-specific adapters, physical-phone installation, two-device change propagation and the master-plan feature gaps remain incomplete.

Do not call this a production-ready live racing service until those checks pass. Grok prose must not mutate race facts. Predictions remain uncalibrated declaration baselines.
