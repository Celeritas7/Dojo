import { DS, TODAY } from "../env.js";
import { MONTHS, MOTTOS, DEFAULT_MOTTO, STATES, PLAN_DAYS, iso, sameDay, longest, runIdx, runInfo, runKey, planDone, shiftMonth, daysInMonth, monthKey, pfHelpers } from "../logic.js";
import { monthOf } from "../store.js";
const { NavButton, Motto, Lanes, DowHeader, SheetCell, WeekTally, Legend, Stat, Field, Counter, Icon, KegelDots, Button } = DS;

// Firefox and Safari on desktop render <input type="month"> as a plain text box; only offer it where it is a real picker.
const MONTH_INPUT_OK = (() => { try { const i = document.createElement("input"); i.setAttribute("type", "month"); return i.type === "month"; } catch { return false; } })();

export function Sheet({ state, month: key, onMonth, onSetMonth, onOpenDay }) {
  const [y, m] = key.split("-").map(Number);
  const todayKey = iso(TODAY), thisMonth = monthKey(TODAY);
  // Plan stat only makes sense on months the plan touches.
  const planHere = !!state.plan.start && (runKey(state.plan.start, 0).slice(0, 7) <= key && key <= runKey(state.plan.start, PLAN_DAYS - 1).slice(0, 7));
  const md = monthOf(state, key);
  const first = new Date(y, m - 1, 1), daysIn = daysInMonth(key), lead = (first.getDay() + 6) % 7;
  const h = pfHelpers(state.pf, TODAY);
  const tests = h.testDays().map(t => t.key);
  let trained = 0, totalMin = 0, kegelFull = 0, pracN = 0; const seq = [];
  for (let d = 1; d <= daysIn; d++) { const e = state.days[iso(new Date(y, m - 1, d))] || {};
    if (e.s === "done" || e.s === "light") trained++; totalMin += (+e.m || 0); if (e.sets >= 3) kegelFull++; if (e.practice === "yes") pracN++;
    seq.push(e.s === "done" || e.s === "light" ? 1 : e.s === "rest" ? -1 : 0); }
  const runDone = planDone(state).filter(Boolean).length;
  const target = +md.target || 0;
  const cells = []; for (let i = 0; i < lead; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d); while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let r = 0; r < cells.length / 7; r++) { let w = 0; const row = [];
    for (let c = 0; c < 7; c++) { const d = cells[r * 7 + c]; if (d === null) { row.push(<SheetCell key={"e" + c} empty />); continue; }
      const date = new Date(y, m - 1, d), k = iso(date), e = state.days[k] || {}, ri = runIdx(date, state.plan.start);
      if (e.s === "done" || e.s === "light") w++;
      const isTest = tests.includes(k), started = !!state.pf.start && date >= h.startDate();
      const planned = started && (isTest || h.isPracticeDay(date));
      const run = ri >= 0 ? { ...runInfo(ri, state.plan.recovery), ok: !!e.run } : null;
      const practice = e.practice === "yes" ? "done" : planned ? "planned" : null;
      const pending = k >= todayKey; // today and future days show the "to do" marker; empty past days stay blank
      row.push(<SheetCell key={d} day={d} status={e.s || null} run={run} sets={e.sets ?? null} pending={pending} mins={e.m} practice={practice} test={isTest} today={sameDay(date, TODAY)} onClick={() => onOpenDay(k)} ariaLabel={`${MONTHS[m - 1]} ${d}${e.s ? ", " + STATES[e.s] : ""}`} />); }
    row.push(<WeekTally key={"w" + r} week={r + 1} done={w} />);
    rows.push(row); }
  const statGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, margin: "18px 0" };
  return <>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <NavButton dir="prev" label="Previous month" onClick={() => onMonth(shiftMonth(key, -1))} />
      <h2 style={{ font: "700 34px/1.2 var(--font-display)", letterSpacing: ".01em", margin: 0, minWidth: 210 }}>{MONTHS[m - 1]} {y}</h2>
      <NavButton dir="next" label="Next month" onClick={() => onMonth(shiftMonth(key, 1))} />
      {key !== thisMonth && <Button variant="ghost" onClick={() => onMonth(thisMonth)}>Today</Button>}
      {MONTH_INPUT_OK && <Field as="month" aria-label="Pick any month" value={key} onChange={e => e.target.value && onMonth(e.target.value)} inputStyle={{ padding: "7px 10px" }} />}
    </div>
    <Motto>{MOTTOS[key] || DEFAULT_MOTTO}</Motto>
    <Lanes value={trained} max={target || daysIn} word="Day" />
    <div role="grid" aria-label={MONTHS[m - 1] + " " + y} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr) 60px", gap: 6 }}><DowHeader />{rows}</div>
    <Legend items={[{ status: "done", label: "Done" }, { status: "light", label: "Light" }, { status: "missed", label: "Missed" }, { status: "rest", label: "Rest" }, { node: <Icon name="run" />, label: "Run plan" }, { node: <KegelDots sets={3} size={7} />, label: "Kegel sets" }, { node: <span style={{ color: "var(--lane)", fontSize: 13 }}>◆</span>, label: "Practice" }, { node: <span style={{ color: "var(--lane)", fontSize: 13 }}>★</span>, label: "Test" }]} />
    <div style={statGrid}>
      <Stat value={target ? `${trained}/${target}` : trained} label={target ? "Days trained" : "Days trained (no target set)"} /><Stat value={longest(seq)} label="Longest streak" /><Stat value={totalMin} label="Minutes this month" />
      {planHere && <Stat value={`${runDone}/${PLAN_DAYS}`} label="Running plan days" />}<Stat value={kegelFull} label="Days with 3 Kegel sets" /><Stat value={pracN} label="Practice sessions" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10, marginBottom: 14 }}>
      <Field label="Goal" value={md.goal} onChange={e => onSetMonth({ goal: e.target.value })} placeholder="What are you working toward this month?" />
      <Field label="Target days" as="number" min={0} max={31} value={md.target} onChange={e => onSetMonth({ target: e.target.value })} placeholder="e.g. 16" />
    </div>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink-2)" }}><span style={{ whiteSpace: "nowrap" }}>New routines tried: <b style={{ fontSize: 18, color: "var(--ink)" }}>{md.routines}</b></span>
        <Counter value={md.routines} onChange={v => onSetMonth({ routines: v })} minusLabel="One fewer new routine" plusLabel="One more new routine" /></div>
    </div>
    <Field label="Notes" as="textarea" value={md.notes} onChange={e => onSetMonth({ notes: e.target.value })} placeholder="How did the month go? What will you change next month?" />
  </>;
}
