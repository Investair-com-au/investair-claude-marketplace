---
name: investor-targeting
description: >
  This skill should be used when the user asks for an "investor targeting
  list", "institutional targeting list for [ticker]", "who should we target
  for [company]'s raise", or wants a shortlist of institutional investors
  likely to be interested in a company, derived from substantial-holder
  (SSH) data across its peer group. Answers in chat with a ranked shortlist.
metadata:
  version: "0.1.0"
---

# Institutional Investor Targeting List

Build a shortlist of institutional investors likely to be interested in a
target company, by cross-referencing substantial-holder (SSH) data across
its peer group with its own current holder base — using the
Investair_data connector.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the ticker

Confirm the target ticker if ambiguous.

## 2. Pull SSH data

- `get_peers` (target ticker) — MCP owns the cascade. Check
  `tool_response.peer_source` and follow `business_context` for how to
  narrate the set in plain business language. Do not redefine peer tiers,
  tables, or fallbacks in this skill. If the set looks wrong, note that
  peer matching is still being improved and invite `log_feedback`.

- `get_substantial_holders_batch` with the target ticker + every peer
  ticker together (not a loop of `get_substantial_holders` per company —
  one round-trip for the whole set). Use each holder's
  `beneficial_owner_name`, not `party_name`, as the institution's identity
  — the tool already resolves custodian/nominee holdings to the upstream
  party behind them, so `party_name` alone would misidentify a custodian
  as the holder for `holding_type='custodian'` rows. Check every entry
  in `holders_by_ticker` — `found: false` means no qualifying SSH
  disclosure for that ticker, not an error.
- Watch for `prime_broker_clause_detected: true` on any holder row across
  the target or its peers — always surface it prominently in step 3
  (e.g. a note next to that institution's row), it's a meaningful signal
  about how that holder trades its position, not an incidental field.

## 3. Build the target list

Before the shortlist, give 1-2 sentences in plain business language on why
this peer group was selected — drawn from the actual field values
`get_peers` returned (shared commodity focus, geography, and lifecycle
stage for a true similarity set; shared sub-industry and development stage
for a classification match), not a generic "similar companies" statement,
and never a raw internal field name, table name, or engine/tool label — and
list the peer group tickers. Describe only the selection logic actually
used; don't explain tiers that weren't used.

Group rows by `beneficial_owner_name` (the resolved institution identity,
not raw `party_name`). Identify institutions that hold one or more peers
but do **not** currently appear as a substantial holder of the target
company. For each:

- Name of the institution
- Which peer(s) they hold, and stake size in each
- A simple "conviction" signal: how many of the peers they hold (more peers
  held = stronger thematic fit)
- Whether any of their holding rows had `prime_broker_clause_detected: true`
  — flag this institution's row distinctly if so

Rank by number of peers held (descending), then by average stake size.
Present as a table in chat: Institution, Peers held, Stakes, Prime broker
flag (if any), Not currently holding [target ticker].

Also note, separately, any institution that already holds the target
company below its stake in a peer — a potential "increase" target, distinct
from a "new" target.

## 4. State the limitations plainly

- SSH/substantial-holder data only captures holders above the statutory
  disclosure threshold (large stakes) — this is a proxy for institutional
  interest, not an exhaustive register of all fund ownership.
- Disclose peer-set strength using only what `peer_source` / `business_context` support — plain language, no internal table/tier names.

Say both so the list isn't mistaken for a complete investor register or a
uniformly strong-conviction shortlist.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words.
