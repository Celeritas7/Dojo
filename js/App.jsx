function App() {
  const [state, setState] = React.useState(() => JSON.parse(JSON.stringify(window.DojoKitData.state)));
  const [view, setView] = React.useState("sheet");
  const [ciOpen, setCiOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [det, setDet] = React.useState({ run: false, pf: false });
  const [saved, setSaved] = React.useState("");
  const flash = t => { setSaved(t); clearTimeout(flash.t); flash.t = setTimeout(() => setSaved(""), 2000); };
  const updatePf = (k, d) => { setState(s => ({ ...s, pf: { ...s.pf, start: s.pf.start || k, days: { ...s.pf.days, [k]: d } } })); flash("Saved"); };
  const onSave = (day, k, ri, ed) => {
    setState(s => { const md = s.months[s.month] || { days: {}, goal: "", target: "", routines: 0, notes: "" }; const days = { ...md.days }; const mins = +ed.m || 0;
      if (!ed.s && !mins) delete days[day]; else days[day] = { s: ed.s || "done", m: mins };
      const run = { ...s.run, done: { ...s.run.done } }; if (ri >= 0 && ed.run !== null) run.done[ri + 1] = ed.run;
      const pfd = { ...s.pf.days }; let start = s.pf.start;
      if (ed.sets || ed.practice !== null) { pfd[k] = { sets: ed.sets, practice: ed.practice, pauses: ed.pauses, control: ed.control, time: ed.time }; if (!start) start = k; } else delete pfd[k];
      return { ...s, run, months: { ...s.months, [s.month]: { ...md, days } }, pf: { ...s.pf, start, days: pfd } }; });
    setEditing(null); flash("Saved"); };
  const onClear = (day, k, ri) => {
    setState(s => { const md = s.months[s.month] || { days: {} }; const days = { ...md.days }; delete days[day]; const pfd = { ...s.pf.days }; delete pfd[k];
      const run = { ...s.run, done: { ...s.run.done } }; if (ri >= 0) run.done[ri + 1] = false;
      return { ...s, run, months: { ...s.months, [s.month]: { ...md, days } }, pf: { ...s.pf, days: pfd } }; });
    setEditing(null); flash("Saved"); };
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px" }}>
    <window.DojoHeader view={view} onView={setView} />
    <section><window.DojoCheckin pf={state.pf} open={ciOpen} setOpen={setCiOpen} update={updatePf} /></section>
    <main>
      {view === "sheet" ? <>
        <window.DojoSheet state={state} setState={setState} onOpenDay={setEditing} />
        <window.DojoRunPlanDetails state={state} setState={setState} open={det.run} onToggle={o => setDet(d => ({ ...d, run: o }))} />
        <window.DojoPFDetails state={state} setState={setState} open={det.pf} onToggle={o => setDet(d => ({ ...d, pf: o }))} />
      </> : <window.DojoRunPlanView state={state} setState={setState} />}
    </main>
    <p aria-live="polite" style={{ fontSize: 13, color: "var(--ink-2)", minHeight: 20 }}>{saved}</p>
    {editing && <window.DojoDayEditor key={editing} state={state} day={editing} onClose={() => setEditing(null)} onSave={onSave} onClear={onClear} />}
  </div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
