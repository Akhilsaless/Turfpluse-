# AI Studio: start with the Grok key you already have

Keep the existing **XAI_API_KEY** in AI Studio's backend Secrets. Do not ask the user to re-enter it in chat or code. It is the only external credential required to use Grok analysis. Google/Gemini API credentials are not required by this application.

Pull the latest `main`, keep the canonical `src/App.tsx` and Node backend, install with `npm ci`, and rebuild. `.env.example` intentionally contains only XAI_API_KEY. `server/settings.ts` reads optional deployment overrides without making them startup requirements. Do not present every optional setting as a required secret. If the existing AI Studio app retained the old environment-variable form, dismiss that form and ask the AI Studio agent to remove the optional required fields; pulling GitHub does not automatically clear AI Studio's previously generated setup UI.

The app can open all ten races and 81 verified declarations, browse runner details, watchlist, search, history and source status, and request Grok analysis with no other configured service. An actual successful server-side Grok request must still be checked: the key must have account access/billing for the selected model. Do not infer success merely from a badge or a saved secret.

## Optional settings and their current defaults

| Setting             | Default / behavior when absent                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| GROK_MODEL          | `grok-4.7` (override only if the account needs a different supported model)                                                            |
| GROK_WEB_SEARCH     | `false`; model analysis uses supplied verified meeting data                                                                            |
| GROK_SEARCH_DOMAINS | `rctconline.com`, used only when web search is explicitly enabled                                                                      |
| AUTO_SYNC           | `false`                                                                                                                                |
| AUTO_ANALYSE        | `false`                                                                                                                                |
| SYNC_INTERVAL_MS    | `60000` milliseconds, used only when sync is enabled                                                                                   |
| RACE_FEEDS_JSON     | `[]`; no provider is connected or invented                                                                                             |
| RUNNER_PHOTOS_JSON  | `[]`; no guessed horse/jockey pictures                                                                                                 |
| OPS_ACTOR           | `operator`, used only for authenticated operations                                                                                     |
| DATABASE_URL        | Unconfigured; never insert a fake connection string                                                                                    |
| DATA_DIR            | Unconfigured; development file storage is explicitly local, not guaranteed durable hosting                                             |
| OPS_PASSWORD        | Unconfigured; operator login remains disabled                                                                                          |
| SESSION_SECRET      | Required only for production operator login; generate a strong secret in the platform's secure backend setup when activating operators |
| SYNC_SECRET         | Unconfigured; external sync requests remain disabled                                                                                   |

The ordinary settings above are defaults, not API credentials. There is no need to create extra API accounts for them. Passwords/signing tokens can be generated securely when the corresponding feature is activated; do not put generated secrets in GitHub.

## What the key does not supply

Grok analysis does not provision a database or provide an authoritative racing feed, licensed odds or real horse/jockey photos. Model/web-search responses must not be labelled official live telemetry or silently mutate scratches/results. Missing integrations retain honest unavailable/disabled labels. Production writes continue to require a configured PostgreSQL database or an explicitly persistent single-server volume; do not bypass that protection, set a random DATA_DIR merely to silence the requirement, or claim the full application is production-ready without durability and live-source verification.

For the immediate AI Studio blocker, paste this into the AI Studio app chat:

> Pull the latest main from Akhilsaless/Turfpluse-. Read docs/AI_STUDIO_KEY_ONLY_SETUP.md. Preserve my already saved XAI_API_KEY. Remove the optional environment variables from the required setup form; only XAI_API_KEY is needed for Grok analysis. Use the documented defaults and leave unconfigured integrations disabled with clear status. Do not create fake database URLs, feed credentials, images or sample results. Start the real Node backend, verify a successful server-side Grok request, and check all ten race cards. Keep production-write safeguards intact. Do not deploy or change Vercel.
