---
name: trapper-keeper
description: Automate the authoring and posting of git commits and their messages.
---

# Trapper Keeper

**When to use:** Invoke with `/trapper-keeper` to automatically analyze staged and unstaged changes in a git repository and create well-crafted git commits with descriptive messages in one of several stylistic modes.

**Usage:** `/trapper-keeper [--codebase:value] [--item-id:value] [--handle:value] [--quiet[:false|true|force]] [--mode:value] [--agent-attribution[:bool]] [--report[:bool]] [--user-mail:value] [--user-name:value]`

- Parameters use `--name:value` syntax and may appear in **any order**.
- Boolean parameters accept `--name:true`, `--name:false`, or bare `--name` (shorthand for `--name:true`).
- The `--quiet` parameter additionally accepts `--quiet:force` for maximum automation (see Step 5).
- Any parameter not provided on the command line falls back to the value in `config.json` under the `"defaults"` key. If no default exists, the user is prompted.
- `--item-id` has no config default and will always be prompted if not passed.
- For `--codebase`, the value after the first colon is the full codebase value (important for Windows paths like `--codebase:C:\my-repo`).
- Unrecognized parameter names are rejected with an error listing valid names.
- Bare positional arguments (no `--` prefix) are rejected with a message showing the correct named syntax.
- Pass `--help` to display a quick reference and exit.

**Examples:**
- `/trapper-keeper --codebase:project --item-id:pbi20525 --mode:professional --quiet:true`
- `/trapper-keeper --item-id:pbi20525` — codebase, mode, etc. use config defaults
- `/trapper-keeper --codebase:personal --item-id:main --mode:terse`
- `/trapper-keeper` — prompts for item-id; codebase, mode use config defaults

## Overview

This skill orchestrates an end-to-end pipeline of 9 steps — 6 setup steps (fully deterministic) followed by 1 mode execution phase (deterministic scripts + agent inference), 1 completion step, and a completion message. Each step lives in its own numbered subfolder.

Available modes: 👍 **Default** · 🔬 **Granular** · 🎭 **Iambic** · 🖖 **Klingon** · 👔 **Professional** · ✂️ **Terse** · 📜 **Verbose**

---

## Progress Visualization

Initialize a progress state array of 8 elements (one per step, steps 1-8):

```json
[null,null,null,null,null,null,null,null]
```

**Before each step:**
1. Set the step's character to `~` (ACTIVE)
2. Render the bar: `node {skill-dir}/progress.mjs <compact-string>`
3. Display step name + bar to the user

**After each step:**
1. Replace the step's character with its final status
2. Render the bar again
3. Display step name + message + bar to the user

**Compact format** — one character per step:

| Char | Emoji | Status |
|------|-------|--------|
| `#` | 🟩 | OK (success) |
| `*` | 🟨 | WARNING (completed with caveats) |
| `!` | 🟥 | ERROR (failed) |
| `-` | ⬜ | SKIP (intentionally skipped) |
| `~` | 🟣 | ACTIVE (currently running) |
| `_` | ⬛ | not yet attempted |

Example: `node {skill-dir}/progress.mjs #####~__`

**Multiple script results:** If a step runs multiple scripts, compute the overall status with:
```bash
node {skill-dir}/progress.mjs --worst #*#
```

---

## Instructions

### Steps 1–6 — Setup (Deterministic)

Execute each setup step in order. For each step, read the markdown file from the step's subfolder, follow the Before/Execute/Act/After pattern described therein.

| Step | Subfolder | File | Description |
|------|-----------|------|-------------|
| 1 | `01-config/` | `CONFIG.md` | Load configuration, parse parameters |
| 2 | `02-check/` | `CHECK.md` | Validate repo, credentials, required files |
| 3 | `03-codebase/` | `CODEBASE.md` | Resolve codebase to absolute path |
| 4 | `04-itemid/` | `ITEMID.md` | Validate item-id format |
| 5 | `05-branch/` | `BRANCH.md` | Find branch, verify checkout, stage all changes |
| 6 | `06-timesetup/` | `TIMESETUP.md` | Capture timestamps, create output directories |

### Step 7 — Execute Mode

Execute the selected mode. Read the markdown file from `07-mode/MODE.md`, follow the Before/Execute/Validate/Act/After pattern described therein.

| Step | Subfolder | File | Output |
|------|-----------|------|--------|
| 7 | `07-mode/` | `MODE.md` | `commits[-{mode}]_{timestamp}.md` |

The mode file is read from `modes/` and its `{placeholders}` are replaced before execution.

### Step 8 — Process Complete

Verify output and commits. Read the markdown file from `08-complete/COMPLETE.md`.

| Step | Subfolder | File | Description |
|------|-----------|------|-------------|
| 8 | `08-complete/` | `COMPLETE.md` | Verify commits and output, display final bar |

### Step 9 — Completion Message

The process is finished. New commits have been created on the designated branch, but the user must still **push** them. All artifacts have been saved to the personal notes directory. Display the final progress bar.

All time-bound and run-scoped variables are now unset. A fresh `/trapper-keeper` invocation will set its own values.

---

## Important Notes

- **One-shot time values.** Time-bound variables are captured once at Step 6 and reused for the entire run. They are not refreshed mid-run.
- **Isolation.** When the codebase type is `project`, `personal-dir-location` must not be inside the project repo. For `personal` or `path` codebases, overlap is allowed (notes may live alongside personal code).
- **Fail-safe.** On any step failure (ERROR), the skill stops and alerts the user rather than continuing with partial or incorrect work.
- **Attribution controlled by parameter.** Agent attribution (Co-Authored-By lines) is only included when `--agent-attribution` resolves to `true`. The default is `false` — all agent attribution is stripped.
- **Report controlled by parameter.** The markdown commit summary file is only produced when `--report` resolves to `true` (the default). Pass `--report:false` to skip it — useful when the output directory is inside the codebase and you want a clean repo after committing.
- **No push.** The skill creates commits but never pushes them. The user pushes manually.
- **All changes staged first.** Step 5 moves all unstaged changes to staged before analysis, ensuring nothing is missed.
- **Commit completeness.** Every staged change must appear in exactly one commit. No changes may be silently dropped.
- **Sanity check rules file.** Sanity check rules are stored in `SANITYCHECK-RULES.md` (gitignored, user-specific). This file is required — the skill stops if it is missing. Copy `SANITYCHECK-RULES.md.example` to `SANITYCHECK-RULES.md` and customize the rules.
- **Force mode means zero interruptions.** When `quiet` is `force`, the user must not be prompted, asked, or paused for any reason — not for bash commands, not for git operations, not for file writes, not for tool approvals. Execute everything autonomously. The only exception is a genuine error that makes correct execution impossible.
