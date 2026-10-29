import { DS, TODAY } from "../env.js";
import { MONTHS, MOTTOS, DEFAULT_MOTTO, STATES, PLAN_DAYS, iso, sameDay, longest, runIdx, runInfo, runKey, planDone, shiftMonth, daysInMonth, monthKey, pfHelpers } from "../logic.js";
import { monthOf } from "../store.js";
import { useBreakpoint, autoGrid } from "../layout.js";
const { NavButton, Motto, Lanes, DowHeader, SheetCell, WeekTally, Legend, Stat, Field, Counter, Icon, KegelDots, Button } = DS;

// Firefox and Safari on desktop render <input type="month"> as a plain text box; only offer it where it is a real picker.
const MONTH_INPUT_OK = (() => { try { const i = document.createElement("input"); i.setAttribute("type", "month"); return i.type === "month"; } catch { return false; } })();

// Everything a day cell shows, in words, for screen readers: "October 15, Workout done, 25 minutes, 3 of 3 Kegel sets, practice done".
function dayLabel(monthName, d, e, run, practice, isTest, today) {
  const parts = [`${monthName} ${d}`];
  if (e.s) parts.push(STATES[e.s]);
  if (e.s && +e.m) parts.push(`${e.m} minutes`);
  if (run) parts.push(`plan: ${run.label}${run.ok ? ", ticked" : ""}`);
  if (e.sets != null) parts.push(`${e.sets} of 3 Kegel sets`);
  if (practice) parts.push(`${isTest ? "test" : "practice"} ${practice === "done" ? "done" : "planned"}`);
  if (today) parts.push("today");
  return parts.join(", ");
}

// Arrow keys move between days (←/→ one day, ↑/↓ one week); Tab still visits every day.
function onCalendarKey(e) {
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (!delta) return;
  const days = [...e.currentTarget.querySelectorAll("button.dj-cell")], i = days.indexOf(document.activeElement);
  if (i < 0) return;
  const next = days[Math.max(0, Math.min(days.length - 1, i + delta))];
  e.preventDefault(); next.focus();
}

export function Sheet({ state, month: key, onMonth, onSetMonth, onOpenDay }) {
  const [y, m] = key.split("-").map(Number);
  const phone = useBreakpoint() === "phone";
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
      row.push(<SheetCell key={d} day={d} status={e.s || null} run={run} sets={e.sets ?? null} pending={pending} compact={phone} mins={e.m} practice={practice} test={isTest} today={sameDay(date, TODAY)} onClick={() => onOpenDay(k)} ariaLabel={dayLabel(MONTHS[m - 1], d, e, run, practice, isTest, sameDay(date, TODAY))} />); }
    row.push(<WeekTally key={"w" + r} week={r + 1} done={w} />);
    rows.push(row); }
  const statGrid = { ...autoGrid(150), margin: "18px 0" };
  return <>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NavButton dir="prev" label="Previous month" onClick={() => onMonth(shiftMonth(key, -1))} />
        <h2 style={{ font: "700 var(--text-title)/1.2 var(--font-display)", letterSpacing: ".01em", margin: 0, whiteSpace: "nowrap" }}>{MONTHS[m - 1]} {y}</h2>
        <NavButton dir="next" label="Next month" onClick={() => onMonth(shiftMonth(key, 1))} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {key !== thisMonth && <Button variant="ghost" onClick={() => onMonth(thisMonth)} style={{ minHeight: 44 }}>Today</Button>}
        {MONTH_INPUT_OK && <Field as="month" aria-label="Pick any month" value={key} onChange={e => e.target.value && onMonth(e.target.value)} inputStyle={{ minHeight: 44, padding: "7px 10px" }} />}
      </div>
    </div>
    <Motto>{MOTTOS[key] || DEFAULT_MOTTO}</Motto>
    <Lanes value={trained} max={target || daysIn} word="Day" />
    <div id="calendar" tabIndex={-1} onKeyDown={onCalendarKey} role="group" aria-label={`${MONTHS[m - 1]} ${y} calendar`} style={{ outline: "none",  display: "grid", gridTemplateColumns: phone ? "repeat(7,minmax(0,1fr)) 40px" : "repeat(7,minmax(0,1fr)) 60px", gap: phone ? 4 : 6 }}><DowHeader labels={phone ? ["M", "T", "W", "T", "F", "S", "S"] : undefined} trailing={phone ? "Wk" : "Week"} />{rows}</div>
    <Legend items={[{ status: "done", label: "Done" }, { status: "light", label: "Light" }, { status: "missed", label: "Missed" }, { status: "rest", label: "Rest" }, { status: null, label: "To do" }, { node: <span style={{ font: "800 var(--text-caption)/1 var(--font-display)", background: "var(--lane)", color: "var(--on-lane)", borderRadius: "var(--radius-pill)", padding: "2px 5px" }}>28</span>, label: "Today" }, { node: <Icon name="run" />, label: "Run plan" }, { node: <KegelDots sets={3} size={7} />, label: "Kegel sets" }, { node: <span style={{ color: "var(--lane)", fontSize: "var(--text-small)" }}>◆</span>, label: "Practice" }, { node: <span style={{ color: "var(--lane)", fontSize: "var(--text-small)" }}>★</span>, label: "Test" }, { node: <span style={{ color: "var(--lane)", fontSize: "var(--text-small)" }}>◇ ☆</span>, label: "Planned" }]} />
    <div style={statGrid}>
      <Stat value={target ? `${trained}/${target}` : trained} label="Days trained" /><Stat value={longest(seq)} label="Longest streak" /><Stat value={totalMin} label="Minutes this month" />
      {planHere && <Stat value={`${runDone}/${PLAN_DAYS}`} label="Running plan days" />}<Stat value={kegelFull} label="Days with 3 Kegel sets" /><Stat value={pracN} label="Practice sessions" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px", gap: 10, marginBottom: 14 }}>
      <Field label="Goal" value={md.goal} onChange={e => onSetMonth({ goal: e.target.value })} placeholder="What are you working toward this month?" />
      <Field label="Target days" as="number" min={0} max={31} value={md.target} onChange={e => onSetMonth({ target: e.target.value })} placeholder="e.g. 16" />
    </div>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
      <div role="group" aria-labelledby="routines-label" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)" }}><span id="routines-label">New routines tried</span>
        <Counter value={md.routines} onChange={v => onSetMonth({ routines: v })} minusLabel="One fewer new routine" plusLabel="One more new routine" style={{ marginTop: 0 }} /></div>
    </div>
    <Field label="Notes" as="textarea" value={md.notes} onChange={e => onSetMonth({ notes: e.target.value })} placeholder="How did the month go? What will you change next month?" />
  </>;
}
