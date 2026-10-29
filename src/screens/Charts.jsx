// Small single-series charts (docs/design/phase4-spec.md, dataviz skill specs): no legend (the title names the series),
// marks in --chart-mark, text in text tokens, 1 px gridlines, a >= 24 px focusable hit area per mark with a tooltip
// (value first), and a "Show numbers" table so nothing is hover-only.
import React from "react";

const H = 168, PAD = { top: 22, right: 28, bottom: 24, left: 34 };
const caption = { font: "500 var(--text-caption) var(--font-body)", fill: "var(--ink-2)" };

function useWidth() {
  const ref = React.useRef(null), [w, setW] = React.useState(0);
  React.useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width))); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w];
}
// Round the axis top up to a clean number: 10, 20, 50, 100, 150, 200, 300 ...
const niceMax = v => { if (v <= 0) return 10; const steps = [10, 20, 30, 50, 60, 100, 120, 150, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000]; return steps.find(s => s >= v) || Math.ceil(v / 500) * 500; };

function Frame({ title, desc, table, children, empty }) {
  const id = React.useId();
  return <figure style={{ margin: "18px 0", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }} aria-labelledby={id}>
    <figcaption id={id} style={{ font: "700 var(--text-subhead)/1.2 var(--font-display)", letterSpacing: ".01em", margin: "0 0 2px" }}>{title}</figcaption>
    <p style={{ margin: "0 0 8px", color: "var(--ink-2)", fontSize: "var(--text-small)" }}>{desc}</p>
    {empty ? <p style={{ margin: 0, color: "var(--ink-2)" }}>{empty}</p> : <>{children}
      <details style={{ marginTop: 6 }}>
        <summary style={{ cursor: "pointer", color: "var(--ink-2)", fontSize: "var(--text-small)", minHeight: 44, display: "flex", alignItems: "center" }}>Show numbers</summary>
        <table style={{ borderCollapse: "collapse", fontSize: "var(--text-small)", marginTop: 4 }}>
          <thead><tr>{table.head.map(h => <th key={h} scope="col" style={{ textAlign: "left", padding: "4px 16px 4px 0", color: "var(--ink-2)", fontWeight: 600 }}>{h}</th>)}</tr></thead>
          <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "4px 16px 4px 0", fontVariantNumeric: "tabular-nums", borderTop: "1px solid var(--line)" }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </details></>}
  </figure>;
}

// Tooltip: value (strong) first, then what it is. Positioned over the plot; hidden from screen readers (the hit area has the label).
// x is clamped so the tooltip never runs past the plot edges.
const Tip = ({ x, y, w, value, label }) => <div aria-hidden="true" style={{ position: "absolute", left: Math.min(Math.max(x, 80), Math.max(80, w - 80)), top: y, transform: "translate(-50%, calc(-100% - 8px))", background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-xs)", padding: "4px 8px", fontSize: "var(--text-caption)", whiteSpace: "nowrap", pointerEvents: "none", boxShadow: "var(--shadow-dialog)" }}>
  <b style={{ fontSize: "var(--text-small)" }}>{value}</b> <span style={{ opacity: .85 }}>{label}</span></div>;

// data: [{ key, label (short x label), long (for tooltip/table), value }]
export function ColumnChart({ title, desc, data, unit, empty }) {
  const [ref, W] = useWidth(); const [active, setActive] = React.useState(null);
  const max = Math.max(0, ...data.map(d => d.value)), top = niceMax(max);
  const pw = Math.max(0, W - PAD.left - PAD.right), ph = H - PAD.top - PAD.bottom, band = data.length ? pw / data.length : 0;
  const colW = Math.min(24, band * 0.6), y = v => PAD.top + ph - (v / top) * ph, xc = i => PAD.left + band * (i + .5);
  const tallest = data.findIndex(d => d.value === max && max > 0);
  // 4 px rounded data end, square at the baseline.
  const col = (i, v) => { const x0 = xc(i) - colW / 2, y0 = y(v), b = y(0), r = Math.min(4, (b - y0) / 2, colW / 2); return `M${x0},${b}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + colW - r}Q${x0 + colW},${y0} ${x0 + colW},${y0 + r}V${b}Z`; };
  return <Frame title={title} desc={desc} empty={max === 0 ? empty : null} table={{ head: ["Week", unit], rows: data.map(d => [d.long, d.value]) }}>
    <div ref={ref} style={{ position: "relative", width: "100%", height: H }}>
      {W > 0 && <svg width={W} height={H} role="group" aria-label={title} style={{ display: "block", overflow: "visible" }}>
        {[0, top / 2, top].map(t => <g key={t}><line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" /><text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" style={caption}>{t}</text></g>)}
        {data.map((d, i) => <g key={d.key}>
          {d.value > 0 && <path d={col(i, d.value)} fill="var(--chart-mark)" opacity={active === null || active === i ? 1 : .55} />}
          <text x={xc(i)} y={H - 6} textAnchor="middle" style={caption}>{d.label}</text>
          {i === tallest && <text x={xc(i)} y={y(d.value) - 6} textAnchor="middle" style={{ ...caption, fill: "var(--ink)", fontWeight: 600 }}>{d.value}</text>}
          <rect x={xc(i) - Math.max(12, band / 2)} y={PAD.top} width={Math.max(24, band)} height={ph} fill="transparent" tabIndex={0} role="img" aria-label={`${d.long}: ${d.value} ${unit.toLowerCase()}`}
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} style={{ outline: "none", cursor: "default" }} />
          {active === i && <rect x={xc(i) - Math.max(12, band / 2) + 1} y={PAD.top} width={Math.max(24, band) - 2} height={ph} fill="none" stroke="var(--lane)" strokeWidth="2" rx="4" className="dj-focus-only" />}
        </g>)}
      </svg>}
      {active !== null && W > 0 && <Tip x={xc(active)} w={W} y={y(data[active].value)} value={`${data[active].value} ${unit.toLowerCase()}`} label={data[active].long} />}
    </div>
  </Frame>;
}

// data: [{ key, label, long, value }] on a fixed y range (e.g. 1-5), evenly spaced in order.
export function LineChart({ title, desc, data, yMin, yMax, unit, empty }) {
  const [ref, W] = useWidth(); const [active, setActive] = React.useState(null);
  const pw = Math.max(0, W - PAD.left - PAD.right), ph = H - PAD.top - PAD.bottom, n = data.length;
  const x = i => PAD.left + (n <= 1 ? pw / 2 : (i / (n - 1)) * pw), y = v => PAD.top + ph - ((v - yMin) / (yMax - yMin)) * ph;
  const ticks = []; for (let t = yMin; t <= yMax; t++) ticks.push(t);
  const band = n <= 1 ? pw : pw / (n - 1), hitW = Math.max(24, band);
  const last = n - 1;
  return <Frame title={title} desc={desc} empty={n === 0 ? empty : null} table={{ head: ["Session", unit], rows: data.map(d => [d.long, d.value]) }}>
    <div ref={ref} style={{ position: "relative", width: "100%", height: H }}>
      {W > 0 && n > 0 && <svg width={W} height={H} role="group" aria-label={title} style={{ display: "block", overflow: "visible" }}>
        {ticks.map(t => <g key={t}><line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" /><text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" style={caption}>{t}</text></g>)}
        {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + ph} stroke="var(--ink-2)" strokeWidth="1" />}
        {n > 1 && <polyline points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")} fill="none" stroke="var(--chart-mark)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {data.map((d, i) => <circle key={d.key} cx={x(i)} cy={y(d.value)} r={active === i ? 5.5 : 4} fill="var(--chart-mark)" stroke="var(--card)" strokeWidth="2" />)}
        <text x={x(last) + 10} y={y(data[last].value) + 4} style={{ ...caption, fill: "var(--ink)", fontWeight: 600 }}>{data[last].value}</text>
        {[0, last].filter((v, i, a) => a.indexOf(v) === i).map(i => <text key={i} x={x(i)} y={H - 6} textAnchor={n === 1 ? "middle" : i === 0 ? "start" : "end"} style={caption}>{data[i].label}</text>)}
        {data.map((d, i) => <rect key={"h" + d.key} x={x(i) - hitW / 2} y={PAD.top - 8} width={hitW} height={ph + 16} fill="transparent" tabIndex={0} role="img" aria-label={`${d.long}: ${unit.toLowerCase()} ${d.value} of ${yMax}`}
          onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} style={{ outline: "none" }} />)}
        {active !== null && <circle cx={x(active)} cy={y(data[active].value)} r="10" fill="none" stroke="var(--lane)" strokeWidth="2" className="dj-focus-only" />}
      </svg>}
      {active !== null && W > 0 && <Tip x={x(active)} w={W} y={y(data[active].value)} value={`${data[active].value} / ${yMax}`} label={data[active].long} />}
    </div>
  </Frame>;
}
