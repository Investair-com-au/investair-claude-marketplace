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

## 5. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Peer group | Investair peer matching | date in the response if present; say in plain words how the set was matched |
| Substantial holders and stakes | Substantial holder notices lodged with ASX (Investair holder data) | the notice / as-at dates the tool returns, and the look-back window |

Format (one line per source, not one line per company or per figure). When
companies in the same table carry different as-at dates, give the common
date and name the exceptions:

```
**Sources — Investair**
- Market data (end-of-day), as at [date] — market cap for all companies
- Cash and runway estimate, as at [date] ([TICKER] as at [earlier date]) —
  cash, burn, runway
- Calculated: EV = market cap less estimated cash
```

Rules:

- Take every as-at date from the tool response itself (the dated field in
  the table, or `evidence.as_of`) — never today's date and never a
  remembered one. If a response carries no date, write "as retrieved
  [today's date]".
- Cite each announcement you relied on by **date and title** (add the ticker
  when more than one company is covered), numbered and linked as set out
  under "Numbered citations" below.
- Label calculated figures as calculated and name their inputs (e.g. "EV —
  calculated: market cap less estimated cash").
- Label anything that did not come from Investair (a figure the user
  supplied, your own inference) as such — never list it under an Investair
  source.
- List only sources actually called in this session. If a call returned
  nothing for a company, say so instead of dropping the line.
- Plain business names only, as in the "Cite as" column — never an internal
  table, column, tool or engine name in the user-visible Sources block.
- For this skill, state the holder look-back window once and note that
  only holdings above the statutory disclosure threshold are captured.

### Numbered citations

Every figure or fact in the reply carries a superscript number tied to a
numbered entry in the Sources block, so nothing is left unsourced. Where
the fact came from a specific ASX filing, the number points to that
filing. Otherwise it points to the Investair dataset that supplied it.
Three kinds of filing count: an ASX announcement, a capital-raise filing
(Appendix 3B/2A or the placement announcement), and a substantial holder
notice.

In this skill: every stake in the target list, and the target company's own holder
stakes, point to the holder notice they came from; the peer-group
sentence points to the peer matching entry.

- One numbered list, in order of first appearance, starting at 1. It
  replaces the dash list in the Format example above — same wording per
  entry, now numbered. A source keeps its number wherever it is cited
  again; a fact resting on two sources gets both numbers (¹ ²).
- In chat — including inside markdown tables — write the marker with
  Unicode superscript characters (¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰, combined for 10
  and above, e.g. ¹²). Never `<sup>`, `^1^`, `[1]` or other markup — chat
  clients show markup as raw text.
- Keep it readable: when a whole table column or a whole list comes from
  one dataset, put the marker once on the column header or the list's
  lead-in line rather than on every cell. Filing-backed facts always
  carry their own marker.
- Calculated figures (EV, runway) carry the numbers of their inputs and
  the word "calculated".
- Entry formats:
  - Dataset: `N. [dataset name], as at [date] — [what it supplied]`
  - Cash and runway estimate: add the filing it is built on — `built on
    the quarterly cash flow report (Appendix 4C/5B) for the quarter ended
    [date]`
  - Announcement: `N. [TICKER] — [date] — "[title]"`
  - Raise filing: `N. [TICKER] — [date] — Appendix 3B/2A, "[title]"`
  - Holder notice (the data carries no title): `N. [TICKER] — [date] —
    Substantial holder notice, [holder name]`
- **Links.** End every filing entry, and the cash and runway estimate
  entry, with a markdown link to the ASX announcements page for that
  ticker, where the filing itself can be opened:
  `[ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)` with the real
  ticker substituted. That page-per-ticker address is the only link you
  may construct. The connector does not return a link to the individual
  document — never invent one. If a tool response does carry a link for
  a filing, use that link instead.
- Never number a source that was not returned by a tool call in this
  session, and never point a figure at a filing it did not come from.
- Never print feed IDs, document IDs or any other internal identifier —
  in the Sources block, the body, a table or an artifact. A reference is
  identified by ticker, date and title only.
- These rules also hold for every follow-up reply in the conversation
  that uses Investair data (see the `source-citations` skill) — each such
  reply carries its own numbers and its own Sources block.
- Before sending, check both directions: every figure has a number that
  resolves to the right entry, and every entry is cited at least once.
- Stakes that come from the same notice (same company, holder and date)
  share one number — do not create a separate entry per table cell.

The Sources block then reads:

```
**Sources — Investair**
1. Market data (end-of-day), as at [date] — price, market cap
2. Cash and runway estimate, as at [date], built on the quarterly cash flow
   report (Appendix 4C/5B) for the quarter ended [date] — cash, burn,
   runway · [ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)
3. [TICKER] — [date] — "[title]" ·
   [ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)
4. [TICKER] — [date] — Substantial holder notice, [holder name] ·
   [ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)
```

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
