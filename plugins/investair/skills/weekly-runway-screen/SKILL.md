---
name: weekly-runway-screen
description: >
  This skill should be used when the user asks to "run the runway screen",
  "run the cash runway report", "check funding risk this week", or "run
  the raise radar" — and is invoked automatically by the plugin's weekly
  scheduled task. Produces a week-over-week funding-risk digest posted in chat.
metadata:
  version: "0.3.0"
---

# Weekly Cash Runway / Funding Risk Screen ("Raise Radar")

Produce a week-over-week digest of ASX-listed companies likely to need a
capital raise soon, using the Investair_data MCP connector.

**This skill is presentation-only.** The screen itself is defined by the
MCP tool `screen_funding_risk` — do not embed SQL, do not reconstruct the
screen with `run_readonly_sql`, and do not redefine thresholds here.

On every tool call, pass `user_question` — for the scheduled run, use a
fixed string like "weekly runway/funding-risk screen (scheduled task)";
for an on-demand run, use the user's actual request.

## 1. Run the screen

Call `screen_funding_risk` (default top_n is fine; raise only if the user
asks for a larger evidence set within the tool's cap).

Use `summary` (new / continuing / dropped counts, as_of dates, truncated)
and `ranked` directly. Follow `business_context` on the response for field
meanings.

## 2. Catalyst context for NEW candidates only

If `summary.new_count` is large, give full per-company catalyst treatment
only to the **top 40 new** candidates by market cap from `ranked`. Others
still count in the headline and appear in a compact list.

For those top-40 new tickers:

- `list_announcements` with `tickers` batched ≤10 per call, `days_back=90`
  (title + `short_preview` only — do not set `include_body=true`)
- Only use forward-looking catalysts actually stated in announcements /
  `current_quarter_key_milestones` — never invent dates or events. If one
  item needs the full long summary, call `get_announcement(feed_id)`.

## 3. Present the digest

Reply in chat (not a document):

- Headline: new / continuing / dropped counts and as-of window
- Note if `summary.truncated` is true
- Tables or compact lists by status; broker_class as counts only (no
  broker-name recovery)
- Short catalyst notes for the top-40 new set only

## 4. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| New / continuing / dropped funding-risk names | Investair funding-risk screen | the as-of dates in `summary` |
| Drill results, catalysts, corporate updates | ASX announcement (Investair summary) | the announcement's own date, with its title |

Format (one line per source, not one line per company or per figure):

```
**Sources — Investair**
- Funding-risk screen, as at [date], compared with [prior date] — new,
  continuing and dropped names
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

In this skill: every catalyst note for the top-40 new candidates points to the
announcement that stated it; the headline counts and each table point to
the funding-risk screen entry (one marker on the headline and on each
table's header is enough).

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
