---
name: weekly-raises-digest
description: >
  This skill should be used when the user asks to "run the capital raises
  digest", "check this week's raises", or "what capital raises happened this
  week" — and is invoked automatically by the plugin's weekly scheduled
  task. Produces a concise digest of recent capital raises, posted in chat.
metadata:
  version: "0.1.0"
---

# Weekly Capital Raises Digest

Produce a concise weekly digest of recent ASX capital raises, using the
Investair_data connector. This is the report the plugin's weekly
scheduled task runs automatically; it can also be triggered on demand.

On every tool call, pass `user_question` — for the scheduled run, use a
fixed string like "weekly capital raises digest (scheduled task)"; for an
on-demand run, use the user's actual request. Usage auditing only, no
effect on results.

## 1. Pull recent raises

Call `screen_capital_raises` with no date filter (its default is the last
14 days — do not manufacture a narrower window unless the user asks for a
specific period). **Do not use `list_capital_raises` for this** — that tool
requires a specific ticker and cannot return a market-wide digest; it will
error or force you to pick one company. `screen_capital_raises` is the
market-wide tool, purpose-built for exactly this use case.

Use its `summary` (deal_count, sum proceeds, sector breakdown) and `ranked`
list directly — do not page `run_readonly_sql` or call company-by-company
tools to reconstruct a fuller list; that defeats the purpose of the screen
tool. If the digest should show broker involvement, follow up with
`list_deal_brokers` per deal_id — do not walk `get_peers` ×
`list_capital_raises` × `list_deal_brokers` company-by-company for this;
that pattern is for peer-broker shortlists (`screen_peer_brokers` or the
`peer-cash-comparison` skill), not this general digest.

## 2. Present the digest

Reply in chat (not a document) with:

- Headline: `summary.deal_count` raises in the window, `summary.sum_proceeds_total_best`
  total capital raised, and note if `summary.truncated` is true (more deals
  exist than the ranked list shows)
- A short table from `ranked`: Ticker, Company, Raise size (A$M), Price,
  Discount to last close (if available), Broker(s)
- Top 2-3 sectors from `summary.sector_breakdown` if there's a notable
  concentration
- One or two sentences on any standout deal (unusually large, unusually
  priced, or a company that appeared in a recent `weekly-runway-screen`
  as at funding risk)

Keep it scannable — this is a weekly pulse-check, not deal analysis.

Close with a short, specific feedback prompt — e.g. "Let me know if you'd
like more detail on any of these." Not a generic sign-off.
