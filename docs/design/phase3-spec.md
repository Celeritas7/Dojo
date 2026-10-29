# Phase 3 spec: information architecture

Goal: logging today takes one screen and at most three taps; the pelvic-floor details are never on the home screen unless you open them; nothing is shown twice.

## 1. Structure

| Before | After |
|---|---|
| Tabs: Monthly sheet · Running plan | Tabs: **Today** · **Month** · **Programs** |
| Check-in card above every tab | Replaced by the **Today** view (the default) |
| Sheet with goal, notes, routines, 3 collapsed sections below the calendar | **Month**: calendar first; goal/target/routines/notes in one collapsed **Month review** |
| Running plan tab + a second copy of its settings in a collapsed section on the sheet | **Programs → Running plan** only (one place for start date and the recovery switch) |
| Pelvic floor program collapsed at the bottom of the sheet | **Programs → Pelvic floor** (second segment) |
| Backup section on the sheet; Theme button in the header | **Settings** dialog from the header: theme, discreet mode, backup |

URLs follow the view so a reload or bookmark returns to it: `#today`, `#month/2026-10`, `#programs/run`, `#programs/pf`.

## 2. Today view

Order, top to bottom:

1. **Date heading** ("Wednesday 28 October") and the month's motto.
2. **Workout**: four one-tap options (Done · Light · Rest · Missed) with their status markers. Choosing one saves; a Minutes field appears next to it. On a plan day, Done pre-fills the plan's minutes.
3. **Running plan** (only while the plan is running): "Day 8 of 21 · Run 2 min, walk 2 min, 6 rounds · ~34 min" and one **Mark done** button (toggles; same record as the plan card). Before the start: "Starts in N days". No start date: a link to set one.
4. **Kegel sets**: 0 · 1 · 2 · 3, with the stage instruction as the description.
5. **Practice / test**: shown on planned days, or when already answered. Otherwise a single "Log a practice session anyway" link opens it. Yes reveals pauses, control (1–5 with anchors) and, on test days, minutes.
6. **This week**: Mon–Sun compact day cells (the same cell as the Month view); tapping one opens the day editor.

Three taps for a typical day: workout status, run done, sets. No "Done for today" step: every answer saves as it is tapped.

## 3. Month view

- Month bar (unchanged), motto.
- **One primary figure**: "20 of 24 days trained" with the progress bar directly under it. The separate "Days trained" stat card is gone (it repeated the bar).
- Calendar and legend.
- Secondary row, smaller: longest streak · minutes · days with 3 sets · practice sessions. "Running plan days" moves to Programs, where it belongs.
- **Month review** (collapsed): goal, target days, new routines, notes.

## 4. Programs view

Segmented control: **Running plan** · **Pelvic floor**.

- Running plan: unchanged layout; its progress bar already shows "7 / 21", so the "Days ticked" stat is removed (streak and runs completed stay).
- Pelvic floor: the former collapsed section, now a page. The inaccurate "Only visible to you unless you share this page" becomes "Stored only on this device."

## 5. Discreet mode (Settings, off by default)

For logging in public. When on:

| Normal | Discreet |
|---|---|
| Pelvic floor / Kegel sets | Daily sets |
| Control practice | Practice |
| Test session | Check session |
| Pelvic floor and control (page title) | Daily routine |
| Programs → Pelvic floor | Programs → Routine |

The routine page hides the stage guidance, test-condition tips and technique tips behind a **Show program details** button. Numbers, dates and the strip stay visible. The setting is stored with the data (so it travels with a backup).

## 6. Settings dialog

- Theme: Auto · Dark · Light (segmented).
- Discreet mode switch, with one line explaining it.
- Backup: Download · Restore · Clear all data (moved from the sheet; same behaviour).
- Close button only; settings save as they change.

## Acceptance

- Today is the default view; a typical day is logged with three taps and no scrolling at 390 × 844.
- No figure appears twice on one screen; one recovery switch in the app.
- With discreet mode on, the words "pelvic", "Kegel", "arousal" and "lubricant" appear nowhere on Today, Month or the routine page until "Show program details" is pressed.
- Reloading keeps the view and month; existing saved data loads unchanged.
- `npm test` green, including axe on every view.
