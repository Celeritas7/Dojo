import React from "react";
import { DS, TODAY, DEMO } from "../env.js";
import { exportJSON, importJSON, backupFilename } from "../store.js";
import { getTheme, applyTheme } from "../theme.js";
const { Dialog, Pill, Toggle, Button } = DS;

const h4 = { font: "700 var(--text-body)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "14px 0 6px" };
const note = { color: "var(--ink-2)", fontSize: "var(--text-small)", margin: "6px 0 0" };

// Settings save as they change; the dialog only has a close button.
export function Settings({ state, onClose, onDiscreet, onReplace, flash, onReminder }) {
  const rem = state.settings.reminder;
  const [perm, setPerm] = React.useState(() => ("Notification" in window ? Notification.permission : "unsupported"));
  const toggleReminder = async on => {
    onReminder({ on });
    // Ask for notification permission only when the person turns reminders on (a user gesture).
    if (on && perm === "default") { try { setPerm(await Notification.requestPermission()); } catch { /* unsupported */ } }
  };
  const [theme, setTheme] = React.useState(getTheme);
  const fileRef = React.useRef(null);
  const [err, setErr] = React.useState("");
  const pickTheme = t => { applyTheme(t); setTheme(t); };
  const download = () => {
    const blob = new Blob([exportJSON(state)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: backupFilename(TODAY) });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href); flash("Backup downloaded.");
  };
  const restore = async e => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    try { onReplace(importJSON(await f.text())); setErr(""); flash("Backup restored."); onClose(); }
    catch (ex) { setErr("Couldn't restore that file. " + ex.message); }
  };
  const reset = () => { if (confirm("Delete everything logged in Dojo on this device? Download a backup first if you want to keep it.")) { onReplace(null); flash("All data cleared."); onClose(); } };
  const count = Object.keys(state.days).length;
  return <Dialog open title="Settings" onClose={onClose} error={err}>
    <h4 id="s-theme" style={{ ...h4, marginTop: 0 }}>Theme</h4>
    <div role="group" aria-labelledby="s-theme" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {[["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => <Pill key={k} pressed={theme === k} onClick={() => pickTheme(k)}>{l}</Pill>)}
    </div>
    <p style={note}>Auto follows your device.</p>
    <h4 style={h4}>Privacy</h4>
    <Toggle checked={!!state.settings.discreet} onChange={onDiscreet} style={{ whiteSpace: "normal" }}>Discreet mode</Toggle>
    <p style={note}>Uses neutral words like "Daily sets" and hides program guidance until you open it. Handy for logging in public.</p>
    <h4 style={h4}>Reminder</h4>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <Toggle checked={rem.on} onChange={toggleReminder}>Daily reminder</Toggle>
      {rem.on && <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-small)", color: "var(--ink-2)" }}>at
        <input type="time" value={rem.time} onChange={e => e.target.value && onReminder({ time: e.target.value })} style={{ font: "inherit", minHeight: 44, padding: "0 10px", border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)", background: "var(--card)", color: "var(--ink)" }} /></label>}
    </div>
    <p style={note}>If nothing is logged by then, Dojo reminds you while it's open or in the background{perm === "granted" ? " with a notification" : perm === "denied" ? " (notifications are blocked, so you'll see a banner in the app)" : ""}, and again when you next open it. A reminder while Dojo is fully closed would need a push service that sends data off this device, so Dojo doesn't do that.</p>
    <h4 style={h4}>Backup</h4>
    <p style={{ ...note, marginTop: 0, marginBottom: 8 }}>{DEMO ? "Demo mode: nothing you change is saved." : `Stored only on this device. ${count} day${count === 1 ? "" : "s"} logged.`}</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button onClick={download} style={{ minHeight: 44 }}>Download backup</Button>
      <Button variant="ghost" onClick={() => fileRef.current.click()} style={{ minHeight: 44 }}>Restore from backup</Button>
      <Button variant="ghost" onClick={reset} style={{ minHeight: 44 }}>Clear all data</Button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={restore} style={{ display: "none" }} aria-label="Choose a backup file" />
    </div>
    <p style={note}>Restoring replaces everything currently logged.</p>
  </Dialog>;
}
