// Renders the app icon (icons/icon.svg) to the PNG sizes the manifest and iOS need. Run after changing the SVG:
//   node scripts/make-icons.js
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync("icons/icon.svg", "utf8");
// Maskable: full-bleed square, artwork kept inside the 80% safe zone (the disc is 300/512 = 59%).
const fullBleed = svg.replace('rx="112"', 'rx="0"');
const jobs = [["icon-192.png", 192, svg, true], ["icon-512.png", 512, svg, true], ["maskable-192.png", 192, fullBleed, false], ["maskable-512.png", 512, fullBleed, false], ["apple-touch-icon.png", 180, fullBleed, false]];
const browser = await chromium.launch();
for (const [name, size, art, transparent] of jobs) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${art}`);
  await page.screenshot({ path: `icons/${name}`, omitBackground: transparent });
  await page.close();
  console.log(`icons/${name}`);
}
await browser.close();
