---
name: Execute Mode
phase: execution
step: 7
description: Agent reads the selected mode file, replaces placeholders, and executes the mode's tasks to create git commits. validate-output.mjs confirms the output file was written.
---

# Step 7 — Execute Mode

## Before

Set position 7 (index 6) to `"ACTIVE"`. Render the bar. Display:

```
Step 7: Execute Mode ({mode})
{bar}
```

## Execute (inference)

The resolved mode is `{mode}`. Read the corresponding file from `{skill-dir}/modes/`:

| Mode | File |
|------|------|
| default | `modes/DEFAULT.md` |
| granular | `modes/GRANULAR.md` |
| iambic | `modes/IAMBIC.md` |
| klingon | `modes/KLINGON.md` |
| professional | `modes/PROFESSIONAL.md` |
| terse | `modes/TERSE.md` |
| verbose | `modes/VERBOSE.md` |

Replace all `{placeholders}` with resolved values. Execute the tasks described in the mode file — analyze all staged changes, group them into logically coherent commits, and create those commits with well-crafted messages.

**Every staged change must appear in exactly one commit. No changes may be silently dropped.**

After the git commits are created:

- **If `{report}` is `"true"`:** produce a markdown file with the commit messages and their corresponding commit SHAs.
- **If `{report}` is `"false"`:** skip the markdown summary file entirely.

**If any problem prevents 100% accurate execution, stop and alert the user.**

## Validate

**If `{report}` is `"false"`:** skip validation entirely — set status to `"OK"` and continue to Step 8.

**If `{report}` is `"true"`:** determine the expected output filename:

| Mode | Output Filename |
|------|-----------------|
| default | `commits_{timestamp}.md` |
| granular | `commits-granular_{timestamp}.md` |
| iambic | `commits-iambic_{timestamp}.md` |
| klingon | `commits-klingon_{timestamp}.md` |
| professional | `commits-professional_{timestamp}.md` |
| terse | `commits-terse_{timestamp}.md` |
| verbose | `commits-verbose_{timestamp}.md` |

Run the validation script:

```bash
node {skill-dir}/07-mode/validate-output.mjs "{output-dir}" "{expected-output-filename}"
```

## Act on the result

### If `status` is `"ERROR"`

The output file was not written or is empty. Fix and re-validate.

### If `status` is `"OK"`

Continue to Step 8.

## After

Set position 7 (index 6) to the final `status`. Render the bar. Display:

```
Step 7: Execute Mode ({mode}) — {message}
{bar}
```
