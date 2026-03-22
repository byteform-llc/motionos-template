#!/usr/bin/env node
/**
 * Builds two WebContainer filesystem snapshots and writes them to /tmp/wc-snapshots/:
 *   files.json.gz        — source files (excluding node_modules)
 *   node_modules.json.gz — pre-installed node_modules
 *
 * Snapshot JSON format (compatible with WebContainer mount() API):
 *   Text files:   { file: { contents: string } }
 *   Binary files: { file: { contents: string (base64), binary: true } }
 *   Symlinks:     { file: { symlink: string } }
 *   Directories:  { directory: { ...children } }
 */

import { readFile, lstat, mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";
import { put } from "@vercel/blob";
import {
  ROOT,
  EXCLUDE_SOURCE_NAMES,
  EXCLUDE_SOURCE_PATHS,
  EXCLUDE_NM_DIRS,
  EXCLUDE_NM_EXTS,
  buildTree,
  printTree,
} from "./snapshot-utils.mjs";

const OUTPUT = "/tmp/wc-snapshots";

// ── Streaming JSON writer ─────────────────────────────────────────────────────
// Writes JSON to a stream token-by-token to avoid building a giant string.
function write(stream, data) {
  return new Promise((resolve, reject) => {
    const ok = stream.write(data);
    if (ok) return resolve();
    stream.once("drain", resolve);
    stream.once("error", reject);
  });
}

async function writeJsonValue(value, stream) {
  if (value === null) {
    await write(stream, "null");
  } else if (typeof value === "boolean" || typeof value === "number") {
    await write(stream, String(value));
  } else if (typeof value === "string") {
    await write(stream, JSON.stringify(value));
  } else if (typeof value === "object") {
    await write(stream, "{");
    const entries = Object.entries(value);
    for (let i = 0; i < entries.length; i++) {
      if (i > 0) await write(stream, ",");
      await write(stream, JSON.stringify(entries[i][0]) + ":");
      await writeJsonValue(entries[i][1], stream);
    }
    await write(stream, "}");
  }
}

// ── Compress to disk then upload to Vercel Blob ───────────────────────────────
async function compressAndUpload(label, tree, filename) {
  const outPath = join(OUTPUT, filename);
  process.stdout.write(`  Streaming ${label}…\n`);

  const gzip = createGzip({ level: 9 });
  const dest = createWriteStream(outPath);
  const pipePromise = pipeline(gzip, dest);
  await writeJsonValue(tree, gzip);
  gzip.end();
  await pipePromise;

  const { size } = await lstat(outPath);
  process.stdout.write(`  Gzipped: ${(size / 1024 / 1024).toFixed(1)} MB\n`);

  process.stdout.write(`  Uploading to Vercel Blob…\n`);
  const blob = await readFile(outPath);
  const result = await put(`snapshots/${filename}`, blob, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/gzip",
    allowOverwrite: true,
  });
  process.stdout.write(`  Uploaded → ${result.url}\n`);
  return result.url;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(OUTPUT, { recursive: true });

  const skipNodeModules = process.env.SKIP_NODE_MODULES === "true";

  // 1. Source files (always)
  console.log("[1/2] Building source files snapshot…");
  const filesTree = await buildTree(ROOT, {
    excludeNames: EXCLUDE_SOURCE_NAMES,
    excludePaths: EXCLUDE_SOURCE_PATHS,
  });
  console.log(`files/\n${printTree(filesTree)}`);
  const filesUrl = await compressAndUpload("files", filesTree, "files.json.gz");

  // 2. node_modules (skippable when package.json unchanged)
  if (skipNodeModules) {
    console.log(
      "\n[2/2] Skipping node_modules snapshot (package.json unchanged).",
    );
  } else {
    console.log("\n[2/2] Building node_modules snapshot…");
    const nmTree = await buildTree(join(ROOT, "node_modules"), {
      excludeDirs: EXCLUDE_NM_DIRS,
      excludeExts: EXCLUDE_NM_EXTS,
    });
    const nmUrl = await compressAndUpload(
      "node_modules",
      nmTree,
      "node_modules.json.gz",
    );
    console.log(`\n  node_modules URL: ${nmUrl}`);
  }

  console.log(`\n  files URL: ${filesUrl}`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
