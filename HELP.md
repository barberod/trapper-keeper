### How to Use the "Trapper Keeper" Skill

Analyze changes and create well-crafted git commits in one run.

```
/trapper-keeper [--codebase:value] [--item-id:value] [--handle:value] [--quiet[:false|true|force]] [--mode:value] [--agent-attribution[:bool]] [--git-user-email:value] [--git-user-name:value]
```

| Param | Type | Default | What it does |
|-------|------|---------|--------------|
| `--codebase` | string | `"project"` | Repo: `project`, `personal`, path, or alias (`work`, `mine`, etc.) |
| `--item-id` | string | *(prompted)* | Work item ID (e.g., `pbi20525`) |
| `--handle` | string | *(config)* | Developer handle for branch matching; `_` skips filtering |
| `--quiet` | `false` \| `true` \| `force` | `false` | `false`: normal. `true`: skip skill confirmations. `force`: skip all interruptions. |
| `--mode` | string | `"default"` | Commit style (see modes below) |
| `--agent-attribution` | bool | `false` | Allow Co-Authored-By lines |
| `--git-user-email` | string | *(config)* | Override git email check; `_` skips |
| `--git-user-name` | string | *(config)* | Override git name check; `_` skips |

Booleans: `--quiet` = true, `--quiet:true` = true, `--quiet:false` = false, `--quiet:force` = force (max automation).
Omitted params use defaults from `config.json` > `"defaults"`.

**Identity parameters** (`--handle`, `--git-user-email`, `--git-user-name`) fall back to their corresponding top-level config keys (`handle`, `git-user-email`, `git-user-name`), not to `defaults`. They are never prompted for.

**Modes:** 👍 default | 🔬 granular | 🎭 iambic | 🖖 klingon | 👔 professional | ✂️ terse | 📜 verbose

**Examples:**
- `/trapper-keeper --item-id:pbi20525 --mode:terse --quiet`
- `/trapper-keeper --codebase:personal --item-id:main`
- `/trapper-keeper --handle:_ --git-user-email:_ --git-user-name:_` *(skip all identity checks)*
- `/trapper-keeper` *(prompts for item-id, rest from config)*
