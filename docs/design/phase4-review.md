# Phase 4 design review

Reviewed: commit `206e224`, demo data, 390 px and 1280 px, light and dark. Method: critique of the plan controls, both charts, the streak lines and the Month shortcuts against `phase4-spec.md`; copy pass on the new messages.

## Findings

| Finding | Severity | Fix |
|---|---|---|
| "Repeat week 2" and "Push back a day" only make sense if you've read the plan rules further down the page. | 🟡 Moderate | One line above the buttons, also their description: "Week felt hard? Repeat it. Missed today? Push the plan back a day. Every change can be undone." |
| Toast "Week added again." reads oddly and doesn't say what moved. | 🟢 Minor | "Week repeated; later days move back a week." |
| Charts at 390 px: axis labels, end label and value label fit; columns stay ≤ 24 px; tooltips stay inside the plot (clamped in the build). | ✅ | — |
| Dark chart colour passes the validator; text stays in text tokens. | ✅ | — |
| Streak lines explain the break in plain words; rest days stated as neutral. | ✅ | — |
| Shortcut hint only shows on devices with a mouse; shortcuts ignored while typing or in the calendar (tested). | ✅ | — |

## Considered, no change

- "Start again today" has the same visual weight as the other two controls. With Undo on every control a heavier confirm would add friction without adding safety.
- "Current streak: 0 days." on an empty profile is plain rather than encouraging. It is accurate, and Today's other rows already invite logging.
