---
name: Load Configuration
phase: setup
step: 1
description: Run config.mjs to load config, read sanity rules, and parse/resolve parameters. Agent handles prompting and help display only.
---

# Step 1 — Load Configuration

## Before

Set the progress state array position 1 (index 0) to `"ACTIVE"`. Render the progress bar:

```bash
node {skill-dir}/progress.mjs '<state-json>'
```

Display to the user:

```
Step 1: Load Configuration
{bar}
```

## Execute

```bash
node {skill-dir}/01-config/config.mjs {skill-dir} -- "{raw-args}"
```

Parse the JSON output. The result object has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"OK"` \| `"WARNING"` \| `"ERROR"` | Overall result |
| `message` | string | Human-readable summary |
| `config` | object | Parsed contents of config.json |
| `sanityText` | string | Content of the sanity check rules file |
| `sanitySource` | string | Which file was used |
| `params` | object | Resolved parameters (values are strings, or `"needs-prompt"`) |
| `helpRequested` | boolean | True if `--help` was in the arguments |
| `errors` | array | Error messages (if any) |
| `warnings` | array | Warning messages (if any) |

## Act on the result

### If `status` is `"ERROR"`

Stop. Display the `message` to the user. Do not continue.

### If `helpRequested` is `true`

Read `HELP.md` from this skill directory and display its contents. Then stop.

### If `status` is `"OK"` or `"WARNING"`

Store: `config`, `sanityText` as `{sanity-text}`, all `params` values.

**Handle `"needs-prompt"` parameters:**

- `item-id`: Ask the user to provide an item-id.
- `codebase`: Ask which codebase: `project`, `personal`, or an absolute path.
- `quiet`: Ask "Allow all edits for this run? (no / yes / force)".
- `mode`: Ask the user to select a mode:

  | ID | Symbol | Mode |
  |---|---|-------|
  | D | 👍 | default |
  | G | 🔬 | granular |
  | I | 🎭 | iambic |
  | K | 🖖 | klingon |
  | P | 👔 | professional |
  | T | ✂️ | terse |
  | V | 📜 | verbose |

- `agent-attribution`: Ask if they want agent attribution in commit messages.

## After

Set position 1 (index 0) to the `status`. Render the bar. Display:

```
Step 1: Load Configuration — {message}
{bar}
```
