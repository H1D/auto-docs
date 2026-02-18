#!/usr/bin/env node

/**
 * Validates TOON syntax in .toon files and ```toon blocks embedded in .md files.
 * Usage: node validate.mjs [docs-dir]
 * Default docs-dir: .claude/docs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { decode } from "@toon-format/toon";

const docsDir = process.argv[2] || ".claude/docs";

let totalFiles = 0;
let totalBlocks = 0;
let errors = [];

function walkDir(dir) {
  let files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files = files.concat(walkDir(full));
      } else {
        files.push(full);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return files;
}

function validateToon(content, source) {
  try {
    decode(content, { strict: true });
    return null;
  } catch (e) {
    return { source, message: e.message };
  }
}

function extractToonBlocks(mdContent) {
  const blocks = [];
  const regex = /^```toon\s*\n([\s\S]*?)^```\s*$/gm;
  let match;
  let blockIndex = 0;
  while ((match = regex.exec(mdContent)) !== null) {
    blockIndex++;
    const content = match[1];
    // Calculate line number of this block
    const lineNum = mdContent.slice(0, match.index).split("\n").length;
    blocks.push({ content, blockIndex, lineNum });
  }
  return blocks;
}

// Collect all files
const allFiles = walkDir(docsDir);

// Validate .toon files
for (const file of allFiles.filter((f) => f.endsWith(".toon"))) {
  totalFiles++;
  const content = readFileSync(file, "utf-8");
  const rel = relative(process.cwd(), file);
  const err = validateToon(content, rel);
  if (err) {
    errors.push(err);
  } else {
    totalBlocks++;
  }
}

// Validate ```toon blocks in .md files
for (const file of allFiles.filter((f) => f.endsWith(".md"))) {
  const content = readFileSync(file, "utf-8");
  const rel = relative(process.cwd(), file);
  const blocks = extractToonBlocks(content);
  if (blocks.length > 0) {
    totalFiles++;
    for (const block of blocks) {
      totalBlocks++;
      const err = validateToon(
        block.content,
        `${rel}:${block.lineNum} (toon block #${block.blockIndex})`
      );
      if (err) {
        errors.push(err);
      }
    }
  }
}

// Report
if (totalBlocks === 0) {
  console.log(`No TOON content found in ${docsDir}`);
  process.exit(0);
}

console.log(
  `Validated ${totalBlocks} TOON block(s) across ${totalFiles} file(s)\n`
);

if (errors.length === 0) {
  console.log("All TOON blocks are valid.");
} else {
  console.log(`Found ${errors.length} error(s):\n`);
  for (const err of errors) {
    console.log(`  ERROR in ${err.source}`);
    console.log(`    ${err.message}\n`);
  }
  process.exit(1);
}
