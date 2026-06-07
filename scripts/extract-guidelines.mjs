#!/usr/bin/env node
// Extract paragraphs from guidelines/high-risk/*.md into a flat JSON keyed by
// paragraph number, so badges that cite "(122)-(124)" can show the matching
// excerpt in a modal at runtime.
//
// Run when the guidelines markdown changes:
//   node scripts/extract-guidelines.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const guidelinesRoot = join(repoRoot, "guidelines");
const outDir = join(repoRoot, "src", "data");
const outFile = join(outDir, "guidelinesParagraphs.json");

function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const files = walkMarkdown(guidelinesRoot);
const paragraphs = {};

for (const fullPath of files) {
  const text = readFileSync(fullPath, "utf8");
  const filename = relative(guidelinesRoot, fullPath);

  // Section title: take the H1 "# 3.X. Title" line.
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const section = titleMatch ? titleMatch[1].trim() : basename(filename, ".md");

  // Split on paragraph anchors of the form `**(N)**`. Each match starts a new
  // paragraph; the block runs until the next `**(N)**` anchor or end of file.
  const re = /\*\*\((\d{1,4})\)\*\*\s*/g;
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push({ num: m[1], start: m.index, bodyStart: m.index + m[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const { num, bodyStart } = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length;
    const body = text.slice(bodyStart, end).trim();
    paragraphs[num] = { section, sourceFile: filename, text: body };
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(paragraphs, null, 2) + "\n", "utf8");

const count = Object.keys(paragraphs).length;
console.log(`wrote ${outFile} (${count} paragraphs from ${files.length} files)`);
