# Investair Generative Company Page (dashboard 1)

A pinned, branded company profile modelled on Investair's full company profile, in Investair colours. Type an ASX code and it builds the page from live Investair data. Nothing is scheduled. The figures, charts and tables are drawn by the page itself; Claude writes the short summary, drafts items on request, and answers follow-up questions from the data already pulled.

## Tabs
Tab order puts Announcements second, because the share price reaction to each announcement is the most useful view. Each tab carries a chip, and a legend under the tab bar explains them: **Live** (built from Investair data), **Partial** (part live, with sections still under construction) and **Soon** (under construction). Any section that is not built shows an amber **Under construction** banner across a greyed outline, with one line on what it needs.

| Tab | Chip | Live content | Under construction |
|---|---|---|---|
| Overview | Partial | Headline, figure tiles (market value, estimated cash today, runway, market value to cash, quarterly outgoings, last close, shares on issue), Claude's company summary, price chart, cash at each quarter end | Mineral resource tile; revenue, recurring revenue and profit |
| Announcements | Partial | Last 90 days with the market's reaction (two-day price move, volume against normal, reception) and a price and volume chart with numbered flags | Sentiment through time; language and tone |
| Cash burn | Partial | Investair's daily estimate (daily burn, cash today, runway, date cash runs out, cash added since the last filing), the cash line from the last filing to zero, cash and runway against peers, filed burn by quarter (operating and exploration) | Why spend changed each quarter; accuracy of cohort quarterly spend |
| Deliverables | Partial | A button drafts the company's commitments from up to 60 announcement summaries over 12 months, with target, due date, status and evidence | Needs the button; drafts only |
| Financials | Partial | Cash at each reporting date, quarters of funding as filed against Investair's estimate today, last two quarters, shares on issue now | What to watch; funding signals; year against prior year; shares over time; reports in words; size of the programme |
| Placements | Live | The company's own raises with structure, peer placement benchmarks, discount against 90-day performance, discount by deal, a raise illustrated at the peer average | |
| Peers | Live | Share price against the peer median, bar chart by period, table, where the peers operate, substantial holder timeline, activity and every notice | |
| Scorecard | Live | Five dimensions rated 1 to 5 by fixed rules, with trend, confidence and reasoning | |
| Risks | Live | Risks derived by rule from the data, with severity and basis | Risks the company discloses in announcements |
| Assets and partners | Partial | Projects; deals and counterparties drafted on request | Mineral resource; drilling and intercepts; tenure and permits; governance and meetings |
| Directors | Partial | Largest disclosed holders from substantial holder notices | Directors and their shares; board and management |
| Q&A | Partial | Claude drafts questions for management from the page's data | Questions posted and answered by management |

## Build it
1. Copy `company-page.html` from this folder. Fill these placeholders, and change nothing else:
   - `{{SERVER}}` the Investair connector's display name in this session (normally `Investair_data`);
   - `{{FIRM}}` the user's firm; `{{COVERAGE_LABEL}}` a short label for the list; `{{DEFAULT_TICKER}}` the first ticker in the list;
   - `{{COVERAGE_JSON}}` the confirmed list as `[["ABC","ABC Ltd"],...]` (upper-case codes; up to 25).
2. Publish with the Artifact tool, no doctype/html/head/body skeleton, `icon: "company"`, `pin: true`, and exactly these capabilities:
   ```json
   {"mcp":{"servers":[{"server":"Investair_data","tools":["get_market_snapshot","get_cashflow_snapshot","list_cashflow_quarterly","get_company_projects","list_announcements","list_capital_raises","get_substantial_holders_batch","get_peers","run_readonly_sql"]}]},
    "sample":{},"db":{},"user":{},"downloads":true}
   ```
   Use the real connector name if it differs from `Investair_data`. The page loads d3 and JSZip from cdnjs; without them the charts and Word export show a plain message.
3. Tell the user in two sentences: type a code (or pick from the list) and select **Generate page**, then use the tabs; the **My list of companies** box adds or removes codes, saved for them only. Tell them which tabs are partial.

## Behaviour notes (for answering questions)
- The projects, peer countries and delisted-peer handling come from Investair's mining project and peer books, so they show for mining and resources companies. For other companies the Projects table says so, and delisted peers are left out of every peer figure.
- Cash burn includes exploration spend where the company files it. The cash line runs from filed cash at the last quarter end to Investair's estimate today and then to zero at the current daily burn; it is an estimate, and any cash-watch flag is shown first.
- Price changes are price only; a period is blank where shares on issue changed more than threefold (a consolidation). The data service caps SQL results at 100 rows, so history is fetched as summaries or weekly closes, and peer placements are a bounded set of the most recent deals.
- The Deliverables and Assets analysis and the suggested questions use the viewer's Claude allowance, only on request, and are labelled as drafts.
- The written summary can fail or be declined without breaking the page: the figures, charts and tables still render.

## Walk-through scenario
See `walkthroughs.md`.
