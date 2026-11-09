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
  version: "0.3.6"
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

The connector is always `Investair_data`. No connector configuration is
needed from the user.

## 1. Find the template directory

Run:

```bash
find ~/.claude/plugins -name "pipeline-template.html" -path "*/broker-setup/artifacts/*" 2>/dev/null | head -1
```

Store the directory (the folder containing that file) as `TMPL_DIR`. If no
match is found, tell the user the plugin may need to be reinstalled and stop.

## 2. Get the firm name (plain-text exchange — one reply)

**CRITICAL: Do this BEFORE listing any artifacts. Send a single plain-text
message. Do NOT call `AskUserQuestion` here. Do NOT list artifacts first.**

Message to send (copy exactly):

> What is your firm's display name? It will appear in the masthead of your
> three Investair dashboards.

Wait for the user's reply. Store it as `FIRM_NAME`. Do not proceed until
you have a reply.

Do NOT ask about sectors, house stocks, connector, coverage list, broker
name, CoWork, or scheduling here.

## 3. Check for existing artifacts

Now that you have FIRM_NAME, list the user's artifacts:

```
Artifact({ action: "list", scope: "mine", limit: 50 })
```

Look for titles matching any of:
- "Sweet Spot Pipeline" (or ends with "Sweet Spot Pipeline")
- "Company Page" (or ends with "Company Page")
- "Standardised Reports" (or ends with "Standardised Reports")

If **any** match, use `AskUserQuestion` (do not write a text response) with
one question:

> I found an existing [name(s)] dashboard in your library. What would you
> like to do?

Options:
- "Overwrite the existing dashboards" — republish over the existing ones
  (same URLs, stay pinned)
- "Keep them and install alongside" — fresh copies with a different title

Wait for the answer before continuing.

**If overwrite:** read each matching artifact (`Artifact({ action: "read", url })`)
and extract the existing setup from the HTML:
- `BROKER_CANONICAL` — the string inside `/*BROKER_START*/"..."/*BROKER_END*/`
  (Pipeline template)
- Optionally reuse `SECTOR`, `FOCUS` and `COVERAGE` slots if present

Set `OVERWRITE = true` and remember each existing URL. Skip the broker
lookup in step 4, using the extracted `BROKER_CANONICAL` as the broker
input. If the broker cannot be extracted, fall back to the lookup in step 4.

**If keep alongside:** `OVERWRITE = false`; append ` – {FIRM_NAME}` to the
three titles so they don't collide.

If **no** matches, set `OVERWRITE = false` and proceed to step 3b without
asking anything.

## 3b. Ask: optional preferences (AskUserQuestion)

Now use `AskUserQuestion` with these **three** questions in one call.
Use the fixed options below exactly — do NOT generate your own options or
add firm names from memory.

**Question 1** — Primary sectors (multiSelect: true, up to 3):
> Optional: Which sectors do you focus on? Select up to 3. Pre-selects
> your sectors in the Standardised Reports.

Options (use exactly, with multiSelect: true):
- label: "Gold",                    description: "ASX gold explorers and producers"
- label: "Copper / Battery Metals", description: "Base metals, lithium, battery materials"
- label: "Oil & Gas",               description: "ASX energy sector"
- label: "Other / multiple",        description: "Type your sector(s) in the reply box below"

**Question 2** — House stocks:
> Optional: ASX codes of your house stocks. These are always flagged at the
> top of the Pipeline regardless of cash runway.

Options (use exactly):
- label: "I have house stocks", description: "Type the ASX codes in the reply box below"
- label: "No house stocks",     description: "Skip — no house stocks to add"

Parse the answers and any free-text replies:
- `SECTORS` — array of all selected sector labels from Q1, plus any free-text typed
  for "Other / multiple" (blank if skipped, `[]` for no sector; limit 3 values)
- `HOUSE_STOCKS` — uppercased ASX codes from Q2 reply, split on spaces/commas,
  deduplicated, limit 10 (blank = `[]`)
- `FOCUS` — always `""` (tagline not collected at setup)

## 4. Look up and confirm the broker canonical name

**Skip this step if `OVERWRITE = true`** — `BROKER_CANONICAL` was taken from the
existing dashboards (set `BROKER_CANONICAL_ID` by running the query below
with an exact match on that name, silently, and proceed to step 5).

**IMPORTANT: Do NOT ask the user for a broker lookup name, an ASX
announcement name, or any variation of their firm name. Do not present
pre-filled options. Run the lookup automatically and silently using
FIRM_NAME. The only user interaction in this step is a single yes/no
confirmation if a match is found.**

Using the `Investair_data` connector, run a fuzzy search against
`Broker.deal_broker_map` to find the canonical broker name. All names in
this table are normalised — if a match is found it is the right name to use.

Run this query once, using a LIKE search across all candidates in one pass:

```sql
SELECT broker_canonical_name, broker_canonical_id, COUNT(*) AS deals
FROM Broker.deal_broker_map
WHERE broker_canonical_name LIKE '%<FIRM_NAME_KEYWORD>%'
GROUP BY broker_canonical_name, broker_canonical_id
ORDER BY deals DESC
LIMIT 5
```

Where `FIRM_NAME_KEYWORD` is the most distinctive word or words from
FIRM_NAME (strip common suffixes: Securities, Capital, Limited, Ltd,
Financial, Group, Advisory, Stockbroking, Partners, Broking, Equities,
Investments, Corp, Inc — use what remains).

If the query returns one clear match (highest deal count by a significant
margin, or only one result), confirm silently with the user in one line:

> Found **"[broker_canonical_name]"** in Investair's deal data
> ([N] deals). Using that — is that right?

- **Yes / no reply needed** → set `BROKER_CANONICAL = broker_canonical_name`
  and `BROKER_CANONICAL_ID = broker_canonical_id`. Proceed to step 5.
- **No** → ask which of the returned names is correct (show the list),
  or confirm the user wants to proceed with FIRM_NAME unvalidated.

If the query returns multiple similarly-scored results, show the short list
and ask the user to pick one.

If **no results**, tell the user in one line:

> I couldn't find your firm in Investair's deal data — the Pipeline sweet
> spot won't be derived from your deal history. Proceeding with
> "[FIRM_NAME]". You can correct this later in the Pipeline's Customise
> screen.

Then proceed: `BROKER_CANONICAL = FIRM_NAME`, `BROKER_CANONICAL_ID = null`.

## 5. Auto-generate coverage list from raise history

Tell the user:

> I'll build your initial coverage list from the ASX companies where your
> firm led or co-led a capital raise in the past 24 months. You can add,
> remove, or modify this list from within the Company Page and Standardised
> Reports dashboards at any time.

Then:

### 5a. Discover Placement table schema

Run `describe_table('Placement.deals_daily')` to find the column names for:
- Issuer ASX ticker (e.g. `issuer_asx_code`, `asx_code`)
- Issuer company name (e.g. `company_name`, `issuer_name`)
- Deal date (e.g. `deal_date`)
- Lead broker identifier — look for a column linking deals to a broker
  canonical id or name (e.g. `lead_broker_canonical_id`, `broker_id`,
  `bookrunner_id`). There may be separate lead and co-lead columns.

If `describe_table` is unavailable, use `run_readonly_sql` to run:

```sql
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'Placement' AND TABLE_NAME = 'deals_daily'
ORDER BY ORDINAL_POSITION
```

### 5b. Query lead and co-lead raises

Using the column names discovered above, run a query of the form:

```sql
SELECT DISTINCT
  [issuer_ticker_col]  AS ticker,
  [company_name_col]   AS company_name
FROM Placement.deals_daily
WHERE deal_date >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
  AND (
    [lead_broker_col] = '[BROKER_CANONICAL_ID or BROKER_CANONICAL]'
    -- also include co-lead col if it exists, e.g.:
    -- OR [colead_broker_col] = '[BROKER_CANONICAL_ID or BROKER_CANONICAL]'
  )
ORDER BY deal_date DESC
LIMIT 50
```

Match on `BROKER_CANONICAL_ID` if it's non-null and the column holds IDs;
otherwise match on `BROKER_CANONICAL` if the column holds name strings.

If the query fails (column name mismatch), try without the company name
column and join to a company name source, or omit company names and use
tickers only. If no query works, skip coverage (COVERAGE = []) and note it.

### 5c. Store results

Store results as `COVERAGE` — an array of `["TICKER", "Company name"]`
pairs (or `["TICKER", ""]` if names unavailable). Limit to 50 pairs.

Tell the user:

> Found **[N] companies** from your firm's capital raises in the past 24
> months — these will be your starting coverage list.
> [List the tickers inline, e.g.: GOR, RMS, WAF, ...]
> You can modify this list in the Company Page and Reports dashboards.

If N = 0, tell the user no matching raises were found and coverage will
start empty.

## Publishing rules (steps 6–8)

- Titles always start with **"Investair"** so the brand shows in the pinned
  sidebar title. The firm name appears only in the masthead (OWNER slot).
  If `OVERWRITE = false` and existing dashboards were kept, append
  ` – {FIRM_NAME}` to each title.
- If `OVERWRITE = true`, pass the existing artifact's `url` in the publish
  call so it is republished in place (no archive, no duplicate). Skip the
  `pin` call for any artifact that is already pinned.

## 6. Publish the Sweet Spot Pipeline

### 6a. Apply slot substitutions

Write and run a Python script that reads
`$TMPL_DIR/pipeline-template.html` and applies these exact string
replacements (substituting actual runtime values before writing the script):

- `<title>Investair Sweet Spot Pipeline Template</title>` →
  `<title>Investair Sweet Spot Pipeline</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- `/*BROKER_START*/""/*BROKER_END*/` →
  `/*BROKER_START*/"{BROKER_CANONICAL}"/*BROKER_END*/`

Write the result to `/tmp/ia-pipeline-filled.html`.

### 6b. Publish

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-pipeline-filled.html",
  title: "Investair Sweet Spot Pipeline",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    mcp: {
      servers: [{
        server: "Investair_data",
        tools: ["run_readonly_sql", "list_announcements", "get_substantial_holders_batch"]
      }]
    }
  }
})
```

Store the returned URL as `PIPELINE_URL`.

### 6c. Write initial screen config

If `SECTORS` or `HOUSE_STOCKS` is non-empty, load ArtifactData via
`ToolSearch("select:ArtifactData")`, then:

```
ArtifactData({
  action: "set",
  url: PIPELINE_URL,
  collection: "config",
  doc_id: "screen",
  data: {
    cfg: {
      segments: SECTORS,      // [] if empty
      house: HOUSE_STOCKS     // [] if empty
    },
    at: "YYYY-MM-DD"          // today's date
  }
})
```

## 7. Publish the Company Page

### 7a. Apply slot substitutions

Python script reading `$TMPL_DIR/company-page-template.html`, applying:
- `<title>Investair Company Page Template</title>` →
  `<title>Investair Company Page</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- If FOCUS non-empty:
  `<!--FOCUS_START--><!--FOCUS_END-->` →
  `<!--FOCUS_START--> · {FOCUS}<!--FOCUS_END-->`
- If COVERAGE non-empty:
  `/*COVERAGE_START*/[]/*COVERAGE_END*/` →
  `/*COVERAGE_START*/{JSON_COVERAGE}/*COVERAGE_END*/`
  where `{JSON_COVERAGE}` is `json.dumps(COVERAGE)`.

Write to `/tmp/ia-company-page-filled.html`.

### 7b. Publish

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-company-page-filled.html",
  title: "Investair Company Page",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    sample: {},
    downloads: {},
    mcp: {
      servers: [{
        server: "Investair_data",
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
  `<title>Investair Standardised Reports</title>`
- `<!--OWNER_START-->Internal<!--OWNER_END-->` →
  `<!--OWNER_START-->Prepared for {FIRM_NAME} · Internal<!--OWNER_END-->`
- If FOCUS non-empty:
  `<!--FOCUS_START--><!--FOCUS_END-->` →
  `<!--FOCUS_START--> · {FOCUS}<!--FOCUS_END-->`
- If SECTORS non-empty (use first sector as the primary):
  `/*SECTOR_START*/""/*SECTOR_END*/` →
  `/*SECTOR_START*/"{SECTORS[0]}"/*SECTOR_END*/`
- If COVERAGE non-empty:
  `/*COVERAGE_START*/[]/*COVERAGE_END*/` →
  `/*COVERAGE_START*/{JSON_COVERAGE}/*COVERAGE_END*/`

Write to `/tmp/ia-reports-filled.html`.

### 8b. Publish

```
Artifact({
  action: "publish",
  file_path: "/tmp/ia-reports-filled.html",
  title: "Investair Standardised Reports",
  icon: "chart",
  capabilities: {
    db: {},
    user: {},
    sample: {},
    downloads: {},
    mcp: {
      servers: [{
        server: "Investair_data",
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

```
Artifact({ action: "pin", url: PIPELINE_URL })
Artifact({ action: "pin", url: COMPANY_PAGE_URL })
Artifact({ action: "pin", url: REPORTS_URL })
```

If a pin fails, tell the user and continue.

## 10. Schedule the weekly pipeline and confirm

### 10a. Auto-create the scheduled task

Derive a task ID: take FIRM_NAME, lowercase it, replace spaces and special
characters with hyphens, and prepend `investair-pipeline-` (e.g.
`investair-pipeline-mst-financial`).

Call `mcp__scheduled-tasks__create_scheduled_task` with:

```
taskId:        "investair-pipeline-{FIRM_NAME_SLUG}"
title:         "Investair Weekly Pipeline — {FIRM_NAME}"
description:   "Weekly Sweet Spot Pipeline refresh for {FIRM_NAME}"
cronExpression: "0 7 * * 1"
notifyOnCompletion: true
prompt: |
  Run the weekly Investair Sweet Spot Pipeline refresh for {FIRM_NAME}.

  Connector: Investair_data
  Pipeline artifact URL: {PIPELINE_URL}
  Broker: {BROKER_CANONICAL}

  Steps:
  1. Read the screen config from the pipeline artifact database
     (collection: "config", doc_id: "screen"). Use any saved sector
     and house stock overrides.
  2. Use the Investair_data connector to screen for ASX companies with
     4–10 weeks confirmed cash runway in the broker's sweet spot sectors.
     Derive the sweet spot from the broker's last 12 months of deals
     (top segments by deal count, core market cap band). Apply saved
     overrides on top.
  3. Always include house stocks from config in the WATCH list regardless
     of runway. Add companies approaching the window (10–26 weeks) in the
     broker's core band.
  4. Call list_announcements on the top 25 candidates (last 45 days) to
     filter out active raises, halts, placements and takeovers.
  5. Read the previous week's results from the artifact database
     (collection: "weekly", doc_id: "latest").
  6. Write the new results using ArtifactData:
     set — collection: "weekly", doc_id: "latest" —
     data: { date, conf: [tickers], watch: [tickers], summary, prev }
  7. If conf or watch changed from last week, send a brief summary
     message. If nothing changed, skip the message.
```

Substitute the actual runtime values for `{FIRM_NAME}`, `{FIRM_NAME_SLUG}`,
`{PIPELINE_URL}`, and `{BROKER_CANONICAL}` before making the call.

### 10b. Confirm to the user

Reply with the setup summary:

```
✅ Setup complete for [FIRM_NAME]

Three artifacts published and pinned:
• Sweet Spot Pipeline   → [PIPELINE_URL]
• Company Page          → [COMPANY_PAGE_URL]
• Standardised Reports  → [REPORTS_URL]

Broker:    [BROKER_CANONICAL]
[If SECTORS set:]      Sectors: [SECTORS joined with ", "]
[If HOUSE_STOCKS set:] House stocks: [tickers joined with spaces]
Coverage:  [N] companies pre-loaded from your raise history (editable in dashboards)

📅 Weekly pipeline scheduled — runs every Monday at 7:00 am while the
   Claude app is open. (If the app is closed on Monday it runs on next launch.)
```

If the scheduled task creation failed, add instead:

```
⚠️ Could not auto-schedule the weekly pipeline. To set it up manually,
   open a new chat and say:
   "Schedule the Investair Sweet Spot Pipeline every Monday at 7 am.
    Pipeline URL: [PIPELINE_URL]  Broker: [BROKER_CANONICAL]"
```

## Required closing

Always end with this feedback prompt:

How useful was this setup? Rate 1–5 and add any comments — reply with
your score and feedback to log it.

If the user replies with a score and/or feedback, extract the numeric
rating (if given) and their text, then call `log_feedback` once with their
full reply.
