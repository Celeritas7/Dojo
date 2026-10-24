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
  await page.goto(base + url); await page.waitForSelector("[role=grid]");
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
  await page.reload(); await page.waitForSelector("[role=grid]");
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

test("check-in writes today's record and sets the program start", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await open(page, "/?today=2026-10-28");
  await page.getByRole("button", { name: "2", exact: true }).first().click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.locator("text=Pelvic floor 2/3 sets").waitFor();
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("dojo.state")));
  assert.deepEqual(stored.days["2026-10-28"], { sets: 2 }); assert.equal(stored.pf.start, "2026-10-28");
  await ctx.close();
});
