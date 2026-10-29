import { test } from "node:test";
import assert from "node:assert/strict";
import { iso, parseISO, shiftMonth, daysInMonth, longest, runIdx, runKey, runInfo, planDone, pfHelpers, PLAN_DAYS, PLAN_RUNS, fmtDate } from "../../src/logic.js";
import { emptyState } from "../../src/store.js";

test("iso/parseISO round-trip in local time", () => {
  for (const k of ["2026-01-01", "2026-02-28", "2026-10-28", "2027-12-31"]) assert.equal(iso(parseISO(k)), k);
  assert.equal(fmtDate(parseISO("2026-10-21")), "Wed 21 Oct");
});

test("shiftMonth wraps years in both directions", () => {
  assert.equal(shiftMonth("2026-10", 1), "2026-11");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-01", -13), "2024-12");
  assert.equal(daysInMonth("2026-02"), 28);
  assert.equal(daysInMonth("2028-02"), 29);
});

test("longest streak: 0 breaks, -1 (rest) is neutral", () => {
  assert.equal(longest([]), 0);
  assert.equal(longest([1, 1, 0, 1, 1, 1]), 3);
  assert.equal(longest([1, -1, 1, 0, 1]), 2);
});

test("runIdx maps dates inside the 21-day window and nothing else", () => {
  const start = "2026-10-21";
  assert.equal(runIdx(parseISO("2026-10-20"), start), -1);
  assert.equal(runIdx(parseISO("2026-10-21"), start), 0);
  assert.equal(runIdx(parseISO("2026-10-28"), start), 7);
  assert.equal(runIdx(parseISO("2026-11-10"), start), 20);
  assert.equal(runIdx(parseISO("2026-11-11"), start), -1);
  assert.equal(runIdx(parseISO("2026-10-21"), null), -1);
  assert.equal(runKey(start, 20), "2026-11-10");
  assert.equal(PLAN_DAYS, 21); assert.equal(PLAN_RUNS, 12);
});

test("runInfo turns rest days into recovery walks when enabled", () => {
  assert.equal(runInfo(1, false).label, "Rest");
  assert.deepEqual({ label: runInfo(1, true).label, mins: runInfo(1, true).mins }, { label: "Recovery", mins: 10 });
  assert.equal(runInfo(0, true).label, "Run");
});

test("planDone reads run ticks from day records", () => {
  const s = emptyState(); s.plan.start = "2026-10-21"; s.days["2026-10-21"] = { run: true }; s.days["2026-10-23"] = { s: "done" };
  const d = planDone(s); assert.equal(d.length, 21); assert.equal(d[0], true); assert.equal(d[2], false);
  assert.deepEqual(planDone(emptyState()), []);
});

test("pfHelpers: test sessions fall on the last practice day of weeks 2, 4, 6, 8", () => {
  const today = parseISO("2026-10-28");
  const h = pfHelpers({ start: "2026-10-01", pdays: [1, 3, 5, 0] }, today); // Thu 1 Oct; practice Mon Wed Fri Sun
  assert.deepEqual(h.testDays().map(t => [t.week, t.key]), [[2, "2026-10-14"], [4, "2026-10-28"], [6, "2026-11-11"], [8, "2026-11-25"]]);
  assert.equal(h.testFor("2026-10-28").week, 4);
  assert.equal(h.testFor("2026-10-27"), null);
  assert.equal(h.stageIdx(), 1); // day 27 → week 3 → stage 2 (index 1)
  assert.equal(pfHelpers({ start: "2026-10-01", pdays: [] }, today).testDays().length, 0);
  assert.equal(pfHelpers({ start: null, pdays: [1] }, today).stageIdx(), 0);
  assert.equal(pfHelpers({ start: "2026-01-01", pdays: [1] }, today).stageIdx(), 3); // clamps at the last stage
});

import { parseRoute, formatRoute } from "../../src/route.js";
test("routes round-trip and fall back to Today", () => {
  for (const h of ["#today", "#month/2026-09", "#programs/run", "#programs/pf"]) assert.equal(formatRoute(parseRoute(h, "2026-10")), h);
  assert.deepEqual(parseRoute("", "2026-10"), { view: "today", month: "2026-10", sub: "run" });
  assert.deepEqual(parseRoute("#month/nope", "2026-10"), { view: "month", month: "2026-10", sub: "run" });
  assert.equal(parseRoute("#programs/xyz", "2026-10").sub, "run");
  assert.equal(parseRoute("#settings", "2026-10").view, "today");
});

import { planLine } from "../../src/logic.js";
test("planLine drops a repeated kind label", () => {
  assert.equal(planLine(runInfo(7, false)), "Run 2 min, walk 2 min, 6 rounds");
  assert.equal(planLine(runInfo(5, false)), "Brisk walk");
  assert.equal(planLine(runInfo(20, false)), "Finish: Run 8 min, walk 1 min, 3 rounds");
  assert.equal(planLine(runInfo(1, false)), "Rest or easy stroll");
  assert.equal(planLine(runInfo(1, true)), "Recovery: Shoes on, 10-min walk or stretch");
});
