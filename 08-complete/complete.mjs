#!/usr/bin/env node

/**
 * 08-complete/complete.mjs
 *
 * Deterministic script for Step 8 (Process Complete).
 * Verifies the run produced output artifacts and that new commits exist.
 *
 * Usage:
 *   node 08-complete/complete.mjs <output-dir> <timestamp> <resolved-codebase-path> <head-before> [<report>]
 *
 * - <report>: "true" (default) or "false" — when false, missing output files are not an error
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "ERROR",
 *   "message": "...",
 *   "outputFiles": [...],
 *   "newCommits": 0,
 *   "commits": [...],
 *   "errors": []
 * }
 */

import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

function git(repoDir, cmd) {
  try {
    return execSync(`git -C "${repoDir}" ${cmd}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const outputDir = resolve(args[0] || ".");
  const timestamp = args[1] || "";
  const repoDir = args[2] || "";
  const headBefore = args[3] || "";
  const report = (args[4] || "true").toLowerCase() !== "false";

  const result = {
    status: "OK",
    message: "",
    outputFiles: [],
    newCommits: 0,
    commits: [],
    errors: [],
  };

  if (!timestamp) {
    result.status = "ERROR";
    result.errors.push("Timestamp argument is empty.");
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // Check output directory and files
  if (!existsSync(outputDir)) {
    result.status = "ERROR";
    result.errors.push(`Output directory "${outputDir}" does not exist.`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  let entries;
  try {
    entries = readdirSync(outputDir);
  } catch (err) {
    result.status = "ERROR";
    result.errors.push(`Cannot read directory "${outputDir}": ${err.message}`);
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  const pattern = new RegExp(`^commits.*_${timestamp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.md$`);
  const matches = entries.filter((f) => pattern.test(f));
  result.outputFiles = matches;

  if (matches.length === 0 && report) {
    result.status = "ERROR";
    result.errors.push(
      `No output files matching "commits*_${timestamp}.md" found in "${outputDir}".`
    );
  }

  // Check for new commits since head-before
  if (repoDir && headBefore) {
    const logOutput = git(repoDir, `log --oneline ${headBefore}..HEAD`);
    if (logOutput) {
      const commitLines = logOutput.split("\n").filter((l) => l.trim().length > 0);
      result.newCommits = commitLines.length;
      result.commits = commitLines.map((l) => {
        const spaceIdx = l.indexOf(" ");
        return {
          sha: l.slice(0, spaceIdx),
          subject: l.slice(spaceIdx + 1),
        };
      });
    }

    if (result.newCommits === 0 && result.errors.length === 0) {
      result.status = "ERROR";
      result.errors.push("No new commits found since the run started.");
    }
  }

  // Build message
  if (result.errors.length > 0) {
    result.message = result.errors.join(" ");
  } else {
    const filePart = matches.length > 0
      ? `${matches.length} output file(s): ${matches.join(", ")}`
      : (report ? "No output files found." : "Report skipped.");
    result.message = `${result.newCommits} commit(s) created. ${filePart}`;
  }

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
