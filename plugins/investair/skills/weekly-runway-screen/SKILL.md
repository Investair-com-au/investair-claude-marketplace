---
name: weekly-runway-screen
description: >
  This skill should be used when the user asks to "run the runway screen",
  "run the cash runway report", "check funding risk this week", or "run
  the raise radar" — and is invoked automatically by the plugin's weekly
  scheduled task. Produces a week-over-week funding-risk digest posted in chat.
metadata:
  version: "0.3.0"
---

# Weekly Cash Runway / Funding Risk Screen ("Raise Radar")

Produce a week-over-week funding-risk digest in chat.

Use the Investair MCP connector. This skill is presentation-only. Keep it scannable.

Every Investair figure ends with a superscript, and the reply ends with a numbered "Sources — Investair" list whose dates and titles come only from the tool response. No feed IDs, no table or column names, no invented document links. The only link is the ticker's ASX announcements page, https://www.asx.com.au/markets/company/TICKER.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
