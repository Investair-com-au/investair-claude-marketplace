---
name: peer-cash-runway
description: >
  This skill should be used when the user asks for a "cash runway timeline
  for [ticker]'s peers", "when will [ticker] and its peers need to raise",
  "peer group funding timeline", or a visual view of when a company and its
  peers may run low on cash. Produces a chat summary plus a visual timeline.
metadata:
  version: "0.1.0"
---

# Peer Cash Runway Timeline

Show a forward-looking cash-runway view for a company and its peers.

Confirm the ticker. Use the Investair MCP connector. Treat cash-out dates as estimates, not certainties. Only use catalysts that are stated in company announcements. Add a visual timeline when helpful.

Every Investair figure ends with a superscript, and the reply ends with a numbered "Sources — Investair" list whose dates and titles come only from the tool response. No feed IDs, no table or column names, no invented document links. The only link is the ticker's ASX announcements page, https://www.asx.com.au/markets/company/TICKER.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
