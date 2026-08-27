# Verification Checklist — Sector Report

Run this pass after drafting, before saving the final `.docx`. Work through
every item; fix what you can from the data already pulled, and flag to the
user (in the handoff message, not silently) anything you can't resolve.

## 1. Recompute every derived metric, for every company

For each company in the resolved universe, independently recompute from the
raw tool outputs captured earlier in this session, and diff against the
draft:

- EV = Market Cap − Cash
- Cash runway in quarters = Cash ÷ quarterly burn

Do this for every row in the universe comparison table, not just a sample —
a single wrong figure in a large table is easy to miss on read-through but
undermines the whole comparison.

## 2. Source-traceability

For every hard number in the draft (market caps, cash figures, burn rates,
raise sizes, screen_cashflow's risk counts), confirm it traces back to a
specific tool call result from this session. A number with no traceable
source is a fabrication risk — remove it, replace it with "data not
available," or ask the user, rather than leaving it in.

## 3. Universe table integrity

- No company appears twice; no company silently dropped between the pull
  and the draft
- EV = Market Cap − Cash holds for every row
- Sort order matches the spec (EV ascending, size cohorts split if the
  range spans an order of magnitude)
- Any company whose cash figure includes an unconfirmed raise, or is stale
  relative to the universe's as-at date, has a footnote

## 4. Funding-risk breakdown matches `screen_cashflow`

The "companies at/under the runway threshold" count and sector breakdown
quoted in the report should match `screen_cashflow`'s own output exactly —
don't let a hand-recount from the universe table silently diverge from
what the screen tool actually returned.

## 5. Missing data is flagged, not omitted

If any company's cash or market data wasn't available for the as-at date
used elsewhere in the report, say so explicitly next to that company's row
rather than silently omitting the company or leaving a blank.

## 6. Structure and disclaimer completeness

- Every section in `references/report-structure.md` is present, or its
  absence is explicitly explained
- The disclaimer is present verbatim, with the data-as-at date updated and
  "companies mentioned herein" language (not single-company language)
