---
name: investair-weekly-runway-screen
description: Weekly Investair funding-risk / raise-radar digest (scheduled).
---

# Weekly runway screen (scheduled)

Call the Investair MCP tool `screen_funding_risk` with
`user_question="weekly runway/funding-risk screen (scheduled task)"`.

Present the digest in chat using `summary` + `ranked` (and optional
`list_announcements` for top-40 new tickers only). Do **not** embed SQL or
call `run_readonly_sql` to rebuild this screen — the MCP tool owns it.

Follow the `weekly-runway-screen` skill for presentation detail, including
its numbered **Sources** block (the screen entry with its as-of dates, and
every announcement relied on, each tied to its figures by a Unicode
superscript number and linked to that ticker's ASX announcements page)
immediately before the required closing.
Never print feed IDs or other internal identifiers — identify an
announcement by ticker, date and title.
