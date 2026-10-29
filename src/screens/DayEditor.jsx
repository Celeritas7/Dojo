import React from "react";
import { DS, TODAY } from "../env.js";
import { STATES, parseISO, fmtDate, runIdx, runInfo, pfHelpers } from "../logic.js";
const { Dialog, DialogSection, StateGrid, Pill, Field } = DS;

export function DayEditor({ state, dayKey: k, onClose, onSave, onClear }) {
  const date = parseISO(k), e = state.days[k] || {};
  const ri = runIdx(date, state.plan.start);
  const [ed, setEd] = React.useState({ s: e.s || null, m: e.m || "", run: ri >= 0 ? !!e.run : null, sets: e.sets ?? null, practice: e.practice ?? null, pauses: e.pauses || "", control: e.control || 0, time: e.time || "" });
  const [error, setError] = React.useState("");
  const minutesNeedStatus = !ed.s && +ed.m > 0;
  const save = () => { if (minutesNeedStatus) { setError("Pick what kind of day it was (done, light, missed or rest) to save these minutes."); return; } onSave(k, ed); };
  const h = pfHelpers(state.pf, TODAY); const test = h.testFor(k);
  const planned = !!state.pf.start && date >= h.startDate() && (test || h.isPracticeDay(date));
  const info = ri >= 0 ? runInfo(ri, state.plan.recovery) : null;
  const pills = { display: "flex", gap: 6, flexWrap: "wrap" };
  const setRun = v => setEd(x => { const n = { ...x, run: v }; if (v && info) { if (!n.s) n.s = info.kind === "rest" && !state.plan.recovery ? "rest" : "done"; if (!n.m && info.mins) n.m = info.mins; } return n; });
  return <Dialog open title={fmtDate(date)} onClose={onClose} onClear={() => onClear(k)} onSave={save} error={error}>
    {info && <DialogSection title={`Running plan, day ${ri + 1}`} first>
      <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 6px" }}>{info.label}: {info.what}{info.extra ? ", " + info.extra : ""}{info.mins ? ` (~${info.mins} min)` : ""}</p>
      <div style={pills}><Pill pressed={ed.run === true} onClick={() => setRun(true)}>Done</Pill><Pill pressed={ed.run === false} onClick={() => setRun(false)}>Not yet</Pill></div></DialogSection>}
    <DialogSection title="Exercise" first={!info}>
      <StateGrid value={ed.s} onChange={v => { setEd({ ...ed, s: v }); setError(""); }} options={Object.entries(STATES).map(([value, label]) => ({ value, label }))} />
      <Field label="Minutes" as="number" min={0} max={600} inputMode="numeric" value={ed.m} onChange={ev => setEd({ ...ed, m: ev.target.value })} placeholder="e.g. 30" /></DialogSection>
    <DialogSection title="Kegel sets"><div style={pills}>{[0, 1, 2, 3].map(n => <Pill key={n} pressed={ed.sets === n} onClick={() => setEd({ ...ed, sets: n })}>{n}</Pill>)}</div></DialogSection>
    <DialogSection title={<>{test ? `Test session (week ${test.week})` : "Control practice"}{!planned && <span style={{ fontWeight: 400, color: "var(--ink-2)", fontSize: 14 }}> (not a planned day)</span>}</>}>
      <div style={pills}><Pill pressed={ed.practice === "yes"} onClick={() => setEd({ ...ed, practice: "yes" })}>Yes</Pill><Pill pressed={ed.practice === "no"} onClick={() => setEd({ ...ed, practice: "no" })}>No</Pill></div>
      {ed.practice === "yes" && <><div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
        {test && <Field label="Minutes until finish" as="number" min={0} step={0.5} value={ed.time} onChange={ev => setEd({ ...ed, time: ev.target.value })} inputStyle={{ width: 100 }} />}
        <Field label="Pauses" as="number" min={0} value={ed.pauses} onChange={ev => setEd({ ...ed, pauses: ev.target.value })} inputStyle={{ width: 80 }} /></div>
        <Field label="Control" style={{ marginTop: 6 }}><div style={pills}>{[1, 2, 3, 4, 5].map(n => <Pill key={n} pressed={ed.control === n} onClick={() => setEd({ ...ed, control: n })}>{n}</Pill>)}</div></Field></>}
    </DialogSection>
  </Dialog>;
}
