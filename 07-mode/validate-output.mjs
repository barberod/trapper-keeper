#!/usr/bin/env node

/**
 * 07-mode/validate-output.mjs
 *
 * Deterministic script for Step 7 (Execute Mode) — validation phase.
 * Checks that the mode produced a non-empty output file with commits.
 *
 * Usage:
 *   node 07-mode/validate-output.mjs <output-dir> <expected-filename>
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "ERROR",
 *   "message": "...",
 *   "outputFile": "...",
 *   "fileSizeBytes": 0,
 *   "errors": []
 * }
 */

import { existsSync, statSync, readFileSync } from "fs";
import { join, resolve } from "path";

function main() {
  const args = process.argv.slice(2);
  const outputDir = resolve(args[0] || ".");
  const expectedFilename = args[1] || "";

  const result = {
    status: "OK",
    message: "",
    outputFile: null,
    fileSizeBytes: 0,
    errors: [],
  };

  if (!expectedFilename) {
    result.status = "ERROR";
    result.errors.push("Expected filename argument is empty.");
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  const fullPath = join(outputDir, expectedFilename);
  result.outputFile = fullPath;

  if (!existsSync(fullPath)) {
    result.status = "ERROR";
    result.errors.push(`Output file "${fullPath}" does not exist.`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  let stat;
  try {
    stat = statSync(fullPath);
  } catch (err) {
    result.status = "ERROR";
    result.errors.push(`Cannot stat "${fullPath}": ${err.message}`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  if (!stat.isFile()) {
    result.status = "ERROR";
    result.errors.push(`"${fullPath}" is not a file.`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  result.fileSizeBytes = stat.size;

  if (stat.size === 0) {
    result.status = "ERROR";
    result.errors.push(`Output file "${expectedFilename}" is empty (0 bytes).`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  const content = readFileSync(fullPath, "utf-8");
  if (!/^#+\s/m.test(content)) {
    result.status = "ERROR";
    result.errors.push(
      `Output file "${expectedFilename}" has no markdown headings. Expected at least one line starting with #.`
    );
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  result.message = `Output file "${expectedFilename}" validated (${stat.size} bytes).`;
  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
