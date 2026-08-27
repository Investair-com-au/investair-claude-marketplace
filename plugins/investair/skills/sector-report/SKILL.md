---
name: sector-report
description: >
  This skill should be used when the user asks for a "sector report", "sector
  overview", "give me a report on [commodity/geography] explorers", or wants
  a research note covering a basket/universe of ASX-listed companies rather
  than a single company — with the same scope and rigor as an initiation
  report. Produces an editable Word document. Runs a verification pass —
  recomputing every derived metric across the universe and checking
  source-traceability, table integrity, and disclaimer completeness —
  before handoff.
metadata:
  version: "0.1.0"
---

# Sector Report

Generate a sector-wide (multi-company) research note over the
Investair_data connector, in the same house style and rigor as
`initiation-report`, but scoped to a universe of companies rather than one.
Read `references/report-structure.md` before drafting — it mirrors the
initiation-report structure with sector-specific adjustments.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the universe

Ask the user how the sector should be defined if it isn't obvious from
their request. There are three ways a universe can come in, and each has a
different resolution mechanism — do not treat them as interchangeable:

**A. An explicit list of tickers** — no resolution needed, use as given.

**B. A peer set seeded from one company** — call `get_peers` on the seed ticker. Narrate why the set was selected from `peer_source` + `business_context` (plain business language only). MCP owns the peer cascade — do not redefine tiers here.

**C. A commodity + geography description** (e.g. "ASX gold explorers in
Côte d'Ivoire") — this is the case that needs real work, not just
clarification. Resolve it like this:

1. If you haven't already this session, call `describe_table` (using
   `list_allowed_tables` first if you don't know the table name) to find
   the sector/sub-industry/commodity/country classification columns —
   likely a GICS sector/sub-industry field plus commodity and country on
   the company or projects table.
2. Run a bounded `run_readonly_sql` query filtered on those columns to get
   the candidate ticker list for the requested commodity/geography. Keep
   it a targeted filter, not an unscoped "give me everything" pull — that
   violates the connector's own guardrails.
3. Supplement with `get_peers` seeded from 1-2 representative companies in that space (follow each response's `peer_source` / `business_context`). Union the results, dedupe.
4. Show the resolved ticker list back to the user before pulling full
   market/cashflow snapshots for every company — confirm scope while it's
   still cheap to adjust, rather than after a large pull.

Do not silently default to "the whole market" for a vague request. If the
user says "everything" or "the full sector," clarify the commodity/geography
filter first, then follow path C above.

## 2. Pull data across the universe

For the resolved universe (target + every other company in scope):

- `get_market_snapshots` and `get_cashflow_snapshots` — pass the full
  ticker list to build the EV/cash/burn/runway comparison table, not a
  per-company loop of `get_market_snapshot`/`get_cashflow_snapshot`. Each
  batch tool accepts at most 30 tickers per call — split a larger universe
  into consecutive batches of up to 30 and merge the results. Each result
  is keyed by ticker with `found`/`snapshot`; treat a `found: false` entry
  as missing data for that company rather than an error.
- `get_company_projects` — for a sector-level project/asset map (single-
  ticker; still called per company)

Sector-wide aggregate views (prefer these over walking company-by-company
for market-wide risk framing):

- `screen_cashflow` — funding-runway risk across the universe/sector; use
  its sector breakdown and bounded ranked list rather than re-deriving it
  company-by-company
- `screen_capital_raises` — recent raise activity for the "recent capital
  markets activity" subsection. **Not `list_capital_raises`** — that tool
  requires a single ticker and cannot scan a universe; walking it
  company-by-company for a large universe is exactly the anti-pattern this
  connector's tools exist to avoid. Filter `screen_capital_raises` by
  `sector` when the universe maps cleanly to one or two GICS sectors. If
  the universe was built from an explicit ticker list or peer-seeding that
  doesn't align to a clean sector filter, the screen's results may include
  companies outside the exact universe — cross-check the `ranked` list
  against your resolved ticker set, or fall back to per-company
  `list_capital_raises` only for the highest-materiality names (same
  restraint as the announcements rule below).
- `list_announcements` per company only for the highest-materiality names
  (do not pull a full announcement feed for every company in a large
  universe)

## 3. Draft the report

Use the docx skill to build the `.docx`. Structure per
`references/report-structure.md`: sector overview, universe comparison
table (sorted by EV), funding-risk breakdown, capital-raise activity, notable
company call-outs (1 paragraph each for the 2-4 most investable/highest-risk
names), sector-wide risks, and a closing view.

Flag analyst-judgment sentences the same way `initiation-report` does.

## 4. Verify before handoff

Before saving the final `.docx`, run the verification pass in
`references/verification-checklist.md` — recompute every derived metric
across the universe, confirm source-traceability, table integrity,
funding-risk-breakdown accuracy, and disclaimer completeness. Fix anything
the checklist catches before moving to handoff; report any issue you
couldn't resolve (e.g. a company's figures you can't trace back to a tool
call) directly to the user instead of silently dropping or guessing it.

## 5. Disclaimer

Append the same disclaimer as `initiation-report` (see its
`references/report-structure.md` for the verbatim text), adjusted to
reference "companies mentioned herein" rather than a single company.

## 6. Hand off

Save the `.docx` and tell the user what was pulled versus drafted/inferred.
## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words.
