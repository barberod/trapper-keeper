### 🗂️ How to Use the "Trapper Keeper" Skill

Analyze changes and create well-crafted git commits in one run.

```
/trapper-keeper [--codebase:value] [--item-id:value] [--quiet[:false|true|force]] [--mode:value] [--agent-attribution[:bool]]
```

| Param | Type | Default | What it does |
|-------|------|---------|--------------|
| `--codebase` | string | `"project"` | Repo: `project`, `personal`, path, or alias (`work`, `mine`, etc.) |
| `--item-id` | string | *(prompted)* | Work item ID (e.g., `pbi20525`) |
| `--quiet` | `false` \| `true` \| `force` | `false` | `false`: normal. `true`: skip skill confirmations. `force`: skip all interruptions. |
| `--mode` | string | `"default"` | Commit style (see modes below) |
| `--agent-attribution` | bool | `false` | Allow Co-Authored-By lines |

Booleans: `--quiet` = true, `--quiet:true` = true, `--quiet:false` = false, `--quiet:force` = force (max automation).
Omitted params use defaults from `config.json` > `"defaults"`.

**Modes:** 👍 default | 🔬 granular | 🎭 iambic | 🖖 klingon | 👔 professional | ✂️ terse | 📜 verbose

**Examples:**
- `/trapper-keeper --item-id:pbi20525 --mode:terse --quiet`
- `/trapper-keeper --codebase:personal --item-id:main`
- `/trapper-keeper` *(prompts for item-id, rest from config)*
