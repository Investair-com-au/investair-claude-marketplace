---
name: broker-setup
description: >
  This skill should be used when a broker user wants to install the three
  Investair artifacts (Sweet Spot Pipeline, Company Page, Standardised
  Reports), pin them to the sidebar, and schedule the weekly pipeline.
  Triggers include: "set up investair", "install investair artifacts",
  "set up my broker workspace", "install the pipeline", or similar
  first-time-setup requests. Idempotent: safe to re-run.
metadata:
  version: "0.2.0"
---

# Investair Broker Setup

Install the three Investair artifacts for a broker user. The templates are
bundled with the plugin — this skill fills their named slots with the
broker's details and publishes a private copy to the user's account. No
shared master links are used; each broker gets artifacts they own and
control.

The three template files are in this skill's `artifacts/` directory:
- `pipeline-template.html` — Sweet Spot Pipeline
- `company-page-template.html` — Investair Company Page
- `standardised-reports-template.html` — Standardised Reports

## 1. Check for CoWork

Inspect your session context to determine whether you are running inside
Cowork (a persistent Claude workspace session). The clearest signal is
whether a `scheduled-tasks.json` file exists under
`~/Library/Application Support/Claude/local-agent-mode-sessions/`. Run:

```bash
ls ~/Library/Application\ Support/Claude/local-agent-mode-sessions/ 2>/dev/null
```

If the directory is empty or missing, you are **not** in CoWork. Tell the
user:

> **You're not in a CoWork session.** The weekly pipeline scheduled task
> requires CoWork, Investair's persistent workspace. Without it, the
> pipeline can't run automatically every Monday morning.
>
> To set up CoWork, open the Claude desktop app, click **New Space** in the
> left sidebar, then re-run `/broker-setup` from that space.
>
> I'll continue installing and pinning the three artifacts now — you can
> come back to schedule the pipeline once you're in CoWork.

Do **not** stop — continue with the remaining steps even if CoWork is
absent (just skip step 10).

## 2. Find the template directory

Locate the template files. Run:

```bash
find ~/.claude/plugins -name "pipeline-template.html" -path "*/broker-setup/artifacts/*" 2>/dev/null | head -1
```

Store the directory (the folder containing that file) as `TMPL_DIR`. If
no match is found, tell the user the plugin may need to be reinstalled and
stop.

## 3. Check for existing artifacts

List the user's artifacts to detect whether any of the three are already
installed:

```
Artifact({ action: "list", scope: "mine", limit: 50 })
```

Look for titles matching any of:
- "Sweet Spot Pipeline" (or ends with "Sweet Spot Pipeline")
- "Company Page" (or ends with "Company Page")
- "Standardised Reports" (or ends with "Standardised Reports")

If **any** existing artifacts match, tell the user what you found and ask:

> I found an existing **[name]** artifact in your library. Would you like
> to keep it (I'll install a fresh copy alongside) or replace it (the
> existing one will be archived)?

Wait for their answer. If replace: read the old artifact, rename it to
`[old title] (archived)` by republishing with the old URL and new title.

If **no** existing artifacts are found, proceed directly.

## 4. Ask: firm details

Use `AskUserQuestion` with these questions in one call:

**Question 1** — Firm name:
> Which firm are you setting up for? (e.g. Argonaut, Canaccord, Euroz
> Hartleys, Petra Capital)

**Question 2** — Broker canonical name:
> What is the broker's **Investair canonical name** — the name exactly as
> it appears in Investair's broker deal data? (e.g. Argonaut, MST
> Financial, Euroz Hartleys). This is used by the pipeline to derive your
> firm's sweet spot from your deal history. If unsure, use your firm's
> trading name as it would appear in a placement announcement.

**Question 3** — Investair connector name:
> What is the Investair connector named in claude.ai Settings → Connectors?
> Leave blank for the default: `Investair_data`

Store answers as:
- `FIRM_NAME` — firm display name (e.g. "Argonaut")
- `BROKER_CANONICAL` — Investair canonical name (e.g. "Argonaut")
- `SERVER` — connector display name (default `"Investair_data"` if blank)

## 5. Ask: coverage (optional)

Use `AskUserQuestion` with these optional questions:

**Question 1** — Primary sector (Investair sub-industry):
> Optional: What is your primary sector in Investair? (e.g. Gold, Copper,
> Lithium, Oil & Gas). This pre-selects your sector in the Standardised
> Reports. Leave blank to default to My list.

**Question 2** — Focus tagline:
> Optional: A short focus phrase for the masthead (e.g. "WA gold
> explorers", "battery metals & critical minerals"). Leave blank to omit.

**Question 3** — House stocks:
> Optional: ASX codes of stocks your desk has mandates on (space- or
> comma-separated, e.g. "ABC DEF GHI"). These are always highlighted in
> the pipeline regardless of sweet-spot score. Leave blank if none.

**Question 4** — Coverage list:
> Optional: Your coverage list as ASX codes and company names, one per
> line, e.g.:
> ```
> ABC, Acme Gold
> DEF, Delta Copper
> ```
> These pre-populate the Company Page and Standardised Reports. Leave
> blank for an empty starting list.

Store:
- `SECTOR` — primary sector string (blank = `""`)
- `FOCUS` — focus tagline string (blank = `""`)
- `HOUSE_STOCKS` — array of ASX codes (blank = `[]`)
- `COVERAGE` — array of `["TICKER", "Company name"]` pairs (blank = `[]`)

For HOUSE_STOCKS: split on spaces and commas, uppercase each code,
deduplicate, limit to 10.

For COVERAGE: parse each line as `TICKER, Company name` or
`TICKER — Company name`. Uppercase the ticker. Limit to 25 pairs.

## 6. Publish the Sweet Spot Pipeline

### 6a. Apply slot substitutions

Write a Python script and run it. The script reads
`$TMPL_DIR/pipeline-template.html` and applies these exact string
replacements (substituting actual runtime values before writing the script):

- `<title>Investair Sweet Spot Pipeline Template</title>` →
  `<title>{FIRM_NAME} Sweet Spot Pipeline</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- `/*BROKER_START*/""/*BROKER_END*/` →
  `/*BROKER_START*/"{BROKER_CANONICAL}"/*BROKER_END*/`
- If SERVER ≠ "Investair_data":
  `/*SERVER_START*/"Investair_data"/*SERVER_END*/` →
  `/*SERVER_START*/"{SERVER}"/*SERVER_END*/`

Write the result to `/tmp/ia-pipeline-filled.html`.

Example Python script (substitute actual values into it):

```python
import sys
t = open('$TMPL_DIR/pipeline-template.html', encoding='utf-8').read()
t = t.replace('<title>Investair Sweet Spot Pipeline Template</title>',
              '<title>FIRM_NAME Sweet Spot Pipeline</title>')
t = t.replace('<!--OWNER_START-->Internal<!--OWNER_END-->',
              '<!--OWNER_START-->Prepared for FIRM_NAME · Internal<!--OWNER_END-->')
t = t.replace('/*BROKER_START*/""/*BROKER_END*/',
              '/*BROKER_START*/"BROKER_CANONICAL"/*BROKER_END*/')
# Only if SERVER != "Investair_data":
# t = t.replace('/*SERVER_START*/"Investair_data"/*SERVER_END*/',
#               '/*SERVER_START*/"SERVER"/*SERVER_END*/')
open('/tmp/ia-pipeline-filled.html', 'w', encoding='utf-8').write(t)
print('Done')
```

### 6b. Publish the pipeline

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-pipeline-filled.html",
  title: "{FIRM_NAME} Sweet Spot Pipeline",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    mcp: {
      servers: [{
        server: "{SERVER}",
        tools: ["run_readonly_sql", "list_announcements", "get_substantial_holders_batch"]
      }]
    }
  }
})
```

Store the returned URL as `PIPELINE_URL`.

### 6c. Write initial screen config (if sectors or house stocks given)

If `SECTOR` is non-empty or `HOUSE_STOCKS` is non-empty, write the initial
screen config to the pipeline's shared db. Load ArtifactData via
`ToolSearch("select:ArtifactData")`, then:

```
ArtifactData({
  action: "set",
  url: PIPELINE_URL,
  collection: "config",
  doc_id: "screen",
  data: {
    cfg: {
      segments: [SECTOR],   // omit or leave [] if SECTOR is blank
      house: HOUSE_STOCKS   // omit or leave [] if none
    },
    at: "YYYY-MM-DD"        // today's date
  }
})
```

This sets the pipeline's default screen overrides. The pipeline's
Customise screen panel will show these values as the saved custom screen.

## 7. Publish the Company Page

### 7a. Apply slot substitutions

Python script reading `$TMPL_DIR/company-page-template.html`, applying:
- `<title>Investair Company Page Template</title>` →
  `<title>{FIRM_NAME} Company Page</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- If FOCUS non-empty:
  `<!--FOCUS_START--><!--FOCUS_END-->` →
  `<!--FOCUS_START--> · {FOCUS}<!--FOCUS_END-->`
- If SERVER ≠ "Investair_data":
  `/*SERVER_START*/"Investair_data"/*SERVER_END*/` →
  `/*SERVER_START*/"{SERVER}"/*SERVER_END*/`
- If COVERAGE non-empty:
  `/*COVERAGE_START*/[]/*COVERAGE_END*/` →
  `/*COVERAGE_START*/{JSON_COVERAGE}/*COVERAGE_END*/`
  where `{JSON_COVERAGE}` is `json.dumps(COVERAGE)` — a JSON array of
  `["TICKER","Company name"]` pairs.

Write to `/tmp/ia-company-page-filled.html`.

### 7b. Publish the company page

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-company-page-filled.html",
  title: "{FIRM_NAME} Company Page",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    sample: {},
    downloads: {},
    mcp: {
      servers: [{
        server: "{SERVER}",
        tools: ["get_market_snapshot", "run_readonly_sql", "get_cashflow_snapshot",
                "get_cashflow_snapshots", "list_cashflow_quarterly", "get_company_projects",
                "list_announcements", "list_capital_raises", "get_peers",
                "get_substantial_holders_batch"]
      }]
    }
  }
})
```

Store the returned URL as `COMPANY_PAGE_URL`.

## 8. Publish the Standardised Reports

### 8a. Apply slot substitutions

Python script reading `$TMPL_DIR/standardised-reports-template.html`,
applying:
- `<title>Investair Standardised Reports Template</title>` →
  `<title>{FIRM_NAME} Standardised Reports</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- If FOCUS non-empty:
  `<!--FOCUS_START--><!--FOCUS_END-->` →
  `<!--FOCUS_START--> · {FOCUS}<!--FOCUS_END-->`
- If SERVER ≠ "Investair_data":
  `/*SERVER_START*/"Investair_data"/*SERVER_END*/` →
  `/*SERVER_START*/"{SERVER}"/*SERVER_END*/`
- If SECTOR non-empty:
  `/*SECTOR_START*/""/*SECTOR_END*/` →
  `/*SECTOR_START*/"{SECTOR}"/*SECTOR_END*/`
- If COVERAGE non-empty:
  `/*COVERAGE_START*/[]/*COVERAGE_END*/` →
  `/*COVERAGE_START*/{JSON_COVERAGE}/*COVERAGE_END*/`

Write to `/tmp/ia-reports-filled.html`.

### 8b. Publish the reports

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-reports-filled.html",
  title: "{FIRM_NAME} Standardised Reports",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    sample: {},
    downloads: {},
    mcp: {
      servers: [{
        server: "{SERVER}",
        tools: ["get_market_snapshot", "get_cashflow_snapshot", "get_peers",
                "get_substantial_holders", "get_substantial_holders_batch",
                "list_announcements", "list_capital_raises", "list_deal_brokers",
                "screen_peer_brokers", "get_company_projects", "run_readonly_sql"]
      }]
    }
  }
})
```

Store the returned URL as `REPORTS_URL`.

## 9. Pin the three artifacts

Run these three pin calls in order:

```
Artifact({ action: "pin", url: PIPELINE_URL })
Artifact({ action: "pin", url: COMPANY_PAGE_URL })
Artifact({ action: "pin", url: REPORTS_URL })
```

After each `pin` call, confirm it succeeded. If a pin fails, tell the user
and continue with the remaining artifacts rather than stopping.

## 10. Schedule the pipeline (CoWork only)

Skip this step if step 1 found you are not in CoWork.

### 10a. Find the active scheduled-tasks.json

```bash
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions \
  -name scheduled-tasks.json -print0 \
  | xargs -0 ls -t 2>/dev/null \
  | head -1
```

Read the file. If an entry with `id: "broker-sweet-spot-pipeline"` already
exists, report it and skip to step 11.

### 10b. Write the weekly task prompt

Create this directory and file, substituting actual values for FIRM_NAME,
BROKER_CANONICAL, SERVER, and PIPELINE_URL:

**Directory**: `~/Claude/Scheduled/broker-sweet-spot-pipeline/`
**File**: `SKILL.md`

**Content** (substitute actual values before writing):

```markdown
---
name: broker-sweet-spot-pipeline
description: Weekly Sweet Spot Pipeline for {FIRM_NAME}
---

# Weekly Sweet Spot Pipeline — {FIRM_NAME}

Run the weekly Investair Sweet Spot Pipeline for {FIRM_NAME} and update
the pipeline artifact with the latest results.

Broker canonical name: **{BROKER_CANONICAL}**
Pipeline artifact: {PIPELINE_URL}

## Steps

### 1. Load ArtifactData

ToolSearch("select:ArtifactData") to load the ArtifactData tool.

### 2. Read the saved screen config (if any)

ArtifactData({
  action: "get",
  url: "{PIPELINE_URL}",
  collection: "config",
  doc_id: "screen"
})

If the doc exists and has `cfg`, use those values as overrides to the
broker's derived sweet spot. Store as SCREEN_CONFIG.

### 3. Run the screen against Investair

Use the {SERVER} connector. First find the broker's canonical ID:

  run_readonly_sql: SELECT b.broker_canonical_id AS id
  FROM Broker.deal_broker_map b
  WHERE b.broker_canonical_name = '{BROKER_CANONICAL}'
  GROUP BY b.broker_canonical_id
  ORDER BY COUNT(*) DESC
  LIMIT 1

Then derive the sweet spot from the broker's last 12 months of deals:
segments by deal count (top 3 Investair sub-industries), market cap core
band from Q2–Q3 of deal sizes, lifecycle stages with ≥15% of deals.
Apply any SCREEN_CONFIG overrides on top.

Screen Cashflow.cashflow_daily for companies with:
- Confirmed runway 4–10 weeks
  (adjusted_estimated_quarters_funding_confirmed between 0.308 and 0.769)
- In the broker's sweet spot segments (or all if segments empty)
- Market cap in the broker's core band (or all if not set)
- In the right lifecycle stages (or all if not set)
- runway_publishable = 1

Also capture:
- House stocks from SCREEN_CONFIG (always include in WATCH)
- Companies approaching the window (10–26 weeks, in core band) for WATCH

Call list_announcements on the top 25 candidates (last 45 days) to filter
out companies with active raises, trading halts, placements, or takeovers.

Call get_substantial_holders_batch on the remaining candidates.

Classify:
- **CONFIRMED**: in window + in segment + in core band + no active raise
- **WATCH**: house stocks | approaching window | in full range outside core

### 4. Read the previous weekly run

ArtifactData({
  action: "get",
  url: "{PIPELINE_URL}",
  collection: "weekly",
  doc_id: "latest"
})

Store as PREV_RUN (may be null if first run).

### 5. Write the new weekly run

ArtifactData({
  action: "set",
  url: "{PIPELINE_URL}",
  collection: "weekly",
  doc_id: "latest",
  data: {
    date: "YYYY-MM-DD",
    conf: ["TKR1", ...],
    watch: ["TKR2", ...],
    summary: "2–3 sentence plain-text summary",
    prev: {date, conf, watch}  // from PREV_RUN, or null if first run
  }
})

### 6. Send summary (only if changes)

Compare today's conf+watch with PREV_RUN conf+watch. If there are new
entrants, exits, or material runway changes, send:

> **{FIRM_NAME} Sweet Spot Pipeline — [date]**
> [summary]
>
> New: [new tickers] · Left: [exited tickers]
>
> View pipeline: {PIPELINE_URL}

If nothing changed since last week, skip the send.
```

### 10c. Register in scheduled-tasks.json

Get epoch milliseconds:

```bash
date +%s000
```

Append to the `scheduledTasks` array in the registry file (read it first,
add the new entry, write it back):

```json
{
  "id": "broker-sweet-spot-pipeline",
  "cronExpression": "0 7 * * 1",
  "enabled": true,
  "filePath": "/Users/<home>/Claude/Scheduled/broker-sweet-spot-pipeline/SKILL.md",
  "createdAt": <epoch_ms>,
  "permissionMode": "auto",
  "disableJitter": false
}
```

Replace `/Users/<home>` with the actual home directory. After editing,
validate the JSON:

```bash
python3 -m json.tool <path-to-scheduled-tasks.json> > /dev/null && echo OK
```

## 11. Confirm

Reply with:

```
✅ Setup complete for [FIRM_NAME]

Three artifacts published and pinned:
• [FIRM_NAME] Sweet Spot Pipeline — [PIPELINE_URL]
• [FIRM_NAME] Company Page — [COMPANY_PAGE_URL]
• [FIRM_NAME] Standardised Reports — [REPORTS_URL]

Broker: [BROKER_CANONICAL]
[If sector set:] Primary sector: [SECTOR]
[If house stocks set:] House stocks: [HOUSE_STOCKS joined with spaces]
[If focus set:] Focus: [FOCUS]

[If CoWork:]
Scheduled: Pipeline runs every Monday at 7:00 am (see CoWork Scheduled panel).

[If not CoWork:]
⚠️  Pipeline not scheduled — re-run /broker-setup from a CoWork space to
add the Monday 7 am schedule.
```

## Required closing

Always end with this feedback prompt:

How useful was this setup? Rate 1–5 and add any comments — reply with your
score and feedback to log it.

If the user replies with a score and/or feedback, extract the numeric rating
(if given) and their text, then call `log_feedback` once with their full
reply.
