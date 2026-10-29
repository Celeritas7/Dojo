import { Tab, TabList } from "../components.js";

export const TABS = [["today", "Today"], ["month", "Month"], ["programs", "Programs"]];

export function Header({ view, onView, onSettings }) {
  return <header style={{ position: "relative", padding: "18px 0 14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div>
        <h1 style={{ font: "800 var(--text-display)/1 var(--font-display)", letterSpacing: ".01em", margin: 0 }}>Dojo</h1>
        <p style={{ color: "var(--ink-2)", margin: "6px 0 0" }}>Show up, train, log it.</p>
      </div>
      <button type="button" onClick={onSettings} style={{ font: "inherit", fontSize: "var(--text-small)", fontWeight: 600, cursor: "pointer", minHeight: 44, padding: "0 16px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--line)", background: "var(--card)", color: "var(--ink)", whiteSpace: "nowrap" }}>Settings</button>
    </div>
    <TabList label="Views" style={{ marginTop: 18 }}>
      {TABS.map(([k, l]) => <Tab key={k} id={`tab-${k}`} aria-controls="panel" selected={view === k} onClick={() => onView(k)}>{l}</Tab>)}
    </TabList>
  </header>;
}
