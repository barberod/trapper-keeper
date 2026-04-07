---
name: Resolve Codebase
phase: setup
step: 3
description: Run codebase.mjs to map the codebase parameter to an absolute path and verify it is a git repository. Agent only acts on errors.
---

# Step 3 — Resolve Codebase

## Before

Set position 3 (index 2) to `"ACTIVE"`. Render the bar. Display:

```
Step 3: Resolve Codebase
{bar}
```

## Execute

```bash
node {skill-dir}/03-codebase/codebase.mjs "{codebase}" "{project-repo-location}" "{personal-dir-location}"
```

Parse the JSON output.

## Act on the result

### If `status` is `"ERROR"`

Stop. Display the `message`.

### If `status` is `"OK"`

Store: `resolvedPath` as `{resolved-codebase-path}`, `codebaseType` as `{codebase-type}`.

## After

Set position 3 (index 2) to the `status`. Render the bar. Display:

```
Step 3: Resolve Codebase — {message}
{bar}
```
