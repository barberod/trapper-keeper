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
   | `user-mail` | Must match `git config user.email` in your repo; set to `"_"` to skip email matching; overridable via `--user-mail` param |
   | `user-name` | Must match `git config user.name` in your repo; set to `"_"` to skip name matching; overridable via `--user-name` param |
   | `handle` | Short handle that appears in your branch names (optional); set to `"_"` to skip handle filtering; overridable via `--handle` param |
   | `product-text` | Description of your product and tech stack |
   | `defaults` | Default values for parameters (see Usage below) |

   See `config.example.json` for the full template with all keys.

4. Set up sanity check rules:
   ```bash
   cp SANITYCHECK-RULES.md.example SANITYCHECK-RULES.md
   ```
   Customize the lettered self-audit questions for your commit message standards. This file is **required**.

## Usage

```
/trapper-keeper [--codebase:value] [--item-id:value] [--handle:value] [--quiet[:false|true|force]] [--mode:value] [--agent-attribution[:bool]] [--user-mail:value] [--user-name:value]
```

> **Tip:** Pass `--help` for a quick-reference card with all parameters, defaults, and examples.

Parameters use `--name:value` syntax, in any order. Booleans accept `--name`, `--name:true`, or `--name:false`. The `--quiet` parameter also accepts `--quiet:force` for maximum automation. Omitted parameters fall back to config defaults.

| Param | Type | Config Default | Effect |
|-------|------|----------------|--------|
| `--codebase` | string | `"project"` | Select repo: `project` (🏢), `personal` (🏠), or absolute path |
| `--item-id` | string | *(none -- prompted)* | Work item identifier (e.g., `pbi20525`) |
| `--handle` | string | *(config)* | Developer handle for branch matching; `_` skips filtering |
| `--quiet` | `false` \| `true` \| `force` | `false` | `false`: pause for confirmations. `true`: skip skill confirmations. `force`: skip all interruptions including tool approvals. |
| `--mode` | string | `"default"` | Commit style: `default`, `granular`, `iambic`, `klingon`, `professional`, `terse`, `verbose` |
| `--agent-attribution` | bool | `false` | Allow Co-Authored-By lines in commits |
| `--user-mail` | string | *(config)* | Override git email check; `_` skips |
| `--user-name` | string | *(config)* | Override git name check; `_` skips |

**Identity parameters** (`--handle`, `--user-mail`, `--user-name`) fall back to their corresponding top-level config keys, not to `defaults`. They are never prompted for.

**Examples:**
- `/trapper-keeper` -- prompts for item-id, uses config defaults for the rest
- `/trapper-keeper --item-id:pbi20525` -- project repo (default), default mode
- `/trapper-keeper --codebase:personal --item-id:main --mode:terse` -- personal repo, terse mode
- `/trapper-keeper --item-id:pbi20525 --mode:professional --quiet --agent-attribution` -- professional mode, quiet, attribution on

When it finishes:
- Commits have been created locally -- you still need to **push**
- A markdown summary of all commits and SHAs is saved to your personal notes directory

## How it works

Each mode is defined by a markdown file (`DEFAULT.md`, `GRANULAR.md`, etc.) that contains instructions Claude follows at runtime. Sanity check rules are stored in `SANITYCHECK-RULES.md` (gitignored, user-specific). `SKILL.md` is the orchestrator that validates config, resolves the branch, sets variables, and delegates to the chosen mode file. There is no compiled code -- the entire skill is structured prompts.

## License

MIT
