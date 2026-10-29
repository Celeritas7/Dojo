import React from "react";
import { DS } from "../env.js";
import { getTheme, applyTheme, THEMES } from "../theme.js";
const { Tab, TabList } = DS;

export const TABS = [["sheet", "Monthly sheet"], ["run", "Running plan"]];
const THEME_LABEL = { auto: "Theme: Auto", dark: "Theme: Dark", light: "Theme: Light" };

export function Header({ view, onView }) {
  const [theme, setTheme] = React.useState(getTheme);
  const cycle = () => { const t = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]; applyTheme(t); setTheme(t); };
  return <header style={{ position: "relative", padding: "18px 0 14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div>
        <h1 style={{ font: "800 var(--text-display)/1 var(--font-display)", letterSpacing: ".01em", margin: 0 }}>Dojo</h1>
        <p style={{ color: "var(--ink-2)", margin: "6px 0 0" }}>Show up, train, and tap any day to log it.</p>
      </div>
      <button type="button" onClick={cycle} aria-label={`${THEME_LABEL[theme]}. Change theme`} style={{ font: "inherit", fontSize: "var(--text-small)", cursor: "pointer", minHeight: 44, padding: "0 14px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--line)", background: "var(--card)", color: "var(--ink-2)", whiteSpace: "nowrap" }}>{THEME_LABEL[theme]}</button>
    </div>
    <TabList label="Views" style={{ marginTop: 18 }}>
      {TABS.map(([k, l]) => <Tab key={k} id={`tab-${k}`} aria-controls="panel" selected={view === k} onClick={() => onView(k)}>{l}</Tab>)}
    </TabList>
  </header>;
}
