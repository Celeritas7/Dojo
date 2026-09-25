const { NavButton, Motto, Lanes, DowHeader, SheetCell, WeekTally, Legend, Stat, Field, Counter, Icon, KegelDots, HabitDot } = window.DojoDesignSystem_c9e716;
const { MONTHS, TODAY, MOTTOS, DEFAULT_MOTTO, PLAN, STATES, iso, sameDay, longest, runIdx } = window.DojoKitData;

function runInfo(i, recovery) {
  const p = PLAN[i]; let kind = p[0], what = p[1], mins = p[3], label = { run: "Run", walk: "Walk", rest: "Rest", finish: "Finish" }[kind];
  if (kind === "rest" && recovery) { label = "Recovery"; what = "Shoes on, 10-min walk or stretch"; mins = 10; }
  return { kind, label, what, extra: p[2], mins };
}
window.runInfo = runInfo;

function Sheet({ state, setState, onOpenDay }) {
  const key = state.month; const [y, m] = key.split("-").map(Number);
  const md = state.months[key] || { days: {}, goal: "", target: "", routines: 0, notes: "" };
  const first = new Date(y, m - 1, 1), daysIn = new Date(y, m, 0).getDate(), lead = (first.getDay() + 6) % 7;
  const h = window.pfHelpers(state.pf);
  const tests = h.testDays().map(t => t.key);
  let trained = 0, totalMin = 0, kegelFull = 0, pracN = 0; const seq = [];
  for (let d = 1; d <= daysIn; d++) { const e = md.days[d] || {}; const pk = state.pf.days[iso(new Date(y, m - 1, d))] || {};
    if (e.s === "done" || e.s === "light") trained++; totalMin += (+e.m || 0); if (pk.sets >= 3) kegelFull++; if (pk.practice === "yes") pracN++;
    seq.push(e.s === "done" || e.s === "light" ? 1 : e.s === "rest" ? -1 : 0); }
  const runDone = Object.values(state.run.done).filter(Boolean).length;
  const target = +md.target || 0;
  const shift = n => { let [yy, mm] = key.split("-").map(Number); mm += n; if (mm < 1) { mm = 12; yy--; } if (mm > 12) { mm = 1; yy++; } setState(s => ({ ...s, month: yy + "-" + String(mm).padStart(2, "0") })); };
  const setMd = patch => setState(s => ({ ...s, months: { ...s.months, [key]: { ...md, ...patch } } }));
  const cells = []; for (let i = 0; i < lead; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d); while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let r = 0; r < cells.length / 7; r++) { let w = 0; const row = [];
    for (let c = 0; c < 7; c++) { const d = cells[r * 7 + c]; if (d === null) { row.push(<SheetCell key={"e" + c} empty />); continue; }
      const date = new Date(y, m - 1, d), k = iso(date), e = md.days[d] || {}, pk = state.pf.days[k] || {}, ri = runIdx(date);
      if (e.s === "done" || e.s === "light") w++;
      const isTest = tests.includes(k), started = !!state.pf.start && date >= h.startDate();
      const planned = started && (isTest || h.isPracticeDay(date));
      const run = ri >= 0 ? { ...runInfo(ri, state.run.recovery), ok: !!state.run.done[ri + 1] } : null;
      const practice = pk.practice === "yes" ? "done" : planned ? "planned" : null;
      row.push(<SheetCell key={d} day={d} status={e.s || null} run={run} sets={pk.sets || 0} mins={e.m} practice={practice} test={isTest} today={sameDay(date, TODAY)} onClick={() => onOpenDay(d)} ariaLabel={`${MONTHS[m - 1]} ${d}${e.s ? ", " + STATES[e.s] : ""}`} />); }
    row.push(<WeekTally key={"w" + r} week={r + 1} done={w} />);
    rows.push(row); }
  const statGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, margin: "18px 0" };
  return <>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <NavButton dir="prev" label="Previous month" onClick={() => shift(-1)} />
      <h2 style={{ font: "700 34px/1.2 var(--font-display)", letterSpacing: ".01em", margin: 0, minWidth: 210 }}>{MONTHS[m - 1]} {y}</h2>
      <NavButton dir="next" label="Next month" onClick={() => shift(1)} />
      <Field as="month" aria-label="Pick any month" value={key} onChange={e => e.target.value && setState(s => ({ ...s, month: e.target.value }))} inputStyle={{ padding: "7px 10px" }} />
    </div>
    <Motto>{MOTTOS[key] || DEFAULT_MOTTO}</Motto>
    <Lanes value={trained} max={target || daysIn} word="Day" />
    <div role="grid" aria-label={MONTHS[m - 1] + " " + y} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr) 60px", gap: 6 }}><DowHeader />{rows}</div>
    <Legend items={[{ status: "done", label: "Done" }, { status: "light", label: "Light" }, { status: "missed", label: "Missed" }, { status: "rest", label: "Rest" }, { node: <Icon name="run" />, label: "Run plan" }, { node: <KegelDots sets={3} size={7} />, label: "Kegel sets" }, { node: <span style={{ color: "var(--lane)", fontSize: 13 }}>◆</span>, label: "Practice" }, { node: <span style={{ color: "var(--lane)", fontSize: 13 }}>★</span>, label: "Test" }]} />
    <div style={statGrid}>
      <Stat value={`${trained}/${target || "__"}`} label="Days trained" /><Stat value={longest(seq)} label="Longest streak" /><Stat value={totalMin} label="Minutes this month" />
      <Stat value={`${runDone}/21`} label="Running plan days" /><Stat value={kegelFull} label="Days with 3 Kegel sets" /><Stat value={pracN} label="Practice sessions" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10, marginBottom: 14 }}>
      <Field label="Goal" value={md.goal} onChange={e => setMd({ goal: e.target.value })} placeholder="What are you working toward this month?" />
      <Field label="Target days" as="number" min={0} max={31} value={md.target} onChange={e => setMd({ target: e.target.value })} placeholder="e.g. 16" />
    </div>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink-2)" }}><span style={{ whiteSpace: "nowrap" }}>New routines tried: <b style={{ fontSize: 18, color: "var(--ink)" }}>{md.routines}</b></span>
        <Counter value={md.routines} onChange={v => setMd({ routines: v })} minusLabel="One fewer new routine" plusLabel="One more new routine" /></div>
    </div>
    <Field label="Notes" as="textarea" value={md.notes} onChange={e => setMd({ notes: e.target.value })} placeholder="How did the month go? What will you change next month?" />
  </>;
}
window.DojoSheet = Sheet;
