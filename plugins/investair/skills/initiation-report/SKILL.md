---
name: initiation-report
description: >
  This skill should be used when the user asks to "write an initiation report",
  "initiate coverage on [ticker]", "generate an initiating coverage note",
  "draft a research report for [company]", or wants a full equities-research
  write-up on a single ASX-listed company, in the Investair house style
  (investment highlights, valuation framework, peer comparison, project
  portfolio, catalysts, risks, thesis). Produces an editable Word document.
  Runs a verification pass — recomputing every derived metric and checking
  source-traceability, cross-section consistency, and disclaimer completeness
  — before handoff.
metadata:
  version: "0.1.0"
---

# Initiation Report

Generate a full "Initiating Coverage" research note on a single ASX-listed
company, in the Investair house style, as an editable Word document. See
`references/report-structure.md` for the exact section order, the metric
definitions, and the disclaimer boilerplate — read it before drafting.

This is a draft for an analyst to review and edit, not a final publication.
Flag every place where analyst judgment (not data) drove a sentence.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the target company

Confirm the ASX ticker with the user if it is ambiguous. Do not guess a
ticker from a company name without confirming — ASX tickers can collide with
similarly-named companies.

## 2. Pull data from the Investair_data connector

Call these tools for the target ticker (omit date args unless the user names
a specific date — the tools default to the latest snapshot):

- `get_market_snapshot` — price, market cap, shares on issue, price performance
- `get_cashflow_snapshot` — cash, quarterly burn, cash runway
- `get_company_projects` — project portfolio (country, commodity, stage, ownership)
- `get_peers` — the peer set for the valuation section
- `list_capital_raises` (ticker) — raise history and pricing/DAP performance
- `list_announcements` (ticker) — recent announcements to source drilling
  results, catalysts, and metallurgy/technical updates from
- `get_substantial_holders` (ticker) — top holders, referenced in the capital
  structure section if notable. Flag any holder with
  `prime_broker_clause_detected: true` explicitly in that section, not as
  an incidental data point.

Then, for the target ticker plus every peer returned by `get_peers`, call
`get_market_snapshots` and `get_cashflow_snapshots` ONCE EACH with the full
ticker list (not a loop of `get_market_snapshot`/`get_cashflow_snapshot`
per company) to build the EV comparison table (market cap, cash,
EV = market cap − cash, quarterly burn, runway in quarters). Each batch
result is keyed by ticker with `found`/`snapshot` — treat a `found: false`
entry as missing data for that company, footnoted, rather than an error.

After `get_peers`, narrate the peer set from `peer_source` + `business_context` only (plain business language; never name internal tables/tiers in the report). MCP owns the peer cascade — do not invent a live cashflow classification peer set.

**Resource ounces (JORC/mineral resource) are not in the Investair
database.** If the report needs EV/oz or Market Cap/oz, ask the user for the
resource figure (or source it from the announcements pulled above) rather
than inventing one. State the data source for that figure in the report.

## 3. Draft the report

Follow the section order and formatting rules in
`references/report-structure.md` exactly. Build the document with the docx
skill (invoke it for actual `.docx` creation/formatting — this skill only
supplies content and structure).

Use tables for: the peer EV comparison, the project portfolio, and the key
risks grid. Use short bolded stat callouts for the header metrics (share
price, market cap, EV, cash runway, 12-month return).

## 4. Narrative sections require analyst framing, not just data

The investment highlights, company overview prose, catalyst commentary, and
summary thesis are analytical judgment layered on top of the pulled data —
write them as a reasonable first draft grounded in what the data actually
shows (do not fabricate drill results, catalysts, or risks not evidenced in
the announcements/data pulled). Mark clearly, either inline in `[brackets]`
or in a final "Analyst review needed" list, anywhere you are inferring
rather than reporting a hard number.

## 5. Always include the disclaimer

Append the standard disclaimer from `references/report-structure.md`
verbatim, updating only the data-as-at date and the specific data-source
sentence (peer EV/oz caveat only applies if resource data was peer-sourced).

## 6. Verify before handoff

Before saving the final `.docx`, run the verification pass in
`references/verification-checklist.md` — recompute every derived metric,
confirm source-traceability, cross-section consistency, peer-table
integrity, disclaimer completeness, and that analyst-judgment sentences are
actually flagged. Fix anything the checklist catches before moving to
handoff; report any issue you couldn't resolve (e.g. a number you can't
trace back to a tool call) directly to the user instead of silently
dropping or guessing it.

## 7. Hand off

Save the `.docx` and tell the user what was pulled from the database versus
drafted/inferred, what the verification pass checked, and what still needs
a resource-ounce figure or analyst sign-off before distribution.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
