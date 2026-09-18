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

Produce a concise weekly digest of recent ASX capital raises in chat.

Use the Investair MCP connector. This skill is presentation-only. Keep it a pulse-check, not deal-by-deal analysis.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
