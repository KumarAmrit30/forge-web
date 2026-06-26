/**
 * Optimize all illustration SVGs with SVGO and report size delta.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, relative } from "path";
import { optimize } from "svgo";
import config from "../svgo.config.mjs";

const ROOT = join(import.meta.dirname, "..", "public/assets/illustrations");

function walkSvgs(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkSvgs(path));
    else if (entry.name.endsWith(".svg")) files.push(path);
  }
  return files;
}

function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

const files = walkSvgs(ROOT).sort();
let beforeTotal = 0;
let afterTotal = 0;
/** @type {Array<{ file: string; before: number; after: number; viewBox: string | null }>} */
const rows = [];

for (const file of files) {
  const before = readFileSync(file, "utf8");
  beforeTotal += Buffer.byteLength(before, "utf8");

  const result = optimize(before, {
    ...config,
    path: file,
  });

  if ("error" in result && result.error) {
    console.error(`FAILED ${relative(ROOT, file)}: ${result.error}`);
    process.exitCode = 1;
    continue;
  }

  const optimized = result.data;
  afterTotal += Buffer.byteLength(optimized, "utf8");

  const viewBoxMatch = optimized.match(/viewBox="([^"]+)"/);
  rows.push({
    file: relative(ROOT, file),
    before: Buffer.byteLength(before, "utf8"),
    after: Buffer.byteLength(optimized, "utf8"),
    viewBox: viewBoxMatch?.[1] ?? null,
  });

  writeFileSync(file, optimized, "utf8");
}

const saved = beforeTotal - afterTotal;
const pct = beforeTotal > 0 ? ((saved / beforeTotal) * 100).toFixed(1) : "0";

console.log("SVGO optimization complete\n");
console.log(`Files:        ${files.length}`);
console.log(`Before:       ${formatBytes(beforeTotal)} (${beforeTotal.toLocaleString()} bytes)`);
console.log(`After:        ${formatBytes(afterTotal)} (${afterTotal.toLocaleString()} bytes)`);
console.log(`Saved:        ${formatBytes(saved)} (${saved.toLocaleString()} bytes, −${pct}%)`);

const missingViewBox = rows.filter((r) => !r.viewBox);
if (missingViewBox.length) {
  console.log(`\nWarning: ${missingViewBox.length} file(s) missing viewBox after optimization:`);
  missingViewBox.forEach((r) => console.log(`  - ${r.file}`));
}

const topSavings = [...rows]
  .sort((a, b) => b.before - b.after - (a.before - a.after))
  .slice(0, 5);

console.log("\nLargest savings:");
for (const r of topSavings) {
  const delta = r.before - r.after;
  if (delta <= 0) continue;
  console.log(
    `  ${r.file}: ${formatBytes(r.before)} → ${formatBytes(r.after)} (−${formatBytes(delta)})`
  );
}
