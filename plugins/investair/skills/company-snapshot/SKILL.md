---
name: company-snapshot
description: >
  This skill should be used when the user asks for a "company snapshot",
  "quick snapshot of [ticker]", "give me an overview of [company]", or wants
  a fast, single-message read on an ASX-listed company's market position,
  cash position, projects, and top holders — without a full initiation
  report. Answers directly in chat, no document is produced. Recomputes EV
  and cash runway from the raw pull before presenting, as a quick accuracy
  check.
metadata:
  version: "0.1.0"
---

# Company Snapshot

Produce a concise, single-message snapshot of one ASX-listed company using
the Investair_data connector. This is the fast/lightweight sibling of
the `initiation-report` skill — no document, no analyst narrative, just the
current facts.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the ticker

Confirm the ticker if ambiguous. If the user names a company without a
ticker and it's not obvious, ask.

## 2. Pull data

Call, for the target ticker (omit date args — use latest snapshot
defaults):

- `get_market_snapshot` — price, market cap, price performance
- `get_cashflow_snapshot` — cash, burn, runway
- `get_company_projects` — project list
- `get_substantial_holders` — top holders (state the threshold/as-at date
  the tool returns)

## 3. Quick verify

Before presenting, recompute EV (Market Cap − Cash) and cash runway (Cash ÷
quarterly burn) from the raw tool outputs, and confirm every figure you're
about to state traces back to a specific tool call from this session — not
a remembered or assumed value. This is a lightweight check, not the full
`initiation-report` verification pass; it exists to catch drafting slips
before a number reaches the user.

## 4. Present the snapshot

Reply directly in chat (not a document) with:

- One-line header: ticker, company name, sector/commodity, stage
- A compact stat line: price, market cap, EV (mcap − cash), cash, runway
- Project list (name, country, stage, ownership) — 1 line each
- Top 3-5 substantial holders with stake % — flag any with
  `prime_broker_clause_detected: true` prominently, not as a footnote
- If runway is under ~2 quarters, flag funding risk in one sentence

Keep it scannable — this should read in under 30 seconds. Do not draft
investment highlights, risks, or a thesis; that's what `initiation-report`
is for. If the user follows up asking for more depth, offer to run
`initiation-report`, `peer-cash-comparison`, or `investor-targeting` instead of
expanding this reply.

## 5. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Price, market cap, shares on issue, price returns | Investair market data (end-of-day) | `info_date` |
| Cash, current burn, runway | Investair cash and runway estimate | `report_date`, plus the quarter it is built on (`base_quarter_end`) |
| Filed quarterly burn trend | Quarterly cash flow reports as filed with ASX (Appendix 4C/5B) | the quarter-end dates shown |
| Project list, stage, ownership | Investair project register | date in the response if present |
| Substantial holders and stakes | Substantial holder notices lodged with ASX (Investair holder data) | the notice / as-at dates the tool returns, and the look-back window |

Format (one line per source, not one line per figure):

```
**Sources — Investair**
- Market data (end-of-day), as at [date] — price, market cap, shares on issue
- Cash and runway estimate, as at [date], built on the quarterly cash flow
  report for the quarter ended [date] — cash, burn, runway
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

### Numbered citations

Every figure or fact in the reply carries a superscript number tied to a
numbered entry in the Sources block, so nothing is left unsourced. Where
the fact came from a specific ASX filing, the number points to that
filing. Otherwise it points to the Investair dataset that supplied it.
Three kinds of filing count: an ASX announcement, a capital-raise filing
(Appendix 3B/2A or the placement announcement), and a substantial holder
notice.

In this skill: each substantial holder's stake points to its holder notice; price,
market cap and returns to the market data entry; cash, burn and runway to
the cash and runway estimate entry; the filed burns to the quarterly
reports entry; the project list to the project register entry.

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
