# Sector Report — Structure

Adapts the single-company initiation-report structure (see the
`initiation-report` skill's `references/report-structure.md` for the full
metric definitions and disclaimer text) to a multi-company universe.

## Header block

- Sector definition (commodity, geography, lifecycle scope) and as-at date
- Universe size (N companies) and total/median EV, cash, runway
- One-line thesis for the sector as a whole

## 1. Sector Highlights

3-6 numbered highlights at the sector level: valuation dispersion, funding
risk concentration, notable recent newsflow/raises, standout names.

## 2. Universe Comparison Table

Same columns as the initiation-report peer table (Ticker, Company,
Country/Focus, Stage, Market Cap, Cash, EV, Burn/Qtr, Runway), covering the
full resolved universe, sorted by EV ascending. Split into size cohorts if
the range spans an order of magnitude, same as the peer table convention.

## 3. Funding Risk Breakdown

Sourced from `screen_cashflow`: how many companies fall under ~2 quarters of
runway, sector/sub-theme breakdown of risk, and the specific at-risk names
(bounded list, not an exhaustive dump).

## 4. Capital Markets Activity

Recent raises across the universe from `screen_capital_raises` (filtered by
sector where the universe maps cleanly to one): sizes, pricing,
discount-to-market, notable brokers if relevant. Frame as evidence of
investor appetite (or lack of) for the sector right now.

## 5. Company Call-Outs

1 short paragraph each for the 2-4 most material names (highest quality
asset, most acute funding risk, most significant recent newsflow) — not a
full profile for every company in the universe.

## 6. Sector Risks

Table: risk category, description, severity — sector-wide risks (commodity
price, jurisdiction, funding-market conditions) rather than single-company
risks.

## 7. Closing View

2-3 paragraphs: where the sector sits in its cycle, the primary
opportunity, the primary risk. End with: "No investment recommendation is
made in this report. See disclaimer below."

## 8. Disclaimer

Use the same verbatim disclaimer as `initiation-report`, replacing
single-company language with "companies mentioned herein."
