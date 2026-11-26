# New and reworked scheduled dashboards

Both are scheduled tasks built from `task-prompt-template.md`. Both use the confirmed house-stock or sector list from setup, embedded in the prompt. To change the list, the user asks Claude; Claude re-runs the code checks and rewrites the prompt.

## Market Morning Report (dashboard 2)

Replaces the old ASX-wide morning brief. It is about the user's house stocks and their peers, with a short market backdrop.

- **Cadence / format:** weekdays 7:00am (user's timezone) · chat digest, plus an email-ready Markdown file `<firm>-morning-report-<YYYY-MM-DD>.md` when the user wants to forward it. Always publishes; it is a report, not an alert.
- **Universe:** the confirmed house list **plus peers**. Peers come from `get_peers` for each house stock (union, de-duplicated, capped at about 40). Peer-only names are tagged "peer" in tables. If the user chose a sector with no house list, the sector is the house list.
- **Investair data (previous trading day unless stated):**
  - price, volume and market cap from `ASX_Market.ASX_DailyMarketInformation`: close, day change, 7-day change from history, the day's volume against its norm; state the as-of date;
  - `list_announcements` since the previous report (up to 10 tickers per call, price-sensitive flagged, never `include_body`);
  - capital raises in the universe since the previous report (`screen_capital_raises` or `list_capital_raises`), with discount and size as a percentage of market cap;
  - new substantial holder notices for the universe (batch tool; prime-broker or lending notices flagged separately);
  - funding-risk changes for the universe (runway newly under 2 quarters), on Mondays only;
  - listings, delistings and renames that touch the universe.
- **Overnight and macro (3 web searches, reputable outlets):** US and European close; gold, copper, iron ore, oil and lithium moves relevant to the list; AUD; any overnight coverage of a house stock.
- **Structure (answer first):**
  1. Three-line "what matters this morning".
  2. House stocks: one table, ticker, price, day and 7-day change, volume vs norm, runway in quarters, a one-phrase flag.
  3. News and announcements on house stocks, price-sensitive first; name house stocks with no news.
  4. Peers: only peers with news, a raise, a large move or a register change; one line each with why it matters for a house stock.
  5. Overnight markets (short table) and what to watch today.
- **Walk-through scenario:** see `walkthroughs.md`.

## Daily flash and weekly newsletter (dashboard 3)

One dashboard, two outputs, for a sector, sub-industry or peer group (confirmed in setup; for a sector the group is built as in `report-catalogue.md` entry 8).

**Daily flash** (weekdays 7:30am) · chat · an alert, so it **stays silent** unless something clears the bar.
- Bar: a price-sensitive announcement on any member; a raise or a filed Appendix 3B or cleansing notice; a new or ceasing substantial holder, or a 1%+ move that is not prime-broker or index noise; a member's runway newly under 2 quarters; a one-day move of 10%+ on unusual volume; or an announcement with read-across to the group (a large contract, M&A, a benchmark price, a regulatory decision).
- Content: an answer-first headline naming the trigger, then one short block per trigger: what happened, why it matters for the group, which members are most exposed. Cite the announcement. Several routine items together still do not make a flash.

**Weekly newsletter** (Monday 7:00am) · one plain Markdown file the client can lightly edit and paste into an email (headings, bullets, simple pipe tables; no HTML, nested formatting, footnotes or callouts), saved as `<group>-weekly-<YYYY-MM-DD>.md`, never a hosted page. Build it exactly as **`report-catalogue.md` entry 3** (data pulls, structure, 7-day and 91-day changes, placements, substantial holders, disclaimer, "Powered by Investair" line), and add a short "This week's flashes" section listing the flashes sent that week, if any. Feedback line in the chat reply only, never in the file.

Notify on the flash only when it fires; the newsletter always publishes and notifies.
