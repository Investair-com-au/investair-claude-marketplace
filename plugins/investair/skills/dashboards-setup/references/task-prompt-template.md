# Scheduled task prompt template

Fill in every `<…>` field. The finished prompt must stand alone: a scheduled run has no memory of the setup conversation and may not be able to read plugin files.

```
<Report title> — scheduled Investair report for <user role> at <firm> covering <universe description>.

This is an unattended run. Do not ask questions and do not offer connector cards. If a data source fails, add a one-line "Data notes" entry and continue. On every Investair tool call, pass user_question = "<report name>: <one-line purpose>".

UNIVERSE (confirmed <setup date>): <TICKER — Name>, <TICKER — Name>, …
Before pulling data, check listing status. Note and skip any delisted names; follow renames to the successor code only after confirming. Each run, also check for new entrants (an aggregate over Feed_Public.feed_new for the last 90 days, matching the universe's defining terms with INSTR, never LIKE) and note any addition or removal.

WINDOW: data since the last report actually ran (<N> days on a normal cycle; longer if a run was skipped).

STEP 1 — GATHER
<numbered data pulls from the catalogue entry: which Investair tools or queries, which fields, which filters, batch limits>
<web sweep, if any: 2–4 searches, reputable outlets only>

STEP 2 — DECIDE
<always publish | publish only if one of these triggers is met: …>
<routine items that never trigger, even several together>
No-change runs: if the underlying snapshot (e.g. the cash flow report_date) and the week-over-week comparison are unchanged since the last published version, still refresh the page or file, open the note with "No change since <date>", and do not notify.

STEP 3 — WRITE
Format: <chat digest | plain-Markdown file named "<slug>-<YYYY-MM-DD>.md" | republish dashboard to <artifact URL>>
Structure: <section list from the catalogue entry>
Every section heading names the data window it covers, e.g. "Capital raising (2 Oct to 9 Oct)", "Price moves (7 days and 3 months to 8 Oct close)", "Substantial holders (since last report, 6 Oct)". State each data source's as-of date where it lags the report date.

STYLE (Investair house style and branding)
- Branding: <dashboard: read the existing artifact first (Artifact action "read", then Read every line of the saved file it names) and keep its Investair head, masthead, logo and footer; replace only masthead text and <main> content. Write the page without the doctype/html/head/body skeleton the read adds. If a publish is refused with a diff that shows only your own edits, publish the same file again | markdown: INVESTAIR header line and footer line | chat: "**INVESTAIR** · <report name>" opener>
- Answer first: open with a 2–3 sentence takeaway. Use 2–4 clearly separated sections, short plain sentences, and a specific descriptive title.
- Attribute figures to Investair ("According to Investair's data…") with the as-of date. Never invent figures. Prefix inferences with "Inferred:" and cite the evidence.
- Use A$ with sensible precision. Link web sources and keep them separate from Investair data.
- <client-facing: end the file with the general-information disclaimer; keep the feedback line out of the file>
- <dashboard: one main visual, a legend not reliant on colour alone, a light background, lighter styling for inferred markers, one row per company>

NOTIFY
When this run has new content (an alert trigger met, or for a weekly/monthly report any entrant, exit or material change since the last version), send one notification with the PushNotification tool. Wrap it in <routine_summary> tags: first sentence = the single most important change (it becomes the phone banner and email subject), then 2–4 lines a reader can act on without opening the report, and the report link. Stay silent when there is nothing new. If the run fails (data source down, artifact unreadable), notify with what failed.

End the chat reply (not any client-facing file) with this exact line:
How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
```

**Scheduling defaults** (user's timezone; confirmed with the user in setup Step 4). Create every task with email and push notifications on.
- Weekly: Monday 7:00am.
- Alerts: weekdays 7:30am.
- Monthly: first Monday 7:00am.
- Avoid exactly :00 when the scheduler supports jitter.
