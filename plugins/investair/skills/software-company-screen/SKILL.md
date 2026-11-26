---
name: software-company-screen
description: >
  This skill should be used when the user asks which Software & Services or
  tech companies match a filter, such as "profitable software companies under
  A$100m", "software companies growing more than 25%", "mature vs early-stage
  software", or "group software companies by customer type". It screens the
  Investair Software & Services book. It is not for peers of one company
  (use peer-cash-comparison / get_peers) and not for one company's full
  profile (use get_software_company_profile).
metadata:
  version: "0.1.0"
---

# Software & Services screen

Answer a sector-wide question about Investair's Software & Services book
by calling `screen_software_companies` on the Investair_data
connector. Reply in chat.

**This skill is presentation-only.** The screen, the row cap, and the
missing-value counts belong to that tool. Do not embed SQL, do not
reconstruct the screen with `run_readonly_sql`, and do not filter a list
you built yourself from other tools.

On every tool call, pass `user_question` with the user's original request
in their own words.

If the connector has no `screen_software_companies` tool, say the software
screen is not available on this connection yet and stop. Do not invent the
list.

## When this skill does not apply

- Peers of one named company → `get_peers`. Do not redefine the peer cascade.
- One company's products, maturity, or financials → `get_software_company_profile`.
- A mining, resources, or other non-software universe → do not use this tool.
  Say the book is Software & Services only.

## 1. Map the question onto one call

Each classification filter takes one value. "Mature or profitable growth"
is two calls, or one call with `group_by` and no stage filter.

Classification filters, when the user states them: `company_stage`,
`size_band`, `growth_band`, `profitability_band`, `geographic_reach`,
`funding_status`, `market_cap_band`, `rule_of_40_band`,
`recurring_share_band`, `arr_band`, `gross_margin_band`, `nrr_band`,
`disclosure_level`.

Revenue-mix filters: `offering_type`, `revenue_model`, `delivery_model`,
`customer_type`, `product_stage`, `customer_region`, `customer_industry`.
They keep companies with at least `min_share` percent of estimated revenue
in that category (default 50). Lower `min_share` only if the user asks for
a smaller share.

Numeric filters, in AUD or percent as the tool defines them:
`min_market_cap_aud`, `max_market_cap_aud`, `min_revenue_growth_pct`,
`max_revenue_growth_pct`, `min_ebitda_margin_pct`. Use these for thresholds
such as "under A$100m" or "growth over 25%". Do not substitute a size or
growth band for a number the user stated.

Profitability: `profitable_on=ebitda` is the EBITDA band (profitable or
highly profitable). `profitable_on=net_profit` is positive trailing
twelve-month net profit after tax. Do not pass `profitable_on` and
`profitability_band` together. Say which definition you used.

`group_by` is one of the classification or revenue-mix fields above. Use it
when the user wants a breakdown rather than a name list. `order_by` is one
of `market_cap_aud`, `revenue_12m_aud`, `revenue_growth_pct`,
`ebitda_margin_pct`. Default `limit` is 25; the tool caps at 100. Raise
`limit` only when the user asks for more names, and say when the result is
capped.

## 2. Present the result

Follow the tool's caveats. In particular:

- Revenue mix, customer type, product category, region, and industry shares
  are estimates. Say "estimated".
- Bands and `company_stage` are Investair classifications.
- If `excluded_missing_values` is set, say how many companies were left out
  because a filtered figure was missing, and that they are not a "no".
- For `group_by`, lead with the group counts and the medians the tool
  returned. Do not expand a group into a name list unless the user asks.
- For a name list, show ticker, company name, and the figures that answered
  the filter (market cap, growth, margin, stage). Do not dump every field.
- State `matched_count` against `universe_count`.

## 3. Sources

End the reply with a short **Sources** block — after the content and
immediately before the required closing — so every figure can be traced
to the Investair data it came from.

| Used for | Cite as | As-at date to quote |
|---|---|---|
| The screened names, counts, medians, bands, and financials | Investair Software & Services company profiles | `as_of` or `evidence.as_of` on the response |

Format:

```
**Sources — Investair**
1. Investair Software & Services company profiles, as at [date] — screened
   names, counts, and the figures in the table
```

Rules:

- Take every as-at date from the tool response (`as_of` or `evidence.as_of`).
  Never today's date and never a remembered one. If the response carries no
  date, write "as retrieved [today's date]".
- One numbered list, in order of first appearance, starting at 1. A source
  keeps its number wherever it is cited again.
- In chat, including inside markdown tables, write the marker with Unicode
  superscript characters (¹ ² ³). Never `<sup>`, `^1^`, or `[1]`.
- When the whole table comes from this screen, put the marker once on the
  table's lead-in line rather than on every cell.
- Plain business names only in the user-visible Sources block — never an
  internal table, column, tool, or engine name.
- List only sources actually called in this session. Label anything the user
  supplied, or your own inference, as such.
- Never print feed IDs, document IDs, or other internal identifiers.
- The only link you may construct is
  `https://www.asx.com.au/markets/company/TICKER`. Do not invent a document
  link. A screen of many companies does not need one link per row.
- These rules also hold for every follow-up reply that uses Investair data
  (see the `source-citations` skill).
- Before sending, check both directions: every figure has a number that
  resolves to an entry, and every entry is cited at least once.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
