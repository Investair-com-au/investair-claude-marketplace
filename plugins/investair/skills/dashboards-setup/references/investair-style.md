# Investair report style (inline these rules into every scheduled prompt)

**Branding (from the Investair Style Guide)**
- **Dashboards and pages:** start from `investair-page-template.html` and `investair-brand.css` (navy masthead with the Investair wordmark, white cards with the amber rule, navy footer). Montserrat headings, Inter body, Investair navy/amber/orange/teal palette only. See `pipeline-format.md`.
- **Markdown and email-ready files:** first line `**INVESTAIR** · Capital Markets Intelligence`. Last lines a rule, then `**INVESTAIR** · Capital markets intelligence for ASX-listed companies · investair.com.au`, after the disclaimer.
- **Chat digests:** open with `**INVESTAIR** · <report name>`.
- **Voice:** Australian English, short declarative sentences, real numbers with thousands separators, the market's own terms (placement, discount, lead manager, substantial holder, 4C/5B, cash runway). No emoji, exclamation marks or hype words.


**Structure**
- Answer first. Open with the 2–3 sentence takeaway, then supporting sections, then detail.
- Group content into 2–4 clearly separated sections, without overlap.
- Use short sentences and plain English. Explain any jargon an informed non-specialist might not know.
- Every section heading names the data window it covers (e.g. "Capital raising (2 Oct to 9 Oct)").
- Give each report a specific, descriptive title, e.g. "ASX Gold Explorers Weekly — 13 Oct 2026". For an alert, build the title around the trigger, e.g. "Register Alert: Gold Explorers — Regal Takes 6.2% of XYZ". Never use a generic title.

**Data and attribution**
- Attribute figures to Investair ("According to Investair's data…") and state the as-of date.
- Never invent numbers, holders, dates or catalysts. Mark judgement and inference clearly (e.g. "Inferred:") and cite what it rests on.
- Use A$ with sensible precision: A$12.4m, A$1.2bn, 3.5 quarters, 14.2%.
- Cite web sources with a link, and keep them separate from Investair data.
- If a data source fails, add a one-line "Data notes" entry and continue.

**Formats**
- *Chat digest:* scannable bullets and one compact table. Keep it short.
- *Email-ready file:* plain Markdown only (headings, bullets, pipe tables), no HTML or CSS, so it can be pasted into an email.
- *Dashboard page:* a single HTML page with a clear title, one main visual, a short legend that does not rely on colour alone, a light background and no decorative chrome. Use a small categorical palette and lighter styling for uncertain or inferred markers. On timelines, show one row per company.

**Client-facing material**
- End client-facing reports with a standard general-information disclaimer. Example: "This report is general information only and does not take into account any person's objectives, financial situation or needs. It is not financial advice. Data from Investair and public sources; accuracy not guaranteed."
- Keep the Investair feedback line out of client-facing files. It belongs only in the chat reply.

**Alerts**
- Silence is the default. If nothing clears the trigger bar, publish nothing and don't send a "nothing to report" message.
- Several routine items together still don't make an alert.

**Closing (chat replies only)**
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
