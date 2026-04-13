---
name: Set Time-Bound Variables and Ensure Directories
phase: setup
step: 6
description: Run timesetup.mjs to capture timestamps, derive folder name, verify directory isolation, create output dirs, and resolve agent-attribution text. Agent only acts on errors.
---

# Step 6 — Set Time-Bound Variables and Ensure Directories

## Before

Set position 6 (index 5) to `"ACTIVE"`. Render the bar. Display:

```
Step 6: Set Time-Bound Variables and Ensure Directories
{bar}
```

## Execute

```bash
node {skill-dir}/06-timesetup/timesetup.mjs "{personal-dir-location}" "{resolved-codebase-path}" "{item-id}" "{agent-attribution}" "{codebase-type}"
```

Parse the JSON output.

## Act on the result

### If `status` is `"ERROR"`

Stop. Display the `message`.

### If `status` is `"OK"`

Store:
- `time.year` -> `{year}`, `time.month` -> `{month}`, `time.day` -> `{day}`, `time.hour` -> `{hour}`, `time.minutes` -> `{minutes}`, `time.timestamp` -> `{timestamp}`
- `folderName` -> `{folder-name}`
- `outputDir` -> `{output-dir}`
- `agentAttributionText` -> `{agent-attribution-text}`

## After

Set position 6 (index 5) to the `status`. Render the bar. Display:

```
Step 6: Set Time-Bound Variables and Ensure Directories — {message}
{bar}
```
