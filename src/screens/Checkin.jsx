import { DS, TODAY } from "../env.js";
import { STAGES, iso, addDays, pfHelpers } from "../logic.js";
const { CheckinCard, Question, Pill, Field, Button } = DS;
const K = iso(TODAY);

export function Checkin({ state, open, setOpen, update }) {
  const h = pfHelpers(state.pf, TODAY);
  const d = { sets: null, practice: null, pauses: "", control: 0, time: "", ...(state.days[K] || {}) };
  const answered = d.sets !== null || d.practice !== null;
  const test = h.testFor(K), pday = h.isPracticeDay(TODAY);
  const testTomorrow = !!h.testFor(iso(addDays(TODAY, 1)));
  const st = STAGES[h.stageIdx()];
  const plan = test ? `Test session day (end of week ${test.week}). Steady realistic pace, pause only if you really need to.`
    : pday ? (testTomorrow ? "Practice day, but tomorrow is a test. Skip practice today and just do your Kegels." : "Practice day. Focus: " + st[3])
    : "Rest day for practice. Kegels only.";
  const set = patch => update(K, patch);
  if (answered && !open) return <CheckinCard collapsed onEdit={() => setOpen(true)} summary={`Pelvic floor ${d.sets ?? 0}/3 sets${d.practice === "yes" ? (test ? ", test logged" : ", practice logged") : d.practice === "no" ? ", no practice today" : ""}.`} />;
  const row = { display: "flex", gap: 6, flexWrap: "wrap" };
  return <CheckinCard>
    <p style={{ color: "var(--ink-2)", fontSize: "var(--text-small)", margin: "2px 0 0" }}>{plan}</p>
    <Question style={{ marginBottom: 0 }} id="ci-sets">Pelvic floor sets done today?</Question>
    <p id="ci-sets-hint" style={{ color: "var(--ink-2)", fontSize: "var(--text-small)", margin: "0 0 8px" }}>{st[1]}, {st[2]}</p>
    <div role="group" aria-labelledby="ci-sets" aria-describedby="ci-sets-hint" style={row}>{[0, 1, 2, 3].map(n => <Pill key={n} pressed={d.sets === n} onClick={() => { set({ sets: n }); setOpen(true); }}>{n}</Pill>)}</div>
    <Question id="ci-practice">{test ? "Test session done today?" : "Control practice session today?"}</Question>
    <div role="group" aria-labelledby="ci-practice" style={row}><Pill pressed={d.practice === "yes"} onClick={() => { set({ practice: "yes" }); setOpen(true); }}>Yes</Pill><Pill pressed={d.practice === "no"} onClick={() => { set({ practice: "no" }); setOpen(true); }}>No</Pill></div>
    {d.practice === "yes" && <>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
        {test && <Field label="Minutes until finish" as="number" min={0} max={120} step={0.5} value={d.time} onChange={e => set({ time: e.target.value })} inputStyle={{ width: 110 }} />}
        <Field label="Pauses" as="number" min={0} max={20} value={d.pauses} onChange={e => set({ pauses: e.target.value })} inputStyle={{ width: 90 }} />
        <div role="group" aria-labelledby="ci-control" aria-describedby="ci-control-scale" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--text-small)", color: "var(--ink-2)" }}>
          <span id="ci-control">How was your control?</span>
          <div style={row}>{[1, 2, 3, 4, 5].map(n => <Pill key={n} pressed={d.control === n} onClick={() => set({ control: n })}>{n}</Pill>)}</div>
          <span id="ci-control-scale" style={{ fontSize: "var(--text-caption)" }}>1 = very little, 5 = full control</span>
        </div>
      </div>
      <p style={{ color: "var(--ink-2)", fontSize: "var(--text-small)", marginTop: 8, marginBottom: 0 }}>Finished earlier than planned? That's normal. Rate it honestly and pause a little earlier next time.</p></>}
    {answered && <div style={{ marginTop: 12 }}><Button onClick={() => setOpen(false)}>Done for today</Button></div>}
  </CheckinCard>;
}
