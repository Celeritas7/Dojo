// Bundles src/main.jsx (+ the component library and production React) into dist/app.js.
//   node scripts/build.js          one build
//   node scripts/build.js --watch  rebuild on change
//   node scripts/build.js --dev    unminified, development React (readable errors)
import * as esbuild from "esbuild";
import { statSync } from "node:fs";

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
  const ctx = await esbuild.context(opts);
  await ctx.watch();
} else {
  await esbuild.build(opts);
  console.log(`dist/app.js ${(statSync("dist/app.js").size / 1024).toFixed(0)} KB`);
}
