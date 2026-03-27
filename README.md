# Trapper Keeper

A [Claude Code](https://claude.ai/code) skill that automates git commit authoring. It analyzes staged and unstaged changes in a branch, groups them into logically coherent commits, and creates those commits with well-crafted messages -- all in one invocation. Choose from 7 stylistic modes ranging from terse to verbose, conventional to Klingon.

## Modes

| | Mode | Grouping | Message Style |
|---|------|----------|---------------|
| 👍 | **Default** | Standard | Conventional Commits subject-only (`type(scope): desc`) |
| 🔬 | **Granular** | Fine-grained | "verb the noun" naming specific methods/classes |
| 🎭 | **Iambic** | Standard | Iambic pentameter |
| 🖖 | **Klingon** | Standard | tlhIngan Hol with parenthetical English gloss |
| 👔 | **Professional** | Standard | Conventional Commits + multi-line body explaining "why" |
| ✂️ | **Terse** | Aggressive (fewest commits) | 3-8 words, no body |
| 📜 | **Verbose** | Standard | Subject + detailed body (What/Why/Considered/Side effects) |

Each mode is defined by its own markdown frontmatter file. The skill reads the file, replaces placeholders with runtime values, and follows the instructions to create commits.

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI or IDE extension
- A git repo with a branch checked out that has staged or unstaged changes

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
     "git-user-email": "you@example.com",
     "git-user-name": "Your Name",
     "developer-handle": "yourhandle"
   }
   ```

   | Key | Description |
   |-----|-------------|
   | `project-repo-location` | Local path to the repo you work in |
   | `personal-dir-location` | Path for notes/artifacts (must be outside the repo) |
   | `git-user-email` | Must match `git config user.email` in your repo |
   | `git-user-name` | Must match `git config user.name` in your repo |
   | `developer-handle` | Short handle that appears in your branch names (optional) |
   | `product-text` | Description of your product and tech stack |
   | `sanity-text` | Self-audit questions run after commit messages are drafted |

   See `config.example.json` for the full template with all keys.

## Usage

```
/trapper-keeper [codebase] [item-id] [quiet] [mode] [agent-attribution-allowed]
```

All parameters are optional:

| Param | Effect |
|-------|--------|
| `codebase` | Select the repo: `project` (🏢), `personal` (🏠), or an absolute path to a git repo |
| `item-id` | Skip the item ID prompt (e.g., `pbi20525`) |
| `quiet` | Allow all edits without per-action confirmations |
| `mode` | Select commit style: `default`, `granular`, `iambic`, `klingon`, `professional`, `terse`, `verbose` |
| `agent-attribution-allowed` | `true` to allow Co-Authored-By lines; `false` (default) to strip them |

**Examples:**
- `/trapper-keeper` -- interactive, prompts for everything
- `/trapper-keeper project pbi20525` -- project repo, item ID pbi20525
- `/trapper-keeper C:\my-other-repo pbi20525 quiet default` -- arbitrary repo path, fast mode, default style
- `/trapper-keeper work pbi20525 quiet professional true` -- project repo, professional mode, attribution on

When it finishes:
- Commits have been created locally -- you still need to **push**
- A markdown summary of all commits and SHAs is saved to your personal notes directory

## How it works

Each mode is defined by a markdown file (`DEFAULT.md`, `GRANULAR.md`, etc.) that contains instructions Claude follows at runtime. `SKILL.md` is the orchestrator that validates config, resolves the branch, sets variables, and delegates to the chosen mode file. There is no compiled code -- the entire skill is structured prompts.

## License

MIT
