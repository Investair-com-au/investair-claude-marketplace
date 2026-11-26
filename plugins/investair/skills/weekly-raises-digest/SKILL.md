---
name: weekly-raises-digest
description: >
  This skill should be used when the user asks to "run the capital raises
  digest", "check this week's raises", or "what capital raises happened this
  week" — and is invoked automatically by the plugin's weekly scheduled
  task. Produces a concise digest of recent capital raises, posted in chat.
metadata:
  version: "0.1.0"
---

# Weekly Capital Raises Digest

Produce a concise weekly digest of recent ASX capital raises, using the
Investair_data connector. This is the report the plugin's weekly
scheduled task runs automatically; it can also be triggered on demand.

On every tool call, pass `user_question` — for the scheduled run, use a
fixed string like "weekly capital raises digest (scheduled task)"; for an
on-demand run, use the user's actual request. Usage auditing only, no
effect on results.

## 1. Pull recent raises

Call `screen_capital_raises` with no date filter (its default is the last
14 days — do not manufacture a narrower window unless the user asks for a
specific period). **Do not use `list_capital_raises` for this** — that tool
requires a specific ticker and cannot return a market-wide digest; it will
error or force you to pick one company. `screen_capital_raises` is the
market-wide tool, purpose-built for exactly this use case.

Use its `summary` (deal_count, sum_proceeds, sector breakdown) and `ranked`
list directly — do not page `run_readonly_sql` or call company-by-company
tools to reconstruct a fuller list; that defeats the purpose of the screen
tool. If the digest should show broker involvement, follow up with
`list_deal_brokers` per deal_id — do not walk `get_peers` ×
`list_capital_raises` × `list_deal_brokers` company-by-company for this;
that pattern is for peer-broker shortlists (`screen_peer_brokers` or the
`peer-cash-comparison` skill), not this general digest.

## 2. Present the digest

Reply in chat (not a document) with:

- Headline: `summary.deal_count` raises in the window,
  `summary.sum_proceeds` total confirmed capital raised, and note if
  `summary.truncated` is true (more deals exist than the ranked list shows).
  Reminder: MCP only includes raises with confirmed proceeds above A$500k.
- A short **markdown** table from `ranked`: Ticker, Company, Proceeds (A$M from
  `proceeds` — confirmed only), Discount (if available), DAP (if available).
  Discount/DAP cells must be **plain numbers** (e.g. `-8.63`), not HTML.
  MCP clients escape HTML — never wrap values in `<span>`, `style=`, or
  color tags. Negative = discount; do not use colour to say that.
  Do **not** cite proposed proceeds or issue price — those are not on the MCP
- Top 2-3 sectors from `summary.sector_breakdown` if there's a notable
  concentration
- One or two sentences on any standout deal (unusual discount / timing,
  or a company that appeared in a recent `weekly-runway-screen` as at
  funding risk)

Keep it scannable — this is a weekly pulse-check, not deal analysis.

## 3. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Raise count, proceeds, discount, DAP, sector split | Investair capital raises data (from ASX Appendix 3B/2A filings) | the screen window (from/to dates) |
| Brokers on a deal | Investair deal broker data | the deal's date |

Format (one line per source, not one line per company or per figure):

```
**Sources — Investair**
- Capital raises data (from ASX Appendix 3B/2A filings), raises from
  [from date] to [to date] — deal count, confirmed proceeds, discount, DAP
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

In this skill: each deal's proceeds points to its raise filing where the response
carries one; the headline totals, sector split and any deal without a
filing point to the capital raises data entry; a standout-deal comment
drawing on a placement announcement points to that announcement.

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
- If the screen returns no filing detail (date and title) for a deal,
  point that row at the capital raises data entry — do not call a
  per-company tool just to obtain a citation, and do not guess a filing.

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
