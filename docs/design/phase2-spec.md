# Phase 2 spec: layout, visual system, accessibility

This is the spec the Phase 2 build follows. Tokens live in `css/styles.css`; component changes are in `js/lib/dojo-components.js`; layout breakpoints are in `src/screens/*`.

## 1. Type scale (20 sizes → 7)

| Token | Size | Family / weight | Used for |
|---|---|---|---|
| `--text-display` | 44 px | Condensed 800 | Page title |
| `--text-title` | 30 px | Condensed 700–800 | Section titles, month title, stat values |
| `--text-heading` | 24 px | Condensed 700–800 | Dialog and check-in titles, plan day number |
| `--text-subhead` | 20 px | Condensed 700 | Card titles, details summaries, week labels, tallies |
| `--text-body` | 16 px | Barlow 400–600 / Condensed for numerals | Body, calendar day number, motto, rule titles |
| `--text-small` | 14 px | Barlow / Condensed labels | Secondary text, labels, chips, legend |
| `--text-caption` | 12 px | Barlow 500 | Captions, minutes, dates on cards, tags. **Floor: nothing smaller.** |

Old → new: 10, 11 → 12 · 13 → 14 · 15, 17, 18 → 16 · 22 → 20 · 26 → 24 · 34, 36 → 30.

## 2. Colour tokens added

| Token | Light | Dark | Measured |
|---|---|---|---|
| `--walk-ink` | `#237A5E` | `#52C29B` | 5.23:1 on card (light), 7.37:1 (dark) |
| `--finish-ink` | `#B8344E` | `#EE6B82` | 5.77:1 (light), 5.45:1 (dark) |
| `--on-lane` | `#FFFFFF` | `#0F1626` | 6.62:1 / 6.47:1 (fixes the dark "Today" tag, which was 2.79:1) |

Kind colours used as **text or chip fill** use the `-ink` variants; the bright originals stay for borders.

Dark mode now follows `prefers-color-scheme` automatically, with a header switch: **Auto → Dark → Light**, remembered on the device.

## 3. Status shapes (never colour alone)

| Status | Marker | Glyph |
|---|---|---|
| Done | Yellow disc | ✓ (done-ink, 7.89:1 on yellow) |
| Light | Half-filled blue disc | shape itself |
| Missed | Red ring, tinted | ✕ |
| Rest | Grey disc | moon (ink, 7.85:1 on grey) |
| To do (today/future, nothing logged) | Solid grey ring (was dashed, read as a spinner) | none |
| Past, nothing logged | No marker | — |

Same glyphs in the calendar (18 px marker, 14 px compact), legend, and editor options. Plan cards' "not done" circle becomes a solid ring too.

## 4. Components

- **Tabs** become a segmented control: tinted track, selected tab is a raised card-colour segment. They no longer look like the answer pills. Roving tabindex, ←/→/Home/End move between tabs, `aria-controls` → `tabpanel`.
- **Today** in the calendar: day number inside a filled lane badge, plus the existing 2 px lane border. On plan cards the "Today" tag sits inline after the number (no overlap).
- **Editor status options** each show their status marker; selected = 2 px ink border, card background, ✓ at the end.
- **Counter** is one control: `[ − ]  2  [ + ]`, 44 px buttons.
- **Touch targets** ≥ 44 px: pills, nav arrows, counter, dialog close, tabs.
- **Hover / press**: cells and cards get a hover ring; all buttons darken slightly on hover and press down 1 px (no motion under reduced-motion).
- **Number fields** lose the browser spinner arrows.
- **Calendar container** drops `role="grid"` (it had no rows/cells, so screen readers announced a broken table); it becomes a labelled group of labelled buttons.
- **28-day strip** becomes a labelled list ("Oct 12: 3 of 3 sets, practice"), numerals at 12 px.
- **Toast** is fixed to the viewport bottom with the safe-area inset.

## 5. Breakpoints

| Width | Calendar | Running plan | Stats / rules / stages | Month bar |
|---|---|---|---|---|
| < 640 px (phone) | 7 compact cells + 40 px week column; minutes hidden, run chip icon-only | Week label row, then cards in **3 columns** | Auto-fit, min 150 px → 2 columns | `‹ Month ›` then `Today` / picker on the right, wrapping as a group |
| 640–959 px | Full cells + week column | Week label row, cards in **4 columns** | Auto-fit | Same |
| ≥ 960 px | As today | Label column + 7 cards | 3 / 4 columns | Same |

Goal + target: `minmax(0, 1fr) 110px` at every width.

**Acceptance:** no horizontal scroll at 390 px on any tab or open section; every text pair ≥ 4.5:1 and every marker either ≥ 3:1 or carrying a glyph; every control ≥ 44 px; `npm test` green.
