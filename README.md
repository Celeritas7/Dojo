# Dojo

A personal training sheet: a monthly calendar you tap to log workouts, a 21-day run/walk plan, and a pelvic-floor program with check-ins and test sessions. Everything is stored in your browser on this device; nothing is sent anywhere.

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

Query switches for screenshots and tests: `?demo=1` loads sample data without touching your saved data; `?today=YYYY-MM-DD` pins "today".

## Backups

Open **Backup and data** at the bottom of the monthly sheet to download a JSON backup, restore one, or clear everything. The file format is the state shape documented at the top of `src/store.js`.

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
  logic.js              plan tables, date helpers, pelvic-floor schedule (pure)
  store.js              state shape, validation, localStorage, backup import/export
  reducers.js           pure state transitions used by the screens
  demo.js               sample state for ?demo=1
  App.jsx               wiring and persistence
  screens/              Header, Checkin, Sheet, Programs, DayEditor, Data
js/lib/dojo-components.js   compiled component library (design-system snapshot; expects a global React)
scripts/build.js        esbuild bundle
scripts/fetch-fonts.js  one-off download of the font files
test/unit/              node:test for logic.js, store.js, reducers.js
test/smoke/             Playwright browser test + screenshots
dist/app.js             built bundle (committed so the folder runs without a toolchain)
```
