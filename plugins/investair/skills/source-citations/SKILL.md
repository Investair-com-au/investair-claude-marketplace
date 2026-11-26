---
name: source-citations
description: >
  Always-on citation rule for Investair data. Use for EVERY reply that states
  a figure or fact obtained from the Investair connector — including ad-hoc
  questions, follow-ups, chronologies, tables, charts and artifacts where no
  other Investair skill was invoked. Adds superscript reference numbers and a
  numbered Sources list (date and title of each announcement). Helper only —
  not a user slash command.
user-invocable: false
---

# Investair source citations (always on)

This rule applies to every user-visible reply that uses Investair data. It
does not depend on the user asking for references, and it does not depend
on another Investair skill being active. If another Investair skill is
active, its own Sources section adds the detail for that skill; this rule
is the floor that always holds.

## The rule

1. **Every figure or fact from Investair carries a superscript number**
   immediately after it.
2. **Every number resolves to one row in a numbered Sources list** at the
   end of the reply, placed before the required closing line.
3. **Each row names the record the fact came from**, with at least its
   date and title.

## What each row must contain

| The fact came from | Row format |
|---|---|
| An ASX announcement | `N. [TICKER] — [date] — "[title]"` |
| A capital-raise filing | `N. [TICKER] — [date] — Appendix 3B/2A, "[title]"` |
| A substantial holder notice (the data carries no title) | `N. [TICKER] — [date] — Substantial holder notice, [holder name]` |
| The cash and runway estimate | `N. Cash and runway estimate, as at [date], built on the quarterly cash flow report (Appendix 4C/5B) for the quarter ended [date]` |
| Any other Investair dataset (market data, project register, peer set, screens) | `N. [plain dataset name], as at [date] — [what it supplied]` |

- Prefer the filing. Where a fact can be traced to a specific announcement
  or notice returned in this session, point the number at that filing, not
  at a dataset.
- Use the date and title exactly as the tool returned them. Take as-at
  dates from the response, never today's date or memory. If a response
  carries no date, write "as retrieved [today's date]".
- End each filing row, and the cash and runway row, with
  `[ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)`
  with the real ticker substituted. That is the only link you may
  construct. Never invent a link to an individual document; if a tool
  response carries one, use it instead.

## Never show internal identifiers

Do not print feed IDs, document IDs, row IDs or any other internal
identifier — not in the Sources list, not in the body, not in tables or
artifacts. Use them only to make follow-up tool calls. A reference is
identified to the reader by ticker, date and title. Likewise use plain
business names for datasets, never an internal table, column, tool or
engine name.

## Numbering

- One list per reply, numbered from 1 in order of first appearance. A
  source keeps its number wherever it is cited again in that reply; a fact
  resting on two sources gets both numbers (¹ ²).
- In chat, including inside markdown tables, write the marker with Unicode
  superscript characters (¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰, combined for 10 and above,
  e.g. ¹²). Never `<sup>`, `^1^`, `[1]` or other markup in chat.
- In HTML artifacts use `<sup>` markers and put the numbered list in the
  footer. In Word documents use true superscript formatting and put the
  list in the sources section. Use the same numbers as the chat reply.
- When a whole table column or list comes from one dataset, put the marker
  once on the column header or lead-in line. Filing-backed facts always
  carry their own marker.
- Calculated figures (EV, runway, ratios, totals) carry the numbers of
  their inputs and the word "calculated".
- A follow-up reply that restates earlier figures carries its own numbers
  and its own Sources list — do not refer back to a list in an earlier
  message.

## Honesty checks

- Never number a source that was not returned by a tool call in this
  session, and never point a fact at a filing it did not come from.
- Anything that did not come from Investair (a figure the user supplied,
  general knowledge, your own inference) gets no number and is labelled as
  such in the sentence.
- Before sending, check both directions: every Investair figure has a
  number that resolves to the right row, and every row is cited at least
  once.
- A reply with no Investair figure or fact in it (a clarifying question, a
  setup step) needs no Sources list.

## Example

```
A1M last traded at $0.42¹, giving a market cap of $310m¹. Estimated cash
is $18m², and the company flagged first concentrate for the March
quarter³.

**Sources — Investair**
1. Market data (end-of-day), as at [date] — price, market cap
2. Cash and runway estimate, as at [date], built on the quarterly cash flow
   report (Appendix 4C/5B) for the quarter ended [date] ·
   [ASX announcements: A1M](https://www.asx.com.au/markets/company/A1M)
3. A1M — [date] — "[title]" ·
   [ASX announcements: A1M](https://www.asx.com.au/markets/company/A1M)
```

(The figures above are placeholders showing the layout only.)
