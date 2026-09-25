const { Details, Toggle, Rule, Field, Pill, Stage, Stat, Strip, Tip, Lanes, DayCard } = window.DojoDesignSystem_c9e716;
const { TODAY, RUN_START, PLAN, WEEKS, STAGES, DAYNAMES, iso, fmtDate, sameDay, longest } = window.DojoKitData;

const RULES = [["Every run day", "5 min brisk walk before and after, already in the minutes shown."], ["Pace", "Slow enough to talk in full sentences. Slower is fine."], ["Missed a day?", "Repeat that day next time. Never do two runs to catch up."], ["Listen to your body", "Sharp pain means stop. If a week felt hard, repeat it before moving on."]];
const rulesGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 };
const progGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, margin: "12px 0 18px" };
const statGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, margin: "18px 0" };
const h3 = { font: "700 20px/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 6px" };

function Rules() { return <div style={rulesGrid}>{RULES.map(([t, b]) => <Rule key={t} title={t}>{b}</Rule>)}</div>; }

function RunPlanDetails({ state, setState, open, onToggle }) {
  return <Details summary="Running plan: 21 Oct to 10 Nov" open={open} onToggle={onToggle}>
    <Toggle checked={state.run.recovery} onChange={v => setState(s => ({ ...s, run: { ...s.run, recovery: v } }))} style={{ marginBottom: 10, display: "inline-flex" }}>Rest days become recovery walks</Toggle>
    <Rules />
  </Details>;
}

function RunPlanView({ state, setState }) {
  const done = state.run.done, rec = state.run.recovery;
  const total = Object.values(done).filter(Boolean).length;
  const streak = longest(PLAN.map((_, i) => done[i + 1] ? 1 : 0));
  const daysTo = Math.round((RUN_START - TODAY) / 86400000);
  const toggle = n => setState(s => ({ ...s, run: { ...s.run, done: { ...s.run.done, [n]: !s.run.done[n] } } }));
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
      <div><h2 style={{ font: "700 30px/1.1 var(--font-display)", letterSpacing: ".01em", margin: 0 }}>21-day running start</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>Wed 21 Oct to Tue 10 Nov 2026. Run/walk intervals building to 8 minutes non-stop.</p>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>{daysTo > 0 ? `Starts in ${daysTo} day${daysTo === 1 ? "" : "s"}.` : daysTo > -21 ? `Day ${1 - daysTo} of 21.` : "Plan complete window has passed. Repeat any week anytime."}</p></div>
      <Toggle checked={rec} onChange={v => setState(s => ({ ...s, run: { ...s.run, recovery: v } }))}>Rest days become recovery walks</Toggle>
    </div>
    <Lanes value={total} max={21} word="Day" />
    {WEEKS.map((w, wi) => { const wdone = [0, 1, 2, 3, 4, 5, 6].filter(k => done[wi * 7 + k + 1]).length;
      return <section key={w[0]} aria-label={w[0]} style={{ display: "grid", gridTemplateColumns: "130px repeat(7,1fr)", gap: 8, marginBottom: 10 }}>
        <div style={{ padding: "10px 4px" }}><b style={{ display: "block", font: "700 22px var(--font-display)", letterSpacing: ".01em" }}>{w[0]}</b><span style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.2, display: "block" }}>{w[1]}</span><div style={{ marginTop: 8, font: "700 18px var(--font-display)", letterSpacing: ".01em" }}>{wdone}/7 done</div></div>
        {[0, 1, 2, 3, 4, 5, 6].map(k => { const i = wi * 7 + k, n = i + 1, info = window.runInfo(i, rec); const date = new Date(2026, 9, 21 + i);
          return <DayCard key={n} n={n} date={fmtDate(date)} kind={info.kind} label={info.label} what={info.what + (info.kind === "rest" && rec && n === 20 ? ". Big day tomorrow." : "")} extra={info.extra} mins={info.mins} done={!!done[n]} today={sameDay(date, TODAY)} onClick={() => toggle(n)} />; })}
      </section>; })}
    <div style={statGrid}><Stat value={`${total}/21`} label="Days ticked" /><Stat value={streak} label="Longest streak" /><Stat value={`${PLAN.filter((p, i) => (p[0] === "run" || p[0] === "finish") && done[i + 1]).length}/12`} label="Runs completed" /></div>
    <Rules />
  </>;
}

function PFDetails({ state, setState, open, onToggle }) {
  const pf = state.pf; const h = window.pfHelpers(pf); const si = h.stageIdx();
  const days = []; for (let i = 27; i >= 0; i--) { const d = new Date(TODAY); d.setDate(d.getDate() - i); days.push(d); }
  let streak = 0; for (let i = days.length - 1; i >= 0; i--) { const e = pf.days[iso(days[i])]; if (e && e.sets >= 3) streak++; else if (i === days.length - 1) continue; else break; }
  const last7 = days.slice(-7).map(d => pf.days[iso(d)] || {}); const pracs = last7.filter(e => e.practice === "yes");
  const ctrls = days.map(d => pf.days[iso(d)] || {}).filter(e => e.practice === "yes" && e.control);
  const avg = a => a.length ? (a.reduce((x, e) => x + e.control, 0) / a.length).toFixed(1) : "–";
  const setPf = patch => setState(s => ({ ...s, pf: { ...s.pf, ...patch } }));
  const TKEY = iso(TODAY);
  return <Details summary="Pelvic floor program and tests" open={open} onToggle={onToggle}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
      <div><h2 style={{ font: "700 30px/1.1 var(--font-display)", letterSpacing: ".01em", margin: 0 }}>Pelvic floor and control</h2>
        <p style={{ margin: "2px 0 0", color: "var(--ink-2)" }}>Daily squeezes build the muscles; practice sessions build awareness. Kegels every day, practice 3–4 days a week, and a test session every two weeks. Only visible to you unless you share this page.</p></div>
      <Field label="Program start" as="date" value={pf.start} onChange={e => setPf({ start: e.target.value })} />
    </div>
    <div style={progGrid}>{STAGES.map((s, i) => <Stage key={s[0]} title={s[0]} now={i === si}><><strong>Kegels daily:</strong> {s[1]}, {s[2]}</><><strong>Practice:</strong> {s[3]}</></Stage>)}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink-2)", marginBottom: 16 }}>Practice days (3–4 a week, Kegels every day)
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[1, 2, 3, 4, 5, 6, 0].map(n => <Pill key={n} pressed={pf.pdays.includes(n)} onClick={() => setPf({ pdays: pf.pdays.includes(n) ? pf.pdays.filter(x => x !== n) : [...pf.pdays, n] })}>{DAYNAMES[n]}</Pill>)}</div></div>
    <h3 style={h3}>Test sessions</h3>
    {pf.start ? <><div style={progGrid}>{h.testDays().map(t => { const e = pf.days[t.key] || {}; const has = e.practice === "yes";
      return <Stage key={t.week} title={`Week ${t.week}`} now={t.key === TKEY}>{fmtDate(t.date)}{has ? `${e.time ? e.time + " min, " : ""}${e.pauses || 0} pauses, control ${e.control || "–"}/5` : (t.date < TODAY ? "Not logged" : "Upcoming")}</Stage>; })}</div>
      <Tip>Keep test conditions the same each time: same lubricant, similar time of day, and no practice the day before.</Tip></>
      : <Tip>Set a program start date or answer today's check-in to schedule your four test sessions.</Tip>}
    <div style={statGrid}><Stat value={streak} label="Days in a row with 3 sets" /><Stat value={pracs.length} label="Practice sessions, last 7 days" /><Stat value={avg(ctrls.slice(-5))} label="Avg control, last 5 sessions (of 5)" /></div>
    <h3 style={{ ...h3, margin: 0 }}>Last 28 days</h3>
    <Strip days={days.map(d => { const e = pf.days[iso(d)] || {}; return { n: d.getDate(), sets: e.sets || 0, practice: e.practice === "yes", title: `${iso(d)}: ${e.sets || 0}/3 sets${e.practice === "yes" ? ", practice" : ""}` }; })} />
    <Tip>Darker squares mean more sets done. A blue underline marks a control practice day.</Tip>
    <Tip>Squeeze only the pelvic floor, not your stomach, thighs or buttocks, and keep breathing. The relaxation half of each rep matters as much as the squeeze.</Tip>
    <Tip>Daily squeezes are fine. For practice sessions, 3–4 a week is enough to improve; daily is okay too, but compare your control scores after a rest day versus back-to-back days and follow what your own numbers show.</Tip>
  </Details>;
}
Object.assign(window, { DojoRunPlanDetails: RunPlanDetails, DojoRunPlanView: RunPlanView, DojoPFDetails: PFDetails });
