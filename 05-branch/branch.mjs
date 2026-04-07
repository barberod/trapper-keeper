#!/usr/bin/env node

/**
 * 05-branch/branch.mjs
 *
 * Deterministic script for Step 5 (Verify Branch, Working Tree State, and Stage Changes).
 *
 * Usage:
 *   node 05-branch/branch.mjs <resolved-codebase-path> <item-id> <handle> <codebase-type> [<selected-branch>]
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "WARNING" | "ERROR",
 *   "message": "...",
 *   "checks": {
 *     "branchSearch":  { "status", "detail", "matches": [...], "designated": ... },
 *     "checkout":      { "status", "detail", "currentBranch": ... },
 *     "workingTree":   { "status", "detail", "blockingState": ... },
 *     "changes":       { "status", "detail", "stagedCount": 0, "headBefore": ... }
 *   },
 *   "needsUserChoice": false,
 *   "needsUserConfirm": false,
 *   "errors": [],
 *   "warnings": []
 * }
 */

import { existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SEVERITY = { OK: 0, WARNING: 1, ERROR: 2 };

function worstStatus(a, b) {
  return (SEVERITY[a] ?? 0) >= (SEVERITY[b] ?? 0) ? a : b;
}

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
  const repoDir = args[0] || ".";
  const itemId = args[1] || "";
  const handle = args[2] ?? "";
  const codebaseType = args[3] || "project";
  const selectedBranch = args[4] || null;

  const result = {
    status: "OK",
    message: "",
    checks: {
      branchSearch: { status: "OK", detail: "", matches: [], designated: null },
      checkout: { status: "OK", detail: "", currentBranch: null },
      workingTree: { status: "OK", detail: "", blockingState: null },
      changes: { status: "OK", detail: "", stagedCount: 0, headBefore: null },
    },
    needsUserChoice: false,
    needsUserConfirm: false,
    errors: [],
    warnings: [],
  };

  // -----------------------------------------------------------------------
  // (a) Find designated branch
  // -----------------------------------------------------------------------
  let designated = null;

  if (itemId.toLowerCase() === "main") {
    designated = "main";
    result.checks.branchSearch.designated = designated;
    result.checks.branchSearch.matches = [designated];
    result.checks.branchSearch.detail = `Designated branch is "main" (item-id is main).`;
  } else if (selectedBranch) {
    designated = selectedBranch;
    result.checks.branchSearch.designated = designated;
    result.checks.branchSearch.matches = [designated];
    result.checks.branchSearch.detail = `Using user-selected branch: "${designated}".`;
  } else {
    const branchOutput = git(repoDir, "branch --list --format=%(refname:short)");
    if (branchOutput === null) {
      result.checks.branchSearch.status = "ERROR";
      result.checks.branchSearch.detail = "Failed to list git branches.";
      result.status = "ERROR";
      result.errors.push(result.checks.branchSearch.detail);
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    const allBranches = branchOutput
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const remoteOutput = git(repoDir, "branch -r --format=%(refname:short)");
    if (remoteOutput) {
      const remoteBranches = remoteOutput
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b.length > 0 && !b.includes("HEAD"))
        .map((b) => b.replace(/^origin\//, ""));
      for (const rb of remoteBranches) {
        if (!allBranches.includes(rb)) {
          allBranches.push(rb);
        }
      }
    }

    const useHandle = handle && handle !== "_";
    const matches = allBranches.filter((b) => {
      const lower = b.toLowerCase();
      if (useHandle) {
        return (
          lower.includes(handle.toLowerCase()) &&
          lower.includes(itemId.toLowerCase())
        );
      }
      return lower.includes(itemId.toLowerCase());
    });

    result.checks.branchSearch.matches = matches;

    if (matches.length === 0) {
      result.checks.branchSearch.status = "ERROR";
      const searchDesc = useHandle
        ? `both "${handle}" and "${itemId}"`
        : `"${itemId}"`;
      result.checks.branchSearch.detail = `No branches found containing ${searchDesc}.`;
      result.status = "ERROR";
      result.errors.push(result.checks.branchSearch.detail);
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    if (matches.length === 1) {
      designated = matches[0];
      result.checks.branchSearch.designated = designated;
      result.checks.branchSearch.detail = `Found branch: "${designated}".`;

      if (!handle) {
        result.needsUserConfirm = true;
        result.checks.branchSearch.detail += " (handle was empty — confirmation recommended)";
      }
    } else {
      result.needsUserChoice = true;
      result.checks.branchSearch.status = "WARNING";
      result.checks.branchSearch.detail = `Multiple branches match: ${matches.join(", ")}. User must select one.`;
      result.warnings.push(result.checks.branchSearch.detail);
      result.status = "WARNING";
      result.message = result.checks.branchSearch.detail;
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }
  }

  // -----------------------------------------------------------------------
  // (b) Confirm designated branch is checked out
  // -----------------------------------------------------------------------
  const currentBranch = git(repoDir, "rev-parse --abbrev-ref HEAD");
  result.checks.checkout.currentBranch = currentBranch;

  if (!currentBranch) {
    result.checks.checkout.status = "ERROR";
    result.checks.checkout.detail = "Could not determine current branch.";
    result.status = worstStatus(result.status, "ERROR");
    result.errors.push(result.checks.checkout.detail);
  } else if (currentBranch !== designated) {
    result.checks.checkout.status = "ERROR";
    result.checks.checkout.detail = `Branch "${designated}" is not checked out. Current branch is "${currentBranch}".`;
    result.status = worstStatus(result.status, "ERROR");
    result.errors.push(result.checks.checkout.detail);
  } else {
    result.checks.checkout.detail = `Branch "${designated}" is checked out.`;
  }

  // -----------------------------------------------------------------------
  // (c) Confirm working tree is ready
  // -----------------------------------------------------------------------
  const blockingFiles = [
    { path: ".git/MERGE_HEAD", state: "merge" },
    { path: ".git/rebase-merge", state: "rebase" },
    { path: ".git/rebase-apply", state: "rebase" },
    { path: ".git/CHERRY_PICK_HEAD", state: "cherry-pick" },
    { path: ".git/REVERT_HEAD", state: "revert" },
    { path: ".git/BISECT_LOG", state: "bisect" },
  ];

  let blockingState = null;
  for (const { path, state } of blockingFiles) {
    if (existsSync(join(repoDir, path))) {
      blockingState = state;
      break;
    }
  }

  result.checks.workingTree.blockingState = blockingState;

  if (blockingState) {
    result.checks.workingTree.status = "ERROR";
    result.checks.workingTree.detail = `Working tree has an in-progress ${blockingState}. Resolve it before continuing.`;
    result.status = worstStatus(result.status, "ERROR");
    result.errors.push(result.checks.workingTree.detail);
  } else {
    result.checks.workingTree.detail = "Working tree is clean of blocking operations.";
  }

  // Stop here if any errors so far
  if (result.status === "ERROR") {
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // -----------------------------------------------------------------------
  // (d) Capture HEAD before and stage all changes
  // -----------------------------------------------------------------------
  const headBefore = git(repoDir, "rev-parse HEAD");
  result.checks.changes.headBefore = headBefore;

  // Stage all unstaged changes
  const addResult = git(repoDir, "add -A");
  // addResult can be null on success (no output), that's OK

  // Count staged files
  const diffOutput = git(repoDir, "diff --cached --name-only");
  const stagedFiles = diffOutput
    ? diffOutput.split("\n").filter((f) => f.trim().length > 0)
    : [];
  result.checks.changes.stagedCount = stagedFiles.length;

  if (stagedFiles.length === 0) {
    result.checks.changes.status = "ERROR";
    result.checks.changes.detail = "No staged or unstaged changes found. Nothing to commit.";
    result.status = "ERROR";
    result.errors.push(result.checks.changes.detail);
  } else {
    result.checks.changes.detail = `${stagedFiles.length} file(s) staged for commit.`;
  }

  // -----------------------------------------------------------------------
  // Build message
  // -----------------------------------------------------------------------
  const parts = [];
  if (result.errors.length > 0) parts.push(...result.errors);
  if (result.warnings.length > 0) parts.push(...result.warnings);
  if (parts.length === 0) parts.push(`Branch "${designated}" verified. ${stagedFiles.length} file(s) staged.`);
  result.message = parts.join(" ");

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
