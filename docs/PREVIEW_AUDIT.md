# TurfPulse AI Studio preview audit - 2 October 2026

## Scope and version distinction

Reviewed the user-supplied AI Studio app `0b125a67-bc2d-410c-b59a-e72b7bce3227` through its embedded preview. This preview is still the legacy prototype: R1 is Opening Sprint Stakes (1100 m, five runners), the directory lists 50 horses, and Derby details show Grade I/2400 m/16:35. It is not the canonical live app on GitHub main with ten races and 81 declarations. GitHub changes require an explicit AI Studio pull and rebuild; they are not automatically visible in this preview.

## Verified page observations

| Page or action | Observed result | Required follow-up |
|---|---|---|
| Live | Loads; next race, 3D area and remaining program render. WebGL initialization errors activate fallback in this browser. | Keep the useful race summary first; avoid calling static graphics live telemetry. Test real supported devices after pull. |
| Races | All ten demo cards render. Derby/Classics filter reduces the list to long-distance races. | Replace legacy context with canonical meeting. Full Card opening has the reproduced RaceDetailModal hook crash, already patched on GitHub. |
| Horses | Directory loads with 50 demo entries. Opening ADMIRINGLY blanks the preview. | Debug panel identifies HorseProfileModal hook-order error. Patched by calling countdown hook before selection guards. Use canonical 81-runner data. |
| News | Four bulletins render; Track & Weather filter works. | Demo bulletins are labelled Verified Official without evidence links. Use sourced meeting events with publication/retrieval timestamps and honest empty state. |
| History | Page renders with zero evaluated races, yet Brier 0.142, +INR4.90 return and a populated calibration matrix. | Use calculated official-result metrics and frozen predictions, as canonical live app already does. Missing metrics must remain unavailable. |
| AI panel | Opens and returns an answer to a verification question. | Response describes 3 October as today on 2 October, claims verified demo details with a future timestamp, and supplies generic source claims. Cannot accept it as live-data evidence or proof of successful Grok authentication. |

The AI UI simultaneously displays Gemini 3.8, Grok-2 and Grok labels. The tested answer was labelled Gemini 3.8 Flash. Provider identity and real credentials must be verified server-side; interface branding does not prove which provider ran.

This is a page-and-key-flow review, not complete device/network/provider acceptance. Background push, licensed feeds, database durability, real Grok credentials and production installation remain unverified. No simulator edits, reset, publishing, secret changes, or AI Studio source edits were performed.

## Recommended product polish

1. Establish a quiet hierarchy: next race and current status first, three leading estimates and one concise reason second, detailed runner evidence on demand. Use the existing sunlight-friendly three-tab design (Races, Track Alerts, Performance); directory, news and history can be nested views rather than more competing top-level tabs.
2. Keep a restrained visual system: consistent type scale, generous spacing, one green accent, clear dividers, predictable touch targets and optional dark mode. Reduce glowing badges, all-caps headings and repeated Brain/Grok/Gemini labels.
3. Make 3D a secondary optional view, lazy-loaded with a flat accessible fallback. It must not block navigation, dominate the first screen or pretend to be measured telemetry.
4. Separate sourced facts from model interpretation. Each important update needs a source, publication time and retrieval time. Show missing odds, form, weather, rails and track readings as unavailable. Confidence remains Low until evidence supports a validated model.
5. Make the assistant contextual: Explain this race, Compare two runners, What changed, and What is missing. Display evidence and limitations alongside its answer. Do not allow generated prose to establish scratches, conditions or results.
6. Remove developer actions from the public surface. Keep simulator/export/configuration controls outside race-day browsing. Operator controls belong in the protected console.
7. Finish consistent empty/loading/error/offline states, keyboard and modal focus behavior, mobile readability, and real result scoring before treating the interface as production-ready.

## Pull acceptance

Pull the latest main and follow LIVE_DATA_HANDOFF.md; preserve backend secrets. Confirm the canonical app entry point and Node API are running. Verify ten races/81 declarations, correct R1/R2 and Derby data, opening/closing all cards and runner details, source-health/offline behavior, and both actual provider success and safe failure. Do not bring the legacy demo context back to preserve decorative UI. Apply any retained visual components to the canonical live schema explicitly.

## Implementation following approval

The approved production-hardening branch implements a calmer canonical interface, horse directory, sourced meeting news, prediction history, contextual assistant, supported photo/attribution adapter and browser checks. The second legacy horse-profile hook-order issue is repaired. None of this silently updates AI Studio: pull and rebuild the branch (or its merged main checkpoint), and perform real integration acceptance above.
