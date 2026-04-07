---
name: Verify Branch, Working Tree State, and Stage Changes
phase: setup
step: 5
description: Run branch.mjs to find the designated branch, verify checkout, check working tree, stage all changes, and count staged files. Agent handles branch selection and quiet mode.
---

# Step 5 — Verify Branch, Working Tree State, and Stage Changes

## Before

Set position 5 (index 4) to `"ACTIVE"`. Render the bar. Display:

```
Step 5: Verify Branch and Stage Changes
{bar}
```

## Execute

```bash
node {skill-dir}/05-branch/branch.mjs "{resolved-codebase-path}" "{item-id}" "{handle}" "{codebase-type}"
```

If re-running after user selects a branch, append the selected branch name as the fifth argument.

Parse the JSON output. The result has:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"OK"` \| `"WARNING"` \| `"ERROR"` | Overall result |
| `message` | string | Human-readable summary |
| `checks` | object | `branchSearch`, `checkout`, `workingTree`, `changes` |
| `needsUserChoice` | boolean | Multiple branches match — ask user to pick |
| `needsUserConfirm` | boolean | Handle was empty and one match — confirm |
| `errors` | array | Error messages |
| `warnings` | array | Warning messages |

The `checks.changes` sub-object contains:
- `stagedCount` — number of files staged for commit
- `headBefore` — SHA of HEAD before staging (used by Step 8 to verify commits)

## Act on the result

### If `status` is `"ERROR"`

Stop. Display the `message`. If the error is "No staged or unstaged changes found," inform the user there is nothing to commit.

### If `needsUserChoice` is `true`

Display matching branches. Ask user to select one. Re-run with the selected branch.

### If `needsUserConfirm` is `true`

Confirm the branch with the user. If handle was `_`, no confirmation needed.

### If `status` is `"OK"`

Store:
- `checks.branchSearch.designated` as `{designated-branch}`
- `checks.changes.headBefore` as `{head-before}`
- `checks.changes.stagedCount` as `{staged-count}`

**Establish quiet mode.** If `quiet` is still `"needs-prompt"`, ask the user: "Allow all edits for this run? (no / yes / force)". The three levels:

| Level | Behavior |
|-------|----------|
| `false` | Normal. Pause to confirm significant actions. |
| `true` | Quiet. Skip skill-level confirmations. |
| `force` | Force. Zero interruptions. Execute everything autonomously. |

## After

Set position 5 (index 4) to the `status`. Render the bar. Display:

```
Step 5: Verify Branch and Stage Changes — {message}
{bar}
```
