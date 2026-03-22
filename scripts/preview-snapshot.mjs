#!/usr/bin/env node
/**
 * Previews the snapshot file trees without uploading anything.
 * Use this to verify which files will be included/excluded before running build-snapshot.
 *
 * Usage:
 *   node scripts/preview-snapshot.mjs
 *   node scripts/preview-snapshot.mjs
 */

import {
  EXCLUDE_SOURCE_NAMES,
  EXCLUDE_SOURCE_PATHS,
  ROOT,
  buildTree,
  printTree,
} from "./snapshot-utils.mjs";

async function main() {
  const filesTree = await buildTree(ROOT, {
    excludeNames: EXCLUDE_SOURCE_NAMES,
    excludePaths: EXCLUDE_SOURCE_PATHS,
  });
  console.log(`files/\n${printTree(filesTree)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
