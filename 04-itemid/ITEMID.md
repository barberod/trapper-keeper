---
name: Resolve Item ID
phase: setup
step: 4
description: Run itemid.mjs to validate the item-id format. Agent handles prompting if item-id was not provided.
---

# Step 4 — Resolve Item ID

## Before

Set position 4 (index 3) to `"ACTIVE"`. Render the bar. Display:

```
Step 4: Resolve Item ID
{bar}
```

## Execute

If `item-id` is still `"needs-prompt"`, ask the user to provide one before running the script.

```bash
node {skill-dir}/04-itemid/itemid.mjs "{item-id}" "{codebase-type}"
```

Parse the JSON output. The result has:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"OK"` \| `"ERROR"` | Overall result |
| `message` | string | Human-readable summary |
| `validatedItemId` | string | The validated item-id |
| `errors` | array | Error messages (if any) |

## Act on the result

### If `status` is `"ERROR"`

Display the errors. If the item-id can be corrected (e.g., format issue), prompt the user for a new one and re-run. If the restriction is absolute (e.g., "main" on project codebase), explain and prompt for a different item-id.

### If `status` is `"OK"`

Store `validatedItemId` as `{item-id}`.

## After

Set position 4 (index 3) to the `status`. Render the bar. Display:

```
Step 4: Resolve Item ID — {message}
{bar}
```
