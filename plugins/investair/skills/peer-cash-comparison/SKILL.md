---
name: peer-cash-comparison
description: >
  This skill should be used when the user asks to "find peers for [ticker]",
  "generate a peer group for [company]", "compare [ticker] to its peers", or
  wants comparative metrics (market cap, cash, EV, burn, runway) across a
  company's peer set. Answers in chat with a comparison table; can build a
  chart on request.
metadata:
  version: "0.2.0"
---

# Peer Comparison

Generate a peer group and comparative-metrics table using the
Investair_data MCP connector.

**Peer selection is owned by MCP `get_peers`.** Do not redefine peer tiers,
tables, or fallbacks in this skill. Read `tool_response.peer_source` and
`business_context` from the tool response and narrate in plain business
language only (never raw table/tier/engine labels unless the user asks for
internals).

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words.

## 1. Resolve the ticker

Confirm the target ticker if ambiguous.

## 2. Pull peers and metrics

- `get_peers` (ticker) — use returned peers and `peer_source`
- Batch target + peers into ONE call each of `get_market_snapshots` and
  `get_cashflow_snapshots` (max 30 tickers per call; split if needed)
- Compute EV = Market Cap − Cash per row from the raw snapshots

If the user wants best peer brokers for a raise, use `screen_peer_brokers`
— do not walk `get_peers` × `list_capital_raises` × `list_deal_brokers`.

## 3. Quick verify

Recompute EV for every row; confirm the target appears once; every figure
must trace to a tool call from this session.

## 4. Present

Before the table: 1–2 sentences on why this peer set was selected, drawn
from the fields `get_peers` actually returned for this `peer_source`. List
peer tickers. Then table: Ticker, Company, Country/Focus, Stage, Market
Cap, Cash, EV, Burn/Qtr, Runway — target first, peers by EV ascending.

If the set looks wrong or incomplete, say peer matching is still being
improved and invite feedback (`log_feedback`).

## 5. Optional chart

Only if the user asks — simple EV or market-cap comparison.

## 6. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Peer group | Investair peer matching | date in the response if present; say in plain words how the set was matched |
| Price, market cap, shares on issue, price returns | Investair market data (end-of-day) | `info_date` |
| Cash, current burn, runway | Investair cash and runway estimate | `report_date`, plus the quarter it is built on (`base_quarter_end`) |
| Filed quarterly burn trend | Quarterly cash flow reports as filed with ASX (Appendix 4C/5B) | the quarter-end dates shown |
| Brokers on a deal | Investair deal broker data | the deal's date |

Format (one line per source, not one line per company or per figure). When
companies in the same table carry different as-at dates, give the common
date and name the exceptions:

```
**Sources — Investair**
- Market data (end-of-day), as at [date] — market cap for all companies
- Cash and runway estimate, as at [date] ([TICKER] as at [earlier date]) —
  cash, burn, runway
- ASX announcement, [TICKER], [date], "[title]" — [what it supported]
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
- If you build the optional chart, repeat the Sources lines as a footer
  on the chart so it still carries them when shared on its own.

### Numbered citations

Every figure or fact in the reply carries a superscript number tied to a
numbered entry in the Sources block, so nothing is left unsourced. Where
the fact came from a specific ASX filing, the number points to that
filing. Otherwise it points to the Investair dataset that supplied it.
Three kinds of filing count: an ASX announcement, a capital-raise filing
(Appendix 3B/2A or the placement announcement), and a substantial holder
notice.

In this skill: market cap points to the market data entry; cash, burn and runway to the
cash and runway estimate entry; the filed-burn line to the quarterly
reports entry; the peer-group sentence to the peer matching entry; EV is
calculated from the market data and cash entries. With one dataset per
column, the markers belong on the column headers.

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
