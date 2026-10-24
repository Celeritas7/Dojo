import { DS } from "../env.js";
const { Tab } = DS;

export function Header({ view, onView }) {
  return <header style={{ position: "relative", padding: "18px 0 14px" }}>
    <h1 style={{ font: "800 44px/1 var(--font-display)", letterSpacing: ".01em", margin: 0 }}>Dojo</h1>
    <p style={{ color: "var(--ink-2)", margin: "6px 0 0" }}>Show up, train, and tap any day to log it.</p>
    <div role="tablist" style={{ display: "flex", gap: 6, margin: "18px 0 0", flexWrap: "wrap" }}>
      {[["sheet", "Monthly sheet"], ["run", "Running plan"]].map(([k, l]) => <Tab key={k} selected={view === k} onClick={() => onView(k)}>{l}</Tab>)}
    </div>
  </header>;
}
