# Phase 5 spec: installable, offline, reminders, guard rails

## 1. Install

- `manifest.webmanifest`: name "Dojo", standalone display, start URL `./#today`, theme and background colours from the tokens, and icons at 192 / 512 px (regular and maskable) plus a 180 px Apple touch icon and an SVG favicon.
- **Icon**: the app's own "done" marker, a yellow disc with a dark check, on the ink-navy background. Maskable variants keep the disc inside the 80% safe zone.
- `<meta name="theme-color">` per colour scheme so the phone's status bar matches light and dark.

## 2. Offline

- A service worker precaches everything the app needs (page, CSS, fonts, bundle, icons, manifest). After the first visit Dojo opens with no network at all.
- The build generates `sw.js` with a content hash of those files as its cache name, so every build that changes a file ships a new cache, and old caches are deleted on activation.
- **Updates never interrupt**: a new version waits. The app shows "A new version is ready" with **Reload**; nothing changes until you tap it.
- Data was already local (localStorage); offline changes nothing about saving.

## 3. Reminders (opt-in, Settings)

- "Daily reminder" with a time (default 19:00), off by default.
- If you haven't logged anything today by that time:
  - while Dojo is open or in the background, a system notification (when allowed) or an in-app banner;
  - when you next open Dojo, a banner on Today: "Nothing logged yet today."
- **Limit, stated in Settings**: a reminder at a set time while the app is fully closed needs a push service, which would mean sending data off the device. Dojo doesn't do that.

## 4. Guard rails (CI)

- GitHub Actions on every push and PR: install, build, **fail if `dist/` or `sw.js` differ from the committed copies** (so the committed build always matches `src/`), unit + browser tests (including axe), and the performance budget.
- **Budget**: `dist/app.js` ≤ 80 KB gzipped; first load (page, CSS, fonts actually used, bundle) ≤ 350 KB uncompressed. At Phase 5: 70 KB gzipped / about 250 KB measured in the browser.

## 5. Handoff

`docs/design/handoff.md`: the living spec for future work: tokens, components and their states, breakpoints, patterns (save-as-you-tap, undo, discreet vocabulary), and where each rule is tested.

## Acceptance

- Chrome reports no installability errors (checked in tests through the DevTools protocol).
- With the network off, a reload shows the app and existing data (tested).
- An update shows the Reload prompt and does not reload by itself.
- CI fails on a stale `dist/`, a failing test, or a budget overrun.
