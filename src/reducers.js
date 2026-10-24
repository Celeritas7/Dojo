// Pure state transitions. Each returns a new state; nothing here touches the DOM.
import { emptyMonth, cleanDay } from "./store.js";

const withDay = (state, k, rec) => { const days = { ...state.days }; const c = cleanDay(rec); if (Object.keys(c).length) days[k] = c; else delete days[k]; return { ...state, days }; };

// Day editor "Save day". ed = { s, m, run, sets, practice, pauses, control, time }; run is null when the day is outside the plan.
export function saveDay(state, k, ed) {
  const mins = +ed.m || 0;
  const rec = { run: ed.run === true, sets: ed.sets };
  if (ed.s || mins) { rec.s = ed.s || "done"; rec.m = mins; }
  if (ed.practice) { rec.practice = ed.practice; if (ed.practice === "yes") { rec.pauses = ed.pauses; rec.control = ed.control; rec.time = ed.time; } }
  return withDay(state, k, rec);
}
export const clearDay = (state, k) => withDay(state, k, {});

// Check-in patch for today: merges into the existing record. Starts the program on first answer if no start is set.
export function patchDay(state, k, patch) {
  const next = withDay(state, k, { ...(state.days[k] || {}), ...patch });
  if (!next.pf.start) next.pf = { ...next.pf, start: k };
  return next;
}
export const toggleRun = (state, k) => withDay(state, k, { ...(state.days[k] || {}), run: !(state.days[k] || {}).run });
export const setPlan = (state, patch) => ({ ...state, plan: { ...state.plan, ...patch } });
export const setPf = (state, patch) => ({ ...state, pf: { ...state.pf, ...patch } });
export const setMonth = (state, key, patch) => ({ ...state, months: { ...state.months, [key]: { ...(state.months[key] || emptyMonth()), ...patch } } });
