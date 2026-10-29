// Bundles src/main.jsx (+ the component library and production React) into dist/app.js.
//   node scripts/build.js          one build
//   node scripts/build.js --watch  rebuild on change
//   node scripts/build.js --dev    unminified, development React (readable errors)
import * as esbuild from "esbuild";
import { statSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Everything the app needs offline. sw.js is generated from src/sw.template.js with a hash of these files.
const ASSETS = ["./", "index.html", "manifest.webmanifest", "css/fonts.css", "css/styles.css", "css/base.css", "dist/app.js",
  ...["400", "500", "600"].map(w => `fonts/barlow-${w}.woff2`), ...["500", "600", "700", "800"].map(w => `fonts/barlow-condensed-${w}.woff2`),
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
function writeServiceWorker() {
  const hash = createHash("sha256");
  for (const a of ASSETS) if (a !== "./") hash.update(a).update(readFileSync(a));
  const version = hash.digest("hex").slice(0, 12);
  const sw = readFileSync("src/sw.template.js", "utf8").replaceAll("__VERSION__", version).replaceAll("__ASSETS__", JSON.stringify(ASSETS.map(a => a === "./" ? a : "./" + a)));
  if (/__[A-Z]+__/.test(sw)) throw new Error("sw.js: unfilled placeholder");
  writeFileSync("sw.js", sw);
  console.log(`sw.js cache dojo-${version}`);
}

const dev = process.argv.includes("--dev");
const opts = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: !dev,
  sourcemap: "linked",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": dev ? '"development"' : '"production"' },
  outfile: "dist/app.js",
  logLevel: "info",
};
if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context({ ...opts, plugins: [{ name: "sw", setup: b => b.onEnd(() => writeServiceWorker()) }] });
  await ctx.watch();
} else {
  await esbuild.build(opts);
  writeServiceWorker();
  console.log(`dist/app.js ${(statSync("dist/app.js").size / 1024).toFixed(0)} KB`);
}
