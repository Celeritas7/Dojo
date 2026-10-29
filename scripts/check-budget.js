// Performance budget (docs/design/phase5-spec.md). The first-load byte budget is measured in the browser tests;
// this checks the bundle, which is what grows with code.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const LIMIT_GZ_KB = 80;
const gz = gzipSync(readFileSync("dist/app.js")).length / 1024;
console.log(`dist/app.js: ${gz.toFixed(1)} KB gzipped (budget ${LIMIT_GZ_KB} KB)`);
if (gz > LIMIT_GZ_KB) { console.error(`Over budget by ${(gz - LIMIT_GZ_KB).toFixed(1)} KB.`); process.exit(1); }
