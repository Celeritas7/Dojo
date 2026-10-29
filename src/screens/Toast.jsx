import { DS } from "../env.js";
const { Button } = DS;

// Status line for saves, with an optional action (Undo). Always rendered so the live region exists before the first message.
export function Toast({ toast, onDismiss }) {
  return <div aria-live="polite" style={{ position: "fixed", left: 16, right: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    {toast && <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-pill)", padding: "8px 8px 8px 16px", fontSize: "var(--text-small)", boxShadow: "var(--shadow-dialog)" }}>
      <span>{toast.text}</span>
      {toast.action && <Button onClick={() => { toast.action.onClick(); onDismiss(); }} style={{ background: "var(--done)", color: "var(--done-ink)", padding: "6px 14px", borderRadius: "var(--radius-pill)" }}>{toast.action.label}</Button>}
    </div>}
  </div>;
}
