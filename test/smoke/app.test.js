// Browser smoke test: serves the repo, loads the built app, logs a day, reloads, checks it stuck. Also saves screenshots to test/screenshots/.
// Run `npm run build` first. Needs Playwright's Chromium (PLAYWRIGHT_BROWSERS_PATH or `npx playwright install chromium`).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
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
  await page.goto(base + url); await page.waitForSelector("[aria-label$=' calendar']");
  return errors;
};

test("loads with no console errors, no CDN requests, and renders the demo", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const external = []; page.on("request", r => { if (!r.url().startsWith(base)) external.push(r.url()); });
  const errors = await open(page, "/?demo=1");
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await assert.doesNotReject(page.locator("h2:has-text('October 2026')").waitFor());
  assert.equal(await page.locator("[aria-label='October 10, Missed']").count(), 1);
  assert.match(await page.locator("text=Days trained").locator("..").innerText(), /20\/24/);
  await page.screenshot({ path: join(SHOTS, "desktop-sheet.png"), fullPage: true });
  await page.getByRole("tab", { name: "Running plan" }).click();
  await page.locator("text=Day 8 of 21").waitFor();
  await page.screenshot({ path: join(SHOTS, "desktop-run.png"), fullPage: true });
  await page.close();
});

test("a logged day survives a reload; demo mode never writes storage", async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator("[aria-label='October 15']").click();
  await page.getByRole("button", { name: "Light / partial" }).click();
  await page.getByLabel("Minutes").fill("15");
  await page.getByRole("button", { name: "Save day" }).click();
  assert.equal(await page.locator("[aria-label='October 15, Light / partial']").count(), 1);
  await page.reload(); await page.waitForSelector("[aria-label$=' calendar']");
  assert.equal(await page.locator("[aria-label='October 15, Light / partial']").count(), 1);
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("dojo.state")));
  assert.deepEqual(stored.days["2026-10-15"], { s: "light", m: 15 });
  await page.screenshot({ path: join(SHOTS, "phone-sheet.png"), fullPage: true });
  // Demo mode must not touch what is stored.
  await open(page, "/?demo=1");
  await page.locator("[aria-label='October 3, Rest day']").click();
  await page.getByRole("button", { name: "Clear day" }).click();
  await page.waitForTimeout(100);
  assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem("dojo.state"))), stored);
  await ctx.close();
});

test("check-in starts unanswered, writes today's record and announces the program start", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  assert.equal(await page.locator("section [aria-pressed=true]").count(), 0, "nothing in the check-in should be pressed before answering");
  await page.getByRole("button", { name: "0", exact: true }).first().click();
  await page.locator("text=Your program starts today").waitFor();
  assert.equal(await page.getByRole("button", { name: "Done for today", exact: true }).count(), 1, "0 sets counts as an answer");
  await page.getByRole("button", { name: "2", exact: true }).first().click();
  await page.getByRole("button", { name: "Done for today", exact: true }).click();
  await page.locator("text=Pelvic floor 2/3 sets").waitFor();
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("dojo.state")));
  assert.deepEqual(stored.days["2026-10-28"], { sets: 2 }); assert.equal(stored.pf.start, "2026-10-28");
  await ctx.close();
});

test("day editor: focus stays inside, Escape and the close button dismiss, minutes need a status", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  await page.locator("[aria-label='October 15, Workout done']").focus();
  await page.keyboard.press("Enter");
  await page.locator("[role=dialog]").waitFor();
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("[role=dialog]")), "focus moved into the dialog");
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("[role=dialog]")), "Tab stays inside the dialog");
  assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("[role=dialog]").count(), 0, "Escape closes");
  assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "October 15, Workout done", "focus returned to the cell");
  await page.locator("[aria-label='October 15, Workout done']").click();
  await page.getByRole("button", { name: "Close without saving" }).click();
  assert.equal(await page.locator("[role=dialog]").count(), 0);
  // Minutes without a status are refused with a message; picking a status clears it.
  await page.locator("[aria-label='October 30']").click();
  await page.getByLabel("Minutes").fill("25");
  await page.getByRole("button", { name: "Save day" }).click();
  await page.locator("[role=alert]:has-text('Choose Done, Light, Missed or Rest')").waitFor();
  assert.equal(await page.locator("[role=dialog]").count(), 1);
  await page.getByRole("button", { name: "Light / partial", exact: true }).click();
  assert.equal(await page.locator("[role=alert]").count(), 0);
  await page.getByRole("button", { name: "Save day" }).click();
  assert.equal(await page.locator("[aria-label='October 30, Light / partial']").count(), 1);
  await ctx.close();
});

test("clear day can be undone from the toast", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  await page.locator("[aria-label='October 15, Workout done']").click();
  await page.getByRole("button", { name: "Clear day" }).click();
  assert.equal(await page.locator("[aria-label='October 15']").count(), 1, "cleared");
  await page.getByRole("button", { name: "Undo" }).click();
  assert.equal(await page.locator("[aria-label='October 15, Workout done']").count(), 1, "restored");
  await ctx.close();
});

test("ticking a plan day shows on the sheet; past empty days are blank; Today button returns", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  await page.getByRole("tab", { name: "Running plan" }).click();
  await page.locator("button", { hasText: "Wed 28 Oct" }).first().click();
  await page.getByRole("tab", { name: "Monthly sheet" }).click();
  assert.equal(await page.locator("[aria-label='October 28, Workout done']").count(), 1, "plan tick marks the sheet day done");
  assert.match(await page.locator("text=Days trained").locator("..").innerText(), /21\/24/);
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.locator("h2:has-text('September 2026')").waitFor();
  // September has nothing logged: no status markers and no Kegel dots on its (past) days.
  const sep = page.locator("[aria-label$=' calendar'] button[aria-label^='September']");
  assert.equal(await sep.count(), 30);
  assert.equal(await sep.first().locator("span > span:nth-child(2), i").count(), 0, "no marker, no dots");
  assert.equal(await page.locator("text=Running plan days").count(), 0, "plan stat hidden outside the plan months");
  assert.match(await page.locator("text=Days trained").locator("..").innerText(), /^0\n/);
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.locator("h2:has-text('October 2026')").waitFor();
  assert.equal(await page.getByRole("button", { name: "Today", exact: true }).count(), 0);
  await ctx.close();
});

test("phone layout: no horizontal scroll on either tab or with sections open", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await open(page, "/?demo=1");
  const width = () => page.evaluate(() => document.documentElement.scrollWidth);
  assert.equal(await width(), 390, "monthly sheet");
  for (const s of ["Running plan:", "Pelvic floor program", "Backup and data"]) await page.locator(`summary:has-text('${s}')`).click();
  assert.equal(await width(), 390, "sheet with every section open");
  await page.screenshot({ path: join(SHOTS, "phone-sheet-open.png"), fullPage: true });
  await page.getByRole("tab", { name: "Running plan" }).click();
  assert.equal(await width(), 390, "running plan");
  await page.screenshot({ path: join(SHOTS, "phone-run.png"), fullPage: true });
  await page.close();
});

test("resizing across the phone breakpoint and back leaves the calendar intact", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await open(page, "/?demo=1");
  const heads = () => page.evaluate(() => [...document.querySelector("[aria-label$=' calendar']").children].slice(0, 8).map(e => e.textContent).join(","));
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(100);
  assert.equal(await heads(), "M,T,W,T,F,S,S,Wk");
  await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(100);
  assert.equal(await heads(), "Mon,Tue,Wed,Thu,Fri,Sat,Sun,Week");
  await page.close();
});

test("tabs: arrow keys move selection, panel is labelled by the selected tab", async () => {
  const page = await browser.newPage();
  await open(page, "/?demo=1");
  await page.getByRole("tab", { name: "Monthly sheet" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.getByRole("tab", { selected: true }).innerText(), "Running plan");
  assert.equal(await page.locator("[role=tabpanel]").getAttribute("aria-labelledby"), "tab-run");
  await page.keyboard.press("Home");
  assert.equal(await page.getByRole("tab", { selected: true }).innerText(), "Monthly sheet");
  assert.equal(await page.locator("[role=tab][tabindex='0']").count(), 1, "roving tabindex");
  await page.close();
});

test("first check-in offers Change, which opens the program section", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  await page.getByRole("button", { name: "3", exact: true }).first().click();
  await page.getByRole("button", { name: "Change", exact: true }).click();
  await page.locator("#pf-program[open]").waitFor();
  await page.waitForTimeout(150);
  assert.equal(await page.locator("#pf-program[open]").count(), 1, "stays open after the native toggle event");
  await ctx.close();
});

test("theme switch cycles Auto → Dark → Light and is remembered", async () => {
  const ctx = await browser.newContext({ colorScheme: "light" }); const page = await ctx.newPage();
  await open(page, "/?demo=1");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(await bg(), "rgb(245, 247, 250)");
  await page.getByRole("button", { name: /Theme: Auto/ }).click();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark");
  assert.equal(await bg(), "rgb(15, 22, 38)");
  await page.screenshot({ path: join(SHOTS, "desktop-dark.png"), fullPage: true });
  await page.reload(); await page.waitForSelector("[aria-label$=' calendar']");
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark", "remembered across reloads");
  await page.getByRole("button", { name: /Theme: Dark/ }).click();
  assert.equal(await bg(), "rgb(245, 247, 250)");
  await page.getByRole("button", { name: /Theme: Light/ }).click();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined, "back to Auto");
  await ctx.close();
  const dark = await browser.newContext({ colorScheme: "dark" }); const p2 = await dark.newPage();
  await open(p2, "/?demo=1");
  assert.equal(await p2.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(15, 22, 38)", "Auto follows the system");
  await dark.close();
});
