# Project status

Last updated: 29 Oct 2026, after Phase 5 and the "Start today" change. Live at the GitHub Pages site for this repo; `main` deploys automatically and the app offers a Reload banner on the next open.

## Where things stand

- Six phases done (see `docs/design/phase*-spec.md` and the reviews beside them): foundations, core fixes, visual system, accessibility audit, Today / Month / Programs structure, plan controls and charts, installable offline app.
- 50 tests (`npm test`): 26 unit, 24 browser (Playwright), including axe WCAG 2.1 AA on every view in both themes, offline reload, update prompt, reminder timing and a first-load budget.
- CI (`.github/workflows/ci.yml`) is green on `main`. It fails on a stale committed build, a failing test or a budget overrun.
- `docs/design/handoff.md` is the living spec: tokens, components, states, breakpoints, rules and which test protects each.

## How to work on it

1. Branch, change, `npm run build` (the built `dist/app.js` and `sw.js` are committed), `npm test`.
2. Push, open a PR, wait for CI, merge. Pages publishes `main` within a minute.
3. `npm run verify` runs exactly what CI runs. `?demo=1` loads sample data without touching real data; `?today=YYYY-MM-DD` and `?now=HH:MM` pin the clock.

## Known limits (by design unless noted)

- Data lives in one browser on one device; back up from Settings. No sync.
- Reminders work while the app is open or in the background only; a reminder with the app fully closed would need a push server.
- The 21-day running plan is fixed; the schedule can be repeated, pushed back or restarted, but not edited.
- Discreet mode is off by default (`settings.discreet`).
- No real screen-reader pass yet (VoiceOver / NVDA); automated checks only.

## Candidates for next

1. A week of daily use, then fix what actually chafes.
2. Screen-reader pass.
3. CSV export; custom plans; sync (sync changes the "nothing leaves this device" promise, so decide first).
