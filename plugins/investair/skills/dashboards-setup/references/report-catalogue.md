# Scheduled report catalogue

Each report can cover a sector, a peer group or a single company plus its peers. "Alert" reports run on weekdays and **stay silent** unless something clears the materiality bar. "Weekly"/"monthly" reports always publish.

## Role mapping (starting point — adjust to what the user said)

| Role | First choices | Also consider |
|---|---|---|
| Listed-company executive / board / IR | 1 Runway & catalysts (peers), 2 Substantial holder watch (own stock + peers) | 7 Peer page, 4 Placement terms (if a raise is likely) |
| Broker / ECM / corporate adviser | 9 Broker sweet-spot pipeline *(uses the firm from Step 1)*, 8 Sector raise pipeline *(uses the sector or ticker from Step 1)*, 4 Placement terms | 3 Client sector note, 6 Broker league table |
| Analyst / fund manager / investor | 3 Sector note, 5 Read-across alerts | 2 Substantial holder watch, 1 Runway & catalysts |
| IR / communications consultant | 3 Client sector note, 5 Read-across alerts | 2 Substantial holder watch |

Every report's section headings name the data window they cover (see `task-prompt-template.md`).

---

## 1. Cash runway & inferred catalysts
Built the same way as the quarterly cashflow trajectory and peer cash runway skills, across the whole universe.
- **Cadence / format:** weekly (Monday) · dashboard page (one row per company on a runway timeline), or email-ready file.
- **Data (latest snapshot):** resolve each ticker first. `Cashflow.cashflow_daily` at its latest `report_date`: adjusted cash, `daily_cash_flow_aud`, `adjusted_estimated_quarters_funding_confirmed`, `base_quarter_end`, `runway_publishable`, `positive_cashflow_transition_flag`, and the placement, rights and SPP counts already folded in. Raises over 12 months. Announcements over 120 days, with full text (`get_announcement`) for the latest 4C/5B and activities report.
- **Two views per company:** Investair's flat run-rate (the last filed quarter extended in a straight line) and a guidance-adjusted range built from what the company has said since. The adjusted range:
  - starts from the 4C/5B's own forward statement on spend (up, down, flat, and why);
  - backs out one-off inflows in the base quarter (R&D rebate, grant, insurance or legal receipt) before treating it as the run-rate, and adds back a further rebate only if the company flags one;
  - adds any cost-relevant event announced after the base quarter (new trial arm, drilling programme, headcount, a programme paused), sized from the existing programme and labelled inferred;
  - is a range, never a point, where the company gave no figure.
- **Raise check:** scan the last 2–4 weeks for an Appendix 3B, a cleansing notice (s708A or s708AA) or a placement, rights issue or SPP. If one is announced, report it instead of modelling around it.
- **Catalysts:** only those stated in company announcements (drill results, study or permit milestones, offtake decisions, option expiries, AGMs) plus the next quarterly due date. Show a likely raise window where runway is under about 3 quarters, especially just after a de-risking catalyst.
- **Flags:** runway newly under 2 quarters; stale base quarter; going-concern language; positive cash flow transition; a base quarter distorted by a one-off inflow.
- **Wording:** cash-out dates are estimates, not certainties. Label every adjusted figure, catalyst and raise window as inferred and cite the announcement. Name the next filing that will confirm or override the estimate.

## 2. Substantial holder watch
- **Cadence / format:** weekday alert plus a Monday trend summary · chat.
- **Data (since the last report):** substantial holder notices for the universe, from the batch holders tool or `Substantial_Holding.beneficial_ownership_asx` with `beneficial_owner = 'True'`, grouped by ticker, party, event type and date, with MAX(total_voting_power), MAX(previous_total_voting_power) and MAX(prime_broker_clause_detected). Use `UPPER(ticker)` when matching.
- **Alert triggers:** a new substantial holder; a holder ceasing; a move of about 1%+ in voting power that looks like genuine buying or selling; a holder present across several companies in the universe (a thematic buyer).
- **Weekly trend:** net accumulators and sellers by institution across the group; register concentration changes. One-phrase read per line: buying or selling, lending or collateral, or index-related.
- Treat prime-broker or securities-lending notices as lending or collateral, not as directional buying. Collapse subsidiaries of one group into a single line. Discount index-fund commencements and cessations around rebalance dates.

## 3. Weekly client-ready sector note
- **Cadence / format:** Monday 7:00am · one plain Markdown file the client can lightly edit and paste into an email (headings, bullets, simple pipe tables; no HTML, nested formatting, footnotes or callouts). Save as `<sector>-weekly-<YYYY-MM-DD>.md`; never a hosted page.
- **Data:**
  - Newsflow since the last report actually ran (`list_announcements`, up to 10 tickers per call, `price_sensitive` flagged, never `include_body`).
  - Price, volume and market cap from `ASX_Market.ASX_DailyMarketInformation`: latest close, and real 7-day and 91-day price and market-cap change computed from history with a correlated lookback (`info_date <= DATE_SUB(latest, INTERVAL 7/91 DAY) ORDER BY info_date DESC LIMIT 1`). If a ticker's earliest row is less than about 95 days before the 91-day lookback, label the change "since listing". Note the day's volume against the ticker's norm. State the end-of-day as-of date; it can lag a day or two. Don't rely on the snapshot tool's `return_1m/3m` fields.
  - Cash and runway from `Cashflow.cashflow_daily` at `MAX(report_date)`: cash at quarter end, net operating cash flow, adjusted confirmed cash, confirmed quarters of funding, `runway_publishable`, `positive_cashflow_transition_flag`. Don't use its market-cap column.
  - Placements over 12 months from `Placement.deals_daily`: filing date, security types, `discount_positive_pct`, performance at 30 and 90 days, `raise_vs_market_cap_pct`, broker, use of funds. No proceeds or price columns. Exclude executive and employee issues.
  - Substantial holder changes, as in report 2.
  - 2–4 web searches for sector and policy news, plus one for external coverage of any price-sensitive announcement.
  - If batch snapshot tools are unavailable on the account, fall back to `run_readonly_sql` on the same tables.
- **Structure:**
  1. Title, date and a one-line data note.
  2. Three-sentence lead on what matters this week (answer first).
  3. Catalysts and dates: next two weeks, then further out.
  4. Sector and macro context, with a short linked sources list.
  5. Universe table: ticker, company, market cap, 7-day and 3-month change side by side, day's volume, cash at quarter end, quarterly net operating cash flow, runway in quarters.
  6. Newsflow by company, price-sensitive flagged; name any company with no announcements.
  7. Placements table with performance at 30 and 90 days.
  8. Substantial investor changes, with a one-phrase read per line.
  9. How the universe was built, and the disclaimer.
  10. Final line: `Powered by [Investair](https://www.investair.com.au)`.
- If an Investair summary reads as misattributed (wrong industry narrative for the company, or flagged as failing its own grounding check), say so rather than repeat it.
- The file goes to clients, so put the feedback line only in the chat reply, never in the file.

## 4. Placement & terms monitor
- **Cadence / format:** weekday alert for new raises plus a Monday summary · chat or email-ready file.
- **Data:** capital raises for the universe from `Placement.deals_daily` (last 12 months for the benchmark; new filings since the last report for the alert), lead brokers from `Broker.deal_broker_map` on `deal_id`; peer-broker screen.
- **Content:** each new raise with its type (placement, SPP, rights issue), discount to last close (`discount_positive_pct`; in `discount_pct` a negative value is a discount), size as a percentage of market cap, attached options, lead broker, use of funds, and price performance at 30 and 90 days against the diluted price for older deals. Compare terms with the group's 12-month median discount and size.
- A raise priced above the last close is labelled "check terms", not reported as a premium. Exclude executive and employee share issues. Don't report proceeds or prices that the data doesn't hold.

## 5. Read-across announcement alerts
- **Cadence / format:** weekday alert · chat.
- **Data:** price-sensitive announcements from the universe and their peers since the last run; one web search on any announcement that clears the bar.
- **Trigger:** an announcement with implications **beyond the issuer**, for example a large contract or offtake, M&A or a takeover bid, a pricing or offtake benchmark, a regulatory or permitting decision, a resource or study that resets peer valuations, or a major customer or government program change.
- **Content:** what happened, why it matters for the rest of the group, and which tickers are most exposed. Routine items (vesting issues, AGM notices, appendices) never trigger an alert.

## 6. Broker league table *(monthly)*
- Lead and co-lead brokers on raises in the universe over the last 12 months: deal count, average discount, average size as a percentage of market cap, and post-deal performance.
- Useful for a CFO choosing a broker, or for a broker benchmarking its own position.

## 7. Peer page *(monthly)*
- One-page dashboard for a listed company's board or IR team: the company against its peers on market cap, EV, cash, burn, runway, 1, 3 and 12-month price performance, raises, and register changes.
- Republished to the same page each month.

## 8. Sector raise pipeline *(weekly, for brokers and advisers)*
Offer this to every broker, ECM or adviser user alongside the sweet-spot pipeline. Ask for **either a sub-industry** (e.g. "gold explorers", "biotech", "lithium developers") **or a ticker**.
- **Build the peer group (re-derived on the first Monday of each month; embed the confirmed list in the prompt between refreshes):**
  - **Sub-industry:** take every live ASX company in that Investair `sub_industry` (for miners, also match the flagship commodity in `Peer_Group.mining_company_project_current`, `portfolio_role = 'flagship'`, weight suffix stripped). Confirm the definition and count with the user before the first run.
  - **Ticker:** discover its peer group the way the peer-discovery skill does. `resolve_company`, then `get_peers`: if `peer_source = "materials_cip_similarity"`, use that CIP set. Otherwise, extract 3–5 phrase buckets from the target's latest annual and half-year reports and match them across every company's latest annual and half-year reports in `Feed_Public.feed_new` (one `run_readonly_sql` query with `LOCATE`, never `LIKE` or `%`); keep companies matching 2 or more buckets, cross-check against the rules-based `get_peers` list, flag scale outliers, and confirm identities with `check_listing_status`. Include the target itself. Show the user the group and why each name is in it before the first run.
- **Window:** runway in **weeks** (confirmed quarters × 13). The **Active Pipeline** is the peer group's companies with a **4–10 week runway** (0.31–0.77 quarters). **Approaching Window** shows 10–26 weeks as lighter watch cards. Everything else goes in the **Excluded** table with a one-line reason (funded beyond 26 weeks, recently raised, under takeover, net cash inflow so runway not meaningful).
- **Per company:** runway weeks, confirmed adjusted cash, burn per quarter (operating + exploration outflows), market cap, inferred catalyst (stated in announcements only), last raise (date, discount, lead broker), likely cornerstones (top substantial holders, excluding prime-broker/lending notices), indicative raise size at the group's 12-month median size (labelled inferred), and a flag when there is no incumbent broker (open mandate). Apply report 1's raise check (an Appendix 3B or cleansing notice already out) and one-off inflow check before placing a company in the window.
- **Week over week:** the masthead names companies that entered or left the window since last week, and why (raised, runway moved, takeover, peer group refreshed).
- **Format:** dashboard page in the pipeline format (`references/pipeline-format.md`), titled "<Sub-industry or TICKER peers> Raise Pipeline", republished weekly to the same URL. Internal only, never client-facing.

## 9. Broker sweet-spot placement pipeline *(weekly, for a named broker firm)*
Offer this whenever the user is a broker, ECM or corporate adviser. Use the firm from setup Step 1, matched to a broker in Investair's placement data (`Broker.deal_broker_map` canonical id and name; confirm the match and deal count with the user). Covers the whole ASX; no universe list is needed.
- **Step 1 — Find the sweet spot (derive at setup; re-derive on the first Monday of each month; embed the result in the prompt between refreshes).** Take every placement the broker worked on in the last 12 months (`Broker.deal_broker_map` joined to `Placement.deals_daily` on `deal_id`, `filing_date` within 12 months) with sector, sub_industry, flagship commodity (`Peer_Group.mining_company_project_current`, `portfolio_role = 'flagship'`, first word of `commodities`), market_cap, `raise_vs_market_cap_pct`, `discount_positive_pct`, `dap_performance_post_30d_pct`, `dap_performance_post_90d_pct`. Collapse same-issuer same-week duplicates.
  - Group into segments: flagship commodity for miners, sector or sub_industry otherwise.
  - Rank by deal count, then median 90-day performance against the diluted price. Keep the top 3–4 as ranked chips, with the evidence for each (deals, median 90-day performance).
  - **Core band** = 25th–75th percentile of deal market caps (rounded); **full range** = min–max, excluding clear outliers (say which). Also state median raise size (% of market cap) and median discount.
- **Step 2 — Screen the market.** Latest `Cashflow.cashflow_daily` snapshot, `runway_publishable = 1`, confirmed runway 0.31–0.77 quarters (4–10 weeks), market cap within the full range. If more than 25 match, use the cash runway screen (top 50).
  - **Confirmed:** sweet-spot segment and inside the core band.
  - **Watch:** sweet-spot segment outside the core band but inside the full range, or an adjacent commodity (other metals and minerals) inside the core band.
  - **Excluded:** everything else, with a short specific reason (wrong commodity, wrong sector, adjacent commodity and outside the core band).
- **Step 3 — Raise check** for every Confirmed and Watch name: headlines in the last 6 weeks containing placement, cleansing, proposed issue, capital rais, entitlement, share purchase plan, trading halt, takeover, suspension, funding or loan; plus 120 days of price-sensitive announcements for non-dilutive funding (licence payments, loan drawdowns, grants). Move any name that has raised, announced a raise, received material post-quarter funding, or is under takeover or merger to Excluded, with the reason and date.
- **Step 4 — Enrich** Confirmed and Watch: last raise date, deal count and distinct brokers over 18 months; **"Existing client"** when the broker worked on any deal in 18 months; **"Open mandate"** when no broker is disclosed on any deal in 18 months; catalysts stated in announcements only; top substantial holders (exclude prime-broker/lending notices, collapse group entities); indicative raise = broker's median size × market cap, labelled Inferred.
- **Step 5 — Week over week:** read the current dashboard, flag entrants as NEW, and name entrants and exits with the reason (raised, runway moved, market cap moved, takeover, sweet spot re-derived) in the masthead note. If the cash flow snapshot is unchanged since last week, say "No change since <date>" and do not notify.
- **Format:** dashboard page in the pipeline format, titled "<Broker> Sweet Spot Pipeline", republished weekly to the same URL. Internal only. Notify (email and push) only when there are entrants, exits or material changes.

## 10. ASX morning market brief *(weekdays, every role)*
- **Cadence / format:** weekdays 7:00am (user's timezone) · chat digest, or an email-ready Markdown file if the user wants to forward it.
- **Investair data (whole market, previous trading day):**
  - capital raises screen for the previous trading day, plus anything announced but not yet reconciled;
  - week-over-week funding-risk screen, on Mondays only;
  - new substantial holder notices (aggregate by holder; flag prime-broker/lending notices separately);
  - price-sensitive announcements (top 10 by market cap);
  - biggest market-cap movers and unusual volume from EOD market data;
  - listings, delistings and renames.
- **Overnight news (3–5 web searches, reputable outlets):**
  - US and European market close;
  - gold, copper, iron ore, oil and lithium moves;
  - AUD;
  - major macro or policy news likely to move the ASX open;
  - any overnight coverage of an ASX-listed company.
- **Structure:**
  1. Three-line "what matters this morning" (answer first).
  2. Overnight markets table.
  3. Yesterday on the ASX: raises, substantial holder moves, key announcements.
  4. If the user has a sector or universe, a short "In your coverage" section.
  5. What to watch today.
- Always publishes; it is a morning brief, not an alert.

---

**On-demand research desk (not scheduled):** see `references/on-demand-desk.md`. Offer it to every user alongside the scheduled reports.

**Inventing new reports:** if the user's role suggests something not listed (for example, index inclusion or liquidity watch, option-expiry overhang, or a director dealings tracker), propose it in the same format. Only propose it if the Investair data or reputable web sources can support it.
