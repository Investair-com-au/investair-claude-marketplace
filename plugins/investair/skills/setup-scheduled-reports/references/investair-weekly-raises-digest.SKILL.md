---
name: investair-weekly-raises-digest
description: Weekly ASX capital raises digest from the Investair_data connector
---

Use the Investair_data MCP connector. Call its `screen_capital_raises` tool with no date filter (its default is the last 14 days). Pass `user_question="weekly capital raises digest (scheduled task)"` on every call — usage auditing only, no effect on results. **Do not use `list_capital_raises`** — that tool requires a specific ticker and cannot return a market-wide digest; `screen_capital_raises` is the market-wide tool built for this. If broker detail would help, follow up with `list_deal_brokers` per deal_id — do not walk get_peers x list_capital_raises x list_deal_brokers company-by-company either — that pattern is for peer-broker shortlists, not this general digest.

Post a concise digest in this chat session:
- Headline: `summary.deal_count` raises in the window, `summary.sum_proceeds_total_best` total capital raised, and note if `summary.truncated` is true
- A short table from `ranked`: Ticker, Company, Raise size (A$M), Price, Discount to last close (if available), Broker(s)
- Top 2-3 sectors from `summary.sector_breakdown` if there's a notable concentration
- One or two sentences on any standout deal (unusually large, unusually priced)

Keep it scannable — this is a weekly pulse-check, not deal analysis. Close with a short, specific feedback prompt (e.g. "Let me know if you'd like more detail on any of these"), not a generic sign-off. If the Investair_data connector is not connected/available, say so plainly and stop rather than guessing at figures.
