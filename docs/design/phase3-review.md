# Phase 3 design review

Reviewed: commit `b2236cd`, demo data and a fresh profile, 390 px and 1280 px, light and dark, discreet mode on and off. Method: critique of Today, Month, Programs and Settings against `phase3-spec.md`, plus a copy pass on the discreet vocabulary.

## Overall impression

The restructure does what the spec asked: Today answers "what do I log now" in one screen, Month answers "how is the month going", and nothing is shown twice. The issues found are hierarchy and ordering details, all fixed in the review commit.

## Usability

| Finding | Severity | Fix |
|---|---|---|
| Workout options were Done · Light · Missed · Rest; Rest is a far more common answer than Missed, and the spec asked for Rest before Missed. | 🟡 Moderate | Order is now Done · Light · Rest · Missed in Today, the editor, the legend and the editor's refusal message. |
| Three taps above the fold at 390 × 844: met (asserted in tests). | ✅ | — |
| "Change" after the first program answer lands on the program start field with focus: met. | ✅ | — |

## Visual hierarchy

| Finding | Severity | Fix |
|---|---|---|
| Month's primary figure ("20 of 24 days trained", 20 px) was smaller than the four secondary stat numbers (30 px), inverting the hierarchy the spec asked for. | 🟡 Moderate | Primary figure at the title size (30 px); secondary stats use a new compact size (20 px). |
| Programs' segmented switch looked identical to the main view switch directly above it. | 🟢 Minor | Secondary size: no track, smaller text, a rule beneath; it now reads as a sub-navigation. |

## Consistency

- Status order now matches across all four places it appears.
- Plan lines use the shared `planLine` wording in Today and the editor.

## Copy (discreet vocabulary)

Read in place on every view with discreet mode on: "Daily sets", "Practice", "Check session", "Daily routine", "Routine" (tab). All read naturally in sentences ("Days with 3 daily sets", "Daily sets and practice, last 28 days", "Tomorrow is a check session, so skip practice today."). One unused entry (`setsQuestion`) removed. No changes to wording needed.

## Accessibility

axe passes on every view in both themes (part of `npm test`). Discreet wording also applies to screen-reader labels, verified by the test that scans `aria-label`s for the sensitive words.

## Carried forward

- The day editor is still long on a phone; Today now covers most daily logging, so it matters less. Revisit if editing past days turns out to be frequent.
