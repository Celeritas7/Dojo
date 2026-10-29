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
  assert.equal(runIdx(parseISO("2026-10-20"), { start }), -1);
  assert.equal(runIdx(parseISO("2026-10-21"), { start }), 0);
  assert.equal(runIdx(parseISO("2026-10-28"), { start }), 7);
  assert.equal(runIdx(parseISO("2026-11-10"), { start }), 20);
  assert.equal(runIdx(parseISO("2026-11-11"), { start }), -1);
  assert.equal(runIdx(parseISO("2026-10-21"), { start: null }), -1);
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

import { planSeq, planSlots, planWeeks, isRepeat, currentStreak, weeklyMinutes, controlSeries, planDone as planDone2 } from "../../src/logic.js";
test("schedule: default, gaps and repeats map dates to plan days", () => {
  const plan = { start: "2026-10-21", seq: [0, 1, 2, 3, 4, 5, 6, 7, null, 8, 9, 10, 11, 12, 13, 7, 8, 9, 10, 11, 12, 13] };
  assert.equal(planSeq({ start: "2026-10-21" }).length, 21);
  assert.equal(runIdx(parseISO("2026-10-29"), plan), -1, "gap day is not a plan day");
  assert.equal(runIdx(parseISO("2026-10-30"), plan), 8, "plan day 9 moved to the 30th");
  assert.equal(runIdx(parseISO("2026-11-05"), plan), 7, "week 2 again from the 5th");
  assert.ok(isRepeat(plan, 15)); assert.ok(!isRepeat(plan, 7));
  const weeks = planWeeks(plan);
  assert.deepEqual(weeks.map(w => [w.week, w.again, w.slots.length]), [[0, false, 7], [1, false, 8], [1, true, 7]]);
  assert.equal(planSlots(plan).at(-1).key, "2026-11-11");
  const s = { plan, days: { "2026-11-05": { run: true } } };
  assert.equal(planDone2(s)[7], true, "a plan day is done if any of its dates is ticked");
});

test("current streak: rest is neutral, names what broke it", () => {
  const days = { "2026-10-20": { s: "missed" }, "2026-10-21": { s: "done" }, "2026-10-22": { s: "rest" }, "2026-10-23": { s: "light" }, "2026-10-24": { s: "done" } };
  assert.deepEqual(currentStreak(days, parseISO("2026-10-24")), { length: 3, since: "2026-10-21", brokenBy: { key: "2026-10-20", reason: "missed" } });
  assert.deepEqual(currentStreak(days, parseISO("2026-10-25")), { length: 3, since: "2026-10-21", brokenBy: { key: "2026-10-20", reason: "missed" } }, "today not logged yet: start from yesterday");
  assert.deepEqual(currentStreak({}, parseISO("2026-10-25")).brokenBy, { key: "2026-10-24", reason: "not logged" });
});

test("weekly minutes cover whole Monday weeks touching the month; control series is the last n rated sessions", () => {
  const days = { "2026-09-28": { s: "done", m: 30 }, "2026-10-01": { s: "done", m: 20 }, "2026-10-05": { s: "light", m: 15 }, "2026-10-06": { m: 99 } };
  const w = weeklyMinutes(days, "2026-10");
  assert.deepEqual(w.map(x => [x.key, x.value]), [["2026-09-28", 50], ["2026-10-05", 15], ["2026-10-12", 0], ["2026-10-19", 0], ["2026-10-26", 0]]);
  const c = { "2026-10-01": { practice: "yes", control: 2 }, "2026-10-03": { practice: "yes" }, "2026-10-05": { practice: "yes", control: 4 }, "2026-10-09": { practice: "yes", control: 5 } };
  assert.deepEqual(controlSeries(c, parseISO("2026-10-08"), 2).map(x => [x.key, x.value]), [["2026-10-01", 2], ["2026-10-05", 4]]);
});

test("a pushed-back gap belongs to the week of the plan day it delays", () => {
  const seq = [0, 1, 2, 3, 4, 5, 6, null, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const weeks = planWeeks({ start: "2026-10-21", seq });
  assert.deepEqual(weeks.map(w => [w.week, w.slots.length]), [[0, 7], [1, 8], [2, 7]]);
  assert.equal(weeks[1].slots[0].i, null);
});
