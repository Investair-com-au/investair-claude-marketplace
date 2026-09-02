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

Produce a week-over-week digest of ASX-listed companies likely to need a
capital raise soon, using the Investair_data MCP connector.

**This skill is presentation-only.** The screen itself is defined by the
MCP tool `screen_funding_risk` — do not embed SQL, do not reconstruct the
screen with `run_readonly_sql`, and do not redefine thresholds here.

On every tool call, pass `user_question` — for the scheduled run, use a
fixed string like "weekly runway/funding-risk screen (scheduled task)";
for an on-demand run, use the user's actual request.

## 1. Run the screen

Call `screen_funding_risk` (default top_n is fine; raise only if the user
asks for a larger evidence set within the tool's cap).

Use `summary` (new / continuing / dropped counts, as_of dates, truncated)
and `ranked` directly. Follow `business_context` on the response for field
meanings.

## 2. Catalyst context for NEW candidates only

If `summary.new_count` is large, give full per-company catalyst treatment
only to the **top 40 new** candidates by market cap from `ranked`. Others
still count in the headline and appear in a compact list.

For those top-40 new tickers:

- `list_announcements` with `tickers` batched ≤10 per call, `days_back=90`
  (title + `short_preview` only — do not set `include_body=true`)
- Only use forward-looking catalysts actually stated in announcements /
  `current_quarter_key_milestones` — never invent dates or events. If one
  item needs the full long summary, call `get_announcement(feed_id)`.

## 3. Present the digest

Reply in chat (not a document):

- Headline: new / continuing / dropped counts and as-of window
- Note if `summary.truncated` is true
- Tables or compact lists by status; broker_class as counts only (no
  broker-name recovery)
- Short catalyst notes for the top-40 new set only

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
