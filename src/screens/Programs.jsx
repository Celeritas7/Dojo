import { DS, TODAY } from "../env.js";
import { useBreakpoint, autoGrid } from "../layout.js";
import { PLAN, PLAN_DAYS, PLAN_RUNS, WEEKS, STAGES, DAYNAMES, RULES, iso, fmtDate, sameDay, longest, addDays, dayDiff, parseISO, runDate, runKey, runInfo, planDone, pfHelpers } from "../logic.js";
const { Details, Toggle, Rule, Field, Pill, Stage, Stat, Strip, Tip, Lanes, DayCard } = DS;

const rulesGrid = autoGrid(200);
const progGrid = { ...autoGrid(200, 8), margin: "12px 0 18px" };
const statGrid = { ...autoGrid(150), margin: "18px 0" };
const h2 = { font: "700 var(--text-title)/1.1 var(--font-display)", letterSpacing: ".01em", margin: 0 };
const h3 = { font: "700 var(--text-subhead)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 6px" };

function Rules() { return <div style={rulesGrid}>{RULES.map(([t, b]) => <Rule key={t} title={t}>{b}</Rule>)}</div>; }
const planRange = start => start ? `${fmtDate(parseISO(start))} to ${fmtDate(runDate(start, PLAN_DAYS - 1))}` : "not started";

export function RunPlanDetails({ state, setPlan, open, onToggle }) {
  return <Details summary={`Running plan: ${planRange(state.plan.start)}`} open={open} onToggle={onToggle}>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
      <Field label="Plan start" as="date" value={state.plan.start || ""} onChange={e => setPlan({ start: e.target.value || null })} />
      <Toggle checked={state.plan.recovery} onChange={v => setPlan({ recovery: v })} style={{ display: "inline-flex" }}>Rest days become recovery walks</Toggle>
    </div>
    <Rules />
  </Details>;
}

export function RunPlanView({ state, setPlan, toggleRun }) {
  const bp = useBreakpoint();
  const start = state.plan.start, rec = state.plan.recovery;
  const done = planDone(state);
  const total = done.filter(Boolean).length;
  const streak = longest(done.map(v => v ? 1 : 0));
  const daysTo = start ? dayDiff(parseISO(start), TODAY) : null;
  const status = daysTo === null ? "Set a start date to put the plan on your calendar." : daysTo > 0 ? `Starts in ${daysTo} day${daysTo === 1 ? "" : "s"}.` : daysTo > -PLAN_DAYS ? `Day ${1 - daysTo} of ${PLAN_DAYS}.` : "Plan complete window has passed. Repeat any week anytime.";
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
      <div><h2 style={h2}>{PLAN_DAYS}-day running start</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{start ? `${planRange(start)}. ` : ""}Run/walk intervals building to 8 minutes non-stop.</p>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{status}</p></div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Field label="Plan start" as="date" value={start || ""} onChange={e => setPlan({ start: e.target.value || null })} />
        <Toggle checked={rec} onChange={v => setPlan({ recovery: v })}>Rest days become recovery walks</Toggle>
      </div>
    </div>
    <Lanes value={total} max={PLAN_DAYS} word="Day" />
    {WEEKS.map((w, wi) => { const wdone = [0, 1, 2, 3, 4, 5, 6].filter(k => done[wi * 7 + k]).length;
      // Desktop: label column + 7 cards. Tablet/phone: label row on top, cards in 4 / 3 columns.
      const wide = bp === "desktop";
      return <section key={w[0]} aria-label={w[0]} style={{ display: "grid", gridTemplateColumns: wide ? "130px repeat(7,minmax(0,1fr))" : `repeat(${bp === "phone" ? 3 : 4},minmax(0,1fr))`, gap: 8, marginBottom: wide ? 10 : 18 }}>
        <div style={wide ? { padding: "10px 4px" } : { gridColumn: "1 / -1", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}><b style={{ display: "block", font: "700 var(--text-subhead) var(--font-display)", letterSpacing: ".01em" }}>{w[0]}</b><span style={{ color: "var(--ink-2)", fontSize: "var(--text-small)", lineHeight: 1.2, display: "block" }}>{w[1]}</span><div style={{ marginTop: wide ? 8 : 0, marginLeft: wide ? 0 : "auto", font: "700 var(--text-body) var(--font-display)", letterSpacing: ".01em" }}>{wdone}/7 done</div></div>
        {[0, 1, 2, 3, 4, 5, 6].map(k => { const i = wi * 7 + k, n = i + 1, info = runInfo(i, rec); const date = start ? runDate(start, i) : null;
          return <DayCard key={n} n={n} date={date ? fmtDate(date) : ""} kind={info.kind} label={info.label} what={info.what + (info.kind === "rest" && rec && n === 20 ? ". Big day tomorrow." : "")} extra={info.extra} mins={info.mins} done={!!done[i]} today={!!date && sameDay(date, TODAY)} onClick={() => start && toggleRun(runKey(start, i))} />; })}
      </section>; })}
    <div style={statGrid}><Stat value={`${total}/${PLAN_DAYS}`} label="Days ticked" /><Stat value={streak} label="Longest streak" /><Stat value={`${PLAN.filter((p, i) => (p[0] === "run" || p[0] === "finish") && done[i]).length}/${PLAN_RUNS}`} label="Runs completed" /></div>
    <Rules />
  </>;
}

export function PFDetails({ id, state, setPf, open, onToggle }) {
  const phone = useBreakpoint() === "phone";
  const pf = state.pf; const h = pfHelpers(pf, TODAY); const si = h.stageIdx();
  const days = []; for (let i = 27; i >= 0; i--) days.push(addDays(TODAY, -i));
  let streak = 0; for (let i = days.length - 1; i >= 0; i--) { const e = state.days[iso(days[i])]; if (e && e.sets >= 3) streak++; else if (i === days.length - 1) continue; else break; }
  const last7 = days.slice(-7).map(d => state.days[iso(d)] || {}); const pracs = last7.filter(e => e.practice === "yes");
  const ctrls = days.map(d => state.days[iso(d)] || {}).filter(e => e.practice === "yes" && e.control);
  const avg = a => a.length ? (a.reduce((x, e) => x + e.control, 0) / a.length).toFixed(1) : "–";
  const TKEY = iso(TODAY);
  return <Details summary="Pelvic floor program and tests" open={open} onToggle={onToggle} style={{ scrollMarginTop: 12 }} id={id}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
      <div><h2 style={h2}>Pelvic floor and control</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>Daily squeezes build the muscles; practice sessions build awareness. Kegels every day, practice 3–4 days a week, and a test session every two weeks. Only visible to you unless you share this page.</p></div>
      <Field label="Program start" as="date" value={pf.start || ""} onChange={e => setPf({ start: e.target.value || null })} />
    </div>
    <div style={progGrid}>{STAGES.map((s, i) => <Stage key={s[0]} title={s[0]} now={i === si}><><strong>Kegels daily:</strong> {s[1]}, {s[2]}</><><strong>Practice:</strong> {s[3]}</></Stage>)}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)", marginBottom: 16 }}>Practice days (3–4 a week, Kegels every day)
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[1, 2, 3, 4, 5, 6, 0].map(n => <Pill key={n} pressed={pf.pdays.includes(n)} onClick={() => setPf({ pdays: pf.pdays.includes(n) ? pf.pdays.filter(x => x !== n) : [...pf.pdays, n] })}>{DAYNAMES[n]}</Pill>)}</div></div>
    <h3 style={h3}>Test sessions</h3>
    {pf.start ? <><div style={progGrid}>{h.testDays().map(t => { const e = state.days[t.key] || {}; const has = e.practice === "yes";
      const details = has ? [e.time && `${e.time} min`, e.pauses && `${e.pauses} pause${e.pauses === "1" ? "" : "s"}`, e.control && `control ${e.control}/5`].filter(Boolean) : [];
      const text = !has ? (t.date < TODAY ? "Not logged" : "Upcoming") : details.length ? details.join(", ") : "Done, no details";
      return <Stage key={t.week} title={`Week ${t.week}`} now={t.key === TKEY}>{fmtDate(t.date)}{text}</Stage>; })}</div>
      <Tip>Keep test conditions the same each time: same lubricant, similar time of day, and no practice the day before.</Tip></>
      : <Tip>Set a program start date or answer today's check-in to schedule your four test sessions.</Tip>}
    <div style={statGrid}><Stat value={streak} label="Days in a row with 3 sets" /><Stat value={pracs.length} label="Practice sessions, last 7 days" /><Stat value={avg(ctrls.slice(-5))} label="Avg control, last 5 sessions (of 5)" /></div>
    <h3 style={{ ...h3, margin: 0 }}>Last 28 days</h3>
    <Strip label="Kegel sets and practice, last 28 days" columns={phone ? 7 : 14} days={days.map(d => { const e = state.days[iso(d)] || {}; return { n: d.getDate(), sets: e.sets || 0, practice: e.practice === "yes", title: `${fmtDate(d)}: ${e.sets ?? 0} of 3 sets${e.practice === "yes" ? ", practice" : ""}` }; })} />
    <Tip>Darker squares mean more sets done. A blue underline marks a control practice day.</Tip>
    <Tip>Squeeze only the pelvic floor, not your stomach, thighs or buttocks, and keep breathing. The relaxation half of each rep matters as much as the squeeze.</Tip>
    <Tip>Daily squeezes are fine. For practice sessions, 3–4 a week is enough to improve; daily is okay too, but compare your control scores after a rest day versus back-to-back days and follow what your own numbers show.</Tip>
  </Details>;
}
