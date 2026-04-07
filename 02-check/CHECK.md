---
name: Check Requirements
phase: setup
step: 2
description: Run check.mjs to validate repo, personal directory, git credentials, and required skill files. Agent only acts on errors.
---

# Step 2 — Check Requirements

## Before

Set position 2 (index 1) to `"ACTIVE"`. Render the bar. Display:

```
Step 2: Check Requirements
{bar}
```

## Execute

```bash
node {skill-dir}/02-check/check.mjs {skill-dir} "{project-repo-location}" "{personal-dir-location}" "{user-mail}" "{user-name}" "{handle}"
```

Parse the JSON output.

## Act on the result

### If `status` is `"ERROR"`

Stop. Display the `message` and each failed check's `detail`.

### If `status` is `"OK"` or `"WARNING"`

Continue. Display any warnings.

## After

Set position 2 (index 1) to the `status`. Render the bar. Display:

```
Step 2: Check Requirements — {message}
{bar}
```
