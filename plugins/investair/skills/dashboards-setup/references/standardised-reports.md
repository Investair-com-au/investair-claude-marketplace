# Standardised Reports (dashboard 3)

A pinned, branded page where the user picks a company (or runs the sector report on their whole list) and generates one of four standard reports on demand, from their own Investair connector. Nothing is scheduled. Reports are written live by Claude in the house style, with copy, Markdown and branded Word download.

## The four reports
| Report | What it gives |
|---|---|
| **Roadshow Plan & Narrative** | A one-page narrative (thesis, assets, funding, catalysts, peer comparison) plus a meeting plan: up to 10 target institutions drawn from peer holders, existing supporters to keep warm, the brokers active with the peers and on the company's own deals, a suggested sequence (labelled inferred), the message for each group and five likely investor questions. A plan, not a schedule. |
| **Investor Targets** | Up to 12 institutions that hold peers but not the company, ranked, with peer positions, recent direction and why they fit, plus existing supporters. Based on substantial holder notices (5% or more), not a full register. |
| **Initiation-style Report** | A two-page version of an initiation note: highlights, valuation framework, projects, funding, catalysts stated in announcements, risks and register. No price target or rating. |
| **Sector Report** | A weekly report on the user's whole list, in the format of Investair's ASX Drone Sector Weekly: title and data note, three-sentence lead, catalysts and dates, sector context, universe table (market cap with 7-day and 3-month change side by side, volume against norm, cash, outgoings, runway), newsflow by company, placements with 30 and 90-day performance against DAP, substantial shareholders with a one-phrase read, footer and the line "Powered by Investair". Plain Markdown only, so it can be edited and pasted into an email. |

The Sector Report follows the Drone template but the page cannot search the web, so the "global context" section is replaced by sector context drawn only from announcements, placements and register changes in Investair's data. The scheduled Drone brief (daily at 7am, flash updates) is separate and keeps its web sweep.

## Build it
1. Copy `standardised-reports.html` from this folder. Fill these placeholders, and change nothing else (the page already carries the Investair branding, logo and Word builder):
   - `{{SERVER}}` the Investair connector's display name in this session (normally `Investair_data`);
   - `{{FIRM}}` the user's firm; `{{COVERAGE_LABEL}}` a short label for the list (e.g. "WA gold explorers"); `{{DEFAULT_TICKER}}` the first ticker in the list;
   - `{{COVERAGE_JSON}}` the confirmed list as `[["ABC","ABC Ltd"],...]` (upper-case codes; up to 25).
2. Publish with the Artifact tool, no doctype/html/head/body skeleton, `icon: "report"`, `pin: true`, and exactly these capabilities:
   ```json
   {"mcp":{"servers":[{"server":"Investair_data","tools":["get_market_snapshot","get_cashflow_snapshot","get_peers","get_substantial_holders","get_substantial_holders_batch","list_announcements","list_capital_raises","list_deal_brokers","screen_peer_brokers","get_company_projects","run_readonly_sql"]}]},
    "sample":{},"db":{},"user":{},"downloads":true}
   ```
   Use the real connector name if it differs from `Investair_data`.
3. Tell the user in two sentences: pick a company (or choose Sector Report for the whole list), choose a report (30–90 seconds); the **My list of companies** box lets them add or remove ASX codes (each new code is checked against Investair and saved for them only). Anyone they share the page with needs their own Investair connector.

## Behaviour notes (for answering questions)
- The list is saved per viewer (database, with browser storage as a fallback); "Reset" returns it to the list from setup. The Sector Report reads up to 25 companies on that list.
- Delisted peers are left out of the roadshow audience and cash comparison.
- Figures come from Investair; the narrative is AI-written and labels inferences. SQL results are capped at 100 rows by the gateway, so data is fetched as summaries. The sector placements table is the most recent deals, bounded by the data service.

## Walk-through scenario
See `walkthroughs.md`.
