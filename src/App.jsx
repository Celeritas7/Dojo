import React from "react";
import { TODAY, DEMO, initialState } from "./env.js";
import { monthKey } from "./logic.js";
import { emptyState, load, save } from "./store.js";
import { saveDay, clearDay, patchDay, toggleRun, setPlan, setPf, setMonth } from "./reducers.js";
import { Header } from "./screens/Header.jsx";
import { Checkin } from "./screens/Checkin.jsx";
import { Sheet } from "./screens/Sheet.jsx";
import { RunPlanDetails, RunPlanView, PFDetails } from "./screens/Programs.jsx";
import { DayEditor } from "./screens/DayEditor.jsx";
import { DataSection } from "./screens/Data.jsx";

export function App() {
  const [state, setState] = React.useState(() => (initialState && initialState()) || load(localStorage) || emptyState());
  const [month, setMonth_] = React.useState(() => monthKey(TODAY));
  const [view, setView] = React.useState("sheet");
  const [ciOpen, setCiOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [det, setDet] = React.useState({ run: false, pf: false, data: false });
  const [saved, setSaved] = React.useState("");
  const timer = React.useRef(null);
  const flash = t => { setSaved(t); clearTimeout(timer.current); timer.current = setTimeout(() => setSaved(""), 2000); };

  // Persist every change (except in demo mode, which must never overwrite real data).
  const first = React.useRef(true);
  React.useEffect(() => { if (first.current) { first.current = false; return; } if (!DEMO && !save(localStorage, state)) flash("Could not save: storage is full or blocked"); }, [state]);

  const apply = (fn, msg = "Saved") => { setState(s => fn(s)); flash(msg); };
  const onSave = (k, ed) => { apply(s => saveDay(s, k, ed)); setEditing(null); };
  const onClear = k => { apply(s => clearDay(s, k)); setEditing(null); };
  const toggle = key => setDet(d => ({ ...d, [key]: !d[key] }));
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px" }}>
    <Header view={view} onView={setView} />
    <section><Checkin state={state} open={ciOpen} setOpen={setCiOpen} update={(k, patch) => apply(s => patchDay(s, k, patch))} /></section>
    <main>
      {view === "sheet" ? <>
        <Sheet state={state} month={month} onMonth={setMonth_} onSetMonth={patch => apply(s => setMonth(s, month, patch))} onOpenDay={setEditing} />
        <RunPlanDetails state={state} setPlan={patch => apply(s => setPlan(s, patch))} open={det.run} onToggle={() => toggle("run")} />
        <PFDetails state={state} setPf={patch => apply(s => setPf(s, patch))} open={det.pf} onToggle={() => toggle("pf")} />
        <DataSection state={state} onReplace={next => setState(next || emptyState())} open={det.data} onToggle={() => toggle("data")} flash={flash} />
      </> : <RunPlanView state={state} setPlan={patch => apply(s => setPlan(s, patch))} toggleRun={k => apply(s => toggleRun(s, k))} />}
    </main>
    <p aria-live="polite" style={{ fontSize: 13, color: "var(--ink-2)", minHeight: 20 }}>{saved}</p>
    {editing && <DayEditor key={editing} state={state} dayKey={editing} onClose={() => setEditing(null)} onSave={onSave} onClear={onClear} />}
  </div>;
}
