#!/usr/bin/env node

/**
 * 05-timesetup/timesetup.mjs
 *
 * Deterministic script for Step 5 (Set Time-Bound Variables and Ensure Directories).
 *
 * Usage:
 *   node 05-timesetup/timesetup.mjs <personal-dir-location> <resolved-codebase-path> <item-id> <agent-attribution> <codebase-type>
 *
 * - <agent-attribution>: "true" or "false"
 * - <codebase-type>: "project" | "personal" | "path"
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "ERROR",
 *   "message": "...",
 *   "time": { "year", "month", "day", "hour", "minutes", "timestamp" },
 *   "folderName": "...",
 *   "outputDir": "...",
 *   "agentAttributionText": "...",
 *   "checks": {
 *     "isolation": { "status", "detail" },
 *     "directory":  { "status", "detail" }
 *   },
 *   "errors": []
 * }
 */

import { existsSync, mkdirSync } from "fs";
import { resolve, sep, basename } from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY = { OK: 0, WARNING: 1, ERROR: 2 };

function worstStatus(a, b) {
  return (SEVERITY[a] ?? 0) >= (SEVERITY[b] ?? 0) ? a : b;
}

/**
 * Derive folder name from item-id.
 * If item-id starts with "pbi" or "bug" (case-insensitive) and the remainder
 * is all digits (with total length >= 5), use only the numeric part.
 * Otherwise use item-id unchanged.
 *
 * Special case: if item-id is "main", derive from codebase path instead.
 */
function deriveFolderName(itemId, codebasePath) {
  if (itemId.toLowerCase() === "main") {
    return deriveFromCodebasePath(codebasePath);
  }

  const lower = itemId.toLowerCase();
  for (const prefix of ["pbi", "bug"]) {
    if (lower.startsWith(prefix)) {
      const remainder = itemId.slice(prefix.length);
      if (remainder.length > 0 && /^\d+$/.test(remainder) && itemId.length >= 5) {
        return remainder;
      }
    }
  }
  return itemId;
}

/**
 * Derive a meaningful name from the codebase path, skipping trailing
 * segments like "src", "source", "app", "root".
 */
function deriveFromCodebasePath(codebasePath) {
  const skipSegments = new Set(["src", "source", "app", "root"]);
  const parts = resolve(codebasePath).split(/[\\/]/).filter(Boolean);

  // Walk backwards to find a meaningful segment
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!skipSegments.has(parts[i].toLowerCase())) {
      return parts[i];
    }
  }
  // Fallback: use the last segment regardless
  return parts[parts.length - 1] || "main";
}

/**
 * Normalize a path for comparison: resolve, lowercase, ensure trailing separator.
 */
function normForContains(p) {
  return resolve(p).toLowerCase().replace(/[\\/]+/g, sep) + sep;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const personalDir = args[0] || "";
  const codebasePath = args[1] || "";
  const itemId = args[2] || "";
  const agentAttribution = (args[3] || "false").toLowerCase() === "true";
  const codebaseType = (args[4] || "project").toLowerCase();

  const result = {
    status: "OK",
    message: "",
    time: {},
    folderName: null,
    outputDir: null,
    agentAttributionText: "",
    checks: {
      isolation: { status: "OK", detail: "" },
      directory: { status: "OK", detail: "" },
    },
    errors: [],
  };

  // -----------------------------------------------------------------------
  // (a-f) Capture time values
  // -----------------------------------------------------------------------
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const year = String(now.getFullYear());
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const timestamp = `${year}${month}${day}-${hour}${minutes}`;

  result.time = { year, month, day, hour, minutes, timestamp };

  // -----------------------------------------------------------------------
  // (g) Safety check: personal-dir-location NOT inside resolved-codebase-path
  //     Exception: when codebase-type is NOT "project", overlap is allowed
  //     (notes may live in a personal/path codebase, just not the project repo)
  // -----------------------------------------------------------------------
  if (!personalDir || !codebasePath) {
    result.checks.isolation.status = "ERROR";
    result.checks.isolation.detail =
      "personal-dir-location or resolved-codebase-path is empty.";
    result.status = "ERROR";
    result.errors.push(result.checks.isolation.detail);
  } else if (codebaseType === "project") {
    const normPersonal = normForContains(personalDir);
    const normCodebase = normForContains(codebasePath);

    if (normPersonal.startsWith(normCodebase)) {
      result.checks.isolation.status = "ERROR";
      result.checks.isolation.detail = `personal-dir-location ("${personalDir}") is inside the project codebase ("${codebasePath}"). They must be separate.`;
      result.status = "ERROR";
      result.errors.push(result.checks.isolation.detail);
    } else {
      result.checks.isolation.detail = "Directories are properly isolated.";
    }
  } else {
    result.checks.isolation.detail = `Isolation check skipped for codebase type "${codebaseType}".`;
  }

  // -----------------------------------------------------------------------
  // (h) Resolve agent-attribution-text
  // -----------------------------------------------------------------------
  if (agentAttribution) {
    result.agentAttributionText =
      "Agent attribution is allowed. You may include Co-Authored-By lines in commit messages to credit AI agents that contributed to the changes.";
  } else {
    result.agentAttributionText =
      "Agent attribution is not allowed. Do not include Co-Authored-By lines or any other agent attribution in commit messages. Strip any existing agent attribution.";
  }

  // -----------------------------------------------------------------------
  // (i-l) Derive folder name and ensure directories
  // -----------------------------------------------------------------------
  const folderName = deriveFolderName(itemId, codebasePath);
  result.folderName = folderName;

  const outputDir = resolve(personalDir, "notes", year, month, folderName);
  result.outputDir = outputDir;

  if (result.status !== "ERROR") {
    try {
      mkdirSync(outputDir, { recursive: true });
      if (existsSync(outputDir)) {
        result.checks.directory.detail = `Output directory ready: "${outputDir}".`;
      } else {
        result.checks.directory.status = "ERROR";
        result.checks.directory.detail = `Failed to create output directory: "${outputDir}".`;
        result.status = "ERROR";
        result.errors.push(result.checks.directory.detail);
      }
    } catch (err) {
      result.checks.directory.status = "ERROR";
      result.checks.directory.detail = `Error creating directory "${outputDir}": ${err.message}`;
      result.status = "ERROR";
      result.errors.push(result.checks.directory.detail);
    }
  }

  // -----------------------------------------------------------------------
  // Build message
  // -----------------------------------------------------------------------
  if (result.errors.length > 0) {
    result.message = result.errors.join(" ");
  } else {
    result.message = `Timestamp ${timestamp}, output dir "${outputDir}".`;
  }

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
