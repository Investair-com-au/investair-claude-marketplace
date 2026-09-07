# investair-claude-marketplace

A Claude Code **plugin marketplace** repo: one plugin (`investair`) that gives
Claude research skills over Investair's ASX data, connected via a bundled MCP
connector. This repo contains **only** the plugin (skills, hooks, connector
config) — no SQL, no server code, no secrets.

Public repo (`Investair-com-au/investair-claude-marketplace`, not private).
**Never commit API keys, tokens, or anything secret-shaped here** — assume
anyone can read the full history.

## Structure

```
.claude-plugin/marketplace.json   marketplace catalog (lists the one plugin + its version)
plugins/investair/
  .claude-plugin/plugin.json      plugin manifest (name, version, description)
  .mcp.json                       bundled MCP connector config
  README.md                       user-facing install/requirements doc
  hooks/hooks.json                SessionStart hook registrations
  hooks/scripts/*.py              the two SessionStart hooks (see below)
  skills/<name>/SKILL.md          one skill per directory; see table below
  skills/<name>/references/*.md   longer reference docs a skill loads on demand
```

Claude discovers plugins by reading `marketplace.json`, which points at
`./plugins/investair` — that's the only wiring; nothing else registers the
plugin.

## Branches

- **`main`** — what ships. `hooks/scripts/check_plugin_version.py` (a
  SessionStart hook) always compares the installed plugin's version against
  `main`'s `plugin.json` via `raw.githubusercontent.com` — bumping a version
  on a feature branch does **not** trigger update notices for anyone until
  that branch is merged to `main`.
- **`SFR_code`** — Stuart's working branch. Develop and test here; merge to
  `main` when a change is ready to actually reach installed users.

## The MCP connector (`plugins/investair/.mcp.json`)

```json
{
  "mcpServers": {
    "Investair_data": {
      "type": "http",
      "url": "https://mcp.investair.com.au/mcp/prefect-v1"
    }
  }
}
```

- Points at a **Zuplo gateway** (`mcp.investair.com.au`) in front of the real
  MCP server (a separate repo — see below), at the `/mcp/prefect-v1` route.
- **Auth is OAuth-only, via Clerk federated through Zuplo's own OAuth
  endpoints** (`x-zuplo-browser-login-kind: federated_oidc` in the gateway's
  authorization-server metadata). There is deliberately **no `headers` /
  `Authorization` block** — do not add one, and do not reintroduce
  `INVESTAIR_MCP_API_KEY`. A prior static-key setup (commit `a63ab7c`) caused
  exactly this failure: *"OAuth fallback is disabled when headers.Authorization
  is set"*, stacked with the key itself expiring. OAuth-only was a deliberate
  fix, not an oversight.
- **How to sanity-check the gateway without logging in**, if a connection
  ever fails and you need to know which link broke: an unauthenticated
  request to the URL above should return `401` with a `WWW-Authenticate`
  header naming a `resource_metadata` URL; that URL should return protected-resource
  JSON whose `authorization_servers` entry, fetched at
  `https://mcp.investair.com.au/.well-known/oauth-authorization-server/mcp/prefect-v1`,
  should return full OAuth server metadata (`authorization_endpoint`,
  `token_endpoint`, `registration_endpoint`, `code_challenge_methods_supported:
  ["S256"]`). All of that was confirmed working with plain `curl` as of
  2026-09-04. What that check *cannot* confirm is the actual interactive
  sign-in (Zuplo → Clerk → token issuance) or whether a real issued token is
  accepted by the MCP endpoint — that needs an actual user login in Claude.
- If the URL or auth model changes again in the future, `.mcp.json` is the
  only file that needs to change — skills call MCP tools by name, never by
  connection detail.

**The MCP server itself is a different repo** —
`TerryTian-Investair/investair-data-intelligence-mcp` (Python/FastMCP,
Prefect-Horizon-hosted). This repo never contains SQL, table names, or
governance/rate-limit logic; that all lives there. If a skill needs new data,
the tool has to be added on the server side first.

## Keeping versions in sync

Nothing automates this — three places need the same version number bumped
together, or the version-check hook and the marketplace listing drift from
the plugin's actual manifest:

1. `plugins/investair/.claude-plugin/plugin.json` → `"version"`
2. `.claude-plugin/marketplace.json` → `"plugins"[0]"."version"`
3. Root `README.md` → the `plugins/investair/` row in the Contents table

## SessionStart hooks

Both registered in `hooks/hooks.json`, both **fail open** (any unexpected
condition — unfamiliar environment, unreadable files, network failure —
results in silent no-op, never a blocked session or a raised error):

- **`setup_scheduled_reports.py`** — idempotently registers the two weekly
  digest tasks (`investair-weekly-runway-screen`,
  `investair-weekly-raises-digest`, both Mondays 8am) directly into Cowork's
  own scheduler. Relies on an **observed, not documented** workspace layout
  (`.../local-agent-mode-sessions/<space-id>/<session-id>/...`, with the
  registry two directories up from `CLAUDE_PLUGIN_ROOT`) — if Cowork's
  internal layout ever changes, this hook just silently stops registering
  anything rather than erroring, so "the schedule never showed up" needs
  manual investigation of that path structure, not an error message to go on.
- **`check_plugin_version.py`** — fetches `plugin.json` from GitHub `main`
  (raw.githubusercontent.com, 3s timeout) and prints a one-line "update
  available" notice only when remote semver > local semver. Never blocks,
  never errors visibly.

## Skills

| Skill | User-facing? | Trigger examples | Output |
|---|---|---|---|
| `company-snapshot` | yes | "snapshot of [ticker]", "give me an overview of [company]" | Chat reply |
| `initiation-report` | yes | "initiate coverage on [ticker]", "write a research report for [company]" | Editable `.docx` |
| `sector-report` | yes | "sector report on [commodity/geography] explorers" | Editable `.docx` |
| `peer-cash-comparison` | yes | "find peers for [ticker]", "compare [ticker] to its peers" | Chat reply (table) |
| `peer-cash-runway` | yes | "cash runway timeline for [ticker]'s peers", "when will [ticker] need to raise" | Chat reply + HTML timeline artifact |
| `investor-targeting` | yes | "institutional targeting list for [ticker]" | Chat reply (ranked shortlist) |
| `weekly-runway-screen` | yes (+ scheduled) | "run the runway screen", "run the raise radar" | Chat reply (week-over-week digest) |
| `weekly-raises-digest` | yes (+ scheduled) | "run the capital raises digest", "check this week's raises" | Chat reply (digest) |
| `log-feedback` | yes | `/log-feedback`, "send feedback on that answer" | Calls MCP `log_feedback` (audit + email to Investair) |
| `setup-scheduled-reports` | yes (manual fallback) | "set up the scheduled reports" | Registers the two weekly tasks (normally automatic via hook) |
| `artifact-design` | **no** (`user-invocable: false`) | — | Helper: HTML-artifact layout guidance, loaded by `peer-cash-runway` |
| `dataviz` | **no** (`user-invocable: false`) | — | Helper: categorical colors/legend rules for multi-series timelines |

Skills never define SQL or MCP tool logic themselves — they call
`Investair_data` tools by name and describe how to present the result. If a
skill seems to need different data than the MCP already exposes, that's a
server-repo change, not a prompt-engineering fix here.

`initiation-report` and `sector-report` each carry a `references/` folder
(`report-structure.md`, `verification-checklist.md`) loaded on demand rather
than inlined in `SKILL.md` — both run a self-verification pass (recomputing
derived metrics, checking source-traceability) before handing back a
document. `setup-scheduled-reports` similarly has `references/` copies of
the two digest skills' bodies, used when registering the scheduled tasks.

## Testing a change

There's no test suite — verification is: push to `SFR_code`, then in Claude:
**Add marketplace → Add from a repository** → this repo, branch `SFR_code` →
install/update the `investair` plugin → start a **new chat** (plugin changes
don't apply retroactively to an open session) → confirm the `Investair_data`
connector prompts a real Clerk sign-in (not a silent failure, not a request
for a static key) → exercise a skill.

## Related, but not in this repo

- **MCP server**: `TerryTian-Investair/investair-data-intelligence-mcp`
  (private, separate repo).
- **Old local `.plugin` zip builds**: `Product/investair_plugin/` — a
  local-only git repo (no remote) that predates this one. It's now
  superseded; don't edit it under the assumption it's the source of truth —
  this repo is.
