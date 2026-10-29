import React from "react";
import { DS, TODAY } from "../env.js";
import { MONTHS, MOTTOS, DEFAULT_MOTTO, STATES, iso, sameDay, longest, runIdx, runInfo, shiftMonth, daysInMonth, monthKey, pfHelpers } from "../logic.js";
import { monthOf } from "../store.js";
import { words } from "../words.js";
import { useBreakpoint, autoGrid } from "../layout.js";
const { NavButton, Motto, Lanes, DowHeader, SheetCell, WeekTally, Legend, Stat, Field, Counter, Icon, KegelDots, Button, Details } = DS;

// Firefox and Safari on desktop render <input type="month"> as a plain text box; only offer it where it is a real picker.
const MONTH_INPUT_OK = (() => { try { const i = document.createElement("input"); i.setAttribute("type", "month"); return i.type === "month"; } catch { return false; } })();

// Everything a day cell shows, in words, for screen readers: "October 15, Workout done, 25 minutes, 3 of 3 Kegel sets, practice done".
function dayLabel(w, monthName, d, e, run, practice, isTest, today) {
  const parts = [`${monthName} ${d}`];
  if (e.s) parts.push(STATES[e.s]);
  if (e.s && +e.m) parts.push(`${e.m} minutes`);
  if (run) parts.push(`plan: ${run.label}${run.ok ? ", ticked" : ""}`);
  if (e.sets != null) parts.push(`${e.sets} of 3 ${w.sets.toLowerCase().replace("kegel", "Kegel")}`);
  if (practice) parts.push(`${(isTest ? w.test : w.practice).toLowerCase()} ${practice === "done" ? "done" : "planned"}`);
  if (today) parts.push("today");
  return parts.join(", ");
}

// Props for one calendar cell; shared by the Month calendar and the Today view's week strip.
export function dayCell(state, date, { compact, onOpenDay }) {
  const k = iso(date), e = state.days[k] || {}, ri = runIdx(date, state.plan.start);
  const h = pfHelpers(state.pf, TODAY), isTest = !!h.testFor(k);
  const planned = !!state.pf.start && date >= h.startDate() && (isTest || h.isPracticeDay(date));
  const run = ri >= 0 ? { ...runInfo(ri, state.plan.recovery), ok: !!e.run } : null;
  const practice = e.practice === "yes" ? "done" : planned ? "planned" : null;
  const today = sameDay(date, TODAY);
  return { key: k, day: date.getDate(), status: e.s || null, run, sets: e.sets ?? null, pending: k >= iso(TODAY), compact, mins: e.m, practice, test: isTest, today,
    onClick: () => onOpenDay(k), ariaLabel: dayLabel(words(state), MONTHS[date.getMonth()], date.getDate(), e, run, practice, isTest, today) };
}

// Arrow keys move between days (←/→ one day, ↑/↓ one week); Tab still visits every day.
export function onCalendarKey(e) {
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (!delta) return;
  const days = [...e.currentTarget.querySelectorAll("button.dj-cell")], i = days.indexOf(document.activeElement);
  if (i < 0) return;
  const next = days[Math.max(0, Math.min(days.length - 1, i + delta))];
  e.preventDefault(); next.focus();
}

export function Sheet({ state, month: key, onMonth, onSetMonth, onOpenDay, reviewOpen, onReviewToggle }) {
  const [y, m] = key.split("-").map(Number);
  const phone = useBreakpoint() === "phone";
  const w = words(state);
  const thisMonth = monthKey(TODAY);
  const md = monthOf(state, key);
  const first = new Date(y, m - 1, 1), daysIn = daysInMonth(key), lead = (first.getDay() + 6) % 7;
  let trained = 0, totalMin = 0, setsFull = 0, pracN = 0; const seq = [];
  for (let d = 1; d <= daysIn; d++) { const e = state.days[iso(new Date(y, m - 1, d))] || {};
    if (e.s === "done" || e.s === "light") trained++; totalMin += (+e.m || 0); if (e.sets >= 3) setsFull++; if (e.practice === "yes") pracN++;
    seq.push(e.s === "done" || e.s === "light" ? 1 : e.s === "rest" ? -1 : 0); }
  const target = +md.target || 0;
  const cells = []; for (let i = 0; i < lead; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d); while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let r = 0; r < cells.length / 7; r++) { let wk = 0; const row = [];
    for (let c = 0; c < 7; c++) { const d = cells[r * 7 + c]; if (d === null) { row.push(<SheetCell key={"e" + c} empty />); continue; }
      const { key: k, ...cell } = dayCell(state, new Date(y, m - 1, d), { compact: phone, onOpenDay });
      if (cell.status === "done" || cell.status === "light") wk++;
      row.push(<SheetCell key={k} {...cell} />); }
    row.push(<WeekTally key={"w" + r} week={r + 1} done={wk} />);
    rows.push(row); }
  const glyph = t => <span style={{ color: "var(--lane)", fontSize: "var(--text-small)" }}>{t}</span>;
  return <>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <NavButton dir="prev" label="Previous month" onClick={() => onMonth(shiftMonth(key, -1))} />
        <h2 style={{ font: "700 var(--text-title)/1.2 var(--font-display)", letterSpacing: ".01em", margin: 0, whiteSpace: "nowrap" }}>{MONTHS[m - 1]} {y}</h2>
        <NavButton dir="next" label="Next month" onClick={() => onMonth(shiftMonth(key, 1))} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {key !== thisMonth && <Button variant="ghost" onClick={() => onMonth(thisMonth)} style={{ minHeight: 44 }}>This month</Button>}
        {MONTH_INPUT_OK && <Field as="month" aria-label="Pick any month" value={key} onChange={e => e.target.value && onMonth(e.target.value)} inputStyle={{ minHeight: 44, padding: "7px 10px" }} />}
      </div>
    </div>
    <Motto>{MOTTOS[key] || DEFAULT_MOTTO}</Motto>
    {/* One primary figure; the bar under it carries no second copy of the number. */}
    <p style={{ margin: "0 0 4px", font: "800 var(--text-title)/1.1 var(--font-display)", letterSpacing: ".01em" }}>
      {target ? `${trained} of ${target} days trained` : `${trained} day${trained === 1 ? "" : "s"} trained`}
      {!target && <span style={{ font: "400 var(--text-small) var(--font-body)", color: "var(--ink-2)" }}> · set a target under Month review</span>}
    </p>
    <Lanes value={trained} max={target || daysIn} word="Day" showLabel={false} />
    <div id="calendar" tabIndex={-1} onKeyDown={onCalendarKey} role="group" aria-label={`${MONTHS[m - 1]} ${y} calendar`} style={{ outline: "none", display: "grid", gridTemplateColumns: phone ? "repeat(7,minmax(0,1fr)) 40px" : "repeat(7,minmax(0,1fr)) 60px", gap: phone ? 4 : 6, marginTop: 10 }}><DowHeader labels={phone ? ["M", "T", "W", "T", "F", "S", "S"] : undefined} trailing={phone ? "Wk" : "Week"} />{rows}</div>
    <Legend items={[{ status: "done", label: "Done" }, { status: "light", label: "Light" }, { status: "rest", label: "Rest" }, { status: "missed", label: "Missed" }, { status: null, label: "To do" }, { node: <span style={{ font: "800 var(--text-caption)/1 var(--font-display)", background: "var(--lane)", color: "var(--on-lane)", borderRadius: "var(--radius-pill)", padding: "2px 5px" }}>28</span>, label: "Today" }, { node: <Icon name="run" />, label: "Run plan" }, { node: <KegelDots sets={3} size={7} />, label: w.sets }, { node: glyph("◆"), label: w.practice }, { node: glyph("★"), label: w.test }, { node: glyph("◇ ☆"), label: "Planned" }]} />
    <div style={{ ...autoGrid(150), margin: "14px 0" }}>
      <Stat compact value={longest(seq)} label="Longest streak" /><Stat compact value={totalMin} label="Minutes" />
      <Stat compact value={setsFull} label={`Days with 3 ${w.sets.toLowerCase().replace("kegel", "Kegel")}`} /><Stat compact value={pracN} label={`${w.practice} sessions`} />
    </div>
    <Details summary={`Month review${md.goal ? ": " + md.goal : ""}`} open={reviewOpen} onToggle={onReviewToggle}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px", gap: 10, marginBottom: 14 }}>
        <Field label="Goal" value={md.goal} onChange={e => onSetMonth({ goal: e.target.value })} placeholder="What are you working toward this month?" />
        <Field label="Target days" as="number" min={0} max={31} value={md.target} onChange={e => onSetMonth({ target: e.target.value })} placeholder="e.g. 16" />
      </div>
      <div role="group" aria-labelledby="routines-label" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)", marginBottom: 14 }}><span id="routines-label">New routines tried</span>
        <Counter value={md.routines} onChange={v => onSetMonth({ routines: v })} minusLabel="One fewer new routine" plusLabel="One more new routine" style={{ marginTop: 0 }} /></div>
      <Field label="Notes" as="textarea" value={md.notes} onChange={e => onSetMonth({ notes: e.target.value })} placeholder="How did the month go? What will you change next month?" />
    </Details>
  </>;
}
