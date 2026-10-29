import React from "react";
import { DS, TODAY } from "../env.js";
import { MOTTOS, DEFAULT_MOTTO, STATES, STAGES, PLAN_DAYS, iso, addDays, fmtDate, parseISO, monthKey, runIdx, runInfo, planLine, planPos, planSeq, isRepeat, currentStreak, pfHelpers } from "../logic.js";
import { words } from "../words.js";
import { useBreakpoint } from "../layout.js";
import { dayCell, onCalendarKey } from "./Sheet.jsx";
const { Motto, StateGrid, Field, Pill, Button, SheetCell, DowHeader, HabitDot } = DS;

const K = iso(TODAY);
const LONG_DATE = TODAY.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const card = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 12 };
const h3 = { font: "700 var(--text-subhead)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 4px" };
const hint = { color: "var(--ink-2)", fontSize: "var(--text-small)", margin: "0 0 10px" };
const row = { display: "flex", gap: 6, flexWrap: "wrap" };

// Home screen: today's workout, plan day, sets and practice as rows that save as they are tapped, then this week.
export function Today({ state, update, updatePf, toggleRun, onOpenDay, onGo }) {
  const phone = useBreakpoint() === "phone";
  const w = words(state);
  const e = state.days[K] || {};
  const h = pfHelpers(state.pf, TODAY);

  // Workout
  const ri = runIdx(TODAY, state.plan), info = ri >= 0 ? runInfo(ri, state.plan.recovery) : null;
  const setStatus = s => s === e.s ? update(K, { s: undefined, m: undefined })
    : update(K, { s, m: e.m || (s === "done" && info && info.mins ? info.mins : undefined) });

  // Running plan
  const pos = planPos(state.plan, TODAY), daysTo = state.plan.start ? -pos : null;
  const gapDay = !!state.plan.start && pos >= 0 && pos < planSeq(state.plan).length && ri < 0;
  const streak = currentStreak(state.days, TODAY);

  // Practice / test
  const test = h.testFor(K), pday = h.isPracticeDay(TODAY), planned = !!state.pf.start && (test || pday);
  const testTomorrow = !!h.testFor(iso(addDays(TODAY, 1)));
  const [anyway, setAnyway] = React.useState(false);
  const showPractice = planned || e.practice != null || anyway;
  const st = STAGES[h.stageIdx()];
  const practiceNote = test ? `${w.test} day (end of week ${test.week}). Steady realistic pace; pause only if you really need to.`
    : pday ? (testTomorrow ? `Tomorrow is a ${w.test.toLowerCase()}, so skip practice today.` : state.settings.discreet ? `${w.practice} day.` : `Practice day. Focus: ${st[3]}`)
    : `Not a planned ${w.practice.toLowerCase()} day.`;

  // This week, Monday to Sunday
  const monday = addDays(TODAY, -((TODAY.getDay() + 6) % 7));
  const week = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(monday, i));

  return <>
    <h2 style={{ font: "700 var(--text-title)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 2px" }}>{LONG_DATE}</h2>
    <Motto>{MOTTOS[monthKey(TODAY)] || DEFAULT_MOTTO}</Motto>

    <section aria-labelledby="t-workout" style={card}>
      <h3 id="t-workout" style={h3}>Workout</h3>
      <StateGrid value={e.s || null} onChange={setStatus} options={Object.entries(STATES).map(([value, label]) => ({ value, label }))} style={{ gridTemplateColumns: phone ? "1fr 1fr" : "repeat(4,1fr)", marginBottom: e.s ? 10 : 0 }} />
      {e.s && e.s !== "missed" && <Field label="Minutes" as="number" min={0} max={600} inputMode="numeric" value={e.m || ""} onChange={ev => update(K, { m: +ev.target.value || undefined })} placeholder="e.g. 30" inputStyle={{ width: 120 }} />}
    </section>

    {(info || gapDay || (daysTo !== null && daysTo > 0) || !state.plan.start) && <section aria-labelledby="t-run" style={card}>
      <h3 id="t-run" style={h3}>Running plan</h3>
      {info ? <>
        <p style={hint}>Day {ri + 1} of {PLAN_DAYS}{isRepeat(state.plan, pos) ? " (again)" : ""} · {planLine(info)}{info.mins ? ` · ~${info.mins} min` : ""}</p>
        <Pill pressed={!!e.run} onClick={() => toggleRun(K)}>{e.run ? "Done ✓" : "Mark done"}</Pill>
      </> : gapDay ? <p style={{ ...hint, margin: 0 }}>Free day: you pushed the plan back. It picks up tomorrow.</p>
        : daysTo > 0 ? <p style={{ ...hint, margin: 0 }}>Starts in {daysTo} day{daysTo === 1 ? "" : "s"}.</p>
        : <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><p style={{ ...hint, margin: 0 }}>No running plan yet.</p><Button variant="ghost" onClick={() => onGo({ view: "programs", sub: "run" })} style={{ minHeight: 44 }}>Set a start date</Button></div>}
    </section>}

    <section aria-labelledby="t-sets" style={card}>
      <h3 id="t-sets" style={h3}>{w.sets}</h3>
      <p id="t-sets-hint" style={hint}>{st[1]}, {st[2]}</p>
      <div role="group" aria-labelledby="t-sets" aria-describedby="t-sets-hint" style={row}>{[0, 1, 2, 3].map(n => <Pill key={n} pressed={e.sets === n} onClick={() => updatePf(K, { sets: n })}>{n}</Pill>)}</div>
    </section>

    {showPractice ? <section aria-labelledby="t-practice" style={card}>
      <h3 id="t-practice" style={h3}>{test ? w.test : w.practice}</h3>
      <p id="t-practice-hint" style={hint}>{practiceNote}</p>
      <div role="group" aria-labelledby="t-practice" aria-describedby="t-practice-hint" style={row}>
        <Pill pressed={e.practice === "yes"} onClick={() => updatePf(K, { practice: "yes" })}>Done</Pill>
        <Pill pressed={e.practice === "no"} onClick={() => updatePf(K, { practice: "no" })}>Not today</Pill>
      </div>
      {e.practice === "yes" && <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}>
        {test && <Field label="Minutes until finish" as="number" min={0} max={120} step={0.5} value={e.time || ""} onChange={ev => updatePf(K, { time: ev.target.value })} inputStyle={{ width: 110 }} />}
        <Field label="Pauses" as="number" min={0} max={20} value={e.pauses || ""} onChange={ev => updatePf(K, { pauses: ev.target.value })} inputStyle={{ width: 90 }} />
        <div role="group" aria-labelledby="t-control" aria-describedby="t-control-scale" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)" }}>
          <span id="t-control">Control</span>
          <div style={row}>{[1, 2, 3, 4, 5].map(n => <Pill key={n} pressed={e.control === n} onClick={() => updatePf(K, { control: n })}>{n}</Pill>)}</div>
          <span id="t-control-scale" style={{ fontSize: "var(--text-caption)" }}>1 = very little, 5 = full control</span>
        </div>
      </div>}
    </section> : <p style={{ margin: "0 0 12px" }}><Button variant="ghost" onClick={() => setAnyway(true)} style={{ minHeight: 44 }}>Log a {w.practice.toLowerCase()} session anyway</Button></p>}

    <section aria-labelledby="t-week" style={{ marginTop: 18 }}>
      <h3 id="t-week" style={h3}>This week</h3>
      <div onKeyDown={onCalendarKey} role="group" aria-labelledby="t-week" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: phone ? 4 : 6 }}>
        <DowHeader labels={phone ? ["M", "T", "W", "T", "F", "S", "S"] : undefined} trailing={null} />
        {week.map(d => { const { key, ...cell } = dayCell(state, d, { compact: phone, onOpenDay }); return <SheetCell key={key} {...cell} />; })}
      </div>
      <p style={{ margin: "10px 0 0", fontWeight: 600 }}>Current streak: {streak.length} day{streak.length === 1 ? "" : "s"}{streak.since && streak.length > 0 ? `, since ${fmtDate(parseISO(streak.since))}` : ""}.</p>
      {streak.brokenBy && <p style={{ ...hint, margin: "2px 0 0" }}>{streak.length ? "Before that, " : ""}{streak.length ? fmtDate(parseISO(streak.brokenBy.key)) : `${fmtDate(parseISO(streak.brokenBy.key))}`} {streak.brokenBy.reason === "missed" ? "was missed" : "had nothing logged"}. Rest days don't break a streak.</p>}
      <p style={{ ...hint, marginTop: 8 }}>Tap a day to edit it. Older days are under <Button variant="ghost" onClick={() => onGo({ view: "month" })} style={{ padding: "2px 8px", fontSize: "var(--text-small)" }}>Month</Button>.</p>
    </section>
  </>;
}
