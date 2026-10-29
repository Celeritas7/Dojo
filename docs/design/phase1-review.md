# Phase 1 design review

Reviewed: commit `36d152c`, demo data, 390 px and 1280 px, light theme. Flows: log today (check-in), edit a past day (day editor), tick a run (running plan), plus the new undo toast and blank past days.

## Overall impression

The three flows now behave correctly and predictably. The remaining friction is presentational: the editor is long on a phone, the check-in's "Done" button collides with the word "Done" used for workout status and run ticks, and several messages are longer than they need to be. Nothing found blocks Phase 2.

## Usability

| Finding | Severity | Recommendation | Status |
|---|---|---|---|
| "Done" means three things: the check-in's close button, a workout status, and a run tick in the editor. | 🟡 Moderate | Rename the check-in button to **Done for today**; keep "Done" for status and run. | Fixed in Phase 2 commit |
| First check-in toast is two sentences and points at a section the user can't see. | 🟡 Moderate | "Saved. Your program starts today." with a **Change** action that opens the program section. | Fixed |
| Editor refusal message is 86 characters and wraps to three lines on a phone. | 🟢 Minor | "Choose Done, Light, Missed or Rest to save these minutes." | Fixed |
| Toast is `position: sticky` inside the page container, so on long pages it can sit mid-content. | 🟢 Minor | Fix it to the viewport bottom with the safe-area inset. | Fixed |
| "Nothing logged on that day" after Clear on an empty day reads like an error. | 🟢 Minor | "Nothing to clear." | Fixed |
| Editor is ~700 px tall on a phone with a run day; Save is below the fold on small phones. | 🟢 Minor | Deferred to Phase 3 (Today view removes most editor use). | Open |
| Ticking a plan card gives only the generic "Saved". | 🟢 Minor | "Day 8 ticked" / "Day 8 unticked" so the change is legible on the sheet tab too. | Fixed |

## Visual hierarchy

- **Draws the eye first:** the check-in card (blue border, top of page). Correct for daily use.
- **Reading flow:** check-in → month title → calendar → stats → goal/notes → sections. The progress bar between motto and calendar repeats the first stat (Phase 3 removes the duplicate).
- **Emphasis:** blank past days (Phase 1) make logged days stand out properly. The selected editor option is still only slightly darker than the others: Phase 2 item.

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Messages | Mix of "Saved.", "Could not save:", "Restored" (no object) | Sentence case, name the object, no colon-style prefixes. |
| Terms | "Clear day" vs "Day cleared" vs "Clear all data" | Keep: verb + object for buttons, past tense for toasts. |
| Ticks | Running plan says "ticked", editor says "Done / Not yet" | Accept for now; both read naturally in place. |

## Accessibility

- Dialog: focus trap, Escape, close button, focus return all verified by the smoke test.
- Close button is 36 px; raise to 44 px with the other targets in Phase 2.
- The toast is a polite live region and the Undo button is reachable by keyboard.

## Copy (ux-copy pass)

| Where | Before | After |
|---|---|---|
| Editor refusal | Pick what kind of day it was (done, light, missed or rest) to save these minutes. | Choose Done, Light, Missed or Rest to save these minutes. |
| First check-in toast | Saved. Program start set to today; change it under Pelvic floor program. | Saved. Your program starts today. **[Change]** |
| Clear on empty day | Nothing logged on that day | Nothing to clear. |
| Undo result | Restored | Day restored. |
| Storage failure | Could not save: storage is full or blocked | Couldn't save on this device. Download a backup to keep your changes. |
| Plan tick | Saved | Day 8 ticked. / Day 8 unticked. |
| Check-in close | Done | Done for today |
| Test card, Yes with no details | Logged, details missing | Done, no details |
| Stat with no target | Days trained (no target set) | Days trained |

## What works well

- Undo-instead-of-confirm keeps clearing fast and safe.
- Blank past days make an empty month read as empty, not as 30 overdue tasks.
- The minutes refusal stops a silent wrong save without blocking anything else in the form.
