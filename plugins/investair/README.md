# Investair

Install via marketplace repo `Investair-com-au/investair-claude-marketplace` (Claude → Add marketplace → Add from a repository), then install plugin `investair`.

Research workflows over the Investair MCP connector: initiation coverage, company snapshots, sector reports, peer comparisons, institutional targeting lists, and two weekly digests.

## Requirements

This plugin **bundles the connection** to Investair MCP via `.mcp.json` — URL only, no API key. Sign in with Claude’s **OAuth / MCP connector**.

Initiation and sector reports also use the built-in `docx` skill for Word documents.

## Skills

| Skill | Trigger examples | Output |
|---|---|---|
| `initiation-report` | "initiate coverage on SKM" | Editable `.docx` |
| `company-snapshot` | "give me a snapshot of [ticker]" | Chat reply |
| `sector-report` | "sector report on ASX gold explorers" | Editable `.docx` |
| `peer-cash-comparison` | "compare [ticker] to its peers" | Chat reply |
| `peer-cash-runway` | "cash runway timeline for [ticker]'s peers" | Chat reply + visual |
| `investor-targeting` | "institutional targeting list for [ticker]" | Chat reply |
| `weekly-runway-screen` | "run the runway screen" | Chat reply |
| `weekly-raises-digest` | "run the capital raises digest" | Chat reply |
| `log-feedback` | "/log-feedback" | Sends feedback to Investair |
| `setup-scheduled-reports` | "set up the scheduled reports" | Registers weekly digests |

## Scheduled reports

Registered automatically on install:

- Weekly cash-runway / funding-risk screen — Mondays 8:00am
- Weekly capital raises digest — Mondays 8:00am

## Notes

- Reports use the latest available data unless you name a date.
- Resource ounces are not always in Investair data — the initiation report will ask if needed.
- Substantial-holder lists are statutory-disclosure holders, not a full fund register.
