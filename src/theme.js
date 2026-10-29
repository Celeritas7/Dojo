// Theme preference: "auto" follows the system; "light"/"dark" are stored per device and set <html data-theme>.
// index.html applies the stored value before first paint so there is no flash.
export const THEME_KEY = "dojo.theme";
export const THEMES = ["auto", "dark", "light"];

export function getTheme() { try { const t = localStorage.getItem(THEME_KEY); return THEMES.includes(t) ? t : "auto"; } catch { return "auto"; } }
export function applyTheme(t) {
  const el = document.documentElement;
  if (t === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", t);
  try { if (t === "auto") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch { /* private mode: still applied for this visit */ }
}
