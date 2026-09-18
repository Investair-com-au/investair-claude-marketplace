---
name: investor-targeting
description: >
  This skill should be used when the user asks for an "investor targeting
  list", "institutional targeting list for [ticker]", "who should we target
  for [company]'s raise", or a shortlist of institutional investors likely
  to be interested in a company. Answers in chat with a ranked shortlist.
metadata:
  version: "0.1.0"
---

# Institutional Investor Targeting List

Build a shortlist of institutions that may be relevant for a company's raise, from substantial-holder disclosures across its peer group.

Confirm the ticker. Use the Investair MCP connector. Say clearly that this is a statutory-disclosure proxy, not a complete fund register.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
