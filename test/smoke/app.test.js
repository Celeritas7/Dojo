// Browser smoke test: serves the repo, loads the built app, logs a day, reloads, checks it stuck. Also saves screenshots to test/screenshots/.
// Run `npm run build` first. Needs Playwright's Chromium (PLAYWRIGHT_BROWSERS_PATH or `npx playwright install chromium`).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("../../", import.meta.url).pathname;
const SHOTS = join(ROOT, "test/screenshots");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".map": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
let server, browser, base;
let swSuffix = ""; // appended to sw.js to simulate a new release in the update test

before(async () => {
  assert.ok(existsSync(join(ROOT, "dist/app.js")), "dist/app.js missing: run `npm run build` first");
  server = http.createServer((req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^\/+/, "") || "index.html";
    const f = join(ROOT, p); if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream", "cache-control": "no-cache" });
    if (p === "sw.js" && swSuffix) return res.end(readFileSync(f, "utf8") + swSuffix);
    createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  mkdirSync(SHOTS, { recursive: true });
});
after(async () => { await browser?.close(); server?.close(); });

const open = async (page, url) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + url); await page.waitForSelector("#panel h2");
  return errors;
};
const width = page => page.evaluate(() => document.documentElement.scrollWidth);
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem("dojo.state")));
const AXE = () => readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const ROUTES = ["#today", "#month/2026-10", "#programs/run", "#programs/pf"];

test("loads with no console errors and no CDN requests; Today is the default view", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const external = []; page.on("request", r => { if (!r.url().startsWith(base)) external.push(r.url()); });
  const errors = await open(page, "/?demo=1");
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  assert.equal(await page.locator("#panel h2").first().innerText(), "Wednesday 28 October");
  assert.match(page.url(), /#today$/);
  await page.screenshot({ path: join(SHOTS, "desktop-today.png"), fullPage: true });
  await page.getByRole("tab", { name: "Month" }).click();
  await page.locator("text=20 of 24 days trained").waitFor();
  assert.equal(await page.locator("[aria-label^='October 10, Missed']").count(), 1);
  await page.screenshot({ path: join(SHOTS, "desktop-month.png"), fullPage: true });
  await page.getByRole("tab", { name: "Programs" }).click();
  await page.locator("text=Day 8 of 21").waitFor();
  await page.screenshot({ path: join(SHOTS, "desktop-run.png"), fullPage: true });
  await page.getByRole("tab", { name: "Pelvic floor" }).click();
  await page.locator("h2:has-text('Pelvic floor and control')").waitFor();
  await page.screenshot({ path: join(SHOTS, "desktop-pf.png"), fullPage: true });
  await page.close();
});

test("Today: a typical day is three taps above the fold, saved as tapped", async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  // Fresh profile: give it a running plan so the plan row shows.
  await page.evaluate(() => localStorage.setItem("dojo.state", JSON.stringify({ version: 2, plan: { start: "2026-10-21", recovery: false } })));
  await page.reload(); await page.waitForSelector("#panel h2"); // a hash-only goto would not reload, so the seed would never be read
  assert.equal(await page.locator("#panel [aria-pressed=true]").count(), 0, "nothing answered yet");
  const taps = [page.getByRole("button", { name: "Workout done", exact: true }), page.getByRole("button", { name: "Mark done" }), page.locator("[aria-labelledby=t-sets] button", { hasText: "3" })];
  for (const t of taps) { const b = await t.boundingBox(); assert.ok(b.y + b.height <= 844, "above the fold"); }
  await taps[0].click();
  assert.equal(await page.getByLabel("Minutes", { exact: true }).inputValue(), "34", "plan minutes pre-filled");
  await taps[1].click(); await page.locator("text=Day 8 ticked.").waitFor();
  await taps[2].click(); await page.locator("text=Your program starts today").waitFor();
  await page.screenshot({ path: join(SHOTS, "phone-today.png"), fullPage: true });
  const s = await stored(page);
  assert.deepEqual(s.days["2026-10-28"], { s: "done", m: 34, run: true, sets: 3 });
  assert.equal(s.pf.start, "2026-10-28", "first sets answer starts the program");
  await page.reload(); await page.waitForSelector("#panel h2");
  assert.equal(await page.getByRole("button", { name: "Done ✓" }).count(), 1, "answers survive a reload");
  // Tapping the chosen workout again clears it (and its minutes).
  await page.getByRole("button", { name: "Workout done", exact: true }).click();
  assert.deepEqual((await stored(page)).days["2026-10-28"], { run: true, sets: 3 });
  await ctx.close();
});

test("first program answer offers Change, which opens the program start", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  await page.locator("[aria-labelledby=t-sets] button", { hasText: "2" }).click();
  await page.getByRole("button", { name: "Change", exact: true }).click();
  await page.locator("#pf-start").waitFor();
  assert.match(page.url(), /#programs\/pf$/);
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.activeElement.id), "pf-start");
  await ctx.close();
});

test("a day logged in Month survives a reload; demo mode never writes storage", async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28#month/2026-10");
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator("[aria-label='October 15']").click();
  await page.getByRole("button", { name: "Light / partial" }).click();
  await page.getByLabel("Minutes", { exact: true }).fill("15");
  await page.getByRole("button", { name: "Save day" }).click();
  await page.reload(); await page.waitForSelector("#panel h2");
  assert.equal(await page.locator("[aria-label^='October 15, Light / partial']").count(), 1, "view and data both survive");
  const before = await stored(page);
  assert.deepEqual(before.days["2026-10-15"], { s: "light", m: 15 });
  await page.screenshot({ path: join(SHOTS, "phone-month.png"), fullPage: true });
  await open(page, "/?demo=1#month/2026-10");
  await page.locator("[aria-label^='October 3, Rest day']").click();
  await page.getByRole("button", { name: "Clear day" }).click();
  await page.waitForTimeout(100);
  assert.deepEqual(await stored(page), before);
  await ctx.close();
});

test("day editor: focus stays inside, Escape and the close button dismiss, minutes need a status", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1#month/2026-10");
  await page.locator("[aria-label^='October 15, Workout done']").focus();
  await page.keyboard.press("Enter");
  await page.locator("[role=dialog]").waitFor();
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("[role=dialog]")), "focus moved into the dialog");
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("[role=dialog]")), "Tab stays inside the dialog");
  assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("[role=dialog]").count(), 0, "Escape closes");
  assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  assert.match(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), /^October 15, Workout done/, "focus returned to the cell");
  await page.locator("[aria-label^='October 15, Workout done']").click();
  await page.getByRole("button", { name: "Close without saving" }).click();
  assert.equal(await page.locator("[role=dialog]").count(), 0);
  await page.locator("[aria-label^='October 30,']").click();
  await page.getByLabel("Minutes", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Save day" }).click();
  await page.locator("[role=alert]:has-text('Choose Done, Light, Rest or Missed')").waitFor();
  await page.getByRole("button", { name: "Light / partial", exact: true }).click();
  assert.equal(await page.locator("[role=alert]").count(), 0);
  await page.getByRole("button", { name: "Save day" }).click();
  assert.equal(await page.locator("[aria-label^='October 30, Light / partial']").count(), 1);
  await page.close();
});

test("clear day can be undone, and the toast stays while hovered", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1#month/2026-10");
  await page.locator("[aria-label^='October 15, Workout done']").click();
  await page.getByRole("button", { name: "Clear day" }).click();
  assert.equal(await page.locator("[aria-label='October 15']").count(), 1, "cleared");
  await page.getByRole("button", { name: "Undo" }).hover();
  await page.waitForTimeout(8500);
  await page.getByRole("button", { name: "Undo" }).click();
  assert.equal(await page.locator("[aria-label^='October 15, Workout done']").count(), 1, "restored after the normal 8 s");
  await page.close();
});

test("plan tick shows on Today and Month; empty months are blank; This month returns", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1#programs/run");
  await page.locator("button", { hasText: "Wed 28 Oct" }).first().click();
  await page.getByRole("tab", { name: "Today" }).click();
  assert.equal(await page.getByRole("button", { name: "Done ✓" }).count(), 1, "Today's run row agrees");
  await page.getByRole("tab", { name: "Month" }).click();
  assert.equal(await page.locator("[aria-label^='October 28, Workout done']").count(), 1, "plan tick marks the day done");
  await page.locator("text=21 of 24 days trained").waitFor();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.locator("h2:has-text('September 2026')").waitFor();
  const sep = page.locator("[aria-label$=' calendar'] button[aria-label^='September']");
  assert.equal(await sep.count(), 30);
  assert.equal(await sep.first().locator("span > span:nth-child(2), i").count(), 0, "no marker, no dots on past empty days");
  await page.locator("text=0 days trained").waitFor();
  assert.match(page.url(), /#month\/2026-09$/);
  await page.reload(); await page.waitForSelector("#panel h2");
  await page.locator("h2:has-text('September 2026')").waitFor();
  await page.getByRole("button", { name: "This month", exact: true }).click();
  await page.locator("h2:has-text('October 2026')").waitFor();
  await page.close();
});

test("layout: no horizontal scroll on any view at 390 px and 320 px (400% zoom)", async () => {
  for (const w of [390, 320]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    for (const r of ROUTES) {
      await open(page, "/?demo=1" + r);
      if (r.startsWith("#month")) await page.locator("summary:has-text('Month review')").click();
      assert.equal(await width(page), w, `${r} at ${w}`);
      if (w === 390 && r === "#programs/run") await page.screenshot({ path: join(SHOTS, "phone-run.png"), fullPage: true });
    }
    await page.close();
  }
});

test("resizing across the phone breakpoint and back leaves the calendar intact", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await open(page, "/?demo=1#month/2026-10");
  const heads = () => page.evaluate(() => [...document.querySelector("[aria-label$=' calendar']").children].slice(0, 8).map(e => e.textContent).join(","));
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(100);
  assert.equal(await heads(), "M,T,W,T,F,S,S,Wk");
  await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(100);
  assert.equal(await heads(), "Mon,Tue,Wed,Thu,Fri,Sat,Sun,Week");
  await page.close();
});

test("accessibility: axe finds no WCAG 2.1 AA violations on any view, light and dark", async () => {
  const axe = AXE();
  for (const colorScheme of ["light", "dark"]) for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const page = await browser.newPage({ viewport, colorScheme });
    const scan = async where => { await page.addScriptTag({ content: axe }); const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
      assert.deepEqual(r.violations.map(v => `${v.id}: ${v.nodes[0].target.join(" ")}`), [], `${colorScheme} ${viewport.width} ${where}`); };
    await open(page, "/?demo=1#today"); await page.getByRole("button", { name: "Done", exact: true }).click(); await scan("today");
    await open(page, "/?demo=1#month/2026-10"); await page.locator("summary:has-text('Month review')").click(); await scan("month");
    await page.locator("[aria-label^='October 15, Workout done']").click(); await scan("editor"); await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Settings" }).click(); await scan("settings"); await page.keyboard.press("Escape");
    await open(page, "/?demo=1#programs/run"); await scan("running plan");
    await open(page, "/?demo=1#programs/pf"); await scan("pelvic floor");
    await page.close();
  }
});

test("keyboard: view tabs and program tabs use arrows; calendar labels, arrows and skip link", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1#today");
  await page.getByRole("tab", { name: "Today" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.getByRole("tab", { selected: true }).innerText(), "Month");
  assert.equal(await page.locator("#panel").getAttribute("aria-labelledby"), "tab-month");
  assert.equal(await page.locator("[role=tablist][aria-label=Views] [role=tab][tabindex='0']").count(), 1, "roving tabindex");
  assert.equal(await page.locator("[aria-label='October 14, Workout done, 34 minutes, 3 of 3 Kegel sets, test session done']").count(), 1);
  assert.equal(await page.locator("[aria-label='October 28, plan: Run, test session planned, today']").count(), 1);
  await page.locator("[aria-label^='October 15,']").focus();
  await page.keyboard.press("ArrowDown");
  assert.match(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), /^October 22,/);
  await page.keyboard.press("ArrowLeft");
  assert.match(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), /^October 21,/);
  await open(page, "/?demo=1#month/2026-10");
  await page.reload(); await page.waitForSelector("#panel h2"); // fresh document so Tab starts at the top
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Skip to calendar");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "calendar");
  await page.getByRole("tab", { name: "Month" }).focus(); await page.keyboard.press("End");
  assert.equal(await page.getByRole("tab", { selected: true }).first().innerText(), "Programs");
  await page.getByRole("tab", { name: "Running plan" }).focus(); await page.keyboard.press("ArrowRight");
  assert.match(page.url(), /#programs\/pf$/);
  await page.close();
});

test("Settings: theme Auto / Dark / Light is applied and remembered", async () => {
  const ctx = await browser.newContext({ colorScheme: "light" }); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(await bg(), "rgb(245, 247, 250)");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  assert.equal(await bg(), "rgb(15, 22, 38)");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: join(SHOTS, "desktop-dark.png"), fullPage: true });
  await page.reload(); await page.waitForSelector("#panel h2");
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark", "remembered across reloads");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Auto", exact: true }).click();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined);
  assert.equal(await bg(), "rgb(245, 247, 250)", "Auto follows the (light) system");
  await ctx.close();
});

test("theme: Dark picked in Settings sets every token exactly as the system dark theme does", async () => {
  // Every custom property declared on :root, read as computed (var() resolved), so a token missing from either dark block shows up.
  const tokens = page => page.evaluate(() => {
    const names = new Set();
    const walk = rules => { for (const r of rules) { if (r.cssRules) walk(r.cssRules); if (r.style && /:root/.test(r.selectorText || "")) for (const n of r.style) if (n.startsWith("--")) names.add(n); } };
    for (const sh of document.styleSheets) walk(sh.cssRules);
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries([...names].sort().map(n => [n, cs.getPropertyValue(n).trim()]));
  });
  const system = await browser.newContext({ colorScheme: "dark" }); const a = await system.newPage();
  await open(a, "/?demo=1");
  const picked = await browser.newContext({ colorScheme: "light" }); const b = await picked.newPage();
  await b.addInitScript(() => localStorage.setItem("dojo.theme", "dark"));
  await open(b, "/?demo=1");
  const [ta, tb] = [await tokens(a), await tokens(b)];
  assert.equal(ta["--chart-mark"], "#6290E8");
  assert.deepEqual(tb, ta);
  await system.close(); await picked.close();
});

test("discreet mode: no program-specific words on Today, Month or the routine page until asked", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  await page.evaluate(() => localStorage.setItem("dojo.state", JSON.stringify({ version: 2, pf: { start: "2026-10-01", pdays: [1, 3, 5, 0] }, days: { "2026-10-14": { s: "done", sets: 3, practice: "yes", control: 4 } } })));
  await page.reload(); await page.waitForSelector("#panel h2");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByText("Discreet mode", { exact: true }).click();
  await page.keyboard.press("Escape");
  assert.equal((await stored(page)).settings.discreet, true, "stored with the data");
  const SENSITIVE = /pelvic|kegel|arousal|lubricant/i;
  const visibleText = () => page.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("[aria-label]")].map(e => e.getAttribute("aria-label")).join(" "));
  for (const r of ["#today", "#month/2026-10", "#programs/pf"]) {
    await open(page, "/?today=2026-10-28" + r);
    if (r.startsWith("#month")) await page.locator("[aria-label^='October 14,']").click();
    assert.doesNotMatch(await visibleText(), SENSITIVE, r);
    if (r.startsWith("#month")) await page.keyboard.press("Escape");
  }
  await page.screenshot({ path: join(SHOTS, "phone-routine-discreet.png"), fullPage: true });
  await page.getByRole("button", { name: "Show program details" }).click();
  assert.match(await visibleText(), /arousal/i, "details appear when asked");
  await ctx.close();
});

test("plan controls: repeat a week, push back a day, start again, each undoable", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await open(page, "/?demo=1#programs/run");
  await page.getByRole("button", { name: "Repeat week 2" }).click();
  await page.locator("b:has-text('Week 2 · again')").waitFor();
  assert.match(await page.locator("p:has-text(' to ')").first().innerText(), /Wed 21 Oct to Tue 17 Nov/, "plan now ends a week later (28 days)");
  await page.getByRole("button", { name: "Undo" }).click();
  assert.equal(await page.locator("b:has-text('Week 2 · again')").count(), 0, "undo removes the repeat");
  await page.getByRole("button", { name: "Push back a day" }).click();
  await page.locator("text=Today is a pushed-back day").waitFor();
  assert.equal(await page.getByRole("button", { name: "Repeat week 2" }).count(), 1, "the gap belongs to the week it delays");
  await page.getByRole("tab", { name: "Month" }).click();
  assert.equal(await page.locator("[aria-label^='October 29, plan: Run']").count(), 1, "plan day 8 moved to the 29th on the calendar");
  await page.getByRole("tab", { name: "Today" }).click();
  await page.locator("text=Free day: you pushed the plan back").waitFor();
  await page.getByRole("tab", { name: "Programs" }).click();
  await page.getByRole("button", { name: "Start again today" }).click();
  await page.locator("text=Day 1 of 21.").waitFor();
  await page.getByRole("button", { name: "Undo" }).click();
  await page.locator("text=Today is a pushed-back day").waitFor();
  await page.close();
});

test("charts: tooltip on keyboard focus, numbers table, empty state", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await open(page, "/?demo=1#month/2026-10");
  const fig = page.locator("figure:has-text('Minutes per week')");
  await fig.locator("rect[role=img]").first().waitFor();
  await fig.locator("rect[aria-label^='Week of Mon 5 Oct']").focus();
  await fig.locator("div[aria-hidden=true]:has-text('154 minutes')").waitFor();
  await fig.locator("summary:has-text('Show numbers')").click();
  assert.equal(await fig.locator("tbody tr").count(), 5);
  // September's last week (28 Sep - 4 Oct) has October minutes, by design; August has none.
  await page.getByRole("button", { name: "Previous month" }).click(); await page.getByRole("button", { name: "Previous month" }).click();
  await page.locator("figure:has-text('No minutes logged in these weeks yet')").waitFor();
  await open(page, "/?demo=1#programs/pf");
  const ctl = page.locator("figure:has-text('Control over time')");
  // Charts draw after measuring their width (ResizeObserver), so wait for the marks before counting them.
  await ctl.locator("circle").first().waitFor();
  assert.equal(await ctl.locator("circle").count(), 12, "last 12 rated sessions");
  await ctl.locator("rect[role=img]").last().focus();
  await ctl.locator("div[aria-hidden=true]:has-text('/ 5')").waitFor();
  await page.close();
});

test("Month shortcuts: arrows and T change month, but not while typing or inside the calendar", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1#month/2026-10");
  await page.locator("h1").click();
  await page.keyboard.press("ArrowRight"); await page.locator("h2:has-text('November 2026')").waitFor();
  await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await page.locator("h2:has-text('September 2026')").waitFor();
  await page.keyboard.press("t"); await page.locator("h2:has-text('October 2026')").waitFor();
  await page.locator("[aria-label^='October 15,']").focus(); await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("h2:has-text('October 2026')").count(), 1, "calendar arrows move days, not months");
  await page.locator("summary:has-text('Month review')").click();
  await page.getByLabel("Goal").focus(); await page.keyboard.press("ArrowLeft"); await page.keyboard.type("t");
  assert.equal(await page.locator("h2:has-text('October 2026')").count(), 1, "typing is never a shortcut");
  await page.close();
});

test("swipe on the calendar changes month; the streak line explains itself", async () => {
  const ctx = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await open(page, "/?demo=1#month/2026-10");
  const swipe = (x0, x1) => page.locator("#calendar").evaluate((el, [a, b]) => {
    const t = x => new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 });
    el.dispatchEvent(new TouchEvent("touchstart", { touches: [t(a)], changedTouches: [t(a)], bubbles: true }));
    el.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [t(b)], bubbles: true }));
  }, [x0, x1]);
  await swipe(300, 120); await page.locator("h2:has-text('November 2026')").waitFor();
  await swipe(120, 300); await page.locator("h2:has-text('October 2026')").waitFor();
  await swipe(200, 170); assert.equal(await page.locator("h2:has-text('October 2026')").count(), 1, "short drags are ignored");
  await open(page, "/?demo=1#today");
  await page.locator("text=Current streak: 13 days, since Sun 11 Oct.").waitFor(); // demo: 28th blank, rests neutral, 10th missed
  await page.locator("text=Before that, Sat 10 Oct was missed.").waitFor();
  await ctx.close();
});

// Wait until a service worker controls the page (first visit installs it; clients.claim() takes over).
const controlled = page => page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 15000 });

test("installable: Chrome reports no installability errors; manifest and icons load", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1");
  await controlled(page);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  assert.deepEqual(installabilityErrors, []);
  const manifest = await (await page.request.get(base + "/manifest.webmanifest")).json();
  for (const i of manifest.icons) assert.equal((await page.request.get(base + "/" + i.src)).status(), 200, i.src);
  await page.close();
});

test("offline: after one visit the app and its data load with no network", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28#month/2026-10");
  await page.locator("[aria-label='October 15']").click();
  await page.getByRole("button", { name: "Workout done", exact: true }).click();
  await page.getByRole("button", { name: "Save day" }).click();
  await controlled(page);
  await ctx.setOffline(true);
  await page.reload(); await page.waitForSelector("#panel h2");
  assert.equal(await page.locator("[aria-label^='October 15, Workout done']").count(), 1, "app shell and saved data, offline");
  await page.getByRole("tab", { name: "Programs" }).click(); await page.locator("text=21-day running start").waitFor();
  await ctx.close();
});

test("update: a new version waits for Reload instead of reloading by itself", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  await controlled(page);
  await page.evaluate(() => { window.__sameDocument = true; });
  swSuffix = "\n// next release";
  try {
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()));
    await page.locator("text=A new version of Dojo is ready.").waitFor({ timeout: 15000 });
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__sameDocument), true, "no automatic reload");
    await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Reload" }).click()]);
    await page.waitForSelector("#panel h2");
    assert.equal(await page.evaluate(() => window.__sameDocument), undefined, "reloaded onto the new version");
    assert.equal(await page.locator("text=A new version of Dojo is ready.").count(), 0);
  } finally { swSuffix = ""; await ctx.close(); }
});

test("reminder: banner after the chosen time when nothing is logged, once a day", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28&now=18:00");
  await page.evaluate(() => localStorage.setItem("dojo.state", JSON.stringify({ version: 2, settings: { reminder: { on: true, time: "19:00" } } })));
  await page.reload(); await page.waitForSelector("#panel h2");
  await page.waitForTimeout(300);
  assert.equal(await page.locator("text=Nothing logged yet today.").count(), 0, "not before 19:00");
  await open(page, "/?today=2026-10-28&now=20:00#month/2026-10"); // a real navigation (the query changed); no extra reload, which would use up today's reminder
  await page.locator("text=Nothing logged yet today.").waitFor();
  await page.getByRole("button", { name: "Log today" }).click();
  assert.match(page.url(), /#today$/);
  await page.locator("[aria-labelledby=t-sets] button", { hasText: "3" }).click();
  assert.equal(await page.locator("text=Nothing logged yet today.").count(), 0, "goes away once something is logged");
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("dojo.state")); delete s.days["2026-10-28"]; localStorage.setItem("dojo.state", JSON.stringify(s)); });
  await page.reload(); await page.waitForSelector("#panel h2"); await page.waitForTimeout(300);
  assert.equal(await page.locator("text=Nothing logged yet today.").count(), 0, "only once a day");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("input[type=time]").waitFor();
  await page.addScriptTag({ content: AXE() });
  const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
  assert.deepEqual(r.violations.map(v => v.id), [], "Settings with the reminder on passes axe");
  await ctx.close();
});

test("performance budget: first load under 350 KB", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  let bytes = 0; page.on("response", async r => { try { bytes += (await r.body()).length; } catch { /* redirects */ } });
  await open(page, "/?demo=1"); await page.waitForLoadState("networkidle");
  assert.ok(bytes <= 350 * 1024, `first load was ${(bytes / 1024).toFixed(0)} KB`);
  console.log(`# first load ${(bytes / 1024).toFixed(0)} KB`);
  await ctx.close();
});

test("Start today: one tap starts the plan from Programs or Today, with Undo; card taps ask for a start first", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28#programs/run");
  await page.locator("text=Not started yet.").waitFor();
  await page.locator("button", { hasText: /^01/ }).click();
  await page.locator("text=Start the plan first").waitFor();
  assert.equal((await stored(page)) ?.days ?? null, null, "tapping a card before starting saves nothing");
  await page.addScriptTag({ content: AXE() });
  const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
  assert.deepEqual(r.violations.map(v => v.id), [], "not-started state passes axe");
  await page.getByRole("button", { name: "Start today", exact: true }).click();
  await page.locator("text=Day 1 of 21.").waitFor();
  assert.equal((await stored(page)).plan.start, "2026-10-28");
  assert.equal(await page.locator("text=Wed 28 Oct").count() > 0, true, "cards show dates");
  await page.getByRole("button", { name: "Undo" }).click();
  await page.locator("text=Not started yet.").waitFor();
  assert.equal((await stored(page)).plan.start, null, "undo puts it back to not started");
  await page.getByRole("tab", { name: "Today" }).click();
  await page.locator("text=No running plan yet.").waitFor();
  await page.getByRole("button", { name: "Start today", exact: true }).click();
  await page.getByRole("button", { name: "Mark done" }).waitFor();
  assert.match(await page.locator("#t-run").locator("..").innerText(), /Day 1 of 21/);
  await ctx.close();
});
