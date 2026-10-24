/* @ds-bundle: {"format":4,"namespace":"DojoDesignSystem_c9e716","note":"ui_kits/dojo/* screen copies removed; the live screens are in src/screens","components":[{"name":"ICONS","sourcePath":"assets/icons/icons.js"},{"name":"CalendarCell","sourcePath":"components/calendar/CalendarCell.jsx"},{"name":"DayCard","sourcePath":"components/calendar/DayCard.jsx"},{"name":"DowHeader","sourcePath":"components/calendar/DowHeader.jsx"},{"name":"HabitDot","sourcePath":"components/calendar/HabitDot.jsx"},{"name":"KegelDots","sourcePath":"components/calendar/KegelDots.jsx"},{"name":"RunChip","sourcePath":"components/calendar/RunChip.jsx"},{"name":"SheetCell","sourcePath":"components/calendar/SheetCell.jsx"},{"name":"WeekTally","sourcePath":"components/calendar/WeekTally.jsx"},{"name":"Button","sourcePath":"components/controls/Button.jsx"},{"name":"Counter","sourcePath":"components/controls/Counter.jsx"},{"name":"Field","sourcePath":"components/controls/Field.jsx"},{"name":"Icon","sourcePath":"components/controls/Icon.jsx"},{"name":"NavButton","sourcePath":"components/controls/NavButton.jsx"},{"name":"Pill","sourcePath":"components/controls/Pill.jsx"},{"name":"Tab","sourcePath":"components/controls/Tab.jsx"},{"name":"Toggle","sourcePath":"components/controls/Toggle.jsx"},{"name":"Lanes","sourcePath":"components/display/Lanes.jsx"},{"name":"Legend","sourcePath":"components/display/Legend.jsx"},{"name":"Motto","sourcePath":"components/display/Motto.jsx"},{"name":"Rule","sourcePath":"components/display/Rule.jsx"},{"name":"Stage","sourcePath":"components/display/Stage.jsx"},{"name":"Stat","sourcePath":"components/display/Stat.jsx"},{"name":"Strip","sourcePath":"components/display/Strip.jsx"},{"name":"Tip","sourcePath":"components/display/Tip.jsx"},{"name":"CheckinCard","sourcePath":"components/overlays/CheckinCard.jsx"},{"name":"Question","sourcePath":"components/overlays/CheckinCard.jsx"},{"name":"Details","sourcePath":"components/overlays/Details.jsx"},{"name":"Dialog","sourcePath":"components/overlays/Dialog.jsx"},{"name":"DialogSection","sourcePath":"components/overlays/Dialog.jsx"},{"name":"StateGrid","sourcePath":"components/overlays/StateGrid.jsx"}],"sourceHashes":{"assets/icons/icons.js":"ac046ffdd62d","components/calendar/CalendarCell.jsx":"15e32c87ac05","components/calendar/DayCard.jsx":"a6fbe0e0bcaa","components/calendar/DowHeader.jsx":"2061a58fca38","components/calendar/HabitDot.jsx":"5fc366de7456","components/calendar/KegelDots.jsx":"43132de2f8f6","components/calendar/RunChip.jsx":"04fc6bdf18bd","components/calendar/SheetCell.jsx":"c4b55b10abb4","components/calendar/WeekTally.jsx":"9a02e385707b","components/controls/Button.jsx":"4d147296c3e1","components/controls/Counter.jsx":"31a22bb947c2","components/controls/Field.jsx":"d70cf1067dfc","components/controls/Icon.jsx":"e443cfe913a7","components/controls/NavButton.jsx":"52e6e9f64bbc","components/controls/Pill.jsx":"155a98acf107","components/controls/Tab.jsx":"c3444a14b989","components/controls/Toggle.jsx":"3a4283b1537b","components/display/Lanes.jsx":"a812098fcb12","components/display/Legend.jsx":"65c747082aad","components/display/Motto.jsx":"1403b407ccc2","components/display/Rule.jsx":"e50c35bf0bd0","components/display/Stage.jsx":"d31ca20c4e8f","components/display/Stat.jsx":"81b1cfde4b1e","components/display/Strip.jsx":"e0e6ccdb5d78","components/display/Tip.jsx":"66165f96ae81","components/overlays/CheckinCard.jsx":"75ae13ebc19f","components/overlays/Details.jsx":"facac6b2e81e","components/overlays/Dialog.jsx":"783f2ff6518f","components/overlays/StateGrid.jsx":"65a289bc21db","ui_kits/dojo/App.jsx":"d40e57457a78","ui_kits/dojo/Checkin.jsx":"aa367f26600c","ui_kits/dojo/DayEditor.jsx":"a35fa34dda53","ui_kits/dojo/Header.jsx":"656e5cb8aaae","ui_kits/dojo/Programs.jsx":"e13a4dae17c1","ui_kits/dojo/Sheet.jsx":"6b78d9fa0e07","ui_kits/dojo/data.js":"61187e861d35"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DojoDesignSystem_c9e716 = window.DojoDesignSystem_c9e716 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/icons/icons.js
try { (() => {
// Dojo glyph set, copied verbatim from Dojo/index.html ICON map. Inline via dangerouslySetInnerHTML or <img src>.
const ICONS = {
  "run": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><path d=\"M2 11c3 0 4-1 6-1s3 2 6 2v1H2z\" fill=\"currentColor\"/><path d=\"M4 10l1-4h3l1 3\" stroke=\"currentColor\" stroke-width=\"1.5\" fill=\"none\"/></svg>",
  "walk": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><ellipse cx=\"5\" cy=\"10\" rx=\"2\" ry=\"3.2\" fill=\"currentColor\"/><ellipse cx=\"11\" cy=\"6\" rx=\"2\" ry=\"3.2\" fill=\"currentColor\"/></svg>",
  "rest": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><path d=\"M10 2a6 6 0 1 0 4 10A5 5 0 0 1 10 2z\" fill=\"currentColor\"/></svg>",
  "finish": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><path d=\"M3 1v14\" stroke=\"currentColor\" stroke-width=\"1.6\"/><path d=\"M4 2h9l-2 3 2 3H4z\" fill=\"currentColor\"/></svg>",
  "check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 14 14\"><path d=\"M2 7l3 3 7-7\" stroke=\"currentColor\" stroke-width=\"2.2\" fill=\"none\"/></svg>"
};
window.DojoIcons = ICONS;
Object.assign(__ds_scope, { ICONS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons/icons.js", error: String((e && e.message) || e) }); }

// components/calendar/DowHeader.jsx
try { (() => {
/** .dow — condensed 14px muted weekday header; pass an extra trailing label (e.g. "Week") */
function DowHeader({
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  trailing = "Week"
}) {
  const s = {
    font: "700 14px var(--font-display)",
    letterSpacing: ".01em",
    color: "var(--ink-2)",
    textAlign: "center",
    padding: "4px 0"
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, labels.map(l => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: s
  }, l)), trailing && /*#__PURE__*/React.createElement("div", {
    style: s
  }, trailing));
}
Object.assign(__ds_scope, { DowHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/DowHeader.jsx", error: String((e && e.message) || e) }); }

// components/calendar/KegelDots.jsx
try { (() => {
/** .kg — three 8px dots, filled yellow per set */
function KegelDots({
  sets = 0,
  size = 8,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 3,
      ...style
    }
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("i", {
    key: n,
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      border: "1.5px solid " + (sets >= n ? "var(--done)" : "var(--ink-2)"),
      background: sets >= n ? "var(--done)" : "transparent",
      boxSizing: "border-box"
    }
  })));
}
Object.assign(__ds_scope, { KegelDots });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/KegelDots.jsx", error: String((e && e.message) || e) }); }

// components/calendar/WeekTally.jsx
try { (() => {
/** .wk — week column summary: "Wk 3" over "5/7" on 6% ink tint */
function WeekTally({
  week,
  done = 0,
  of = 7,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    "aria-label": "Week " + week + ": " + done + " of " + of,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      background: "var(--tint-ink)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--ink-2)"
    }
  }, "Wk ", week), /*#__PURE__*/React.createElement("b", {
    style: {
      font: "800 20px/1 var(--font-display)",
      letterSpacing: ".01em",
      color: "var(--ink)"
    }
  }, done, "/", of));
}
Object.assign(__ds_scope, { WeekTally });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/WeekTally.jsx", error: String((e && e.message) || e) }); }

// components/controls/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** .btn / .btn.ghost from Dojo */
function Button({
  variant = "solid",
  children,
  style,
  ...rest
}) {
  const ghost = variant === "ghost";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button"
  }, rest, {
    style: {
      font: "inherit",
      cursor: "pointer",
      border: ghost ? "1.5px solid var(--line)" : "none",
      borderRadius: "var(--radius-sm)",
      padding: "10px 16px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: ghost ? "transparent" : "var(--ink)",
      color: ghost ? "var(--ink-2)" : "var(--paper)",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Button.jsx", error: String((e && e.message) || e) }); }

// components/controls/Counter.jsx
try { (() => {
const b = {
  font: "inherit",
  cursor: "pointer",
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1.5px solid var(--line)",
  background: "var(--card)",
  fontWeight: 700,
  color: "var(--ink)"
};
/** .counter — two round − / + buttons */
function Counter({
  value = 0,
  onChange,
  min = 0,
  minusLabel = "One fewer",
  plusLabel = "One more",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 6,
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": minusLabel,
    style: b,
    onClick: () => onChange && onChange(Math.max(min, value - 1))
  }, "\u2212"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": plusLabel,
    style: b,
    onClick: () => onChange && onChange(value + 1)
  }, "+"));
}
Object.assign(__ds_scope, { Counter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Counter.jsx", error: String((e && e.message) || e) }); }

// components/controls/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const inputStyle = {
  font: "inherit",
  background: "var(--card)",
  border: "1.5px solid var(--line)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 11px",
  color: "var(--ink)",
  fontSize: 15
};
/** .field — 13px muted label above an input/textarea/select. Pass children to replace the control (e.g. Pills). */
function Field({
  label,
  as = "input",
  inline = false,
  children,
  style,
  inputStyle: is,
  ...rest
}) {
  const control = children != null ? children : as === "textarea" ? /*#__PURE__*/React.createElement("textarea", _extends({}, rest, {
    style: {
      ...inputStyle,
      minHeight: rest.rows ? undefined : 90,
      resize: "vertical",
      width: "100%",
      ...is
    }
  })) : as === "select" ? /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    style: {
      ...inputStyle,
      padding: "8px 10px",
      ...is
    }
  }), rest.options && rest.options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))) : /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    type: as === "input" ? rest.type || "text" : as,
    style: {
      ...inputStyle,
      ...is
    }
  }));
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: inline ? "row" : "column",
      alignItems: inline ? "center" : undefined,
      gap: inline ? 8 : 4,
      fontSize: 13,
      color: "var(--ink-2)",
      ...style
    }
  }, label, control);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Field.jsx", error: String((e && e.message) || e) }); }

// components/controls/Icon.jsx
try { (() => {
const ICONS = {
  run: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 11c3 0 4-1 6-1s3 2 6 2v1H2z" fill="currentColor"/><path d="M4 10l1-4h3l1 3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
  walk: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="5" cy="10" rx="2" ry="3.2" fill="currentColor"/><ellipse cx="11" cy="6" rx="2" ry="3.2" fill="currentColor"/></svg>',
  rest: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 2a6 6 0 1 0 4 10A5 5 0 0 1 10 2z" fill="currentColor"/></svg>',
  finish: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1v14" stroke="currentColor" stroke-width="1.6"/><path d="M4 2h9l-2 3 2 3H4z" fill="currentColor"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7l3 3 7-7" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>'
};
/** Dojo glyph. name: run | walk | rest | finish | check. Inherits currentColor. */
function Icon({
  name,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      lineHeight: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: ICONS[name] || ""
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Icon.jsx", error: String((e && e.message) || e) }); }

// components/calendar/DayCard.jsx
try { (() => {
const KIND = {
  run: "var(--run)",
  walk: "var(--walk)",
  rest: "var(--ink-2)",
  finish: "var(--finish)"
};
/** .day — 21-day running plan card (numbered, kind, description, duration, check) */
function DayCard({
  n,
  date,
  kind = "run",
  label,
  what,
  extra,
  mins,
  done = false,
  today = false,
  onClick,
  style
}) {
  const finish = kind === "finish";
  const lbl = label || {
    run: "Run",
    walk: "Walk",
    rest: "Rest",
    finish: "Finish"
  }[kind];
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": done,
    style: {
      font: "inherit",
      cursor: "pointer",
      position: "relative",
      textAlign: "left",
      background: done ? "var(--tint-done)" : "var(--card)",
      border: (finish ? "2px" : "1.5px") + " solid " + (done ? "var(--done)" : finish ? "var(--finish)" : "var(--line)"),
      borderRadius: "var(--radius-md)",
      padding: "10px 10px 36px",
      minHeight: 150,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      color: "var(--ink)",
      transition: "border-color .15s,background .15s",
      ...style
    }
  }, today && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      right: 8,
      font: "700 11px var(--font-display)",
      background: "var(--lane)",
      color: "#fff",
      padding: "1px 6px",
      borderRadius: "var(--radius-pill)"
    }
  }, "Today"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "800 26px/1 var(--font-display)",
      letterSpacing: ".01em"
    }
  }, String(n).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)"
    }
  }, date), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      font: "700 14px var(--font-display)",
      letterSpacing: ".01em",
      marginTop: 6,
      color: KIND[kind]
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: kind
  }), " ", lbl), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      lineHeight: 1.3
    }
  }, what, extra && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "\xD7 ", extra)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)",
      marginTop: "auto"
    }
  }, mins ? "~" + mins + " min" : "\u00a0"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 10,
      bottom: 10,
      width: 24,
      height: 24,
      borderRadius: "50%",
      border: done ? "2px solid var(--done)" : "2px dashed var(--ink-2)",
      background: done ? "var(--done)" : "transparent",
      color: "var(--done-ink)",
      display: "grid",
      placeItems: "center"
    }
  }, done && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check"
  })));
}
Object.assign(__ds_scope, { DayCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/DayCard.jsx", error: String((e && e.message) || e) }); }

// components/calendar/HabitDot.jsx
try { (() => {
/** Status circle. status: done | light | missed | rest | null (dashed empty). size 28 (month cell) / 18 (sheet) / 12 (legend) */
function HabitDot({
  status = null,
  size = 28,
  symbol = true,
  style
}) {
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: 13,
    fontWeight: 700,
    flex: "none",
    boxSizing: "border-box"
  };
  const s = status === "done" ? {
    background: "var(--done)",
    border: "2px solid var(--done)",
    color: "var(--done-ink)"
  } : status === "light" ? {
    background: "linear-gradient(90deg,var(--light) 50%,transparent 50%)",
    border: "2px solid var(--light)"
  } : status === "missed" ? {
    border: "2px solid var(--missed)",
    color: "var(--missed)",
    background: size <= 18 ? "var(--tint-missed)" : "transparent"
  } : status === "rest" ? {
    background: "var(--rest)",
    border: "2px solid var(--rest)",
    color: "var(--card)"
  } : {
    border: "2px dashed var(--ink-2)"
  };
  const sym = symbol && size >= 24 ? status === "done" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check"
  }) : status === "missed" ? "✕" : null : null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      ...base,
      ...s,
      ...style
    }
  }, sym);
}
Object.assign(__ds_scope, { HabitDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/HabitDot.jsx", error: String((e && e.message) || e) }); }

// components/calendar/CalendarCell.jsx
try { (() => {
/** .cell — simple month-view day: number, big status dot, minutes */
function CalendarCell({
  day,
  status = null,
  mins,
  today = false,
  empty = false,
  onClick,
  ariaLabel,
  style
}) {
  if (empty) return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      background: "transparent",
      border: "1px dashed var(--line)",
      borderRadius: "var(--radius-sm)",
      minHeight: 82,
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-label": ariaLabel,
    style: {
      font: "inherit",
      cursor: "pointer",
      background: "var(--card)",
      border: today ? "2px solid var(--lane)" : "1.5px solid var(--line)",
      borderRadius: "var(--radius-sm)",
      minHeight: 82,
      padding: 6,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      textAlign: "center",
      color: "var(--ink)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: "flex-start",
      font: "700 15px/1 var(--font-display)",
      letterSpacing: ".01em"
    }
  }, day), /*#__PURE__*/React.createElement(__ds_scope.HabitDot, {
    status: status,
    size: 28
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)",
      lineHeight: 1.1
    }
  }, mins ? mins + " min" : "__ min"));
}
Object.assign(__ds_scope, { CalendarCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/CalendarCell.jsx", error: String((e && e.message) || e) }); }

// components/calendar/RunChip.jsx
try { (() => {
const KIND = {
  run: "var(--run)",
  walk: "var(--walk)",
  rest: "var(--ink-2)",
  finish: "var(--finish)"
};
/** .rp — run-plan chip: outlined in kind colour, solid when ok (done) */
function RunChip({
  kind = "run",
  label,
  ok = false,
  hideLabel = false,
  style
}) {
  const c = KIND[kind] || KIND.run;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      font: "700 13px var(--font-display)",
      letterSpacing: ".01em",
      borderRadius: "var(--radius-xs)",
      padding: hideLabel ? "1px 2px" : "1px 5px",
      alignSelf: "flex-start",
      border: "1.5px solid " + c,
      color: ok ? "var(--card)" : c,
      background: ok ? c : "transparent",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ok ? "check" : kind
  }), !hideLabel && /*#__PURE__*/React.createElement("span", null, label || kind[0].toUpperCase() + kind.slice(1)));
}
Object.assign(__ds_scope, { RunChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/RunChip.jsx", error: String((e && e.message) || e) }); }

// components/calendar/SheetCell.jsx
try { (() => {
/** .sc — one day of the combined monthly sheet. practice: 'done' | 'planned' | null; test marks ★ instead of ◆ */
function SheetCell({
  day,
  status = null,
  run = null,
  sets = 0,
  mins,
  practice = null,
  test = false,
  today = false,
  empty = false,
  compact = false,
  onClick,
  ariaLabel,
  style
}) {
  if (empty) return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      background: "transparent",
      border: "1px dashed var(--line)",
      borderRadius: "var(--radius-sm)",
      minHeight: compact ? 76 : 112,
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-label": ariaLabel,
    style: {
      font: "inherit",
      cursor: "pointer",
      position: "relative",
      background: "var(--card)",
      border: today ? "2px solid var(--lane)" : "1.5px solid var(--line)",
      borderRadius: "var(--radius-sm)",
      minHeight: compact ? 76 : 112,
      padding: compact ? 4 : "6px 7px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      textAlign: "left",
      color: "var(--ink)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "800 17px/1 var(--font-display)",
      letterSpacing: ".01em"
    }
  }, day), /*#__PURE__*/React.createElement(__ds_scope.HabitDot, {
    status: status,
    size: compact ? 12 : 18,
    symbol: false
  })), run && /*#__PURE__*/React.createElement(__ds_scope.RunChip, {
    kind: run.kind,
    label: run.label,
    ok: run.ok,
    hideLabel: compact
  }), /*#__PURE__*/React.createElement(__ds_scope.KegelDots, {
    sets: sets,
    size: compact ? 6 : 8
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: "auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 12,
      color: "var(--ink-2)"
    }
  }, /*#__PURE__*/React.createElement("span", null, !compact && mins ? mins + " min" : ""), practice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--lane)",
      lineHeight: 1,
      opacity: practice === "planned" ? .45 : 1
    }
  }, test ? "★" : "◆")));
}
Object.assign(__ds_scope, { SheetCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/calendar/SheetCell.jsx", error: String((e && e.message) || e) }); }

// components/controls/NavButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** .nav — 40px round month stepper */
function NavButton({
  dir = "next",
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label || (dir === "prev" ? "Previous" : "Next")
  }, rest, {
    style: {
      font: "inherit",
      cursor: "pointer",
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "1.5px solid var(--line)",
      background: "var(--card)",
      fontSize: 18,
      fontWeight: 700,
      color: "var(--ink)",
      ...style
    }
  }), dir === "prev" ? "‹" : "›");
}
Object.assign(__ds_scope, { NavButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/NavButton.jsx", error: String((e && e.message) || e) }); }

// components/controls/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** .pill toggle — aria-pressed flips to ink/paper */
function Pill({
  pressed = false,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-pressed": pressed
  }, rest, {
    style: {
      font: "inherit",
      cursor: "pointer",
      border: "1.5px solid " + (pressed ? "var(--ink)" : "var(--line)"),
      background: pressed ? "var(--ink)" : "var(--paper)",
      color: pressed ? "var(--paper)" : "var(--ink)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 14px",
      fontWeight: 600,
      minWidth: 44,
      whiteSpace: "nowrap",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Pill.jsx", error: String((e && e.message) || e) }); }

// components/controls/Tab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** .tab — same pill shape as Pill but 8px 16px padding, card background */
function Tab({
  selected = false,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "tab",
    "aria-selected": selected
  }, rest, {
    style: {
      font: "inherit",
      cursor: "pointer",
      border: "1.5px solid " + (selected ? "var(--ink)" : "var(--line)"),
      background: selected ? "var(--ink)" : "var(--card)",
      color: selected ? "var(--paper)" : "var(--ink)",
      padding: "8px 16px",
      borderRadius: "var(--radius-pill)",
      fontWeight: 600,
      whiteSpace: "nowrap",
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Tab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Tab.jsx", error: String((e && e.message) || e) }); }

// components/controls/Toggle.jsx
try { (() => {
/** .toggle — labelled checkbox in a small card */
function Toggle({
  checked = false,
  onChange,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "var(--card)",
      border: "1px solid var(--line)",
      padding: "8px 12px",
      borderRadius: "var(--radius-md)",
      fontSize: 14,
      cursor: "pointer",
      whiteSpace: "nowrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      width: 18,
      height: 18,
      accentColor: "var(--lane)",
      margin: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/display/Lanes.jsx
try { (() => {
/** .lanes — running-track progress bar with tick marks and a runner pill */
function Lanes({
  value = 0,
  max = 21,
  word = "Day",
  style
}) {
  const pct = Math.min(100, max ? value / max * 100 : 0);
  const marks = [];
  for (let i = 1; i < max; i++) marks.push(/*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 1,
      background: "var(--line)",
      left: i / max * 100 + "%"
    }
  }));
  const ln = t => /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 1,
      background: "var(--line)",
      top: t
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    role: "img",
    "aria-label": value + " of " + max + " " + word.toLowerCase() + "s done",
    style: {
      position: "relative",
      height: 46,
      margin: "6px 0 4px",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      background: "var(--card)",
      border: "1px solid var(--line)",
      ...style
    }
  }, ln("33%"), ln("66%"), marks, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      background: "var(--done)",
      opacity: .9,
      transition: "width .5s ease",
      width: pct + "%"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "50%",
      transform: "translate(-50%,-50%)",
      font: "700 13px " + "var(--font-display)",
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "2px 8px",
      borderRadius: "var(--radius-pill)",
      whiteSpace: "nowrap",
      transition: "left .5s ease",
      left: "clamp(40px," + pct + "%,calc(100% - 40px))"
    }
  }, value, " / ", max));
}
Object.assign(__ds_scope, { Lanes });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Lanes.jsx", error: String((e && e.message) || e) }); }

// components/display/Legend.jsx
try { (() => {
/** .legend2 — inline swatch + label row. items: [{status:'done'|'light'|'missed'|'rest'} | {node}, label] */
function Legend({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      margin: "12px 0",
      fontSize: 13,
      color: "var(--ink-2)",
      alignItems: "center",
      ...style
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      whiteSpace: "nowrap"
    }
  }, it.node || /*#__PURE__*/React.createElement(__ds_scope.HabitDot, {
    status: it.status,
    size: 12
  }), it.label)));
}
Object.assign(__ds_scope, { Legend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Legend.jsx", error: String((e && e.message) || e) }); }

// components/display/Motto.jsx
try { (() => {
/** .motto — italic 17px monthly line */
function Motto({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      font: "italic 500 17px var(--font-body)",
      color: "var(--ink-2)",
      margin: "0 0 14px",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Motto });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Motto.jsx", error: String((e && e.message) || e) }); }

// components/display/Rule.jsx
try { (() => {
/** .rule — 3px lane left border, condensed 18px title, 14px muted body */
function Rule({
  title,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: "3px solid var(--lane)",
      padding: "4px 12px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "700 18px/1.2 var(--font-display)",
      letterSpacing: ".01em",
      color: "var(--ink)"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.35
    }
  }, children));
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Rule.jsx", error: String((e && e.message) || e) }); }

// components/display/Stage.jsx
try { (() => {
/** .stage — program stage card; now=true gets done tint + done border */
function Stage({
  title,
  now = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: now ? "var(--tint-done-soft)" : "var(--card)",
      border: "1.5px solid " + (now ? "var(--done)" : "var(--line)"),
      borderRadius: "var(--radius-md)",
      padding: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: "800 20px/1.2 var(--font-display)",
      letterSpacing: ".01em",
      display: "block",
      color: "var(--ink)"
    }
  }, title), React.Children.map(children, (c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      display: "block",
      lineHeight: 1.35,
      marginTop: i ? 6 : 0
    }
  }, c)));
}
Object.assign(__ds_scope, { Stage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Stage.jsx", error: String((e && e.message) || e) }); }

// components/display/Stat.jsx
try { (() => {
/** .stat — big condensed number over a muted label */
function Stat({
  value,
  label,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-lg)",
      padding: "14px 16px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "800 36px/1 var(--font-display)",
      letterSpacing: ".01em",
      color: "var(--ink)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14
    }
  }, label), children);
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/display/Strip.jsx
try { (() => {
/** .strip — 28-day heatmap. days: [{n, sets:0-3, practice:boolean, title}] */
function Strip({
  days = [],
  columns = 14,
  style
}) {
  const bg = ["var(--line)", "var(--strip-1)", "var(--strip-2)", "var(--done)"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(" + columns + ",1fr)",
      gap: 4,
      margin: "8px 0 18px",
      ...style
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: d.title,
    style: {
      aspectRatio: "1",
      borderRadius: "var(--radius-xs)",
      background: bg[Math.min(3, d.sets || 0)],
      display: "grid",
      placeItems: "center",
      fontSize: 10,
      color: (d.sets || 0) >= 3 ? "var(--done-ink)" : "var(--ink-2)",
      boxShadow: d.practice ? "inset 0 -4px 0 var(--lane)" : "none"
    }
  }, d.n)));
}
Object.assign(__ds_scope, { Strip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Strip.jsx", error: String((e && e.message) || e) }); }

// components/display/Tip.jsx
try { (() => {
/** .tip — one-line muted note with lane left border */
function Tip({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      borderLeft: "3px solid var(--lane)",
      padding: "4px 12px",
      color: "var(--ink-2)",
      fontSize: 14,
      margin: "0 0 10px",
      lineHeight: 1.5,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Tip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tip.jsx", error: String((e && e.message) || e) }); }

// components/overlays/CheckinCard.jsx
try { (() => {
/** .checkin — lane-bordered card. collapsed=true renders the one-line summary with an Edit button */
function CheckinCard({
  title = "Today's check-in",
  collapsed = false,
  summary,
  onEdit,
  children,
  style
}) {
  const box = {
    background: "var(--card)",
    border: "1.5px solid var(--lane)",
    borderRadius: "var(--radius-lg)",
    padding: "14px 16px",
    margin: "0 0 18px",
    ...style
  };
  const h = {
    font: "700 24px/1.2 var(--font-display)",
    letterSpacing: ".01em",
    margin: "0 0 2px",
    color: "var(--ink)"
  };
  if (collapsed) return /*#__PURE__*/React.createElement("div", {
    style: box
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 18,
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: h
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      marginTop: 8
    }
  }, summary)), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    onClick: onEdit
  }, "Edit")));
  return /*#__PURE__*/React.createElement("div", {
    style: box
  }, /*#__PURE__*/React.createElement("h2", {
    style: h
  }, title), children);
}
/** .q — 600-weight question line inside the check-in */
function Question({
  children,
  hint,
  style
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 6px",
      fontWeight: 600,
      color: "var(--ink)",
      ...style
    }
  }, children, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "var(--ink-2)"
    }
  }, " (", hint, ")"));
}
Object.assign(__ds_scope, { CheckinCard, Question });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/CheckinCard.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Details.jsx
try { (() => {
/** details.more — collapsible card with a condensed 20px summary */
function Details({
  summary,
  open = false,
  onToggle,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("details", {
    open: open,
    onToggle: e => onToggle && onToggle(e.target.open),
    style: {
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 16px",
      marginTop: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      font: "700 20px/1.3 var(--font-display)",
      letterSpacing: ".01em",
      cursor: "pointer",
      color: "var(--ink)",
      marginBottom: open ? 10 : 0
    }
  }, summary), children);
}
Object.assign(__ds_scope, { Details });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Details.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Dialog.jsx
try { (() => {
/** Day-editor dialog shell: 18px radius card, deep shadow, dim backdrop; footer = Clear day / Save day */
function Dialog({
  open = false,
  title,
  children,
  onClear,
  onSave,
  onClose,
  clearLabel = "Clear day",
  saveLabel = "Save day",
  fixed = true,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: fixed ? "fixed" : "absolute",
      inset: 0,
      background: "var(--backdrop)",
      display: "grid",
      placeItems: "center",
      zIndex: 50,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSave && onSave();
    },
    role: "dialog",
    "aria-modal": "true",
    style: {
      border: "none",
      borderRadius: "var(--radius-xl)",
      padding: 18,
      background: "var(--card)",
      color: "var(--ink)",
      width: "min(380px,100%)",
      boxShadow: "var(--shadow-dialog)",
      maxHeight: "calc(100vh - 24px)",
      overflow: "auto",
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 12px",
      font: "700 24px/1.2 var(--font-display)",
      letterSpacing: ".01em"
    }
  }, title), children, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    onClick: onClear
  }, clearLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    type: "submit"
  }, saveLabel))));
}
/** .dsec — hairline-topped section inside the dialog */
function DialogSection({
  title,
  first = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: first ? "none" : "1px solid var(--line)",
      paddingTop: first ? 0 : 10,
      marginTop: first ? 0 : 10,
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: "0 0 6px",
      font: "700 17px/1.2 var(--font-display)",
      letterSpacing: ".01em"
    }
  }, title), children);
}
Object.assign(__ds_scope, { Dialog, DialogSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/StateGrid.jsx
try { (() => {
/** .states — 2-column grid of pressable state buttons. options: [{value,label}] */
function StateGrid({
  options = [],
  value = null,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      marginBottom: 14,
      ...style
    }
  }, options.map(o => {
    const on = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      "aria-pressed": on,
      onClick: () => onChange && onChange(o.value),
      style: {
        font: "inherit",
        cursor: "pointer",
        border: "1.5px solid " + (on ? "var(--ink)" : "var(--line)"),
        background: on ? "var(--tint-ink-strong)" : "var(--paper)",
        color: "var(--ink)",
        borderRadius: "var(--radius-md)",
        padding: 10,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
        textAlign: "left"
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { StateGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/StateGrid.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ICONS = __ds_scope.ICONS;

__ds_ns.CalendarCell = __ds_scope.CalendarCell;

__ds_ns.DayCard = __ds_scope.DayCard;

__ds_ns.DowHeader = __ds_scope.DowHeader;

__ds_ns.HabitDot = __ds_scope.HabitDot;

__ds_ns.KegelDots = __ds_scope.KegelDots;

__ds_ns.RunChip = __ds_scope.RunChip;

__ds_ns.SheetCell = __ds_scope.SheetCell;

__ds_ns.WeekTally = __ds_scope.WeekTally;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Counter = __ds_scope.Counter;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.NavButton = __ds_scope.NavButton;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.Tab = __ds_scope.Tab;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.Lanes = __ds_scope.Lanes;

__ds_ns.Legend = __ds_scope.Legend;

__ds_ns.Motto = __ds_scope.Motto;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.Stage = __ds_scope.Stage;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Strip = __ds_scope.Strip;

__ds_ns.Tip = __ds_scope.Tip;

__ds_ns.CheckinCard = __ds_scope.CheckinCard;

__ds_ns.Question = __ds_scope.Question;

__ds_ns.Details = __ds_scope.Details;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.DialogSection = __ds_scope.DialogSection;

__ds_ns.StateGrid = __ds_scope.StateGrid;

})();
