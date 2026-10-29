# Phase 4 spec: plan controls, trends, streaks, shortcuts

## 1. Running-plan controls (Programs → Running plan)

The plan's rules say "if a week felt hard, repeat it" and "missed a day? repeat that day next time", but until now the only way to follow them was to edit dates by hand. Three controls, in one row under the plan header, shown while the plan is running:

| Control | What it does | Shown when |
|---|---|---|
| **Repeat week N** | Inserts another copy of the current plan week straight after it; everything later moves 7 days. | Today falls inside the plan |
| **Push back a day** | Today's plan day (or tomorrow's, if today is already ticked) and everything after it move one day later. | Today falls inside the plan |
| **Start again today** | New start date today, original schedule; past ticks stay on their dates as history. | Any time a plan exists |

Every control shows a toast with **Undo**. The start-date field stays.

**Model.** `plan.seq` is the schedule: one entry per calendar day from the start date, each a plan-day index (0–20) or `null` for a pushed-back gap. Missing means the original 21 days in order, so saved data is unchanged. A ticked day is still `days[date].run`, so the calendar, Today and Programs keep agreeing by construction.

**Display.** Plan cards group into weeks; a repeated week is labelled "Week 2 · again"; a gap shows as a slim "Pushed back" card. All widths now put the week label above its cards (7 / 4 / 3 columns), so a week with a gap can wrap cleanly. Progress counts each plan day once, however many times it was scheduled.

## 2. Trends (dataviz skill procedure)

Both are single-series: no legend, the title names the series. Mark colour is `--chart-mark` (light `#2E5AAC`; dark `#6290E8`, re-stepped because the lane blue `#6D9AF0` fails the dark lightness band, L 0.691 > 0.67; both pass the validator). Text uses text tokens, never the mark colour. Gridlines are 1 px `--line`.

| Chart | Where | Form | Marks |
|---|---|---|---|
| **Minutes per week** | Month, under the stats | Columns, one per week touching the month (Mon–Sun) | ≤ 24 px columns, 4 px rounded top, square at baseline; value on the tallest cap only |
| **Control over time** | Programs → Pelvic floor, under the stats | Line + dots, last 12 sessions with a control rating, y fixed 1–5 | 2 px line, 8 px dots with a 2 px surface ring; latest value labelled at the end |

Hover/focus: every column and dot has a ≥ 24 px focusable hit area with a tooltip (value first, date second). **Show numbers** reveals the same data as a table. Empty states say what's missing ("No minutes logged in these weeks yet").

## 3. Streak explanation (Today → This week)

One line under the week strip: "Current streak: 5 days, since Thu 15 Oct." When it was broken recently, a second line names the break: "Before that, Wed 14 Oct was missed." / "…had nothing logged." Rest days neither count nor break, matching the Month figure.

## 4. Month shortcuts and swipe

- **← / →** previous / next month, **T** this month. Ignored while typing, inside the calendar (whose arrows move between days), in tab lists and in dialogs. Buttons carry `aria-keyshortcuts`; a hint line shows on devices with a mouse.
- **Swipe** left / right on the calendar changes month on touch screens (horizontal travel ≥ 60 px and at least twice the vertical travel).

## Acceptance

- Repeat, push back and start again each produce the expected dates in tests, and Undo restores the previous plan exactly.
- Old saves without `plan.seq` load and display as before.
- Both charts have tooltips on hover and keyboard focus, a table view, and pass axe in both themes.
- Shortcuts don't fire while typing or inside the calendar.
