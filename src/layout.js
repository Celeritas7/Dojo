// Viewport breakpoints from docs/design/phase2-spec.md: phone < 640 px, tablet < 960 px, desktop otherwise.
import React from "react";

const query = w => window.matchMedia(`(max-width: ${w - 0.02}px)`);
const read = () => query(640).matches ? "phone" : query(960).matches ? "tablet" : "desktop";

export function useBreakpoint() {
  const [bp, setBp] = React.useState(read);
  React.useEffect(() => {
    const qs = [query(640), query(960)], on = () => setBp(read());
    qs.forEach(q => q.addEventListener("change", on));
    return () => qs.forEach(q => q.removeEventListener("change", on));
  }, []);
  return bp;
}

// Auto-fit grids shared by stats, rules and program stages.
export const autoGrid = (min, gap = 10) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(${min}px,100%),1fr))`, gap });
