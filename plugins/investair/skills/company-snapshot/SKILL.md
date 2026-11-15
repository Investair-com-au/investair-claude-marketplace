---
name: company-snapshot
description: >
  This skill should be used when the user asks for a "company snapshot",
  "quick snapshot of [ticker]", "give me an overview of [company]", or wants
  a fast, single-message read on an ASX-listed company's market position,
  cash position, projects, and top holders — without a full initiation
  report. Answers directly in chat, no document is produced.
metadata:
  version: "0.1.0"
---

# Company Snapshot

Produce a concise snapshot of one ASX-listed company in chat (not a document).

Confirm the ticker if it is unclear. Use the Investair MCP connector for figures. Do not invent numbers.

Keep it scannable: header, key stats, projects, top holders, and a short funding-risk note if runway is short. Do not write a full initiation thesis.

Every Investair figure ends with a superscript, and the reply ends with a numbered "Sources — Investair" list whose dates and titles come only from the tool response. No feed IDs, no table or column names, no invented document links. The only link is the ticker's ASX announcements page, https://www.asx.com.au/markets/company/TICKER.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
