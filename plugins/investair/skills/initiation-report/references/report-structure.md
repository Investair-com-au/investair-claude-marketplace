# Investair Initiating Coverage — Report Structure

Section order and content rules, modeled on Investair's house style for
single-company initiation notes. Follow this order; omit a section only if
the underlying data genuinely does not exist for this company (state why).

## Header block

- Company name, ASX ticker, sector (e.g. "Materials")
- One-line strapline summarizing the investment case
- Stat row: Share price (as-at date) · Market cap · Estimated EV · Cash
  runway · 12-month price return · (EV/resource-oz if a resource figure was
  supplied)
- Tag line: commodity, jurisdiction, lifecycle stage, next major catalyst

## 1. Investment Highlights

3–6 numbered highlights, each one bolded headline phrase followed by 1–3
sentences of supporting detail sourced from the data pulled (market
snapshot, cashflow, announcements). Order roughly by materiality to the
investment case (valuation anomaly, flagship asset quality, recent
newsflow, funding position, corporate activity, catalysts).

## 2. Valuation Framework

Short intro paragraph noting that resource-stage/pre-revenue companies are
valued on relative metrics, not DCF, until a scoping study or PFS exists.

Present each applicable metric as a labeled stat card (metric name, one-line
category tag, the number, and 1–2 sentences of interpretation):

- **EV per Resource Ounce** — EV ÷ resource ounces (only if a resource
  figure was supplied — see SKILL.md step 2)
- **Market Cap per Resource Ounce** — market cap ÷ resource ounces
- **Cash Backing per Share** — cash ÷ shares on issue, and as a % of share price
- **Cash as % of Market Cap** — funding-risk indicator; flag values below
  ~15% as signaling near-term capital-raising pressure
- **EV per km² of tenure** — if project area data is available; a
  pre-resource land-value proxy
- **Annual Exploration Spend / Market Cap** — annualized burn ÷ market cap;
  an exploration-intensity proxy

State plainly which metrics could not be calculated and why (e.g. "P/NAV,
EV/EBITDA and DCF-derived fair value are not applicable — no scoping study
or production economics exist yet").

## 3. Peer Group — Enterprise Value Comparison

- One paragraph (1–2 sentences) explaining why this peer set was selected,
  drawn from the fields `get_peers` returned for this `peer_source` and from
  `business_context` — plain business language only; never raw table/tier/
  engine labels. Explicitly list the peer group tickers. MCP owns the peer
  cascade — do not invent alternative peer logic or a live cashflow
  classification set.
- Table columns: Ticker, Company, Country/Focus, Stage, Market Cap (A$M),
  Cash (A$M), EV (A$M), Burn/Qtr (A$M), Runway (Qtrs). Sort by EV ascending
  within similarly-sized peers; call out larger/more-advanced peers
  separately if the EV range spans an order of magnitude.
- If any peer's cash figure is stale,
  footnote it rather than silently including it.
- A short paragraph positioning the target company within the peer cohort:
  where it sits on EV, what differentiates it (larger/smaller resource,
  burn rate, stage).
- If resource-ounce data is not available for peers (it will not be, by
  default — see SKILL.md), say so explicitly and note that EV/oz is
  presented for the target company only, sourced from company filings.

## 4. Company Overview

2–3 paragraphs: what the company is, where it operates, its flagship asset,
how it got there (recent corporate history if notable — acquisitions,
strategy pivots), current share price / market cap / EV / implied valuation
multiple.

## 5. Project Portfolio

Table columns: Project, Country, Commodity, Stage, Ownership, Role
(Flagship/Secondary), Notes — from `get_company_projects`.

## 6. Flagship Project Deep-Dive

For the flagship asset: location/size/tenure, resource statement (if a
figure was supplied), drilling to date vs. total strike/prospective area
(upside framing), and a subsection of **recent drilling highlights**
sourced from `list_announcements` — pull real intercepts/results, do not
invent grades or intervals.

Include a **metallurgy** subsection if testwork results appear in
announcements.

## 7. Financial Position & Capital Structure

Stat cards: estimated cash, cash runway, quarterly burn (split
exploration/operations if available), cash as % of market cap. Prose:
shares on issue, options/performance rights overhang, and — from
`list_capital_raises` — the most recent raise (price, size, post-raise DAP
performance if available) as a precedent for any upcoming raise.

Include price performance over 1/3/6/12 months if available from
`get_market_snapshot`.

## 8. Near-Term Catalysts

Chronological list (quarter/date, catalyst, why it matters), sourced from
announcements and the funding runway (a raise is itself a catalyst when
runway is short).

## 9. Key Risks

Table: Risk category, description, severity (High/Medium/Low). Always
include funding/dilution risk if runway is short, and exploration risk for
any pre-resource or resource-definition company. Add jurisdiction, price
(commodity), technical/metallurgy, ownership-structure, and liquidity risks
where relevant to the data pulled — do not list a risk with no supporting
evidence from the data.

## 10. Summary Thesis

2–3 paragraphs synthesizing the above: the core investment case, the
primary valuation observation, and the primary near-term risk. End with:
"No investment recommendation is made in this report. See disclaimer
below."

## 11. Sources & Data References

A table listing every Investair source the report drew on, so each figure
can be traced. Columns: Source, As at, Used for (the sections / metrics it
supplied). Include only the rows that apply:

| Used for | Cite as | As-at date to quote |
|---|---|---|
| Price, market cap, shares on issue, price returns | Investair market data (end-of-day) | `info_date` |
| Cash, current burn, runway | Investair cash and runway estimate | `report_date`, plus the quarter it is built on (`base_quarter_end`) |
| Filed quarterly burn trend | Quarterly cash flow reports as filed with ASX (Appendix 4C/5B) | the quarter-end dates shown |
| Project list, stage, ownership | Investair project register | date in the response if present |
| Peer group | Investair peer matching | date in the response if present; say in plain words how the set was matched |
| Raise history, pricing, discount, DAP | Investair capital raises data (from ASX Appendix 3B/2A filings) | each deal's date |
| Substantial holders and stakes | Substantial holder notices lodged with ASX (Investair holder data) | the notice / as-at dates the tool returns, and the look-back window |
| Drill results, catalysts, corporate updates | ASX announcement (Investair summary) | the announcement's own date, with its title |

Below the table:

- **Announcements relied on** — a numbered list, in order of first citation
  in the report, that the superscript numbers in the body point to.
  Entry formats: announcement — `N. [TICKER] — [date] — "[title]"`; raise
  filing — `N. [TICKER] — [date] — Appendix 3B/2A, "[title]"`; holder notice
  (no title in the data) — `N. [TICKER] — [date] — Substantial holder
  notice, [holder name]`.
- **Calculated by Investair Research** — one line naming each derived
  metric and its inputs (EV, cash backing per share, cash as % of market
  cap, runway, EV/oz if used).
- **Not from Investair** — anything user-supplied or inferred (e.g. the
  resource-ounce figure and where it came from).

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

## 12. Disclaimer (verbatim, edit only the bracketed parts)

> This report has been prepared by Investair Research for general
> information and educational purposes only. It does not constitute
> financial product advice, investment advice, or a recommendation to buy,
> sell, or hold any securities. No investment recommendation is made.
>
> Information is sourced from ASX company announcements, quarterly reports,
> and the Investair financial database as at [DATA DATE]. [Include only if
> a resource figure was used: "Resource ounce estimates are not available
> in the Investair database and have not been sourced or estimated by
> Investair — readers should refer to the company's own JORC resource
> statements."] While care has been taken in preparing this report,
> Investair makes no representation as to accuracy or completeness. Past
> performance is not indicative of future results. Exploration-stage
> companies carry high risk; investors may lose some or all of their
> investment. Investors should seek independent financial advice from a
> licensed adviser. Investair and related entities may hold interests in
> securities mentioned herein. Intended for professional and wholesale
> investors only.
