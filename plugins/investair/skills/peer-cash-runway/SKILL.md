---
name: peer-cash-runway
description: >
  This skill should be used when the user asks for a "cash runway timeline
  for [ticker]'s peers", "when will [ticker] and its peers need to raise",
  "peer group funding timeline", "raising window timeline", or wants a
  visual, forward-looking view of when a company and its peer group are
  likely to run low on cash and what near-term catalysts (drilling
  results, studies, corporate actions) might precede or support a capital
  raise before then. Produces a chat summary plus a visual timeline
  artifact (one row per company, one column per month). Every date on the
  timeline is either a calculated figure or sourced from an actual
  announcement — never an invented catalyst or date.
metadata:
  version: "0.1.0"
---

# Peer Cash Runway Timeline

Build a forward-looking cash runway timeline across a company and its peer
group using the Investair_data connector: when each company is projected
to run low on cash, and what stated near-term catalysts might precede or
support a raise before then.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the ticker and window

Confirm the target ticker if ambiguous. Default the forward window to 6
months from today; use a different window only if the user names one.

## 2. Pull the peer group and cash data

- `get_peers` (target ticker) — MCP owns the cascade. Check
  `tool_response.peer_source` and follow `business_context` for how to
  narrate the set in plain business language. Do not redefine peer tiers,
  tables, or fallbacks in this skill. If the set looks wrong, note that
  peer matching is still being improved and invite `log_feedback`.

- `get_cashflow_snapshots` — ONE batch call for the target ticker plus
  every peer ticker (not a loop of `get_cashflow_snapshot` per company).
  Gives `report_date`, `cash_today_aud`, `adjusted_cash_today_aud`,
  `daily_cash_flow_aud`, and `adjusted_estimated_quarters_funding` per
  company. A company with `found: false` has no current cashflow row —
  note it as excluded from the timeline rather than guessing its runway.

## 3. Compute a cash-out estimate per company

For each company with cash data: estimated cash-out month ≈
`report_date` + (`adjusted_estimated_quarters_funding` × ~91 days),
rounded to the nearest month. This assumes the current burn rate
(`daily_cash_flow_aud`) continues unchanged — state that assumption
whenever a cash-out estimate is shown; it is not a guarantee, and a raise,
cost reduction, or asset sale changes it.

## 4. Pull near-term catalysts from actual announcements

- `list_announcements` with `tickers` set to the target + peer list,
  `days_back=180`, `limit` sized to the group (this tool already accepts
  up to 10 tickers per call — for a peer group larger than 9, split into
  consecutive batches of up to 10 tickers and merge the results; it is
  NOT a per-company loop like the old `get_market_snapshot` pattern).
- Scan `title`/`short_preview` for explicit forward-looking language only
  — e.g. "expected", "targeting", "planned for", "due in", "scheduled",
  "on track for" — naming a study (PFS/DFS/scoping/MRE update), drill
  programme, corporate action, or asset sale with an approximate
  timeframe. **Only use a catalyst and its timing if the announcement
  text actually states or clearly implies both** — do not infer a
  catalyst that isn't named, and do not invent a date that isn't stated.
  Do **not** set `include_body=true` on this multi-ticker screen. If one
  announcement needs the full long summary, call `get_announcement`
  with that row's `feed_id` after listing.
- If a company has no forward-looking announcement in the window, leave
  its row without a catalyst marker rather than guessing one. Cite the
  announcement date next to any catalyst you do use.

## 5. Build the raise-window estimate — label it as an estimate, always

For each company, in one short phrase:
- If a stated catalyst's timing falls before the estimated cash-out date,
  name the catalyst and flag a plausible raise window around/shortly
  after it (a de-risking event ahead of fundraising is a common pattern —
  say so as a pattern, not a fact).
- If the cash-out estimate is under ~1 quarter with no catalyst in sight,
  flag it as urgent / imminent funding risk.
- If runway is comfortably long (roughly 3+ quarters) and there's no
  near-term catalyst pointing to a raise, mark it "no near-term raise
  expected" rather than leaving it blank.
- Never state a raise as certain. Use "may need to raise around ~[month]"
  / "raise window: ~[month]" — never "will raise" or a bare date without
  a qualifier.

## 6. Present the summary (chat, before the visual)

- One-paragraph headline: peer group size, how many companies show
  imminent risk (under ~1-2 quarters) vs. comfortably funded, and any
  standout name.
- One line per company: ticker, runway (quarters + estimated cash-out
  month), near-term catalyst if any (with its source announcement date),
  and the raise-window estimate.
- State plainly, once: catalyst timing comes from company-stated guidance
  in recent announcements (not confirmed schedules), and every cash-out
  estimate assumes the current burn rate continues unchanged.

## 7. Build the visual timeline

Load the Investair `artifact-design` skill (HTML artifact polish) and the
Investair `dataviz` skill (categorical color / legend / marker weight) before
building. Build an HTML artifact: a calendar-grid timeline, one row per
company (target first, then peers), one column per month across the
window — company name/ticker/runway in the row header. Cell content per
company/month:
- A raise-window marker in the estimated month, naming the driving
  catalyst if there is one
- A catalyst marker in the month a stated near-term catalyst falls,
  citing what it is
- A cash-out marker in the projected depletion month when no raise is
  otherwise flagged
- A visually lighter/muted marker for anything genuinely uncertain
  (e.g. "watch", "?") — never give a guess the same visual weight as a
  sourced fact
Include a legend explaining what each marker color/style means, and a
one-line disclaimer under the title that this is a projection built from
current cash data and company-stated guidance, not a confirmed schedule.

## 8. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Peer group | Investair peer matching | date in the response if present; say in plain words how the set was matched |
| Cash, current burn, runway | Investair cash and runway estimate | `report_date`, plus the quarter it is built on (`base_quarter_end`) |
| Filed quarterly burn trend | Quarterly cash flow reports as filed with ASX (Appendix 4C/5B) | the quarter-end dates shown |
| Drill results, catalysts, corporate updates | ASX announcement (Investair summary) | the announcement's own date, with its title |

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
- Every catalyst on the timeline already needs its announcement date
  (step 4) — those same announcements form part of the numbered Sources
  list described below.
- Put the same Sources lines in a footer on the HTML timeline, below the
  legend, so the artifact still carries them when shared on its own.

### Numbered citations

Every figure or fact in the reply carries a superscript number tied to a
numbered entry in the Sources block, so nothing is left unsourced. Where
the fact came from a specific ASX filing, the number points to that
filing. Otherwise it points to the Investair dataset that supplied it.
Three kinds of filing count: an ASX announcement, a capital-raise filing
(Appendix 3B/2A or the placement announcement), and a substantial holder
notice.

In this skill: every catalyst and its timing points to the announcement that stated it,
in the per-company summary lines and on the timeline; runway and cash-out
months point to the cash and runway estimate entry; the peer-group
sentence to the peer matching entry. Raise windows are your own estimate
— say so, and give them the numbers of the catalyst and cash entries they
rest on.

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
- On the HTML timeline, use real `<sup>` markers and real `<a href>` links
  (HTML is fine inside the artifact) with the **same numbers** as the chat
  reply, and put the numbered list in the footer below the legend.

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
