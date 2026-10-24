// State shape (version 2), persistence and backup. Everything is keyed by ISO date so one record holds a whole day.
//
// {
//   version: 2,
//   plan:   { start: "YYYY-MM-DD" | null, recovery: boolean },
//   pf:     { start: "YYYY-MM-DD" | null, pdays: number[] },          // practice weekdays, 0 = Sunday
//   days:   { "YYYY-MM-DD": { s?, m?, run?, sets?, practice?, pauses?, control?, time? } },
//   months: { "YYYY-MM": { goal, target, routines, notes } }
// }
import { monthKey } from "./logic.js";

export const VERSION = 2;
export const STORAGE_KEY = "dojo.state";
const DAY_FIELDS = ["s", "m", "run", "sets", "practice", "pauses", "control", "time"];

export const emptyMonth = () => ({ goal: "", target: "", routines: 0, notes: "" });
export const emptyState = () => ({ version: VERSION, plan: { start: null, recovery: false }, pf: { start: null, pdays: [1, 3, 5, 0] }, days: {}, months: {} });
export const monthOf = (state, key) => state.months[key] || emptyMonth();
// A day record only keeps meaningful values: no empty strings, zeros, nulls or false.
export const cleanDay = rec => { const out = {}; for (const f of DAY_FIELDS) { const v = rec[f]; if (v !== undefined && v !== null && v !== "" && v !== false && v !== 0) out[f] = v; } return out; };

// Returns a cleaned copy or throws with a readable message. Used for localStorage and for imported backups.
export function validate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Not a Dojo backup (expected an object).");
  if (input.version !== VERSION) throw new Error(`Unsupported backup version ${input.version} (this app reads version ${VERSION}).`);
  const s = emptyState();
  const isKey = k => /^\d{4}-\d{2}-\d{2}$/.test(k), isMonth = k => /^\d{4}-\d{2}$/.test(k);
  if (input.plan && typeof input.plan === "object") { if (input.plan.start !== null && input.plan.start !== undefined && !isKey(input.plan.start)) throw new Error("plan.start must be a date."); s.plan = { start: input.plan.start || null, recovery: !!input.plan.recovery }; }
  if (input.pf && typeof input.pf === "object") { if (input.pf.start !== null && input.pf.start !== undefined && !isKey(input.pf.start)) throw new Error("pf.start must be a date."); s.pf = { start: input.pf.start || null, pdays: Array.isArray(input.pf.pdays) ? input.pf.pdays.filter(n => Number.isInteger(n) && n >= 0 && n <= 6) : s.pf.pdays }; }
  if (input.days && typeof input.days === "object") for (const [k, v] of Object.entries(input.days)) { if (!isKey(k) || !v || typeof v !== "object") throw new Error(`Bad day entry: ${k}`); const rec = cleanDay(v); if (Object.keys(rec).length) s.days[k] = rec; }
  if (input.months && typeof input.months === "object") for (const [k, v] of Object.entries(input.months)) { if (!isMonth(k) || !v || typeof v !== "object") throw new Error(`Bad month entry: ${k}`); s.months[k] = { ...emptyMonth(), goal: String(v.goal || ""), target: String(v.target || ""), routines: +v.routines || 0, notes: String(v.notes || "") }; }
  return s;
}

export function load(storage) {
  try { const raw = storage.getItem(STORAGE_KEY); return raw ? validate(JSON.parse(raw)) : null; }
  catch (e) { console.warn("Dojo: ignoring saved data:", e.message); return null; }
}
export function save(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export const exportJSON = state => JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
export const importJSON = text => validate(JSON.parse(text));
export const backupFilename = today => `dojo-backup-${monthKey(today)}-${String(today.getDate()).padStart(2, "0")}.json`;
