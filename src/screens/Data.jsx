import React from "react";
import { DS, TODAY, DEMO } from "../env.js";
import { exportJSON, importJSON, backupFilename } from "../store.js";
const { Details, Button, Tip } = DS;

// Backup, restore and reset. Everything stays on this device; a backup is a plain JSON file.
export function DataSection({ state, onReplace, open, onToggle, flash }) {
  const fileRef = React.useRef(null);
  const [err, setErr] = React.useState("");
  const download = () => {
    const blob = new Blob([exportJSON(state)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: backupFilename(TODAY) });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href); flash("Backup downloaded");
  };
  const restore = async e => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    try { onReplace(importJSON(await f.text())); setErr(""); flash("Backup restored"); }
    catch (ex) { setErr("Could not restore: " + ex.message); }
  };
  const reset = () => { if (confirm("Delete everything logged in Dojo on this device? Download a backup first if you want to keep it.")) { onReplace(null); flash("All data cleared"); } };
  const count = Object.keys(state.days).length;
  return <Details summary="Backup and data" open={open} onToggle={onToggle}>
    <p style={{ margin: "0 0 10px", color: "var(--ink-2)" }}>{DEMO ? "Demo mode: nothing you change here is saved." : `Saved on this device only. ${count} day${count === 1 ? "" : "s"} logged.`}</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button onClick={download}>Download backup</Button>
      <Button variant="ghost" onClick={() => fileRef.current.click()}>Restore from backup</Button>
      <Button variant="ghost" onClick={reset}>Clear all data</Button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={restore} style={{ display: "none" }} aria-label="Choose a backup file" />
    </div>
    {err && <p role="alert" style={{ color: "var(--missed)", margin: "10px 0 0" }}>{err}</p>}
    <Tip>Restoring replaces everything currently logged with the backup's contents.</Tip>
  </Details>;
}
