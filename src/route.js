// The view lives in the URL hash so reloads and bookmarks return to it:
//   #today · #month/2026-10 · #programs/run · #programs/pf
const VIEWS = ["today", "month", "programs"], SUBS = ["run", "pf"];

export function parseRoute(hash, fallbackMonth) {
  const [view, arg] = hash.replace(/^#/, "").split("/");
  return {
    view: VIEWS.includes(view) ? view : "today",
    month: view === "month" && /^\d{4}-\d{2}$/.test(arg || "") ? arg : fallbackMonth,
    sub: view === "programs" && SUBS.includes(arg) ? arg : "run",
  };
}
export const formatRoute = r => "#" + (r.view === "month" ? `month/${r.month}` : r.view === "programs" ? `programs/${r.sub}` : "today");
