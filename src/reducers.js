// Pure state transitions. Each returns a new state; nothing here touches the DOM.
import { emptyMonth, cleanDay } from "./store.js";
import { runIdx, runInfo, parseISO, iso, planSeq, planPos, currentWeekGroup } from "./logic.js";

const withDay = (state, k, rec) => { const days = { ...state.days }; const c = cleanDay(rec); if (Object.keys(c).length) days[k] = c; else delete days[k]; return { ...state, days }; };

// What ticking a plan day implies for the exercise fields when nothing else is logged.
export function runDefaults(state, k) {
  const i = runIdx(parseISO(k), state.plan); if (i < 0) return null;
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

// Plan controls. Each returns the state unchanged when it doesn't apply (no plan, or today outside it).
// Repeat the plan week today is in: a full copy of that week goes straight after it.
export function repeatWeek(state, today) {
  const g = currentWeekGroup(state.plan, today); if (!g) return state;
  const seq = planSeq(state.plan).slice(), end = g.slots[g.slots.length - 1].pos;
  seq.splice(end + 1, 0, ...[0, 1, 2, 3, 4, 5, 6].map(d => g.week * 7 + d));
  return setPlan(state, { seq });
}
// Push the rest of the plan back a day from today (from tomorrow if today is already ticked).
export function pushBack(state, today) {
  const seq = planSeq(state.plan).slice(), pos = planPos(state.plan, today);
  const at = (state.days[iso(today)] || {}).run ? pos + 1 : pos;
  if (pos < 0 || at >= seq.length) return state;
  seq.splice(at, 0, null);
  return setPlan(state, { seq });
}
// Start the original schedule again today; ticks on earlier dates stay as history.
export function restartPlan(state, today) { const { seq, ...plan } = state.plan; return { ...state, plan: { ...plan, start: iso(today) } }; }
export const setPf = (state, patch) => ({ ...state, pf: { ...state.pf, ...patch } });
export const setMonth = (state, key, patch) => ({ ...state, months: { ...state.months, [key]: { ...(state.months[key] || emptyMonth()), ...patch } } });
