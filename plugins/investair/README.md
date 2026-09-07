# Investair

Install via marketplace repo `Investair-com-au/investair-claude-marketplace` (Claude → Add marketplace → Add from a repository), then install plugin `investair`.


Research workflows built on the `Investair_data` MCP connector
(read-only ASX / Investair analytics over MySQL, hosted as a FastMCP server):
initiation coverage, company snapshots, sector reports, peer comparisons,
and institutional targeting lists — plus two weekly digests.

## Requirements

This plugin **bundles the connection** to `Investair_data` via
`.mcp.json` — URL only, no Bearer API key. It points at
`https://mcp.investair.com.au/mcp/prefect-v1` (production, fronted by a
Zuplo gateway). Authenticate with Claude's **OAuth / MCP connector** login
for that server — Clerk handles auth on the gateway side (do not set
`INVESTAIR_MCP_API_KEY` on this path — a stale key was causing expired-token
failures when stacked with OAuth).

If the server URL changes, update `.mcp.json` only — skills reference tools
by name, not connection details.

The `initiation-report` and `sector-report` skills also use the built-in
`docx` skill to produce editable Word documents — no extra setup needed.

## Components

| Skill | Trigger examples | Output |
|---|---|---|
| `initiation-report` | "initiate coverage on SKM", "write a research report for [company]" | Editable `.docx` |
| `company-snapshot` | "give me a snapshot of [ticker]" | Chat reply |
| `sector-report` | "sector report on ASX gold explorers in Côte d'Ivoire" | Editable `.docx` |
| `peer-cash-comparison` | "find peers for [ticker]", "compare [ticker] to its peers" | Chat reply (table) |
| `peer-cash-runway` | "cash runway timeline for [ticker]'s peers", "when will [ticker] and peers need to raise" | Chat reply + visual timeline artifact |
| `investor-targeting` | "institutional targeting list for [ticker]" | Chat reply (table) |
| `weekly-runway-screen` | "run the runway screen" (also runs on schedule) | Chat reply |
| `weekly-raises-digest` | "run the capital raises digest" (also runs on schedule) | Chat reply |
| `log-feedback` | "/log-feedback …", "send feedback on the last answer" | Calls MCP `log_feedback` (email to Investair) |
| `setup-scheduled-reports` | "set up the scheduled reports" (manual fallback — runs automatically via a hook on install) | Registers the two weekly digests in Cowork's own scheduler |

## Scheduled reports

Registered automatically — no manual step needed. A `SessionStart` hook
(`hooks/scripts/setup_scheduled_reports.py`) runs on every session start and
idempotently registers two tasks directly in Cowork's native "Scheduled"
panel (not Claude Code's local scheduler, and not the ephemeral
session-only cron). A second SessionStart hook
(`hooks/scripts/check_plugin_version.py`) compares the installed plugin
version to GitHub `main` and prints a one-line update notice only when you
are behind; otherwise it stays silent.

- **Weekly cash-runway / funding-risk screen** — Mondays 8:00am
- **Weekly capital raises digest** — Mondays 8:00am

The hook only *adds* these two entries if they're missing — it never
touches or removes anything else already in the scheduler (including your
own unrelated scheduled tasks), and does nothing on sessions after the
first where they're already registered. If for some reason the hook
doesn't fire in your environment, the `setup-scheduled-reports` skill does
the same thing on request ("set up the scheduled reports") as a manual
fallback — also idempotent, safe to run any time.

Both digests post directly into a chat session. If you'd rather have these
emailed, ask Claude to update the scheduled task to send via Outlook
instead.

## Data notes

- Resource ounces (JORC/mineral resource estimates) are **not** in the
  Investair database — `initiation-report` will ask for that figure, or
  source it from company announcements, rather than inventing one.
- `get_substantial_holders` reflects statutory-disclosure-threshold holders
  only — `investor-targeting` treats this as a proxy, not an exhaustive
  fund register, and says so in its output.
- Every report/digest defaults to the latest available data unless you name
  a specific date or period.
