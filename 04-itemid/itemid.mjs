#!/usr/bin/env node

/**
 * 04-itemid/itemid.mjs
 *
 * Deterministic script for Step 4 (Resolve Item ID).
 * Validates item-id format only — branch search is handled by Step 5.
 *
 * Usage:
 *   node 04-itemid/itemid.mjs <item-id> <codebase-type>
 *
 * - <codebase-type>: "project", "personal", or "path"
 *
 * Outputs JSON:
 * {
 *   "status": "OK" | "ERROR",
 *   "message": "...",
 *   "validatedItemId": "...",
 *   "errors": []
 * }
 */

function main() {
  const args = process.argv.slice(2);
  const itemId = args[0] || "";
  const codebaseType = args[1] || "project";

  const result = {
    status: "OK",
    message: "",
    validatedItemId: itemId,
    errors: [],
  };

  if (!itemId || itemId.length === 0) {
    result.status = "ERROR";
    result.errors.push("item-id is empty.");
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // Special case: "main"
  if (itemId.toLowerCase() === "main") {
    if (codebaseType === "project") {
      result.status = "ERROR";
      result.errors.push(
        'item-id "main" is not allowed when the codebase is "project". You must not commit directly to the main branch of the business codebase.'
      );
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }
    result.message = `item-id "main" is valid for ${codebaseType} codebase.`;
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // No spaces
  if (/\s/.test(itemId)) {
    result.errors.push("item-id must not contain spaces.");
  }

  // Only letters, numbers, hyphens, underscores
  if (!/^[a-zA-Z0-9\-_]+$/.test(itemId)) {
    const emojiPattern =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/u;
    if (emojiPattern.test(itemId)) {
      result.errors.push("item-id must not contain emoji.");
    } else {
      result.errors.push(
        "item-id contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed."
      );
    }
  }

  // Length
  if (itemId.length < 5) {
    result.errors.push(
      `item-id must be at least 5 characters (got ${itemId.length}).`
    );
  }
  if (itemId.length > 24) {
    result.errors.push(
      `item-id must be at most 24 characters (got ${itemId.length}).`
    );
  }

  if (result.errors.length > 0) {
    result.status = "ERROR";
    result.message = result.errors.join(" ");
  } else {
    result.message = `item-id "${itemId}" is valid.`;
  }

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
