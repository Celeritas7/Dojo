// Demo state for screenshots and tests. Loaded with ?demo=1 (and usually ?today=2026-10-28). Not used in normal runs.
import { iso, runKey } from "./logic.js";
import { emptyState, cleanDay } from "./store.js";

export const DEMO_TODAY = "2026-10-28"; // Wed 28 Oct 2026, run-plan day 8

export function demoState() {
  const s = emptyState();
  s.plan = { start: "2026-10-21", recovery: false };
  s.pf = { start: "2026-10-01", pdays: [1, 3, 5, 0] };
  const pattern = ["done","done","rest","done","light","done","rest","done","done","missed","done","rest","done","done","done","rest","light","done","done","done","done","rest","done","done","done","done","rest"];
  const sets = [3,3,2,3,3,1,3,3,3,0,3,2,3,3,3,3,3,1,3,3,3,3,2,3,3,3,3];
  pattern.forEach((st, i) => {
    const d = i + 1, date = new Date(2026, 9, d), k = iso(date), pd = s.pf.pdays.includes(date.getDay());
    const rec = { s: st, m: st === "done" ? [30, 34, 25, 40, 35, 45][i % 6] : st === "light" ? 15 : 0, sets: sets[i] };
    if (pd) { rec.practice = d === 9 ? "no" : "yes"; if (rec.practice === "yes") { rec.pauses = String(1 + d % 3); rec.control = 3 + d % 3; if (d === 14) rec.time = "12.5"; } }
    s.days[k] = cleanDay(rec);
  });
  for (let i = 0; i < 7; i++) s.days[runKey(s.plan.start, i)] = { ...(s.days[runKey(s.plan.start, i)] || {}), run: true };
  s.months["2026-10"] = { goal: "Run 8 minutes without stopping", target: "24", routines: 2, notes: "Knees felt fine after week 1. Keep the pace slow." };
  return s;
}
