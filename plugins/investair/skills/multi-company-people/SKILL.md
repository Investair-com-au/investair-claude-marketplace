---
name: multi-company-people
description: >
  This skill should be used when the user asks who sits on several ASX
  boards, "directors at more than one listed company", "most connected
  directors", or "people who appear at multiple ASX companies". It runs the
  market-wide multi-company people screen. It is not a single company's
  board (get_company_people) and not a search for one named organisation
  (get_people_at_organisation).
metadata:
  version: "0.1.0"
---

# Multi-company directors and executives

Answer a market-wide question about people who show up at more than one
ASX company by calling `screen_multi_company_people` on the
Investair_data connector. Reply in chat.

**This skill is presentation-only.** The screen and the row cap belong to
that tool. Do not embed SQL, do not reconstruct the list with
`run_readonly_sql`, and do not walk company by company.

On every tool call, pass `user_question` with the user's original request
in their own words.

If the connector has no `screen_multi_company_people` tool, say this
screen is not available on this connection yet and stop. Do not invent
the list.

## When this skill does not apply

- Directors and executives of one ticker → `get_company_people`.
- Other boards of one ticker's people → `get_person_other_roles`.
- Roles named in one ticker's biographies → `get_person_bio_roles`.
- Who mentions one named organisation (a charity, a private company, a
  former employer) → `get_people_at_organisation`.

## 1. Run the screen

Call `screen_multi_company_people`.

- `min_companies` defaults to 2. Raise it only when the user asks for
  people at three or more companies, or similar.
- `limit` defaults to 50. The tool caps the list at 100. This is a capped
  list, not a dump of every director on the market.

## 2. Present the result

Show name, how many companies, and the company list the tool returned,
most-connected first.

Say that links across companies are name-based and can join different
people who share a common name. A long company list is a reason to be
cautious, not proof of one person. Do not assert a unique identity the
tool did not establish.

The list only covers people who are directors or executives of an ASX
company in this dataset. An empty result is not proof that nobody sits on
more than one board.

If the user then asks about one person or one company, stop this screen
and use the single-company people tool that matches the question. Do not
keep screening.

## 3. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from.

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Names and the companies they are linked to | Investair directors and executives, from company annual reports | `evidence.as_of` if present, otherwise the filing date the tool returns |

Format:

```
**Sources — Investair**
1. Investair directors and executives, from company annual reports, as at
   [date] — people linked to more than one ASX company
```

Rules:

- Take every as-at date from the tool response. Never today's date and
  never a remembered one. If the response carries no date, write
  "as retrieved [today's date]".
- One numbered list, in order of first appearance, starting at 1. A source
  keeps its number wherever it is cited again.
- In chat, including inside markdown tables, write the marker with Unicode
  superscript characters (¹ ² ³). Never `<sup>`, `^1^`, or `[1]`.
- When the whole list comes from this screen, put the marker once on the
  list's lead-in line rather than on every name.
- Plain business names only in the user-visible Sources block — never an
  internal table, column, tool, or engine name.
- List only sources actually called in this session.
- Never print feed IDs, document IDs, person keys, or other internal
  identifiers.
- The only link you may construct is
  `https://www.asx.com.au/markets/company/TICKER`. Do not invent a document
  link. Do not add a link on every row of a long list.
- These rules also hold for every follow-up reply that uses Investair data
  (see the `source-citations` skill).
- Before sending, check both directions: every figure has a number that
  resolves to an entry, and every entry is cited at least once.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
