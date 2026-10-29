import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyState, validate, load, save, importJSON, exportJSON, STORAGE_KEY } from "../../src/store.js";
import { saveDay, clearDay, restoreDay, patchDay, toggleRun, setMonth, setPf } from "../../src/reducers.js";
import { demoState } from "../../src/demo.js";

const memStorage = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), m }; };

test("saveDay stores a compact record and drops empty ones", () => {
  let s = emptyState();
  s = saveDay(s, "2026-10-15", { s: "done", m: "30", run: null, sets: 2, practice: null, pauses: "", control: 0, time: "" });
  assert.deepEqual(s.days["2026-10-15"], { s: "done", m: 30, sets: 2 });
  s = saveDay(s, "2026-10-15", { s: null, m: "", run: null, sets: null, practice: null, pauses: "", control: 0, time: "" });
  assert.equal(s.days["2026-10-15"], undefined);
});

test("saveDay: minutes need a status; sets 0 is an answer, null is not; practice details only kept for yes", () => {
  const a = saveDay(emptyState(), "2026-10-15", { s: null, m: "20", run: true, sets: 0, practice: "no", pauses: "3", control: 4, time: "5" });
  assert.deepEqual(a.days["2026-10-15"], { run: true, sets: 0, practice: "no" });
  const b = saveDay(emptyState(), "2026-10-15", { s: null, m: "", run: false, sets: null, practice: "yes", pauses: "3", control: 4, time: "" });
  assert.deepEqual(b.days["2026-10-15"], { practice: "yes", pauses: "3", control: 4 });
});

test("toggleRun fills in the plan's exercise and removes only that on untick", () => {
  let s = emptyState(); s.plan.start = "2026-10-21";
  s = toggleRun(s, "2026-10-21"); assert.deepEqual(s.days["2026-10-21"], { s: "done", m: 34, run: true });   // day 1: run, 34 min
  s = toggleRun(s, "2026-10-22"); assert.deepEqual(s.days["2026-10-22"], { s: "rest", run: true });          // day 2: rest
  s = toggleRun(s, "2026-10-21"); assert.equal(s.days["2026-10-21"], undefined);
  s.days["2026-10-23"] = { s: "light", m: 15 }; s = toggleRun(s, "2026-10-23");
  assert.deepEqual(s.days["2026-10-23"], { s: "light", m: 15, run: true });                                  // keeps what was logged
  s = toggleRun(s, "2026-10-23"); assert.deepEqual(s.days["2026-10-23"], { s: "light", m: 15 });
  // Unticking after the recovery setting changed: the stored "rest" no longer matches what the tick would fill in, so it is kept.
  const rec = toggleRun({ ...s, plan: { start: "2026-10-21", recovery: true } }, "2026-10-22");
  assert.deepEqual(rec.days["2026-10-22"], { s: "rest" });
});

test("restoreDay puts a cleared record back", () => {
  let s = demoState(); const prev = s.days["2026-10-05"];
  s = clearDay(s, "2026-10-05"); s = restoreDay(s, "2026-10-05", prev);
  assert.deepEqual(s.days["2026-10-05"], prev);
});

test("clearDay removes the whole record, including the run tick", () => {
  let s = demoState(); assert.ok(s.days["2026-10-21"].run);
  s = clearDay(s, "2026-10-21"); assert.equal(s.days["2026-10-21"], undefined);
});

test("patchDay merges and starts the program on the first answer", () => {
  let s = emptyState();
  s = patchDay(s, "2026-10-28", { sets: 2 });
  assert.deepEqual(s.days["2026-10-28"], { sets: 2 }); assert.equal(s.pf.start, "2026-10-28");
  s = patchDay(s, "2026-10-28", { practice: "yes" });
  assert.deepEqual(s.days["2026-10-28"], { sets: 2, practice: "yes" }); assert.equal(s.pf.start, "2026-10-28");
});

test("toggleRun flips the tick and keeps the rest of the day", () => {
  let s = emptyState(); s.days["2026-10-21"] = { s: "done", m: 30 };
  s = toggleRun(s, "2026-10-21"); assert.deepEqual(s.days["2026-10-21"], { s: "done", m: 30, run: true });
  s = toggleRun(s, "2026-10-21"); assert.deepEqual(s.days["2026-10-21"], { s: "done", m: 30 });
});

test("setMonth and setPf merge patches", () => {
  const s = setMonth(emptyState(), "2026-10", { goal: "Run" });
  assert.deepEqual(s.months["2026-10"], { goal: "Run", target: "", routines: 0, notes: "" });
  assert.deepEqual(setPf(s, { pdays: [2] }).pf, { start: null, pdays: [2] });
});

test("save/load round-trips through storage and ignores junk", () => {
  const st = memStorage(); const s = demoState();
  assert.ok(save(st, s)); assert.deepEqual(load(st), s);
  st.setItem(STORAGE_KEY, "{not json"); assert.equal(load(st), null);
  st.setItem(STORAGE_KEY, JSON.stringify({ version: 1 })); assert.equal(load(st), null);
  assert.equal(load(memStorage()), null);
});

test("export/import round-trips and validates", () => {
  const s = demoState();
  assert.deepEqual(importJSON(exportJSON(s)), s);
  assert.throws(() => importJSON("[]"), /expected an object/);
  assert.throws(() => importJSON(JSON.stringify({ version: 2, days: { "nope": {} } })), /Bad day entry/);
  assert.throws(() => importJSON(JSON.stringify({ version: 2, plan: { start: "yesterday" } })), /plan.start/);
  assert.throws(() => validate({ version: 3 }), /version 3/);
  const cleaned = validate({ version: 2, days: { "2026-01-01": { s: "done", m: 0, bogus: 1 }, "2026-01-02": { m: 0 }, "2026-01-03": { sets: 0 } }, pf: { pdays: [1, 9, "x"] } });
  assert.deepEqual(cleaned.days, { "2026-01-01": { s: "done" }, "2026-01-03": { sets: 0 } }); assert.deepEqual(cleaned.pf.pdays, [1]);
});

import { updateDay, setSettings } from "../../src/reducers.js";
test("updateDay merges without starting the program; settings round-trip and default", () => {
  let s = updateDay(emptyState(), "2026-10-28", { s: "done", m: 34 });
  assert.deepEqual(s.days["2026-10-28"], { s: "done", m: 34 }); assert.equal(s.pf.start, null);
  s = setSettings(s, { discreet: true });
  assert.deepEqual(importJSON(exportJSON(s)).settings, { discreet: true });
  assert.deepEqual(validate({ version: 2 }).settings, { discreet: false }, "older saves without settings still load");
});

import { repeatWeek, pushBack, restartPlan } from "../../src/reducers.js";
import { runIdx, parseISO, planSeq } from "../../src/logic.js";
test("plan controls: repeat week, push back, start again", () => {
  const base = { ...emptyState(), plan: { start: "2026-10-21", recovery: false } };
  const today = parseISO("2026-10-29"); // plan day 9, week 2
  const r = repeatWeek(base, today);
  assert.deepEqual(planSeq(r.plan).slice(14, 21), [7, 8, 9, 10, 11, 12, 13], "week 2 again right after week 2");
  assert.equal(runIdx(parseISO("2026-11-11"), r.plan), 14, "week 3 now starts 7 days later");
  const p = pushBack(base, today);
  assert.equal(runIdx(today, p.plan), -1); assert.equal(runIdx(parseISO("2026-10-30"), p.plan), 8);
  const ticked = { ...base, days: { "2026-10-29": { run: true } } };
  assert.equal(runIdx(today, pushBack(ticked, today).plan), 8, "already ticked today: the gap goes tomorrow");
  assert.equal(pushBack(base, parseISO("2026-12-01")), base, "outside the plan: unchanged");
  assert.equal(repeatWeek(base, parseISO("2026-10-01")), base);
  const s = restartPlan(r, parseISO("2026-12-01"));
  assert.deepEqual(s.plan, { start: "2026-12-01", recovery: false }, "original schedule from the new start");
  assert.deepEqual(validate(JSON.parse(exportJSON(r))).plan.seq, planSeq(r.plan), "schedule survives a backup");
  assert.throws(() => validate({ version: 2, plan: { start: "2026-10-21", seq: [0, 99] } }), /plan.seq/);
});
