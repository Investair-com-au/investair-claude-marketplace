---
name: investair-weekly-raises-digest
description: Weekly ASX capital raises digest from the Investair_data connector
---

Use the Investair_data MCP connector. Call its `screen_capital_raises` tool with no date filter (its default is the last 14 days). Pass `user_question="weekly capital raises digest (scheduled task)"` on every call — usage auditing only, no effect on results. **Do not use `list_capital_raises`** — that tool requires a specific ticker and cannot return a market-wide digest; `screen_capital_raises` is the market-wide tool built for this. If broker detail would help, follow up with `list_deal_brokers` per deal_id — do not walk get_peers x list_capital_raises x list_deal_brokers company-by-company either — that pattern is for peer-broker shortlists, not this general digest.

Post a concise digest in this chat session:
- Headline: `summary.deal_count` raises in the window, `summary.sum_proceeds` total confirmed capital raised, and note if `summary.truncated` is true
- A short markdown table from `ranked`: Ticker, Company, Proceeds (A$M from `proceeds` — confirmed only), Discount (if available), DAP (if available). Discount/DAP cells = plain numbers only (e.g. `-8.63`). Never HTML / `<span>` / `style=` — MCP chat tables do not render HTML. Do not cite proposed proceeds or issue price
- Top 2-3 sectors from `summary.sector_breakdown` if there's a notable concentration
- One or two sentences on any standout deal (unusual discount / timing)

Keep it scannable — this is a weekly pulse-check, not deal analysis.

## Sources
After the digest and immediately before the required closing, add a short **Sources — Investair** block: "Capital raises data (from ASX Appendix 3B/2A filings), raises from [from date] to [to date]", plus one line per broker lookup or announcement you relied on (announcement date and title). Take dates from the tool response, never from memory. Plain business names only — no internal table, column or tool names. Never invent a link. Where the response carries a filing (date and title) for a deal, put a Unicode superscript number (¹ ² ³) after that deal's proceeds and list the filings, numbered in order of first appearance, under "Announcements" at the top of the Sources block; when no filing detail is returned for a deal, point it at a numbered "Capital raises data" entry instead, which the headline totals also cite. End each filing entry with a link to that ticker's ASX announcements page, `[ASX announcements: TICKER](https://www.asx.com.au/markets/company/TICKER)` — the only link you may construct; never invent a document link. Never use `<sup>` or other markup in chat. Never print feed IDs or other internal identifiers — identify a filing by ticker, date and title.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words.
