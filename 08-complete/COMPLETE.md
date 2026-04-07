---
name: Process Complete
phase: completion
step: 8
description: Run complete.mjs to verify output artifacts and that new commits exist, then inform the user.
---

# Step 8 — Process Complete

## Before

Set position 8 (index 7) to `"ACTIVE"`. Render the bar. Display:

```
Step 8: Process Complete
{bar}
```

## Execute

```bash
node {skill-dir}/08-complete/complete.mjs "{output-dir}" "{timestamp}" "{resolved-codebase-path}" "{head-before}"
```

Parse the JSON output. The result has:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"OK"` \| `"ERROR"` | Overall result |
| `message` | string | Human-readable summary |
| `outputFiles` | array | Output filenames found |
| `newCommits` | number | Count of new commits since `{head-before}` |
| `commits` | array | Commit SHAs and subjects |
| `errors` | array | Error messages |

## Act on the result

### If `status` is `"ERROR"`

Alert the user about missing output or commits.

### If `status` is `"OK"`

Inform the user: New commits have been created on the designated branch, but the user must still **push** them. All artifacts saved to `{output-dir}`.

## After

Set position 8 (index 7) to the final `status`. Render the final bar. Display:

```
Step 8: Process Complete — {message}
{bar}
```

### Reset Variables

All time-bound and run-scoped variables are now unset. A fresh `/trapper-keeper` invocation will set its own values.
