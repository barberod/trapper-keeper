#!/usr/bin/env node

/**
 * 03-codebase/codebase.mjs
 *
 * Deterministic script for Step 3 (Resolve Codebase).
 *
 * Usage:
 *   node 03-codebase/codebase.mjs <codebase-value> <project-repo-location> <personal-dir-location>
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "ERROR",
 *   "message": "...",
 *   "resolvedPath": "...",
 *   "codebaseType": "project" | "personal" | "path",
 *   "errors": []
 * }
 */

import { existsSync } from "fs";
import { join, resolve } from "path";

// ---------------------------------------------------------------------------
// Alias mapping
// ---------------------------------------------------------------------------

const PROJECT_ALIASES = new Set([
  "project", "work", "product", "theirs", "a", "\u{1F3E2}" // 🏢
]);

const PERSONAL_ALIASES = new Set([
  "personal", "dev", "notes", "mine", "z", "\u{1F3E0}" // 🏠
]);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const codebaseValue = (args[0] || "").trim();
  const projectRepo = args[1] || "";
  const personalDir = args[2] || "";

  const result = {
    status: "OK",
    message: "",
    resolvedPath: null,
    codebaseType: null,
    errors: [],
  };

  if (!codebaseValue) {
    result.status = "ERROR";
    result.errors.push("Codebase value is empty.");
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  const lower = codebaseValue.toLowerCase();

  let resolvedPath = null;
  let codebaseType = null;

  if (PROJECT_ALIASES.has(lower)) {
    resolvedPath = projectRepo;
    codebaseType = "project";
  } else if (PERSONAL_ALIASES.has(lower)) {
    resolvedPath = personalDir;
    codebaseType = "personal";
  } else {
    // Treat as absolute path
    resolvedPath = resolve(codebaseValue);
    codebaseType = "path";
  }

  // Validate the resolved path
  if (!resolvedPath) {
    result.status = "ERROR";
    result.errors.push(`Resolved path is empty for codebase "${codebaseValue}".`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  if (!existsSync(resolvedPath)) {
    result.status = "ERROR";
    result.errors.push(`Path "${resolvedPath}" does not exist.`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  if (!existsSync(join(resolvedPath, ".git"))) {
    result.status = "ERROR";
    result.errors.push(`Path "${resolvedPath}" is not a git repository (no .git found).`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  result.resolvedPath = resolvedPath;
  result.codebaseType = codebaseType;
  result.message = `Codebase resolved: "${resolvedPath}" (${codebaseType}).`;

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
