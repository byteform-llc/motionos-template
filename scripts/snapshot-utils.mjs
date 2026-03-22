import { readdir, readFile, lstat, readlink } from "fs/promises";
import { join } from "path";

export const ROOT = process.cwd();

// ── Source file exclusions ────────────────────────────────────────────────────
export const EXCLUDE_SOURCE_NAMES = new Set([
  "node_modules",
  ".git",
  "build",
  "out",
  "dist",
  "scripts",
  ".github",
  "index.html",
  "README.md",
]);

// Paths relative to ROOT that should be excluded
export const EXCLUDE_SOURCE_PATHS = new Set([
  "src/preview.tsx",
  "src/preview.css",
]);

// ── node_modules exclusions (reduce snapshot size) ───────────────────────────
export const EXCLUDE_NM_DIRS = new Set([
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

export const EXCLUDE_NM_EXTS = new Set([".map"]);

// ── Helpers ───────────────────────────────────────────────────────────────────
export function isBinary(buf) {
  const len = Math.min(buf.length, 8192);
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

export function fileExt(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i);
}

// ── Tree builder ─────────────────────────────────────────────────────────────
export async function buildTree(dir, opts = {}) {
  const {
    excludeNames = new Set(),
    excludePaths = new Set(),
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
    const relPath = fullPath.slice(ROOT.length + 1);
    if (excludePaths.has(relPath)) continue;

    try {
      if (entry.isSymbolicLink()) {
        const target = await readlink(fullPath);
        tree[entry.name] = { file: { symlink: target } };
      } else if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        const stat = await lstat(fullPath);
        if (visitedInodes.has(stat.ino)) continue;
        const subtree = await buildTree(fullPath, {
          excludeNames,
          excludePaths,
          excludeDirs,
          excludeExts,
          visitedInodes: new Set([...visitedInodes, stat.ino]),
        });
        tree[entry.name] = { directory: subtree };
      } else if (entry.isFile()) {
        if (excludeExts.has(fileExt(entry.name))) continue;
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

// ── Tree visualizer ───────────────────────────────────────────────────────────
export function printTree(tree, prefix = "") {
  const lines = [];
  const entries = Object.entries(tree).sort(
    ([aName, aNode], [bName, bNode]) => {
      const aIsDir = !!aNode.directory;
      const bIsDir = !!bNode.directory;
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return aName.localeCompare(bName);
    },
  );
  for (let i = 0; i < entries.length; i++) {
    const [name, node] = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    if (node.directory) {
      lines.push(`${prefix}${connector}${name}/`);
      lines.push(
        ...printTree(node.directory, childPrefix).split("\n").filter(Boolean),
      );
    } else {
      lines.push(`${prefix}${connector}${name}`);
    }
  }
  return lines.join("\n");
}
