---
name: log-feedback
description: >
  Log user feedback on Investair research to Investair. Use when the user
  runs /log-feedback, says "send feedback", "log this feedback", or wants
  to report accuracy / content / format issues.
metadata:
  version: "0.1.0"
---

# Log Investair feedback

Capture the user's feedback and send it through the Investair MCP connector. Do not invent a parallel channel.

If they invoked the skill with no text, ask once for short feedback. Confirm that it was recorded. Do not append the usual end-of-research feedback line after this skill.
