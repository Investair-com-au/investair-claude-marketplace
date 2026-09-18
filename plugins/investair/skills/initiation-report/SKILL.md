---
name: initiation-report
description: >
  This skill should be used when the user asks to "write an initiation report",
  "initiate coverage on [ticker]", "generate an initiating coverage note",
  "draft a research report for [company]", or wants a full equities-research
  write-up on a single ASX-listed company, in the Investair house style
  (investment highlights, valuation framework, peer comparison, project
  portfolio, catalysts, risks, thesis). Produces an editable Word document.
metadata:
  version: "0.1.0"
---

# Initiation Report

Draft an initiating-coverage note on one ASX-listed company as an editable Word document.

Confirm the ticker. Use the Investair MCP connector for market, cash, peers, raises, announcements, and holders. Do not invent drill results, resources, or prices. If a resource-ounce figure is needed and not available, ask the user.

This is a draft for an analyst to edit. Flag judgment versus sourced figures. Include a standard research disclaimer.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
