# Public marketplace channel

This repo is the **public** Claude marketplace: skill names, short descriptions, the MCP connector URL, and user-facing update notes.

| | Public (this repo) | Private |
|---|---|---|
| Repo | `Investair-com-au/investair-claude-marketplace` | `TerryTian-Investair/investair-claude-plugin` |
| Channel | `public` | `private` |
| Allowed | Skill names, short descriptions, MCP URL, update notes | Full skills, SQL, table names, schema |
| Forbidden | SQL, table/column names, schema, data internals | — |

Work happens in the **private** plugin first. Publish here only as a description-only PR.

## Labels

| Label | Meaning |
|---|---|
| `channel:public` | Description-only; safe for this repo |
| `description-only` | Names, short descriptions, update notes |
| `channel:private` | Contains private tech detail |
| `internal-only` | SQL, tables, schema |
| `do-not-merge-public` | Must not merge to `main` |

PRs with `channel:private`, `internal-only`, or `do-not-merge-public` stay closed or are rewritten before merge.
