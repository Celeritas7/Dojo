import React from "react";
import { TODAY, DEMO, initialState } from "./env.js";
import { monthKey, runIdx, parseISO } from "./logic.js";
import { emptyState, load, save } from "./store.js";
import { saveDay, clearDay, restoreDay, patchDay, toggleRun, setPlan, setPf, setMonth } from "./reducers.js";
import { Toast } from "./screens/Toast.jsx";
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
  const [toast, setToast] = React.useState(null); // { text, action?: { label, onClick } }
  const timer = React.useRef(null);
  const flash = (text, action) => { setToast({ text, action }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), action ? 8000 : 2000); };
  const holdToast = () => clearTimeout(timer.current);
  const releaseToast = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 4000); };

  // Persist every change (except in demo mode, which must never overwrite real data).
  const first = React.useRef(true);
  React.useEffect(() => { if (first.current) { first.current = false; return; } if (!DEMO && !save(localStorage, state)) flash("Couldn't save on this device. Download a backup to keep your changes."); }, [state]);

  const apply = (fn, msg = "Saved.") => { setState(s => fn(s)); flash(msg); };
  const onSave = (k, ed) => { apply(s => saveDay(s, k, ed)); setEditing(null); };
  // Clearing is immediate but reversible: the toast offers Undo for a few seconds.
  const onClear = k => {
    const prev = state.days[k]; setEditing(null);
    if (!prev) { flash("Nothing to clear."); return; }
    setState(s => clearDay(s, k));
    flash("Day cleared.", { label: "Undo", onClick: () => apply(s => restoreDay(s, k, prev), "Day restored.") });
  };
  // The first check-in answer also sets the program start; say so, since test dates follow from it, and offer a way to change it.
  const openProgram = () => { setView("sheet"); setDet(d => ({ ...d, pf: true })); setTimeout(() => document.getElementById("pf-program")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };
  const onCheckin = (k, patch) => {
    const starts = !state.pf.start;
    setState(s => patchDay(s, k, patch));
    if (starts) flash("Saved. Your program starts today.", { label: "Change", onClick: openProgram }); else flash("Saved.");
  };
  const onToggleRun = k => { const n = runIdx(parseISO(k), state.plan.start) + 1, was = !!(state.days[k] || {}).run; apply(s => toggleRun(s, k), `Day ${n} ${was ? "unticked" : "ticked"}.`); };
  // Sections report their real open state; storing it (rather than flipping) keeps code-opened sections open.
  const setOpen = key => open => setDet(d => d[key] === open ? d : { ...d, [key]: open });
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px" }}>
    {view === "sheet" && <a className="skip-link" href="#calendar">Skip to calendar</a>}
    <Header view={view} onView={setView} />
    <section><Checkin state={state} open={ciOpen} setOpen={setCiOpen} update={onCheckin} /></section>
    <main id="panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
      {view === "sheet" ? <>
        <Sheet state={state} month={month} onMonth={setMonth_} onSetMonth={patch => apply(s => setMonth(s, month, patch))} onOpenDay={setEditing} />
        <RunPlanDetails state={state} setPlan={patch => apply(s => setPlan(s, patch))} open={det.run} onToggle={setOpen("run")} />
        <PFDetails id="pf-program" state={state} setPf={patch => apply(s => setPf(s, patch))} open={det.pf} onToggle={setOpen("pf")} />
        <DataSection state={state} onReplace={next => setState(next || emptyState())} open={det.data} onToggle={setOpen("data")} flash={flash} />
      </> : <RunPlanView state={state} setPlan={patch => apply(s => setPlan(s, patch))} toggleRun={onToggleRun} />}
    </main>
    <Toast toast={toast} onDismiss={() => setToast(null)} onHold={holdToast} onRelease={releaseToast} />
    {editing && <DayEditor key={editing} state={state} dayKey={editing} onClose={() => setEditing(null)} onSave={onSave} onClear={onClear} />}
  </div>;
}
