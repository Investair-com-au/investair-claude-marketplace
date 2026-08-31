# Investair

Install via marketplace repo `Investair-com-au/investair-claude-marketplace` (Claude → Add marketplace → Add from a repository), then install plugin `investair`.


Research workflows built on the `Investair_data` MCP connector
(read-only ASX / Investair analytics over MySQL, hosted as a FastMCP server):
initiation coverage, company snapshots, sector reports, peer comparisons,
and institutional targeting lists — plus two weekly digests.

## Requirements

This plugin **bundles the connection** to `Investair_data` via
`.mcp.json` — you don't need to connect it separately in Cowork first.
It currently points at `https://investair-mcp.fastmcp.app/mcp` — the **production**
deployment — and authenticates with a Bearer token read from the
`INVESTAIR_MCP_API_KEY` environment variable. The plugin file itself never
contains the actual key. Swap the `url` in `.mcp.json` to the production
endpoint once testing is done.

Before installing, set that variable in your local environment with a
valid API key/token for this FastMCP deployment (from your Prefect/FastMCP
Cloud account). If the deployment actually expects a different header or
auth scheme than a Bearer token, update the `headers` block in `.mcp.json`
to match — this was written from FastMCP Cloud's typical pattern, not
verified against a live connection.

If the server's URL or auth requirements change in the future (the
connector is expected to evolve), update `.mcp.json` accordingly — nothing
else in the plugin should need to change, since the skills reference tools
by name, not by connection details.

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
