### 🗂️ How to Use the "Trapper Keeper" Skill

Analyze changes and create well-crafted git commits in one run.

```
/trapper-keeper [--codebase:value] [--item-id:value] [--quiet[:bool]] [--mode:value] [--agent-attribution-allowed[:bool]]
```

| Param | Type | Default | What it does |
|-------|------|---------|--------------|
| `--codebase` | string | `"project"` | Repo: `project`, `personal`, path, or alias (`work`, `mine`, etc.) |
| `--item-id` | string | *(prompted)* | Work item ID (e.g., `pbi20525`) |
| `--quiet` | bool | `false` | Skip per-action confirmations |
| `--mode` | string | `"default"` | Commit style (see modes below) |
| `--agent-attribution-allowed` | bool | `false` | Allow Co-Authored-By lines |

Booleans: `--quiet` = true, `--quiet:true` = true, `--quiet:false` = false.
Omitted params use defaults from `config.json` > `"defaults"`.

**Modes:** 👍 default | 🔬 granular | 🎭 iambic | 🖖 klingon | 👔 professional | ✂️ terse | 📜 verbose

**Examples:**
- `/trapper-keeper --item-id:pbi20525 --mode:terse --quiet`
- `/trapper-keeper --codebase:personal --item-id:main`
- `/trapper-keeper` *(prompts for item-id, rest from config)*
