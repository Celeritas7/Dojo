# Accessibility audit: Dojo after Phase 2

**Standard:** WCAG 2.1 AA · **Build audited:** `f956df3` · **Method:** axe-core 4.10 across 24 states (6 screens × light/dark × 390/1280 px), scripted keyboard walk, 320 px reflow, contrast measured from tokens, manual review of labels and timing. Real screen readers (VoiceOver, NVDA) were not used; that still needs a person.

## Summary

**Issues found:** 9 · **Critical:** 0 · **Major:** 5 · **Minor:** 4 · **All fixed** in the audit commit; the checks now run in `npm test`.

## Findings

### Perceivable

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 1 | Calendar day labels said only "October 15, Workout done"; minutes, Kegel sets, plan day, practice and test markers were invisible to screen readers. | 1.1.1, 1.3.1 | 🟡 Major | Labels now carry everything the cell shows: "October 14, Workout done, 34 minutes, 3 of 3 Kegel sets, test done". |
| 2 | 28-day strip numbers on part-filled squares: 3.99:1 light, 1.19:1 dark. | 1.4.3 | 🟡 Major | Per-level label colour (`--strip-1-ink`); dark 1-set shade at 30%. Now ≥ 4.73:1 everywhere. |
| 3 | Dark mode: blue "Run" labels on ticked plan cards, 3.91:1 (the 18% yellow tint goes olive on navy). | 1.4.3 | 🟡 Major | Dark done-tint at 8%: lane 4.94, finish 4.64, walk 6.27, ink-2 5.90. |
| 4 | Planned practice/test markers were the solid glyph at 45% opacity, about 2.3:1. | 1.4.11 | 🟢 Minor | Outline glyphs (◇ ☆) at full strength; added to the legend. |
| 5 | 28-day strip overflowed by 17 px at 320 px. | 1.4.10 | 🟢 Minor | 7 columns on phones. |

### Operable

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 6 | Undo toast disappeared after 8 s with no way to keep it. | 2.2.1 | 🟡 Major | Toast holds while hovered or focused, then gives 4 s more. |
| 7 | 31 tab stops per month before the goal and notes; no way past them or through them quickly. | 2.4.1 | 🟢 Minor | "Skip to calendar" link; arrow keys move by day (←/→) and week (↑/↓). |

### Robust

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 8 | Answer buttons (0–3, Yes/No, 1–5) were not tied to their question; a screen reader heard "2, toggle button, not pressed". | 1.3.1, 4.1.2 | 🟡 Major | Each row is a group named by its question; the hold/relax instruction is its description. |
| 9 | Week tallies used `aria-label` on a plain `div` (prohibited; often ignored). | 4.1.2 | 🟢 Minor | `role="img"` with "Week 2: 5 of 7 days trained". |

### Understandable

Control ratings (1–5) had no anchors; added "1 = very little, 5 = full control" as each group's description (3.3.2). Error identification (editor refusal, backup restore) already uses `role="alert"` with plain-language fixes.

## Colour contrast (key pairs, after fixes)

| Element | Light | Dark | Required |
|---|---|---|---|
| Body text (ink on card) | 14.2 | 13.66 | 4.5 ✅ |
| Secondary text (ink-2 on card) | 6.33 | 6.93 | 4.5 ✅ |
| Walk / Finish labels | 5.23 / 5.77 | 7.37 / 5.45 | 4.5 ✅ |
| Lane labels on ticked plan card | 6.03 | 4.94 | 4.5 ✅ |
| Today badge (on-lane on lane) | 6.62 | 6.47 | 4.5 ✅ |
| Strip labels, 0 / 1 / 2+ sets | 4.73 / 8.87 / 8.33 | 5.12 / 5.31 / 5.78 | 4.5 ✅ |
| Status glyphs (✓ on yellow, moon on grey) | 7.89 / 7.85 | 9.60 / 5.16 | 3 ✅ |
| Missed ring | 3.76 | 5.45 | 3 ✅ |

## Keyboard

| Element | Tab | Enter/Space | Escape | Arrows |
|---|---|---|---|---|
| Skip link | First stop on the sheet | Jumps to calendar | — | — |
| View tabs | One stop (roving) | Selects | — | ←/→/Home/End switch view |
| Calendar days | Each day | Opens editor | — | ←/→ day, ↑/↓ week |
| Day editor | Trapped inside | Activates | Closes, focus returns to the day | — |
| Toast Undo | Reachable; holds the toast | Restores the day | — | — |
| Month field | Native segments | Native | Native | Native (browser's own focus style; acceptable) |

## Still needs a person

- A pass with VoiceOver (iOS/macOS) and NVDA (Windows), especially the calendar labels and the dialog.
- 200% text-only zoom in Safari, which axe and Chromium don't cover.
