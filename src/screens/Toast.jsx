import { Button } from "../components.js";

// Status line for saves, with an optional action (Undo). Always rendered so the live region exists before the first message.
// While the pointer or keyboard focus is on the toast it stays put (WCAG 2.2.1); it resumes its timer when they leave.
export function Toast({ toast, onDismiss, onHold, onRelease }) {
  return <div aria-live="polite" style={{ position: "fixed", left: 16, right: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    {toast && <div onMouseEnter={onHold} onMouseLeave={onRelease} onFocus={onHold} onBlur={onRelease} style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-pill)", padding: "8px 8px 8px 16px", fontSize: "var(--text-small)", boxShadow: "var(--shadow-dialog)" }}>
      <span>{toast.text}</span>
      {toast.action && <Button onClick={() => { toast.action.onClick(); onDismiss(); }} style={{ background: "var(--done)", color: "var(--done-ink)", padding: "6px 14px", borderRadius: "var(--radius-pill)" }}>{toast.action.label}</Button>}
    </div>}
  </div>;
}
