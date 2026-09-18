---
name: sector-report
description: >
  This skill should be used when the user asks for a "sector report", "sector
  overview", "give me a report on [commodity/geography] explorers", or wants
  a research note covering a basket of ASX-listed companies rather than a
  single company. Produces an editable Word document.
metadata:
  version: "0.1.0"
---

# Sector Report

Draft a multi-company sector research note as an editable Word document.

Confirm how the universe is defined (ticker list, peers of one name, or commodity/geography). Use the Investair MCP connector. Show the ticker list before pulling a large set.

Include a standard research disclaimer. This is a draft for an analyst to edit.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
