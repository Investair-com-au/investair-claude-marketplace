---
name: peer-cash-comparison
description: >
  This skill should be used when the user asks to "find peers for [ticker]",
  "generate a peer group for [company]", "compare [ticker] to its peers", or
  wants comparative metrics (market cap, cash, EV, burn, runway) across a
  company's peer set. Answers in chat with a comparison table; can build a
  chart on request.
metadata:
  version: "0.2.0"
---

# Peer Comparison

Compare one ASX-listed company with its peer set in chat.

Confirm the ticker. Use the Investair MCP connector for the peer set and comparative figures. Present a short why-this-set note, then a comparison table. Invite a chart only if the user asks.

Every Investair figure ends with a superscript, and the reply ends with a numbered "Sources — Investair" list whose dates and titles come only from the tool response. No feed IDs, no table or column names, no invented document links. The only link is the ticker's ASX announcements page, https://www.asx.com.au/markets/company/TICKER.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
