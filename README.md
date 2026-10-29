# Dojo

A personal training log with three views:

- **Today**: log the day in a few taps (workout, running-plan day, sets, practice) and see this week.
- **Month**: the calendar, monthly figures, and a month review (goal, target, notes).
- **Programs**: the 21-day run/walk plan and the pelvic-floor program.

**Settings** holds the theme, discreet mode (neutral wording for logging in public) and backups. Everything is stored in your browser on this device; nothing is sent anywhere.

## Run it

The app is plain static files once built. Serve the folder and open it:

    npm install
    npm run build          # writes dist/app.js
    npm run serve          # http://localhost:8000/

Or double-click `run-dojo.bat` (Windows) / `run-dojo.sh` (macOS, Linux) after building once. No internet is needed: React and the Barlow fonts are bundled.

During development, `npm run watch` rebuilds `dist/app.js` on every change.

## Test

    npm test               # unit tests (node:test) + browser smoke test (Playwright)
    npm run test:unit      # just the pure logic and state tests

The smoke test needs Playwright's Chromium (`npx playwright install chromium` once, or set `PLAYWRIGHT_BROWSERS_PATH`). It serves the repo, loads the built app, logs a day, reloads to check it persisted, and writes screenshots to `test/screenshots/` for design review.

Query switches for screenshots and tests: `?demo=1` loads sample data without touching your saved data; `?today=YYYY-MM-DD` pins "today". The view is in the hash: `#today`, `#month/2026-10`, `#programs/run`, `#programs/pf`.

The browser tests also run axe-core (WCAG 2.1 AA) on every view in both themes. Design specs, reviews and the accessibility audit are in `docs/design/`.

## Backups

Open **Settings** to download a JSON backup, restore one, or clear everything. The file format is the state shape documented at the top of `src/store.js`.

## Layout

```
index.html              page shell; loads css/ and dist/app.js
css/
  fonts.css             @font-face for the self-hosted Barlow files in fonts/
  styles.css            design tokens (colours, type, spacing)
  base.css              reset, focus ring, reduced motion
src/
  main.jsx              entry: globals → component library → <App/>
  env.js                today's date and the ?demo / ?today switches
  route.js              view <-> URL hash
  words.js              program vocabulary (normal / discreet)
  layout.js             breakpoints and auto-fit grids
  theme.js              Auto / Light / Dark preference
  logic.js              plan tables, date helpers, pelvic-floor schedule (pure)
  store.js              state shape, validation, localStorage, backup import/export
  reducers.js           pure state transitions used by the screens
  demo.js               sample state for ?demo=1
  App.jsx               wiring and persistence
  screens/              Header, Today, Sheet (Month), Programs, DayEditor, Settings, Toast
js/lib/dojo-components.js   compiled component library (design-system snapshot; expects a global React)
scripts/build.js        esbuild bundle
scripts/fetch-fonts.js  one-off download of the font files
test/unit/              node:test for logic.js, store.js, reducers.js
test/smoke/             Playwright browser tests (incl. axe) + screenshots
docs/design/            phase specs, design review, accessibility audit
dist/app.js             built bundle (committed so the folder runs without a toolchain)
```
