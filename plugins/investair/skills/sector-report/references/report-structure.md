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

## 8. Sources & Data References

A table listing every Investair source the report drew on. Columns: Source,
As at, Used for. Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Price, market cap, shares on issue, price returns | Investair market data (end-of-day) | `info_date` |
| Cash, current burn, runway | Investair cash and runway estimate | `report_date`, plus the quarter it is built on (`base_quarter_end`) |
| Filed quarterly burn trend | Quarterly cash flow reports as filed with ASX (Appendix 4C/5B) | the quarter-end dates shown |
| Project list, stage, ownership | Investair project register | date in the response if present |
| Peer group | Investair peer matching | date in the response if present; say in plain words how the set was matched |
| Sector funding-risk counts and at-risk names | Investair cash runway screen | the as-of date in the response |
| Raise count, proceeds, discount, DAP, sector split | Investair capital raises data (from ASX Appendix 3B/2A filings) | the screen window (from/to dates) |
| Drill results, catalysts, corporate updates | ASX announcement (Investair summary) | the announcement's own date, with its title |

When companies in the universe table carry different as-at dates, give the
common date and name the exceptions. Below the table:

- **Universe definition** — how the company list was resolved (explicit
  list, peers of a named company, or a commodity/geography filter), in
  plain words.
- **Announcements relied on** — a numbered list, in order of first citation
  in the report, that the superscript numbers in the body point to.
  Entry formats: announcement — `N. [TICKER] — [date] — "[title]"`; raise
  filing — `N. [TICKER] — [date] — Appendix 3B/2A, "[title]"`; holder notice
  (no title in the data) — `N. [TICKER] — [date] — Substantial holder
  notice, [holder name]`.
- **Calculated by Investair Research** — derived metrics and their inputs
  (EV, runway, universe totals and medians).
- **Not from Investair** — anything user-supplied or inferred.

Rules:

- Take every as-at date from the tool response itself (the dated field in
  the table, or `evidence.as_of`) — never today's date and never a
  remembered one. If a response carries no date, write "as retrieved
  [date of pull]".
- List each announcement relied on by **date and title** (with ticker), and
  end each entry with a hyperlink to the ASX announcements page for that
  ticker, `https://www.asx.com.au/markets/company/TICKER` (real ticker
  substituted), where the filing itself can be opened. Do the same on the
  cash and runway row, naming the quarterly cash flow report (Appendix
  4C/5B) and quarter it is built on. That page-per-ticker address is the
  only link you may construct — the connector does not return a link to the
  individual document, so never invent one. If a tool response does carry
  a link for a filing, use that instead.
- **Numbered citations.** Every figure or fact in the body taken from a
  specific ASX filing — an announcement (drill intercept, study date,
  corporate update), a capital-raise filing (Appendix 3B/2A or placement
  announcement) or a substantial holder notice — carries a superscript
  number immediately after it, matching its entry in the numbered
  announcements list. This applies in prose, stat cards and table cells.
- Number in order of first appearance, starting at 1; a filing keeps its
  number wherever it is cited again. Use true superscript formatting in the
  Word document (not brackets, not carets).
- Never print feed IDs, document IDs or any other internal identifier in
  the report. A reference is identified by ticker, date and title only.
- Figures that do not come from a specific filing — market data, the cash
  and runway estimate, filed quarterly burn, project and peer data — carry
  the number of their row in the source table, so every figure in the
  report is numbered. Number the source-table rows and the announcements
  list as one sequence, in order of first citation. Where a whole table
  column comes from one source, put the marker on the column header.
  Calculated metrics carry the numbers of their inputs.
- Never point a figure at a source it did not come from, and never number
  a source that was not pulled for this report.
- Label calculated figures as calculated and name their inputs.
- Label anything that did not come from Investair (a resource figure the
  user supplied, analyst inference) as such — never under an Investair
  source.
- List only sources actually pulled for this report; if a pull returned
  nothing for a company, say so.
- Plain business names only, as in the "Cite as" column — never an internal
  table, column, tool or engine name in the report.

## 9. Disclaimer

Use the same verbatim disclaimer as `initiation-report`, replacing
single-company language with "companies mentioned herein."
