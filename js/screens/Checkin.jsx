const { CheckinCard, Question, Pill, Field, Button } = window.DojoDesignSystem_c9e716;
const { TODAY, STAGES, iso } = window.DojoKitData;
const K = iso(TODAY);
function pfHelpers(pf) {
  const startDate = () => pf.start ? new Date(pf.start + "T00:00:00") : null;
  const isPracticeDay = d => pf.pdays.includes(d.getDay());
  const testDays = () => { const st = startDate(); if (!st) return []; const out = []; [2, 4, 6, 8].forEach(w => { for (let i = w * 7 - 1; i >= (w - 1) * 7; i--) { const d = new Date(st); d.setDate(d.getDate() + i); if (isPracticeDay(d)) { out.push({ week: w, date: d, key: iso(d) }); break; } } }); return out; };
  const testFor = key => testDays().find(t => t.key === key) || null;
  const stageIdx = () => { if (!pf.start) return 0; const w = Math.floor((TODAY - startDate()) / 86400000 / 7); return Math.max(0, Math.min(3, Math.floor(w / 2))); };
  return { startDate, isPracticeDay, testDays, testFor, stageIdx };
}
window.pfHelpers = pfHelpers;

function Checkin({ pf, open, setOpen, update }) {
  const h = pfHelpers(pf);
  const d = pf.days[K] || { sets: 0, practice: null, pauses: "", control: 0, time: "" };
  const answered = d.sets > 0 || d.practice !== null;
  const test = h.testFor(K), pday = h.isPracticeDay(TODAY);
  const tomorrow = new Date(TODAY); tomorrow.setDate(tomorrow.getDate() + 1);
  const testTomorrow = !!h.testFor(iso(tomorrow));
  const st = STAGES[h.stageIdx()];
  const plan = test ? `Test session day (end of week ${test.week}). Steady realistic pace, pause only if you really need to.`
    : pday ? (testTomorrow ? "Practice day, but tomorrow is a test. Skip practice today and just do your Kegels." : "Practice day. Focus: " + st[3])
    : "Rest day for practice. Kegels only.";
  const set = patch => update(K, { ...d, ...patch });
  if (answered && !open) return <CheckinCard collapsed onEdit={() => setOpen(true)} summary={`Pelvic floor ${d.sets}/3 sets${d.practice === "yes" ? (test ? ", test logged" : ", practice logged") : d.practice === "no" ? ", no practice today" : ""}.`} />;
  const row = { display: "flex", gap: 6, flexWrap: "wrap" };
  return <CheckinCard>
    <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "2px 0 0" }}>{plan}</p>
    <Question hint={st[1] + ", " + st[2]}>Pelvic floor sets done today?</Question>
    <div style={row}>{[0, 1, 2, 3].map(n => <Pill key={n} pressed={d.sets === n} onClick={() => { set({ sets: n }); setOpen(true); }}>{n}</Pill>)}</div>
    <Question>{test ? "Test session done today?" : "Control practice session today?"}</Question>
    <div style={row}><Pill pressed={d.practice === "yes"} onClick={() => { set({ practice: "yes" }); setOpen(true); }}>Yes</Pill><Pill pressed={d.practice === "no"} onClick={() => { set({ practice: "no" }); setOpen(true); }}>No</Pill></div>
    {d.practice === "yes" && <>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
        {test && <Field label="Minutes until finish" as="number" min={0} max={120} step={0.5} value={d.time} onChange={e => set({ time: e.target.value })} inputStyle={{ width: 110 }} />}
        <Field label="Pauses" as="number" min={0} max={20} value={d.pauses} onChange={e => set({ pauses: e.target.value })} inputStyle={{ width: 90 }} />
        <Field label="How was your control?"><div style={row}>{[1, 2, 3, 4, 5].map(n => <Pill key={n} pressed={d.control === n} onClick={() => set({ control: n })}>{n}</Pill>)}</div></Field>
      </div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 8, marginBottom: 0 }}>Finished earlier than planned? That's normal. Rate it honestly and pause a little earlier next time.</p></>}
    {answered && <div style={{ marginTop: 12 }}><Button onClick={() => setOpen(false)}>Done</Button></div>}
  </CheckinCard>;
}
window.DojoCheckin = Checkin;
