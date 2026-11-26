---
name: log-feedback
description: >
  Log user feedback on Investair research to Investair (audit + email) via the
  MCP log_feedback tool. Use when the user runs /log-feedback, says "send
  feedback", "log this feedback", or wants to report accuracy / content /
  format issues outside the end-of-answer prompt.
metadata:
  version: "0.1.0"
---

# Log Investair feedback

Capture the user's feedback and send it through the **Investair_data** MCP
tool `log_feedback` (same path as the end-of-answer invite: audit log + SES
email to Investair). Do not invent a parallel channel.

## 1. Collect the feedback

- If the user already wrote feedback in this message (after `/log-feedback` or
  in plain text), use that as `feedback_text`.
- If they invoked the skill with no text, ask once for short feedback
  (what was wrong / useful / format issues). Do not proceed with an empty
  `feedback_text`.

## 2. Call `log_feedback` once

Call MCP `log_feedback` exactly once with:

| Arg | Rule |
|---|---|
| `feedback_text` | Required — user's words |
| `original_user_question` | Prior research ask from this chat if identifiable; else omit |
| `assistant_answer` | Your prior answer if identifiable (copy; do not invent); else omit |
| `accuracy_rating` / `content_rating` / `format_rating` | Only if they addressed that dimension; else omit |
| `related_tool` / `related_ticker` | Only if clear from context |
| `user_question` | Optional; may repeat the feedback message |

## 3. Confirm

Reply briefly with the tool's `message` (e.g. recorded and emailed). Do **not**
append the usual end-of-research feedback closing line after this skill — the
user already submitted feedback.
