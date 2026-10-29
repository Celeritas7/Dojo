import React from "react";
import { DS, TODAY } from "../env.js";
import { words } from "../words.js";
import { useBreakpoint, autoGrid } from "../layout.js";
import { PLAN, PLAN_DAYS, PLAN_RUNS, WEEKS, STAGES, DAYNAMES, RULES, iso, fmtDate, sameDay, longest, addDays, runInfo, planDone, planSeq, planPos, planSlots, planWeeks, currentWeekGroup, isRepeat, runIdx, controlSeries, pfHelpers } from "../logic.js";
import { LineChart } from "./Charts.jsx";
const { Toggle, Rule, Field, Pill, Stage, Stat, Strip, Tip, Lanes, DayCard, Tab, TabList, Button } = DS;

const rulesGrid = autoGrid(200);
const progGrid = { ...autoGrid(200, 8), margin: "12px 0 18px" };
const statGrid = { ...autoGrid(150), margin: "18px 0" };
const h2 = { font: "700 var(--text-title)/1.1 var(--font-display)", letterSpacing: ".01em", margin: 0 };
const h3 = { font: "700 var(--text-subhead)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 6px" };

function Rules() { return <div style={rulesGrid}>{RULES.map(([t, b]) => <Rule key={t} title={t}>{b}</Rule>)}</div>; }

// Programs: one segmented switch between the running plan and the pelvic-floor program.
export function ProgramsView({ state, sub, onSub, setPlan, setPf, toggleRun, onPlanAction }) {
  const w = words(state);
  return <>
    <TabList label="Programs" size="sm" style={{ marginBottom: 16, borderBottom: "1px solid var(--line)", borderRadius: 0, paddingBottom: 6, display: "flex" }}>
      {[["run", "Running plan"], ["pf", w.programTab]].map(([k, l]) => <Tab key={k} id={`ptab-${k}`} aria-controls="ppanel" selected={sub === k} onClick={() => onSub(k)}>{l}</Tab>)}
    </TabList>
    <div id="ppanel" role="tabpanel" aria-labelledby={`ptab-${sub}`}>
      {sub === "run" ? <RunPlanView state={state} setPlan={setPlan} toggleRun={toggleRun} onPlanAction={onPlanAction} /> : <PFView state={state} setPf={setPf} />}
    </div>
  </>;
}

function RunPlanView({ state, setPlan, toggleRun, onPlanAction }) {
  const bp = useBreakpoint();
  const plan = state.plan, start = plan.start, rec = plan.recovery;
  const done = planDone(state);
  const total = done.filter(Boolean).length;
  const streak = longest(done.map(v => v ? 1 : 0));
  // Without a start date the plan still shows (undated) so it can be read before committing.
  const groups = planWeeks(start ? plan : { start: iso(TODAY) });
  const slots = planSlots(plan), len = planSeq(plan).length, pos = planPos(plan, TODAY), inPlan = !!start && pos >= 0 && pos < len;
  const ri = runIdx(TODAY, plan), week = currentWeekGroup(plan, TODAY);
  const status = !start ? "Set a start date to put the plan on your calendar."
    : pos < 0 ? `Starts in ${-pos} day${pos === -1 ? "" : "s"}.`
    : pos < len ? (ri >= 0 ? `Day ${ri + 1} of ${PLAN_DAYS}${isRepeat(plan, pos) ? ", again" : ""}.` : "Today is a pushed-back day; the plan continues tomorrow.")
    : "The plan has finished. Start again any time, or repeat it from a new date.";
  const cols = bp === "desktop" ? 7 : bp === "phone" ? 3 : 4;
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
      <div><h2 style={h2}>{PLAN_DAYS}-day running start</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{start ? `${fmtDate(slots[0].date)} to ${fmtDate(slots[slots.length - 1].date)}. ` : ""}Run/walk intervals building to 8 minutes non-stop.</p>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{status}</p></div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Field label="Plan start" as="date" value={start || ""} onChange={e => setPlan({ start: e.target.value || null })} />
        <Toggle checked={rec} onChange={v => setPlan({ recovery: v })}>Rest days become recovery walks</Toggle>
      </div>
    </div>
    {start && <p id="plan-adjust-hint" style={{ margin: "0 0 6px", color: "var(--ink-2)", fontSize: "var(--text-small)" }}>Week felt hard? Repeat it. Missed today? Push the plan back a day. Every change can be undone.</p>}
    {start && <div role="group" aria-label="Adjust the plan" aria-describedby="plan-adjust-hint" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      {inPlan && week && <Button variant="ghost" onClick={() => onPlanAction("repeat")} style={{ minHeight: 44 }}>Repeat week {week.week + 1}</Button>}
      {inPlan && <Button variant="ghost" onClick={() => onPlanAction("push")} style={{ minHeight: 44 }}>Push back a day</Button>}
      <Button variant="ghost" onClick={() => onPlanAction("restart")} style={{ minHeight: 44 }}>Start again today</Button>
    </div>}
    <Lanes value={total} max={PLAN_DAYS} word="Day" />
    {groups.map((g, gi) => { const w = g.week === null ? null : WEEKS[g.week];
      const planned = g.slots.filter(sl => sl.i !== null), wdone = planned.filter(sl => (state.days[sl.key] || {}).run).length;
      const title = w ? `${w[0]}${g.again ? " · again" : ""}` : "Pushed back";
      // Week label on top at every width, so a week with a pushed-back day can wrap cleanly.
      return <section key={gi} aria-label={title} style={{ display: "grid", gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`, gap: 8, marginBottom: 16 }}>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}><b style={{ font: "700 var(--text-subhead) var(--font-display)", letterSpacing: ".01em" }}>{title}</b>{w && <span style={{ color: "var(--ink-2)", fontSize: "var(--text-small)" }}>{w[1]}</span>}{planned.length > 0 && <span style={{ marginLeft: "auto", font: "700 var(--text-body) var(--font-display)", letterSpacing: ".01em" }}>{wdone}/{planned.length} done</span>}</div>
        {g.slots.map(sl => { if (sl.i === null) return <div key={sl.key} style={{ border: "1.5px dashed var(--line)", borderRadius: "var(--radius-md)", padding: 10, color: "var(--ink-2)", fontSize: "var(--text-small)", display: "flex", flexDirection: "column", gap: 2 }}><b style={{ font: "700 var(--text-body) var(--font-display)", color: "var(--ink)" }}>Pushed back</b>{start && fmtDate(sl.date)}<span>Free day; the plan picks up the next day.</span></div>;
          const n = sl.i + 1, info = runInfo(sl.i, rec);
          return <DayCard key={sl.key} n={n} date={start ? fmtDate(sl.date) : ""} kind={info.kind} label={info.label} what={info.what + (info.kind === "rest" && rec && n === 20 ? ". Big day tomorrow." : "")} extra={info.extra} mins={info.mins} done={!!(state.days[sl.key] || {}).run} today={!!start && sameDay(sl.date, TODAY)} onClick={() => start && toggleRun(sl.key)} />; })}
      </section>; })}
    <div style={statGrid}><Stat value={streak} label="Longest streak" /><Stat value={`${PLAN.filter((p, i) => (p[0] === "run" || p[0] === "finish") && done[i]).length}/${PLAN_RUNS}`} label="Runs completed" /></div>
    <Rules />
  </>;
}

function PFView({ state, setPf }) {
  const phone = useBreakpoint() === "phone";
  const w = words(state), discreet = state.settings.discreet;
  // Discreet mode keeps the numbers but hides the guidance until asked.
  const [showGuide, setShowGuide] = React.useState(false);
  const guide = !discreet || showGuide;
  const pf = state.pf; const h = pfHelpers(pf, TODAY); const si = h.stageIdx();
  const days = []; for (let i = 27; i >= 0; i--) days.push(addDays(TODAY, -i));
  let streak = 0; for (let i = days.length - 1; i >= 0; i--) { const e = state.days[iso(days[i])]; if (e && e.sets >= 3) streak++; else if (i === days.length - 1) continue; else break; }
  const last7 = days.slice(-7).map(d => state.days[iso(d)] || {}); const pracs = last7.filter(e => e.practice === "yes");
  const ctrls = days.map(d => state.days[iso(d)] || {}).filter(e => e.practice === "yes" && e.control);
  const avg = a => a.length ? (a.reduce((x, e) => x + e.control, 0) / a.length).toFixed(1) : "–";
  const TKEY = iso(TODAY);
  const series = controlSeries(state.days, TODAY);
  return <section aria-labelledby="pf-title">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
      <div><h2 id="pf-title" style={h2}>{w.programTitle}</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{discreet ? `${w.sets} every day, ${w.practice.toLowerCase()} 3–4 days a week, and a ${w.test.toLowerCase()} every two weeks.` : "Daily squeezes build the muscles; practice sessions build awareness. Kegels every day, practice 3–4 days a week, and a test session every two weeks."} Stored only on this device.</p></div>
      <Field label="Program start" id="pf-start" as="date" value={pf.start || ""} onChange={e => setPf({ start: e.target.value || null })} />
    </div>
    {discreet && <p style={{ margin: "0 0 14px" }}><Button variant="ghost" aria-expanded={showGuide} onClick={() => setShowGuide(v => !v)} style={{ minHeight: 44 }}>{showGuide ? "Hide program details" : "Show program details"}</Button></p>}
    {guide && <div style={progGrid}>{STAGES.map((s, i) => <Stage key={s[0]} title={s[0]} now={i === si}><><strong>Kegels daily:</strong> {s[1]}, {s[2]}</><><strong>Practice:</strong> {s[3]}</></Stage>)}</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)", marginBottom: 16 }}>{w.practice} days (3–4 a week; {w.sets.toLowerCase().replace("kegel", "Kegel")} every day)
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[1, 2, 3, 4, 5, 6, 0].map(n => <Pill key={n} pressed={pf.pdays.includes(n)} onClick={() => setPf({ pdays: pf.pdays.includes(n) ? pf.pdays.filter(x => x !== n) : [...pf.pdays, n] })}>{DAYNAMES[n]}</Pill>)}</div></div>
    <h3 style={h3}>{w.test}s</h3>
    {pf.start ? <><div style={progGrid}>{h.testDays().map(t => { const e = state.days[t.key] || {}; const has = e.practice === "yes";
      const details = has ? [e.time && `${e.time} min`, e.pauses && `${e.pauses} pause${e.pauses === "1" ? "" : "s"}`, e.control && `control ${e.control}/5`].filter(Boolean) : [];
      const text = !has ? (t.date < TODAY ? "Not logged" : "Upcoming") : details.length ? details.join(", ") : "Done, no details";
      return <Stage key={t.week} title={`Week ${t.week}`} now={t.key === TKEY}>{fmtDate(t.date)}{text}</Stage>; })}</div>
      {guide && <Tip>Keep test conditions the same each time: same lubricant, similar time of day, and no practice the day before.</Tip>}</>
      : <Tip>Set a program start date, or answer on the Today screen, to schedule your four {w.test.toLowerCase()}s.</Tip>}
    <div style={statGrid}><Stat value={streak} label="Days in a row with 3 sets" /><Stat value={pracs.length} label={`${w.practice} sessions, last 7 days`} /><Stat value={avg(ctrls.slice(-5))} label="Average control, last 5 sessions (out of 5)" /></div>
    <LineChart title="Control over time" desc={`Your control rating for the last ${Math.min(12, series.length) || 12} ${w.practice.toLowerCase()} and ${w.test.toLowerCase()}s, 1 to 5.`} unit="Control" yMin={1} yMax={5} empty={`No rated ${w.practice.toLowerCase()} sessions yet. Rate your control after a session to see the trend.`}
      data={series.map(d => ({ key: d.key, label: fmtDate(d.date).slice(4), long: fmtDate(d.date), value: d.value }))} />
    <h3 style={{ ...h3, margin: 0 }}>Last 28 days</h3>
    <Strip label={`${w.sets} and ${w.practice.toLowerCase()}, last 28 days`} columns={phone ? 7 : 14} days={days.map(d => { const e = state.days[iso(d)] || {}; return { n: d.getDate(), sets: e.sets || 0, practice: e.practice === "yes", title: `${fmtDate(d)}: ${e.sets ?? 0} of 3 sets${e.practice === "yes" ? ", practice" : ""}` }; })} />
    <Tip>Darker squares mean more sets done. A blue underline marks a {w.practice.toLowerCase()} day.</Tip>
    {guide && <><Tip>Squeeze only the pelvic floor, not your stomach, thighs or buttocks, and keep breathing. The relaxation half of each rep matters as much as the squeeze.</Tip>
    <Tip>Daily squeezes are fine. For practice sessions, 3–4 a week is enough to improve; daily is okay too, but compare your control scores after a rest day versus back-to-back days and follow what your own numbers show.</Tip></>}
  </section>;
}
