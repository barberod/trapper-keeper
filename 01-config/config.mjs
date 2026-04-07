#!/usr/bin/env node

/**
 * 01-config/config.mjs
 *
 * Deterministic script for Step 1 (Load Configuration).
 *
 * Usage:
 *   node 01-config/config.mjs <skill-dir> [-- raw args string]
 *
 * Outputs a single JSON object to stdout:
 * {
 *   "status": "OK" | "WARNING" | "ERROR",
 *   "message": "Human-readable summary",
 *   "config": { ... },
 *   "sanityText": "...",
 *   "sanitySource": "...",
 *   "params": { ... },
 *   "helpRequested": false,
 *   "errors": [],
 *   "warnings": []
 * }
 */

import { readFileSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  const stat = statSync(filePath);
  if (!stat.isFile()) return null;
  const content = readFileSync(filePath, "utf-8").trim();
  return content.length > 0 ? content : null;
}

function tokenize(raw) {
  if (!raw || !raw.trim()) return [];
  const tokens = [];
  let i = 0;
  const s = raw.trim();
  while (i < s.length) {
    while (i < s.length && s[i] === " ") i++;
    if (i >= s.length) break;

    const quoteChars = ["'", '"', "`"];
    let token = "";
    if (quoteChars.includes(s[i])) {
      const q = s[i];
      i++;
      while (i < s.length && s[i] !== q) {
        token += s[i];
        i++;
      }
      if (i < s.length) {
        i++;
      } else {
        token = q + token;
      }
    } else {
      while (i < s.length && s[i] !== " ") {
        if (quoteChars.includes(s[i])) {
          const q = s[i];
          i++;
          while (i < s.length && s[i] !== q) {
            token += s[i];
            i++;
          }
          if (i < s.length) i++;
        } else {
          token += s[i];
          i++;
        }
      }
    }
    tokens.push(token);
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Mode normalization
// ---------------------------------------------------------------------------

const MODE_NAMES = [
  "default",
  "granular",
  "iambic",
  "klingon",
  "professional",
  "terse",
  "verbose",
];

const MODE_IDS = { d: "default", g: "granular", i: "iambic", k: "klingon", p: "professional", t: "terse", v: "verbose" };

const MODE_SYMBOLS = {
  "\u{1F44D}": "default",       // 👍
  "\u{1F52C}": "granular",      // 🔬
  "\u{1F3AD}": "iambic",        // 🎭
  "\u{1F596}": "klingon",       // 🖖
  "\u{1F454}": "professional",  // 👔
  "\u{2702}\u{FE0F}": "terse",  // ✂️
  "\u{2702}": "terse",          // ✂ (without variation selector)
  "\u{1F4DC}": "verbose",       // 📜
};

function normalizeMode(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (MODE_NAMES.includes(lower)) return lower;
  if (MODE_IDS[lower]) return MODE_IDS[lower];
  if (MODE_SYMBOLS[value]) return MODE_SYMBOLS[value];
  return null;
}

// ---------------------------------------------------------------------------
// Severity ranking for aggregation
// ---------------------------------------------------------------------------

const SEVERITY = { OK: 0, WARNING: 1, ERROR: 2 };

function worstStatus(a, b) {
  return (SEVERITY[a] ?? 0) >= (SEVERITY[b] ?? 0) ? a : b;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const doubleDashIdx = args.indexOf("--");
  const skillDir = resolve(args[0] || ".");
  const rawArgs =
    doubleDashIdx >= 0 ? args.slice(doubleDashIdx + 1).join(" ") : "";

  const result = {
    status: "OK",
    message: "",
    config: null,
    sanityText: null,
    sanitySource: null,
    params: {},
    helpRequested: false,
    errors: [],
    warnings: [],
  };

  // -----------------------------------------------------------------------
  // 1. Load config.json
  // -----------------------------------------------------------------------
  const configPath = join(skillDir, "config.json");
  let config;
  try {
    const raw = readFileSync(configPath, "utf-8");
    const cleaned = raw.replace(/,\s*([\]}])/g, "$1");
    config = JSON.parse(cleaned);
  } catch (err) {
    result.status = "ERROR";
    result.errors.push(
      `Failed to load config.json at ${configPath}: ${err.message}`
    );
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }
  result.config = config;

  const requiredKeys = [
    "project-repo-location",
    "personal-dir-location",
    "product-text",
  ];
  for (const key of requiredKeys) {
    if (!config[key] || typeof config[key] !== "string" || !config[key].trim()) {
      result.status = "ERROR";
      result.errors.push(`config.json: required key "${key}" is missing or empty.`);
    }
  }

  if (result.status === "ERROR") {
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // -----------------------------------------------------------------------
  // 2. Load sanity check rules
  // -----------------------------------------------------------------------
  const sanityPrimary = join(skillDir, "SANITYCHECK-RULES.md");
  const sanityFallback = join(skillDir, "SANITYCHECK-RULES.md.example");

  let sanityText = readIfExists(sanityPrimary);
  let sanitySource = sanityText ? "SANITYCHECK-RULES.md" : null;
  if (!sanityText) {
    sanityText = readIfExists(sanityFallback);
    sanitySource = sanityText ? "SANITYCHECK-RULES.md.example" : null;
  }
  if (!sanityText) {
    result.status = "ERROR";
    result.errors.push(
      "Neither SANITYCHECK-RULES.md nor SANITYCHECK-RULES.md.example exists or has content."
    );
  }
  result.sanityText = sanityText;
  result.sanitySource = sanitySource;

  if (result.status === "ERROR") {
    result.message = result.errors.join(" ");
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  // -----------------------------------------------------------------------
  // 3. Parse and resolve named parameters
  // -----------------------------------------------------------------------
  const tokens = tokenize(rawArgs);

  if (tokens.includes("--help")) {
    result.helpRequested = true;
    result.message = "Help requested.";
    process.stdout.write(JSON.stringify(result, null, 2));
    return;
  }

  const VALID_PARAMS = [
    "codebase",
    "item-id",
    "handle",
    "quiet",
    "mode",
    "agent-attribution",
    "user-mail",
    "user-name",
  ];
  const BOOLEAN_PARAMS = ["agent-attribution"];

  const parsed = {};

  for (const token of tokens) {
    if (!token.startsWith("--")) {
      result.status = "ERROR";
      result.errors.push(
        `Bare positional argument "${token}" is not allowed. Use --name:value syntax.`
      );
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    const stripped = token.slice(2);
    const colonIdx = stripped.indexOf(":");
    let name, value;
    if (colonIdx === -1) {
      name = stripped;
      value = undefined;
    } else {
      name = stripped.slice(0, colonIdx);
      value = stripped.slice(colonIdx + 1);
    }

    if (!VALID_PARAMS.includes(name)) {
      result.status = "ERROR";
      result.errors.push(
        `Unknown parameter "--${name}". Valid parameters: ${VALID_PARAMS.map((p) => "--" + p).join(", ")}`
      );
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    if (name in parsed) {
      result.status = "ERROR";
      result.errors.push(`Duplicate parameter "--${name}".`);
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    if (BOOLEAN_PARAMS.includes(name)) {
      if (value === undefined) {
        value = "true";
      } else if (value !== "true" && value !== "false") {
        result.status = "ERROR";
        result.errors.push(
          `Parameter "--${name}" must be true or false, got "${value}".`
        );
        result.message = result.errors.join(" ");
        process.stdout.write(JSON.stringify(result, null, 2));
        return;
      }
    }

    if (name === "quiet") {
      if (value === undefined) {
        value = "true";
      } else if (!["true", "false", "force"].includes(value)) {
        result.status = "ERROR";
        result.errors.push(
          `Parameter "--quiet" must be true, false, or force, got "${value}".`
        );
        result.message = result.errors.join(" ");
        process.stdout.write(JSON.stringify(result, null, 2));
        return;
      }
    }

    if (name === "mode") {
      if (value === undefined || value === "") {
        result.status = "ERROR";
        result.errors.push(`Parameter "--mode" requires a value.`);
        result.message = result.errors.join(" ");
        process.stdout.write(JSON.stringify(result, null, 2));
        return;
      }
      const normalized = normalizeMode(value);
      if (!normalized) {
        result.status = "ERROR";
        result.errors.push(
          `Invalid mode "${value}". Valid modes: ${MODE_NAMES.join(", ")} (or IDs: ${Object.keys(MODE_IDS).join(", ")})`
        );
        result.message = result.errors.join(" ");
        process.stdout.write(JSON.stringify(result, null, 2));
        return;
      }
      value = normalized;
    }

    if (
      ["handle", "user-mail", "user-name", "item-id"].includes(name) &&
      (value === undefined || value === "")
    ) {
      result.status = "ERROR";
      result.errors.push(`Parameter "--${name}" requires a value.`);
      result.message = result.errors.join(" ");
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }

    parsed[name] = value;
  }

  // -----------------------------------------------------------------------
  // 4. Resolve parameters
  // -----------------------------------------------------------------------
  const defaults = config.defaults || {};

  result.params["item-id"] = parsed["item-id"] ?? "needs-prompt";

  if (parsed["codebase"] !== undefined) {
    result.params["codebase"] = parsed["codebase"];
  } else if (defaults["codebase"] !== undefined) {
    result.params["codebase"] = String(defaults["codebase"]);
  } else {
    result.params["codebase"] = "needs-prompt";
  }

  result.params["handle"] =
    parsed["handle"] ?? (config["handle"] || "");
  result.params["user-mail"] =
    parsed["user-mail"] ?? (config["user-mail"] || null);
  result.params["user-name"] =
    parsed["user-name"] ?? (config["user-name"] || null);

  for (const key of ["quiet", "agent-attribution"]) {
    if (parsed[key] !== undefined) {
      result.params[key] = parsed[key];
    } else if (defaults[key] !== undefined) {
      result.params[key] = String(defaults[key]);
    } else {
      result.params[key] = "needs-prompt";
    }
  }

  if (parsed["mode"] !== undefined) {
    result.params["mode"] = parsed["mode"];
  } else if (defaults["mode"] !== undefined) {
    const normalized = normalizeMode(String(defaults["mode"]));
    if (normalized) {
      result.params["mode"] = normalized;
    } else {
      result.params["mode"] = "needs-prompt";
      result.warnings.push(
        `Config default mode "${defaults["mode"]}" is not valid. User will be prompted.`
      );
    }
  } else {
    result.params["mode"] = "needs-prompt";
  }

  // -----------------------------------------------------------------------
  // 5. Warnings
  // -----------------------------------------------------------------------
  if (sanitySource === "SANITYCHECK-RULES.md.example") {
    result.status = worstStatus(result.status, "WARNING");
    result.warnings.push(
      "Using SANITYCHECK-RULES.md.example (no custom SANITYCHECK-RULES.md found)."
    );
  }

  // -----------------------------------------------------------------------
  // Build message
  // -----------------------------------------------------------------------
  const parts = [];
  if (result.errors.length > 0) parts.push(...result.errors);
  if (result.warnings.length > 0) parts.push(...result.warnings);
  if (parts.length === 0) parts.push("Configuration loaded successfully.");
  result.message = parts.join(" ");

  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
