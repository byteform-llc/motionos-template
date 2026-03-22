#!/usr/bin/env node
/**
 * Builds two WebContainer filesystem snapshots and writes them to /tmp/wc-snapshots/:
 *   files-{commitSha}.json.gz       — source files (excluding node_modules)
 *   node_modules-{packageHash}.json.gz — pre-installed node_modules
 *   snapshot.env                    — shell-sourceable vars for the upload step
 *
 * Snapshot JSON format (compatible with WebContainer mount() API):
 *   Text files:   { file: { contents: string } }
 *   Binary files: { file: { contents: string (base64), binary: true } }
 *   Symlinks:     { symlink: { target: string } }
 *   Directories:  { directory: { ...children } }
 */

import { readdir, readFile, lstat, readlink, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

const ROOT = process.cwd();
const OUTPUT = "/tmp/wc-snapshots";

// ── Source file exclusions ────────────────────────────────────────────────────
const EXCLUDE_SOURCE = new Set([
  "node_modules",
  ".git",
  "build",
  "out",
  "dist",
  "scripts",
  ".github",
]);

// ── node_modules exclusions (reduce snapshot size) ───────────────────────────
// Directory names to skip anywhere inside node_modules
const EXCLUDE_NM_DIRS = new Set([
  "test",
  "tests",
  "__tests__",
  "spec",
  "specs",
  "__mocks__",
  "docs",
  "doc",
  "documentation",
  "example",
  "examples",
  "demo",
  "demos",
  "benchmark",
  "benchmarks",
  "bench",
  ".github",
  ".vscode",
]);

// File extensions to skip inside node_modules
const EXCLUDE_NM_EXTS = new Set([".map"]); // source maps – large, not needed at runtime

// ── Helpers ───────────────────────────────────────────────────────────────────
function isBinary(buf) {
  const len = Math.min(buf.length, 8192);
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

function ext(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i);
}

// ── Tree builder ─────────────────────────────────────────────────────────────
async function buildTree(dir, opts = {}) {
  const {
    excludeNames = new Set(),
    excludeDirs = new Set(),
    excludeExts = new Set(),
    visitedInodes = new Set(),
  } = opts;

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return {};
  }

  const tree = {};

  for (const entry of entries) {
    if (excludeNames.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);

    try {
      if (entry.isSymbolicLink()) {
        const target = await readlink(fullPath);
        tree[entry.name] = { file: { symlink: target } };
      } else if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        const stat = await lstat(fullPath);
        if (visitedInodes.has(stat.ino)) continue; // guard against circular symlinks
        const subtree = await buildTree(fullPath, {
          excludeNames,
          excludeDirs,
          excludeExts,
          visitedInodes: new Set([...visitedInodes, stat.ino]),
        });
        tree[entry.name] = { directory: subtree };
      } else if (entry.isFile()) {
        if (excludeExts.has(ext(entry.name))) continue;
        const buf = await readFile(fullPath);
        if (isBinary(buf)) {
          tree[entry.name] = {
            file: { contents: buf.toString("base64"), binary: true },
          };
        } else {
          tree[entry.name] = { file: { contents: buf.toString("utf-8") } };
        }
      }
    } catch (err) {
      process.stderr.write(`  Skipping ${fullPath}: ${err.message}\n`);
    }
  }

  return tree;
}

// ── Compress & write ──────────────────────────────────────────────────────────
async function compress(label, tree, outPath) {
  process.stdout.write(`  Serializing ${label}…\n`);
  const json = JSON.stringify(tree);
  process.stdout.write(`  JSON size: ${(json.length / 1024 / 1024).toFixed(1)} MB\n`);

  process.stdout.write(`  Compressing…\n`);
  const gz = await gzipAsync(Buffer.from(json), { level: 9 });
  process.stdout.write(`  Gzipped: ${(gz.length / 1024 / 1024).toFixed(1)} MB\n`);

  await writeFile(outPath, gz);
  process.stdout.write(`  Written → ${outPath}\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(OUTPUT, { recursive: true });

  const packageJson = await readFile(join(ROOT, "package.json"), "utf-8");
  const packageHash = createHash("sha256")
    .update(packageJson)
    .digest("hex")
    .slice(0, 12);
  const commitSha = (process.env.GITHUB_SHA ?? "local").slice(0, 12);

  console.log(`Commit:       ${commitSha}`);
  console.log(`PackageHash:  ${packageHash}`);

  // 1. Source files
  console.log("\n[1/2] Building source files snapshot…");
  const filesTree = await buildTree(ROOT, { excludeNames: EXCLUDE_SOURCE });
  await compress(
    "files",
    filesTree,
    join(OUTPUT, `files-${commitSha}.json.gz`),
  );

  // 2. node_modules
  console.log("\n[2/2] Building node_modules snapshot…");
  const nmTree = await buildTree(join(ROOT, "node_modules"), {
    excludeDirs: EXCLUDE_NM_DIRS,
    excludeExts: EXCLUDE_NM_EXTS,
  });
  await compress(
    "node_modules",
    nmTree,
    join(OUTPUT, `node_modules-${packageHash}.json.gz`),
  );

  // 3. Shell env file for the upload step
  const envContent = `SHORT_SHA=${commitSha}\nPACKAGE_HASH=${packageHash}\n`;
  await writeFile(join(OUTPUT, "snapshot.env"), envContent);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
