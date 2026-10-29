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
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".map": "application/json" };
let server, browser, base;

before(async () => {
  assert.ok(existsSync(join(ROOT, "dist/app.js")), "dist/app.js missing: run `npm run build` first");
  server = http.createServer((req, res) => {
    const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^\/+/, "") || "index.html";
    const f = join(ROOT, p); if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); createReadStream(f).pipe(res);
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
