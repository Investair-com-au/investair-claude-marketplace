# On-demand research desk (pinned page)

A pinned artifact the user opens whenever they need a report. Each button generates one report live from the user's own Investair connector. Nothing is scheduled.

## Before building
- Load the `artifact-capabilities` skill, and read its `claude.d.ts`, `mcp.d.ts` and `sample.d.ts` type definitions. They are authoritative for the call shapes.
- Take the Investair connector's display name and tool input schemas from this session's own tool definitions. Never guess argument names.
- Pre-fill the page with the user's coverage from setup (universe tickers or sector, and broker firm if given), so every button opens with a sensible default target.

## Capabilities to declare
```
capabilities: {
  mcp: { servers: [{ server: "<Investair connector display name>",
                     tools: ["resolve_company","check_listing_status","get_market_snapshot",
                             "get_cashflow_snapshot","get_peers","get_substantial_holders",
                             "get_substantial_holders_batch","list_announcements",
                             "list_capital_raises","get_company_projects","screen_peer_brokers","run_readonly_sql"] }] },
  sample: {},
  downloads: true
}
```
- **mcp:** the page calls the viewer's Investair connector with the viewer's own credentials.
- **sample:** Claude writes the narrative.
- **downloads:** lets the viewer save the result as a Markdown file.

## How each button works
1. The viewer picks a target: a ticker input pre-filled from their coverage, with a dropdown of universe tickers.
2. The page passes the needed Investair tools to `sample(...)` as page-side `tools`. Each tool's `execute` calls `mcp.callTool(...)` and returns a small, trimmed payload.
3. Send a full instruction set with every call, because `sample` has no memory: the house style from `investair-style.md`, the report structure below, the attribution rule, and "never invent figures; label inferences".
4. Stream the answer into a result panel via `onText`. Offer "Copy", "Save as Markdown" and **"Download Word"** buttons, all using `downloads.save`. For Word, load JSZip from `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`, inline `investair-docx-builder.js`, and call `iaBuildDocx(JSZip, markdown, title, logoBytes, {eyebrow, sub, footer})`. Take the logo bytes from the page's embedded wordmark data URI. The result is an Investair-branded .docx: logo, amber eyebrow, Montserrat navy headings with an amber rule, navy table header rows, and a branded footer with page numbers. Handle `declined` and `extension_not_enabled` (point the viewer to Markdown instead).
5. Pass `user_question` on every Investair call, set to the button name plus the ticker.

## Prompt sent with every button
```
You are Investair's research writer. Today is <today>.

<button brief, below, with {T} = the ticker>

<desk house style, below>

Use ONLY the Investair data below (JSON from Investair's tools; fields with "error" failed — say what is missing in a one-line "Data notes" entry).

INVESTAIR DATA:
<one section per tool result, each trimmed to about 24,000 characters>
```

**Desk house style (send verbatim):** House style: answer first (2–3 sentence takeaway), then 2–4 clearly separated sections, short plain sentences, Australian spelling, A$ with sensible precision (A$12.4m). Attribute figures to Investair ("According to Investair's data…") and give as-of dates; every section heading names the data window it covers. Never invent figures, holders, dates, drill results, resources or catalysts; prefix inferences with "Inferred:" and say what they rest on. Treat substantial-holder notices with a prime-broker clause as stock lending/collateral, not directional buying, and say so. Collapse subsidiaries of one group into one line. Output GitHub-flavoured Markdown only (headings, bullets, pipe tables). End with: "This report is general information only and does not take into account any person's objectives, financial situation or needs. It is not financial advice. Data from Investair as at <date> and public sources; accuracy not guaranteed."

## Buttons (start with these; add role-specific ones)
| Button | Investair data | Brief (send verbatim) |
|---|---|---|
| **Roadshow narrative** | market snapshot, cashflow, projects, 120 days of announcements, raises, substantial holders, peers | Write a one-page roadshow narrative for {T}: 1) Investment thesis in 3 bullets. 2) Assets and milestones achieved. 3) Funding position (cash, burn, runway, recent raises). 4) Catalysts for the next 6–12 months, only those the company has stated (label inferred timing). 5) How it compares with its closest peers. 6) Five questions investors are likely to ask, each with a short evidence-based answer. |
| **Institutional investor target list** | substantial holders of the company **and of its peers** (`get_peers`, then `get_substantial_holders_batch`) | Build an institutional investor target list for {T}. Using the substantial-holder notices across {T} and its peers: rank up to 12 institutions (funds, family offices) that hold one or more peers but are not substantial holders in {T}. For each give: name, peer positions held (ticker and %), recent direction (buying, selling or new), and one line on why they fit. Exclude prime-broker/lending notices and index-fund rebalance noise. Then list current {T} substantial holders as "existing supporters". Use a table for the ranked list. Say once that this is a statutory-disclosure proxy (holdings of 5% or more), not a complete fund register. |
| **Company snapshot** | market snapshot plus daily price history (`ASX_Market.ASX_DailyMarketInformation`), cash, projects, top holders, 60 days of announcements | Write a company snapshot for {T}: headline takeaway; market position (incl price movements and volume trends: 7-day and 3-month change computed from daily history, the day's volume against its norm); cash and runway; projects (flagship first); top holders; last 60 days of news in 3–5 bullets. Add a short funding-risk note if runway is under 2 quarters. Keep it a snapshot, not an initiation thesis. |
| **Peer cash comparison** | peers (with `peer_source`) plus cashflow snapshots | Compare {T} with its peers on cash and funding. Open with one or two sentences on why this peer set (commodity, geography, stage, or the shared business themes), from the peer data itself. One table: ticker, market cap, adjusted cash, quarterly burn, runway (quarters, one decimal), last quarter end. Then 3–4 takeaways: where {T} ranks, who must raise first, and any cash-watch flags (state flags before the cash figure). Flag scale outliers rather than dropping them. |
| **Placement terms benchmark** | own raises, peer raises over 12 months, peer brokers | Benchmark placement terms for {T}: its own recent raises (date, proceeds, discount, broker) and the peer-set brokers (deal count, issuers, average discount). Give the median discount to expect, the brokers most active with peers, and incumbents on {T}. Recommend nothing; present evidence. |
| **Substantial investor change summary** | substantial holders, 180 days | Write a substantial investor change summary for {T}: summarise substantial-holder changes over the last 180 days: new holders, exits, increases, decreases (old→new %, date). Net direction in one sentence first. Flag prime-broker notices separately. |

## Design and behaviour
- Build from `investair-page-template.html` (Investair masthead, logo, navy footer, brand stylesheet). Use report buttons as white cards with the amber rule in a grid, and put the result panel below with a navy header strip. Result tables use navy header rows.
- Handle a `null` from `claude.use("mcp")` or `claude.use("sample")`: show "Connect Investair in Settings → Connectors to use this page" and disable the buttons.
- Errors: show what failed in plain words. Retry only errors marked `retryable`. Never loop.
- After publishing, pin the page to the user's sidebar (Artifact `pin`) when they asked for a pinned page. Tell them it runs on their own Investair access, so anyone they share it with needs their own Investair account and connector.
