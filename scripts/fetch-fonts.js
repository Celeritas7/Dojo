// One-off: downloads the latin subset of Barlow + Barlow Condensed from Google Fonts into fonts/ and writes css/fonts.css.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const url = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap";
const css = execFileSync("curl", ["-sS", "-A", UA, url], { encoding: "utf8" });
const faces = [...css.matchAll(/@font-face \{([^}]*)\}/g)].map(m => m[1]).filter(b => /unicode-range: U\+0000-00FF/.test(b));
let out = "/* Self-hosted latin subsets of Barlow and Barlow Condensed (SIL Open Font License). Fetched by scripts/fetch-fonts.js */\n";
for (const b of faces) {
  const family = b.match(/font-family: '([^']+)'/)[1], weight = b.match(/font-weight: (\d+)/)[1], src = b.match(/url\((https:[^)]+)\)/)[1];
  const file = `${family.toLowerCase().replace(/ /g, "-")}-${weight}.woff2`;
  execFileSync("curl", ["-sS", "-o", `fonts/${file}`, src]);
  out += `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url("../fonts/${file}") format("woff2")}\n`;
  console.log(file);
}
writeFileSync("css/fonts.css", out);
