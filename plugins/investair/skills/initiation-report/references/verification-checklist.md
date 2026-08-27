# Verification Checklist — Initiation Report

Run this pass after drafting, before saving the final `.docx`. Work through
every item; fix what you can from the data already pulled, and flag to the
user (in the handoff message, not silently) anything you can't resolve.

## 1. Recompute every derived metric

Independently recompute each of the following from the raw tool outputs
captured earlier in this session, and diff against what's written in the
draft:

- EV = Market Cap − Cash
- EV per resource ounce = EV ÷ resource ounces (only if a resource figure
  was supplied)
- Market cap per resource ounce = Market Cap ÷ resource ounces
- Cash backing per share = Cash ÷ shares on issue, and as a % of share price
- Cash as % of market cap = Cash ÷ Market Cap
- Cash runway in quarters = Cash ÷ quarterly burn
- Annual exploration spend / market cap = (quarterly burn × 4) ÷ Market Cap
- Every peer's EV in the comparison table

Any mismatch is a drafting error — fix it before proceeding. Do not trust a
number in the draft over a fresh recomputation from the source data.

## 2. Source-traceability

For every hard number in the draft (prices, cash figures, burn, resource
ounces, drill intercepts, raise sizes, holder stakes), confirm it traces
back to a specific tool call result from this session. A number with no
traceable source is a fabrication risk — remove it, replace it with "data
not available," or ask the user, rather than leaving it in.

## 3. Cross-section consistency

The market cap, EV, cash, and runway quoted in the header stat row, the
valuation framework section, the financial position section, and the peer
table (target company's own row) must all match exactly — same figures,
same as-at date. Drift between sections (e.g. a stale market cap in the
header vs. a freshly pulled one in the body) means a re-pull happened
mid-draft and only some sections were updated — resolve by using the most
recent pull throughout.

## 4. Peer table integrity

- The target company appears exactly once in the table (not duplicated,
  not missing)
- EV = Market Cap − Cash holds for every row, not just the target
- Rows are sorted by EV ascending as specified, with larger/more-advanced
  peers separated out if the range spans an order of magnitude
- Any peer whose cash figure includes an unconfirmed raise, or is stale
  relative to the target's as-at date, has a footnote — not a silent
  inclusion

## 5. Missing data is flagged, not omitted

If a resource-ounce figure was not supplied, confirm the report explicitly
says EV/oz and Market Cap/oz could not be calculated and why — it should
not simply be missing from the valuation section with no explanation. Same
principle for any other metric that could not be calculated (P/NAV,
EV/EBITDA, DCF) — state why, per `references/report-structure.md`.

## 6. Analyst-judgment sentences are actually flagged

Re-scan the investment highlights, company overview prose, catalyst
commentary, and summary thesis. Per SKILL.md step 4, every sentence that
reflects inference or judgment rather than a reported fact should be marked
(inline `[bracket]` or in a closing "Analyst review needed" list). Confirm
this actually happened throughout the draft — it's easy to do it for the
first section and drift from it by the thesis.

## 7. Structure and disclaimer completeness

- Every section in `references/report-structure.md` is present, or its
  absence is explicitly explained (e.g. "no metallurgy subsection — no
  testwork results in recent announcements")
- The disclaimer is present verbatim, with the data-as-at date updated and
  the peer-EV/oz caveat sentence included only if a resource figure was
  actually used
