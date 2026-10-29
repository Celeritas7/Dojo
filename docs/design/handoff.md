# Handoff spec: Dojo (living document)

The single reference for anyone changing Dojo. It describes the app as built through Phase 5. The phase specs and reviews in this folder record *why*; this file records *what is true now*. Update it in the same commit as any change it describes.

## Overview

A personal training log used daily, mostly on a phone, often in public. Three views and a Settings dialog:

| View | Job | Default? |
|---|---|---|
| **Today** (`#today`) | Log the day in about three taps; see this week and the current streak | Yes |
| **Month** (`#month/YYYY-MM`) | Calendar, the month's figures, minutes-per-week chart, month review | |
| **Programs** (`#programs/run`, `#programs/pf`) | 21-day running plan with schedule controls; pelvic-floor program with control chart | |
| **Settings** (dialog) | Theme, discreet mode, reminder, backup / restore / clear | |

Everything is stored on the device (`localStorage` key `dojo.state`, schema in `src/store.js`). Nothing is sent anywhere. The app installs as a PWA and works offline.

## Design tokens (`css/styles.css`)

Always use tokens; there are no raw colour or font-size values in components.

### Type (7 steps, 12 px floor)

| Token | Size | Use |
|---|---|---|
| `--text-display` | 44 px | Page title (Condensed 800) |
| `--text-title` | 30 px | Section titles, month title, primary figures, full-size stat values |
| `--text-heading` | 24 px | Dialog titles, plan day number |
| `--text-subhead` | 20 px | Card titles, week labels, compact stat values, chart titles |
| `--text-body` | 16 px | Body, calendar day numbers |
| `--text-small` | 14 px | Secondary text, labels, chips, legend |
| `--text-caption` | 12 px | Captions, minutes, chart axes. Nothing smaller. |

Families: `--font-display` (Barlow Condensed) for headings and numerals, `--font-body` (Barlow) for text. Both are self-hosted (`fonts/`).

### Colour (light / dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F5F7FA` | `#0F1626` | Page background |
| `--card` | `#FFFFFF` | `#172036` | Cards, dialogs |
| `--ink` / `--ink-2` | `#1B2A4A` / `#51607D` | `#E6ECF7` / `#9DAAC4` | Text / secondary text |
| `--line` | `#D9DFEA` | `#2A3654` | Borders, gridlines |
| `--lane` | `#2E5AAC` | `#6D9AF0` | Focus ring, today badge, practice glyphs, links |
| `--on-lane` | `#FFFFFF` | `#0F1626` | Text on `--lane` |
| `--done` / `--done-ink` | `#F2C230` / `#3D2E00` | same / `#2A2000` | Done fill / glyph on it |
| `--walk-ink`, `--finish-ink` | `#237A5E`, `#B8344E` | `#52C29B`, `#EE6B82` | Kind text and chip fills (≥ 4.5:1) |
| `--chart-mark` | `#2E5AAC` | `#6290E8` | Chart marks only (dataviz validator) |
| `--tint-done` | 18% done on card | 8% done on card | Ticked plan cards |

Dark mode: `prefers-color-scheme` unless the person picks Light or Dark in Settings (stored as `<html data-theme>`, applied before first paint). The two dark blocks in `styles.css` must stay identical.

### Shape and size

Radii `--radius-xs…xl`, `--radius-pill`. Every interactive control is **≥ 44 × 44 px** (pills, nav arrows, counter, close buttons, tabs, banner buttons).

## Components (`src/components.js` + `src/screens/`)

| Component | Variants / props | Notes |
|---|---|---|
| `TabList` + `Tab` | `size="sm"` for secondary switches | Segmented control; roving tabindex; ←/→/Home/End |
| `SheetCell` | `compact` (phone), `today`, `pending` | Status marker + glyph, run chip, set dots, practice ◆/◇, test ★/☆; full `aria-label` built by `dayCell()` |
| `HabitDot` | status `done/light/rest/missed/null` | Glyph from 14 px: ✓, half disc, moon, ✕; `null` = "to do" ring |
| `DayCard` | `done`, `today`, kind | Plan card; Today tag inline after the number |
| `StateGrid` | options | Workout status picker with markers; selected = 2 px ink border + ✓ |
| `Stat` | `compact` | Secondary figures use `compact` so the primary figure leads |
| `Lanes` | `showLabel` | Progress bar; hide the label when the number is printed above |
| `Dialog` | footer optional | Focus trap, Escape, close button, scroll lock, focus return |
| `ColumnChart`, `LineChart` | `src/screens/Charts.jsx` | Single series; tooltip on hover/focus; "Show numbers" table |
| `Toast` | action (Undo, Change) | Fixed bottom; holds while hovered/focused |
| `Banner` | `src/App.jsx` | Persistent notices: app update, reminder |

## States and interactions

| Element | State | Behaviour |
|---|---|---|
| Any button | Hover / press | `brightness(.96)` (dark: `1.15`) / 1 px down; none under reduced motion |
| Day cell / plan card | Hover | 2 px `--ink-2` ring |
| Any control | Keyboard focus | 3 px `--lane` outline, 2 px offset |
| Today answers | Tap | Saves immediately; toast "Saved." |
| Workout option | Tap the selected one | Clears it and its minutes |
| Day editor | Minutes without a status | Refuses with inline alert "Choose Done, Light, Rest or Missed…" |
| Clear day | Tap | Clears at once; toast with **Undo** (8 s, held on hover/focus) |
| Plan controls | Repeat / push back / restart | Changes the schedule; toast with **Undo** that restores the previous plan exactly |
| First program answer | Tap | Sets program start; toast with **Change** → Programs, focus on the start field |
| App update | New version installed | Banner "A new version of Dojo is ready." + **Reload**; never reloads by itself |
| Reminder | Due, app visible | Banner "Nothing logged yet today." (+ **Log today** off Today); clears when anything is logged |
| Reminder | Due, app in background | System notification if permitted, else the banner on return |

## Responsive behaviour (`src/layout.js`)

| Breakpoint | Changes |
|---|---|
| Phone (< 640 px) | Compact calendar cells, single-letter weekdays, 40 px week column; plan cards 3 per row; workout options 2 × 2; 28-day strip 7 columns |
| Tablet (640–959 px) | Full cells; plan cards 4 per row |
| Desktop (≥ 960 px) | Plan cards 7 per row; workout options in one row |

Grids for stats, rules and stages auto-fit (`autoGrid(min)`). No horizontal scroll at 390 or 320 px on any view (tested).

## Content rules

- **Vocabulary** comes from `src/words.js`; never hard-code program words. Discreet mode swaps them for neutral ones everywhere, including `aria-label`s, and hides program guidance behind "Show program details".
- **Plan lines** use `planLine()`, which never repeats the kind ("Run 2 min, walk 2 min, 6 rounds").
- **Messages**: sentence case, name the object, end with a full stop ("Day cleared.", "Plan pushed back a day.").
- **Status order** is Done, Light, Rest, Missed everywhere.

## Edge cases

- **Empty states**: past days with nothing logged are blank; charts say what's missing ("No minutes logged in these weeks yet"); a profile with no plan offers "Set a start date".
- **No target**: Month shows "N days trained · set a target under Month review".
- **Plan schedule**: gaps belong to the week they delay; repeated weeks are labelled "· again"; progress counts each plan day once.
- **Offline**: everything works after one visit; nothing to show differently.
- **Storage blocked or full**: toast "Couldn't save on this device. Download a backup to keep your changes."
- **Old saves**: missing `settings`, `plan.seq` or reminder fields load with defaults; bad values fall back (validated in `store.js`).

## Motion

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Buttons | Hover / press | Filter / 1 px translate | `--motion-ui` (0.15 s) |
| Progress bar | Value change | Width | 0.5 s ease |
| All | `prefers-reduced-motion` | Off | — |

## Accessibility

- **Landmarks and order**: skip link (Month) → header (Settings, view tabs) → `main[role=tabpanel]` labelled by the selected tab → toast → dialogs.
- **Keyboard**: tabs ←/→/Home/End; calendar ←/→ day, ↑/↓ week; Month ←/→ month and T this month (ignored while typing, in the calendar, tab lists and dialogs); dialogs trap focus, Escape closes, focus returns.
- **Screen readers**: day cells say everything they show; answer buttons are grouped and named by their question; control ratings carry "1 = very little, 5 = full control"; charts' marks are labelled and every value is in the "Show numbers" table; status messages use a polite live region.
- **Colour**: text ≥ 4.5:1, markers ≥ 3:1 or carrying a glyph, in both themes (`phase2-accessibility-audit.md`).

## Where each rule is tested

| Rule | Test |
|---|---|
| Data model, schedule, plan controls, streak, trends, reminder due | `test/unit/*.test.js` |
| Today in three taps above the fold; saved as tapped | smoke: "Today: a typical day is three taps…" |
| WCAG 2.1 AA on every view, both themes, both widths | smoke: "accessibility: axe…" |
| No horizontal scroll at 390 / 320 px | smoke: "layout…" |
| Discreet vocabulary everywhere | smoke: "discreet mode…" |
| Installable, offline, update prompt, reminder, first-load budget | smoke: Phase 5 tests |
| Committed `dist/` and `sw.js` match the source; bundle budget | CI (`.github/workflows/ci.yml`), `npm run verify` |

## Not covered yet

- Real screen readers (VoiceOver, NVDA) and Safari text zoom: need a person.
- Reminders while the app is fully closed: would need a push service and so are out of scope by design.
