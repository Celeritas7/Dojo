import React from "react";
import { TODAY, DEMO, initialState } from "./env.js";
import { monthKey, runIdx, parseISO } from "./logic.js";
import { emptyState, load, save } from "./store.js";
import { saveDay, clearDay, restoreDay, updateDay, patchDay, toggleRun, setPlan, setPf, setMonth, setSettings, repeatWeek, pushBack, restartPlan } from "./reducers.js";
import { parseRoute, formatRoute } from "./route.js";
import { Toast } from "./screens/Toast.jsx";
import { Header } from "./screens/Header.jsx";
import { Today } from "./screens/Today.jsx";
import { Sheet } from "./screens/Sheet.jsx";
import { ProgramsView } from "./screens/Programs.jsx";
import { DayEditor } from "./screens/DayEditor.jsx";
import { Settings } from "./screens/Settings.jsx";

export function App() {
  const [state, setState] = React.useState(() => (initialState && initialState()) || load(localStorage) || emptyState());
  const [route, setRoute] = React.useState(() => parseRoute(location.hash, monthKey(TODAY)));
  const [editing, setEditing] = React.useState(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null); // { text, action?: { label, onClick } }
  const timer = React.useRef(null);
  const flash = (text, action) => { setToast({ text, action }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), action ? 8000 : 2000); };
  const holdToast = () => clearTimeout(timer.current);
  const releaseToast = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 4000); };

  // Persist every change (except in demo mode, which must never overwrite real data).
  const first = React.useRef(true);
  React.useEffect(() => { if (first.current) { first.current = false; return; } if (!DEMO && !save(localStorage, state)) flash("Couldn't save on this device. Download a backup to keep your changes."); }, [state]);

  // The view lives in the URL hash (replaceState keeps the query, e.g. ?demo=1, and adds no history entries).
  const go = patch => setRoute(r => ({ ...r, ...patch }));
  React.useEffect(() => { const h = formatRoute(route); if (location.hash !== h) history.replaceState(null, "", h); }, [route]);
  React.useEffect(() => { const on = () => setRoute(parseRoute(location.hash, monthKey(TODAY))); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);

  const apply = (fn, msg = "Saved.") => { setState(s => fn(s)); flash(msg); };
  const onSave = (k, ed) => { apply(s => saveDay(s, k, ed)); setEditing(null); };
  // Clearing is immediate but reversible: the toast offers Undo for a few seconds.
  const onClear = k => {
    const prev = state.days[k]; setEditing(null);
    if (!prev) { flash("Nothing to clear."); return; }
    setState(s => clearDay(s, k));
    flash("Day cleared.", { label: "Undo", onClick: () => apply(s => restoreDay(s, k, prev), "Day restored.") });
  };
  // The first pelvic-floor answer also sets the program start; say so, since test dates follow from it, and offer a way to change it.
  const openProgramStart = () => { go({ view: "programs", sub: "pf" }); setTimeout(() => document.getElementById("pf-start")?.focus(), 50); };
  const onPf = (k, patch) => {
    const starts = !state.pf.start;
    setState(s => patchDay(s, k, patch));
    if (starts) flash("Saved. Your program starts today.", { label: "Change", onClick: openProgramStart }); else flash("Saved.");
  };
  const onToggleRun = k => { const n = runIdx(parseISO(k), state.plan) + 1, was = !!(state.days[k] || {}).run; apply(s => toggleRun(s, k), `Day ${n} ${was ? "unticked" : "ticked"}.`); };
  // Plan controls change the schedule; each can be undone by putting the previous plan back exactly.
  const onPlanAction = kind => {
    const prev = state.plan, next = { repeat: repeatWeek, push: pushBack, restart: restartPlan }[kind](state, TODAY);
    if (next === state) { flash("Nothing to change."); return; }
    setState(next);
    flash({ repeat: "Week added again.", push: "Plan pushed back a day.", restart: "Plan restarts today." }[kind], { label: "Undo", onClick: () => apply(s => ({ ...s, plan: prev }), "Plan restored.") });
  };
  const { view } = route;
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 16px 48px" }}>
    {view === "month" && <a className="skip-link" href="#calendar" onClick={e => { e.preventDefault(); document.getElementById("calendar")?.focus(); }}>Skip to calendar</a>}
    <Header view={view} onView={v => go({ view: v })} onSettings={() => setSettingsOpen(true)} />
    <main id="panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
      {view === "today" ? <Today state={state} update={(k, patch) => apply(s => updateDay(s, k, patch))} updatePf={onPf} toggleRun={onToggleRun} onOpenDay={setEditing} onGo={go} />
        : view === "month" ? <Sheet state={state} month={route.month} onMonth={m => go({ month: m })} onSetMonth={patch => apply(s => setMonth(s, route.month, patch))} onOpenDay={setEditing} reviewOpen={reviewOpen} onReviewToggle={setReviewOpen} />
        : <ProgramsView state={state} sub={route.sub} onSub={sub => go({ sub })} setPlan={patch => apply(s => setPlan(s, patch))} setPf={patch => apply(s => setPf(s, patch))} toggleRun={onToggleRun} onPlanAction={onPlanAction} />}
    </main>
    <Toast toast={toast} onDismiss={() => setToast(null)} onHold={holdToast} onRelease={releaseToast} />
    {editing && <DayEditor key={editing} state={state} dayKey={editing} onClose={() => setEditing(null)} onSave={onSave} onClear={onClear} />}
    {settingsOpen && <Settings state={state} onClose={() => setSettingsOpen(false)} onDiscreet={v => apply(s => setSettings(s, { discreet: v }), v ? "Discreet mode on." : "Discreet mode off.")} onReplace={next => setState(next || emptyState())} flash={flash} />}
  </div>;
}
