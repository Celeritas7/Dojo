// Pure logic for Dojo: plan tables, date helpers and the pelvic-floor schedule. No DOM, no Date.now().

export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const MOTTOS = {"2026-09":"Start where you are. Show up again tomorrow.","2026-10":"Strong legs, clear head. One session at a time.","2026-11":"Consistency beats intensity. Keep the chain going.","2026-12":"Finish the year stronger than you started it."};
export const DEFAULT_MOTTO = "Every rep is a vote for the person you want to be.";

// [kind, what, extra, minutes]
export const PLAN = [
 ["run","Run 1 min, walk 2 min","8 rounds",34],["rest","Rest or easy stroll","",0],["run","Run 1 min, walk 2 min","8 rounds",34],["rest","Rest, light stretch","",0],["run","Run 1.5 min, walk 2 min","7 rounds",35],["walk","Brisk walk","",25],["run","Run 1.5 min, walk 2 min","7 rounds",35],
 ["run","Run 2 min, walk 2 min","6 rounds",34],["rest","Rest","",0],["run","Run 2 min, walk 1.5 min","6 rounds",31],["walk","Brisk walk","",25],["run","Run 3 min, walk 2 min","5 rounds",35],["rest","Rest, light stretch","",0],["run","Run 3 min, walk 1.5 min","5 rounds",33],
 ["run","Run 4 min, walk 1.5 min","4 rounds",32],["rest","Rest","",0],["run","Run 5 min, walk 1.5 min","4 rounds",36],["walk","Brisk walk","",30],["run","Run 6 min, walk 1.5 min","3 rounds",33],["rest","Rest, big day tomorrow","",0],["finish","Run 8 min, walk 1 min","3 rounds",37]
];
export const PLAN_DAYS = PLAN.length;
export const PLAN_RUNS = PLAN.filter(p => p[0] === "run" || p[0] === "finish").length;
export const WEEKS = [["Week 1","Build the habit"],["Week 2","Longer intervals"],["Week 3","Toward non-stop"]];
export const STATES = {done:"Workout done",light:"Light / partial",rest:"Rest day",missed:"Missed"};
export const STAGES = [
 ["Weeks 1–2","Hold 3 s, relax 3 s","10 reps, 3 times a day","Learn your arousal scale. Stop fully at 7–8, wait until it drops to about 4, then continue."],
 ["Weeks 3–4","Hold 5 s, relax 5 s","12 reps, 3 times a day","Slow down or change angle at 7 instead of stopping. Add slow belly breathing."],
 ["Weeks 5–6","Hold 8 s, relax 8 s, then 10 quick squeezes","3 times a day","Near 7–8, pause and do a gentle Kegel hold to calm the urge."],
 ["Weeks 7–8+","Hold 10 s, relax 10 s, 15 quick squeezes, then 5 slow full relaxations","3 times a day","Realistic practice: vary positions and pace, with fewer pauses."]
];
export const RULES = [["Every run day", "5 min brisk walk before and after, already in the minutes shown."], ["Pace", "Slow enough to talk in full sentences. Slower is fine."], ["Missed a day?", "Repeat that day next time. Never do two runs to catch up."], ["Listen to your body", "Sharp pain means stop. If a week felt hard, repeat it before moving on."]];

// ---- dates (all local time, keys are YYYY-MM-DD / YYYY-MM) ----
const pad = n => String(n).padStart(2, "0");
export const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const parseISO = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d || 1); };
export const monthKey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1);
export const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
export const sameDay = (a, b) => iso(a) === iso(b);
export const fmtDate = d => DOW[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3);
export const fmtDateKey = k => fmtDate(parseISO(k));
export const shiftMonth = (key, n) => { let [y, m] = key.split("-").map(Number); m += n; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return y + "-" + pad(m); };
export const daysInMonth = key => { const [y, m] = key.split("-").map(Number); return new Date(y, m, 0).getDate(); };

// Longest run of 1s; 0 breaks the run, anything else (e.g. -1 for rest) is neutral.
export const longest = arr => { let best = 0, cur = 0; for (const v of arr) { if (v === 1) { cur++; best = Math.max(best, cur); } else if (v === 0) cur = 0; } return best; };

// ---- running plan ----
// The schedule is plan.seq: one entry per calendar day from plan.start, each a plan-day index (0-20) or null for a
// pushed-back gap. Without seq it is the original 21 days in order. Ticks live on the dates (days[date].run).
export const planSeq = plan => (plan && plan.seq) || PLAN.map((_, i) => i);
export const planPos = (plan, date) => (plan && plan.start ? dayDiff(date, parseISO(plan.start)) : -1);
export const runIdx = (date, plan) => { const pos = planPos(plan, date), seq = planSeq(plan); return pos >= 0 && pos < seq.length && seq[pos] !== null ? seq[pos] : -1; };
export const runDate = (planStart, pos) => addDays(parseISO(planStart), pos);
export const runKey = (planStart, pos) => iso(runDate(planStart, pos));
export const planSlots = plan => (plan && plan.start ? planSeq(plan).map((i, pos) => { const date = runDate(plan.start, pos); return { pos, i, date, key: iso(date) }; }) : []);
export const isRepeat = (plan, pos) => { const seq = planSeq(plan), i = seq[pos]; return i !== null && i !== undefined && seq.slice(0, pos).includes(i); };
// Slots grouped into plan weeks for display; a week scheduled a second time is its own group marked `again`.
// A pushed-back gap delays the day after it, so gaps join the group of the next plan day.
export function planWeeks(plan) {
  const groups = [], seen = new Set(); let cur = null, pending = [];
  for (const s of planSlots(plan)) {
    if (s.i === null) { pending.push(s); continue; }
    const w = Math.floor(s.i / 7);
    if (!cur || cur.week !== w || cur.last >= s.i) { cur = { week: w, again: seen.has(w), slots: [], last: -1 }; seen.add(w); groups.push(cur); }
    cur.slots.push(...pending, s); pending = []; cur.last = s.i;
  }
  if (pending.length) { if (cur) cur.slots.push(...pending); else groups.push({ week: null, again: false, slots: pending, last: -1 }); }
  return groups;
}
export const currentWeekGroup = (plan, date) => { const pos = planPos(plan, date); return planWeeks(plan).find(g => g.week !== null && g.slots.some(s => s.pos === pos)) || null; };
export function runInfo(i, recovery) {
  const p = PLAN[i]; let kind = p[0], what = p[1], mins = p[3], label = { run: "Run", walk: "Walk", rest: "Rest", finish: "Finish" }[kind];
  if (kind === "rest" && recovery) { label = "Recovery"; what = "Shoes on, 10-min walk or stretch"; mins = 10; }
  return { kind, label, what, extra: p[2], mins };
}
// "Run 2 min, walk 2 min, 6 rounds" rather than "Run: Run 2 min, ..."; keeps the label only when the text doesn't already say it.
export const planLine = info => (info.what.toLowerCase().includes(info.label.toLowerCase()) ? info.what : `${info.label}: ${info.what}`) + (info.extra ? `, ${info.extra}` : "");
// One flag per plan day: done if any date it was scheduled on is ticked.
export const planDone = state => { if (!state.plan.start) return []; const done = PLAN.map(() => false); for (const s of planSlots(state.plan)) if (s.i !== null && (state.days[s.key] || {}).run) done[s.i] = true; return done; };

// ---- streaks and trends ----
const trained = e => e.s === "done" || e.s === "light";
// Walk back from today (or yesterday, if today has nothing yet): done/light count, rest days are neutral,
// a missed or empty day ends it. brokenBy names that day so the app can say why.
export function currentStreak(days, today) {
  let d = (days[iso(today)] || {}).s ? today : addDays(today, -1), length = 0, since = null;
  for (let n = 0; n < 1000; n++, d = addDays(d, -1)) {
    const e = days[iso(d)] || {};
    if (trained(e)) { length++; since = iso(d); }
    else if (e.s !== "rest") return { length, since, brokenBy: { key: iso(d), reason: e.s === "missed" ? "missed" : "not logged" } };
  }
  return { length, since, brokenBy: null };
}
// Minutes per Monday-to-Sunday week, for every week that touches the month (whole weeks, so totals are honest).
export function weeklyMinutes(days, key) {
  const [y, m] = key.split("-").map(Number), first = new Date(y, m - 1, 1), last = new Date(y, m, 0);
  const out = [];
  for (let mon = addDays(first, -((first.getDay() + 6) % 7)); mon <= last; mon = addDays(mon, 7)) {
    let total = 0; for (let i = 0; i < 7; i++) { const e = days[iso(addDays(mon, i))] || {}; if (e.s) total += +e.m || 0; }
    out.push({ key: iso(mon), date: mon, value: total });
  }
  return out;
}
// The last `n` practice/test sessions with a control rating, up to and including today, oldest first.
export const controlSeries = (days, today, n = 12) => Object.keys(days).filter(k => k <= iso(today) && days[k].practice === "yes" && days[k].control).sort().slice(-n).map(k => ({ key: k, date: parseISO(k), value: days[k].control }));

// ---- pelvic floor program ----
export function pfHelpers(pf, today) {
  const startDate = () => pf.start ? parseISO(pf.start) : null;
  const isPracticeDay = d => pf.pdays.includes(d.getDay());
  // Test session = last practice day of weeks 2, 4, 6 and 8 of the program.
  const testDays = () => { const st = startDate(); if (!st) return []; const out = []; [2, 4, 6, 8].forEach(w => { for (let i = w * 7 - 1; i >= (w - 1) * 7; i--) { const d = addDays(st, i); if (isPracticeDay(d)) { out.push({ week: w, date: d, key: iso(d) }); break; } } }); return out; };
  const testFor = key => testDays().find(t => t.key === key) || null;
  const stageIdx = () => { if (!pf.start) return 0; const w = Math.floor(dayDiff(today, startDate()) / 7); return Math.max(0, Math.min(3, Math.floor(w / 2))); };
  return { startDate, isPracticeDay, testDays, testFor, stageIdx };
}
