# Trapper Keeper

A [Claude Code](https://claude.ai/code) skill that automatically analyzes staged and unstaged changes in a git repository and creates well-crafted git commits with descriptive messages. It orchestrates 9 steps — 6 deterministic setup steps, 1 mode execution phase (deterministic scripts + agent inference), 1 completion step, and a completion message.

## Modes

| | Mode | What it does |
|---|------|-------------|
| 👍 | **Default** | Conventional Commits format (type(scope): description) |
| 🔬 | **Granular** | Fine-grained "verb the noun" format |
| 🎭 | **Iambic** | Iambic pentameter (da-DUM x 5 = 10 syllables) |
| 🖖 | **Klingon** | tlhIngan Hol with English gloss |
| 👔 | **Professional** | Conventional Commits + multi-line body explaining "why" |
| ✂️ | **Terse** | Aggressive grouping, 3-8 word messages only |
| 📜 | **Verbose** | What/Why/Considered/Side effects format |

Each mode is defined by its own markdown frontmatter file in the `modes/` directory.

## Architecture

Each step lives in its own numbered subfolder (`01-config/`, `02-check/`, etc.) containing:
- A **markdown file** (agent instructions: Before/Execute/Validate/Act/After)
- One or more **`.mjs` scripts** (deterministic logic: validation, data gathering, verification)

A shared `progress.mjs` utility renders an 8-emoji progress bar (`🟩🟩🟩🟣⬛⬛⬛⬛`) that updates before and after each step.

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI or IDE extension
- Node.js (for `.mjs` scripts)
- A git repo with a branch checked out and uncommitted changes

## Install

1. Copy this directory into your Claude Code skills folder:
   ```
   ~/.claude/skills/trapper-keeper/
   ```

2. Copy the example config and fill in your values:
   ```bash
   cp config.example.json config.json
   ```

3. Edit `config.json`:
   ```json
   {
     "project-repo-location": "C:\\path\\to\\your\\project-repo",
     "personal-dir-location": "C:\\path\\to\\your\\personal-notes",
     "user-mail": "you@example.com",
     "user-name": "Your Name",
     "handle": "yourhandle",
     "defaults": {
       "codebase": "project",
       "quiet": false,
       "mode": "default",
       "agent-attribution": false
     }
   }
   ```

   | Key | Description |
   |-----|-------------|
   | `project-repo-location` | Local path to the repo you work in |
   | `personal-dir-location` | Path for notes/artifacts (must be outside the repo) |
   | `user-mail` | Must match `git config user.email` (or `_` to skip; overridable via `--user-mail`) |
   | `user-name` | Must match `git config user.name` (or `_` to skip; overridable via `--user-name`) |
   | `handle` | Short handle in your branch names (optional; `_` to skip filtering; overridable via `--handle`) |
   | `product-text` | Description of your product and tech stack |
   | `defaults` | Default values for parameters |

4. Set up sanity check rules:
   ```bash
   cp SANITYCHECK-RULES.md.example SANITYCHECK-RULES.md
   ```
   Customize the self-audit questions. This file is **required**.

## Usage

```
/trapper-keeper [--codebase:value] [--item-id:value] [--handle:value] [--quiet[:false|true|force]] [--mode:value] [--agent-attribution[:bool]] [--user-mail:value] [--user-name:value]
```

> **Tip:** Pass `--help` for a quick-reference card.

| Param | Type | Config Default | Effect |
|-------|------|----------------|--------|
| `--codebase` | string | `"project"` | `project` (🏢), `personal` (🏠), or absolute path |
| `--item-id` | string | *(prompted)* | Work item identifier (e.g., `pbi20525`) |
| `--handle` | string | *(config)* | Branch matching handle; `_` skips filtering |
| `--quiet` | `false`\|`true`\|`force` | `false` | Automation level |
| `--mode` | string | `"default"` | Commit style |
| `--agent-attribution` | bool | `false` | Allow Co-Authored-By lines |
| `--user-mail` | string | *(config)* | Override git email check; `_` skips |
| `--user-name` | string | *(config)* | Override git name check; `_` skips |

**Examples:**
- `/trapper-keeper` -- prompts for item-id, uses config defaults
- `/trapper-keeper --item-id:pbi20525` -- project repo, default mode
- `/trapper-keeper --item-id:pbi20525 --mode:professional --quiet` -- professional mode, quiet
- `/trapper-keeper --codebase:personal --item-id:main --mode:terse` -- personal repo, terse mode

When it finishes:
- Commits are created on the branch (you still need to **push**)
- A markdown summary with SHAs is saved to your personal notes directory

## Directory Structure

```
trapper-keeper/
├── SKILL.md                     # Thin orchestrator
├── progress.mjs                 # Shared progress bar utility
├── README.md
├── HELP.md
├── config.json                  # User config (gitignored)
├── config.example.json
├── SANITYCHECK-RULES.md         # User sanity rules (gitignored)
├── SANITYCHECK-RULES.md.example
├── .gitignore
│
├── modes/                       # Mode payload files
│   ├── DEFAULT.md
│   ├── GRANULAR.md
│   ├── IAMBIC.md
│   ├── KLINGON.md
│   ├── PROFESSIONAL.md
│   ├── TERSE.md
│   └── VERBOSE.md
│
├── 01-config/       CONFIG.md + config.mjs
├── 02-check/        CHECK.md + check.mjs
├── 03-codebase/     CODEBASE.md + codebase.mjs
├── 04-itemid/       ITEMID.md + itemid.mjs
├── 05-branch/       BRANCH.md + branch.mjs
├── 06-timesetup/    TIMESETUP.md + timesetup.mjs
├── 07-mode/         MODE.md + validate-output.mjs
└── 08-complete/     COMPLETE.md + complete.mjs
```

## How It Works

**Deterministic scripts** (`.mjs`) handle everything that can be done reliably without inference: config parsing, parameter validation, git operations, branch verification, change staging, file existence checks.

**Agent inference** handles everything that requires judgment: analyzing code changes, grouping related changes, writing commit messages in the selected style, and creating the commits.

Each script outputs a JSON result tuple:
```json
{
  "status": "OK",
  "message": "Human-readable summary."
}
```

## License

MIT
