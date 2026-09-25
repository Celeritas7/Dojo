// Sample data for the Dojo UI kit — plan/stages/mottos copied from Dojo/index.html; logged state is fabricated for the demo.
(() => {
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TODAY = new Date(2026, 9, 28); // fixed demo "today": Wed 28 Oct 2026, run-plan day 8
const RUN_START = new Date(2026, 9, 21);
const MOTTOS = {"2026-09":"Start where you are. Show up again tomorrow.","2026-10":"Strong legs, clear head. One session at a time.","2026-11":"Consistency beats intensity. Keep the chain going.","2026-12":"Finish the year stronger than you started it."};
const DEFAULT_MOTTO = "Every rep is a vote for the person you want to be.";
const PLAN = [
 ["run","Run 1 min, walk 2 min","8 rounds",34],["rest","Rest or easy stroll","",0],["run","Run 1 min, walk 2 min","8 rounds",34],["rest","Rest, light stretch","",0],["run","Run 1.5 min, walk 2 min","7 rounds",35],["walk","Brisk walk","",25],["run","Run 1.5 min, walk 2 min","7 rounds",35],
 ["run","Run 2 min, walk 2 min","6 rounds",34],["rest","Rest","",0],["run","Run 2 min, walk 1.5 min","6 rounds",31],["walk","Brisk walk","",25],["run","Run 3 min, walk 2 min","5 rounds",35],["rest","Rest, light stretch","",0],["run","Run 3 min, walk 1.5 min","5 rounds",33],
 ["run","Run 4 min, walk 1.5 min","4 rounds",32],["rest","Rest","",0],["run","Run 5 min, walk 1.5 min","4 rounds",36],["walk","Brisk walk","",30],["run","Run 6 min, walk 1.5 min","3 rounds",33],["rest","Rest, big day tomorrow","",0],["finish","Run 8 min, walk 1 min","3 rounds",37]
];
const WEEKS = [["Week 1","Build the habit"],["Week 2","Longer intervals"],["Week 3","Toward non-stop"]];
const STATES = {done:"Workout done",light:"Light / partial",missed:"Missed",rest:"Rest day"};
const STAGES = [
 ["Weeks 1–2","Hold 3 s, relax 3 s","10 reps, 3 times a day","Learn your arousal scale. Stop fully at 7–8, wait until it drops to about 4, then continue."],
 ["Weeks 3–4","Hold 5 s, relax 5 s","12 reps, 3 times a day","Slow down or change angle at 7 instead of stopping. Add slow belly breathing."],
 ["Weeks 5–6","Hold 8 s, relax 8 s, then 10 quick squeezes","3 times a day","Near 7–8, pause and do a gentle Kegel hold to calm the urge."],
 ["Weeks 7–8+","Hold 10 s, relax 10 s, 15 quick squeezes, then 5 slow full relaxations","3 times a day","Realistic practice: vary positions and pace, with fewer pauses."]
];
const iso = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const fmtDate = d => DOW[(d.getDay()+6)%7]+" "+d.getDate()+" "+MONTHS[d.getMonth()].slice(0,3);
const sameDay = (a,b) => a.getTime()===b.getTime();
const longest = arr => { let best=0,cur=0; for(const v of arr){ if(v===1){cur++;best=Math.max(best,cur);} else if(v===0){cur=0;} } return best; };
const runIdx = date => { const i=Math.round((date-RUN_START)/86400000); return (i>=0&&i<21)?i:-1; };

// Fabricated October log
const octDays = {};
const pattern = ["done","done","rest","done","light","done","rest","done","done","missed","done","rest","done","done","done","rest","light","done","done","done","done","rest","done","done","done","done","rest"];
pattern.forEach((s,i)=>{ octDays[i+1] = {s, m: s==="done"?[30,34,25,40,35,45][i%6]: s==="light"?15:0}; });
const pf = { start:"2026-10-01", pdays:[1,3,5,0], days:{} };
for(let d=1; d<=27; d++){ const date=new Date(2026,9,d); const k=iso(date); const sets=[3,3,2,3,3,1,3,3,3,0,3,2,3,3,3,3,3,1,3,3,3,3,2,3,3,3,3][d-1]; const pd=pf.pdays.includes(date.getDay()); pf.days[k]={sets, practice: pd?(d===9?"no":"yes"):null, pauses: pd?String(1+(d%3)):"", control: pd?3+(d%3):0, time: d===14?"12.5":""}; }
const state = {
  month:"2026-10",
  run:{ done:{1:true,2:true,3:true,4:true,5:true,6:true,7:true}, recovery:false },
  months:{ "2026-10":{ days:octDays, goal:"Run 8 minutes without stopping", target:"24", routines:2, notes:"Knees felt fine after week 1. Keep the pace slow." } },
  pf
};
window.DojoKitData = { MONTHS, DOW, DAYNAMES, TODAY, RUN_START, MOTTOS, DEFAULT_MOTTO, PLAN, WEEKS, STATES, STAGES, iso, fmtDate, sameDay, longest, runIdx, state };
})();
