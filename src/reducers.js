// Pure state transitions. Each returns a new state; nothing here touches the DOM.
import { emptyMonth, cleanDay } from "./store.js";
import { runIdx, runInfo, parseISO } from "./logic.js";

const withDay = (state, k, rec) => { const days = { ...state.days }; const c = cleanDay(rec); if (Object.keys(c).length) days[k] = c; else delete days[k]; return { ...state, days }; };

// What ticking a plan day implies for the exercise fields when nothing else is logged.
export function runDefaults(state, k) {
  const i = runIdx(parseISO(k), state.plan.start); if (i < 0) return null;
  const info = runInfo(i, state.plan.recovery);
  return { s: info.kind === "rest" && !state.plan.recovery ? "rest" : "done", m: info.mins || 0 };
}

// Day editor "Save day". ed = { s, m, run, sets, practice, pauses, control, time }.
// `run` is null outside the plan; `sets` is null until the person answers (0 is a real answer).
// Minutes are only kept with a status; the editor refuses to save minutes without one.
export function saveDay(state, k, ed) {
  const mins = +ed.m || 0;
  const rec = { run: ed.run === true, sets: ed.sets };
  if (ed.s) { rec.s = ed.s; rec.m = mins; }
  if (ed.practice) { rec.practice = ed.practice; if (ed.practice === "yes") { rec.pauses = ed.pauses; rec.control = ed.control; rec.time = ed.time; } }
  return withDay(state, k, rec);
}
export const clearDay = (state, k) => withDay(state, k, {});
export const restoreDay = (state, k, rec) => withDay(state, k, rec || {});

// Merge a patch into one day's record (Today view answers save as they are tapped).
export const updateDay = (state, k, patch) => withDay(state, k, { ...(state.days[k] || {}), ...patch });
// Same, for pelvic-floor answers: the first one also starts the program if no start is set.
export function patchDay(state, k, patch) {
  const next = updateDay(state, k, patch);
  if (!next.pf.start) next.pf = { ...next.pf, start: k };
  return next;
}
export const setSettings = (state, patch) => ({ ...state, settings: { ...state.settings, ...patch } });

// Tick/untick a plan day from the running-plan view. Ticking fills in the exercise the plan implies when
// nothing is logged yet; unticking removes only what the tick filled in, so the sheet and the plan agree.
export function toggleRun(state, k) {
  const cur = state.days[k] || {}, d = runDefaults(state, k) || {};
  if (!cur.run) return withDay(state, k, { ...cur, run: true, s: cur.s || d.s, m: cur.m || d.m });
  const next = { ...cur, run: false };
  if (next.s === d.s && (next.m || 0) === (d.m || 0)) { delete next.s; delete next.m; }
  return withDay(state, k, next);
}
export const setPlan = (state, patch) => ({ ...state, plan: { ...state.plan, ...patch } });
export const setPf = (state, patch) => ({ ...state, pf: { ...state.pf, ...patch } });
export const setMonth = (state, key, patch) => ({ ...state, months: { ...state.months, [key]: { ...(state.months[key] || emptyMonth()), ...patch } } });
