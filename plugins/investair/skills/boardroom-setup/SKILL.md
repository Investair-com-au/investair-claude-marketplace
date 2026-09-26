---
name: boardroom-setup
description: >
  This skill should be used when the user asks to "set up the boardroom",
  "set up Investair Boardroom for [ticker]", "create our Investair dashboard",
  "build the board dashboard for [company]", or wants the Investair Boardroom
  artifact — the live, company-specific interface for a listed company's CEO,
  CFO, Chair and Company Secretary — created for an ASX-listed company. Asks
  for the ticker, confirms the peer group, and publishes one artifact with the
  company permanently embedded (no ticker input or company switcher in the
  page). Optionally seeds the first peer-messaging analysis.
metadata:
  version: "0.1.0"
---

# Investair Boardroom setup

Publishes the **Investair Boardroom**: a single HTML artifact that becomes the
day-to-day Investair interface for one ASX-listed company's CEO, CFO, Chair and
Company Secretary. The page reads live Investair data through the viewer's own
Investair connector every time it opens.

The template is `assets/boardroom.html` in this skill's directory. Do not
redesign it or rewrite its code during setup. Your job is to fill in the
configuration, publish it, and optionally seed the analysis.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words (usage auditing only). Never omit or
paraphrase it.

## What the page contains (for explaining it to the user)

- **Overview**: headline tiles (3-month share price vs peer median, trading
  value vs six months ago, cash runway, substantial holder notices) and "Since
  you last looked", a feed of holder notices, raises, price-sensitive
  announcements and large price moves since the viewer's previous visit.
- **Market**: share price rebased to 100 against every peer and the peer
  median (3/6/12 months, announcement markers), returns table, and market
  interest: value traded per day and turnover (value ÷ market cap) now vs six
  and twelve months ago, ranked against peers.
- **Register**: the company's substantial holders, holders substantial in
  peers but not on the register (approach list), who is building or reducing
  positions across the sub-industry, and the full notice log with
  prime-broker flags.
- **Capital**: a six-months-back, six-months-forward funding timeline (raises
  sourced from the deal book, cash-out and raise windows calculated), funding
  position (cash, burn, runway, LR 7.1 headroom, last raise), and broker
  profiles with a transparent fit score.
- **Peers & messaging**: themes, business-quality signals and points for the
  board to consider, written by Claude from announcement summaries, with every
  point citing its announcements.
- **Ask Investair**: free-form questions answered live with Investair tools.
- **Board summary**: downloads a self-contained HTML summary for the board pack.

## 1. Get and confirm the ticker

Ask for the ASX code if the user has not given one. Call `resolve_company`
when the code or name is uncertain, renamed or possibly delisted, and confirm
the match with the user. Never substitute a suggestion silently.

Tell the user once, plainly: **the company is fixed when the page is
published.** The page has no ticker box or company switcher. A different
company means running this setup again, which publishes a separate artifact.

## 2. Confirm the peer group

Call `get_peers` (target ticker, `top_n` 10). Follow `tool_response.peer_source`
and `business_context` to explain in one or two plain sentences why these
companies were chosen (shared commodity, stage, geography for a similarity
set; industry and stage for a rules-based set). Never show internal field,
table or engine names.

Show the list and ask the user to confirm, remove or add peers. Keep 6 to 15
peers: fewer makes medians noisy, and more slows the page. If
`peer_source` is `none`, ask the user for the peers directly.

Note for the user: the confirmed peers are the page's starting set. Editors
and contributors can adjust peers inside the page later (saved for everyone),
and "Reset to original" returns to this set. The company itself never changes.

## 3. Find the Investair connector's display name

The page calls Investair through the viewer's claude.ai connector, addressed
by its **display name**. Load the `artifact-capabilities` skill and read the
"Your connectors this session" list. Use the display name of the Investair
connector exactly as written there (for example `Investair_data`). If there is
no Investair connector in that list, stop and tell the user to add the
Investair connector in claude.ai Settings → Connectors first.

Everyone who opens the page needs the Investair connector with that same
display name on their own claude.ai account.

## 4. Build the page from the template

Copy `assets/boardroom.html` to your scratchpad as `<TICKER>-boardroom.html`
and change exactly two things with a script (not by hand-editing the code):

1. Replace the JSON between the markers `/*__BOARDROOM_CONFIG__*/` and
   `/*__END_CONFIG__*/` (keep both markers) with:

   ```json
   {"ticker": "AAR",
    "company": "Astral Resources NL",
    "connector": "<display name from step 3>",
    "peers": ["BM1", "HRN", "PRX"],
    "peerNote": "Original set: <one sentence on why these peers>",
    "setupDate": "<today, YYYY-MM-DD>"}
   ```

   Escape `</` as `<\/` in the JSON so it cannot close the script tag.
2. Replace `<title>Investair Boardroom</title>` with `<title><TICKER> Boardroom</title>`.

Example:

```bash
python3 - "$SCRATCH/AAR-boardroom.html" <<'EOF'
import json, sys
t = open("<skill dir>/assets/boardroom.html").read()
cfg = {...}
s, e = "/*__BOARDROOM_CONFIG__*/", "/*__END_CONFIG__*/"
i = t.index(s) + len(s); j = t.index(e)
t = t[:i] + json.dumps(cfg).replace("</", "<\\/") + t[j:]
t = t.replace("<title>Investair Boardroom</title>", f"<title>{cfg['ticker']} Boardroom</title>", 1)
open(sys.argv[1], "w").write(t)
EOF
```

## 5. Publish

Publish with the Artifact tool:

- `file_path`: the built file
- `icon`: `chart`
- `description`: `Investair Boardroom for <Company> (ASX:<TICKER>): live peer share price, trading interest, substantial holders, funding timeline, brokers and peer messaging.`
- `capabilities` (use the connector display name from step 3):

```json
{"mcp": {"servers": [{"server": "<display name>", "tools": [
   "run_readonly_sql", "get_substantial_holders_batch", "get_cashflow_snapshots",
   "get_placement_capacity", "list_capital_raises", "screen_peer_brokers",
   "list_announcements"]}]},
 "db": {}, "sample": {}, "downloads": true}
```

Do not add tools the page does not call. The artifact is private to the user
until they share it from the page's Share menu. Declaring connectors means the
page cannot be shared by public link, only with named people in the
organisation.

## 6. Seed the peer-messaging analysis (recommended)

Seeding gives the Peers & messaging tab content on first open, so executives
never face an empty tab. Skip it only if the user declines.

1. Call `list_announcements` for the company and peers (max 10 tickers per
   call, `days_back` 120, `limit` 150). Drop administrative items (substantial
   holder notices, cleansing notices, Appendix 2A/3B/3Y, quotation
   applications, director changes, trading halts). Keep at most 12 per
   company, price-sensitive first. Number the kept items 0..n-1.
2. Write the analysis yourself from those items only, citing item numbers.
   Every theme and recommendation needs at least one citation. Recommendations
   start with "Consider…" and are observations for board discussion, not
   investment advice. Use plain Australian English.
3. Write it with `ArtifactData` (`set`, collection `narrative`, doc `latest`)
   on the published URL, in exactly this shape:

```json
{"generatedAt": 1790000000000,
 "peers": ["BM1", "HRN"],
 "evidence": [{"t": "AAR", "d": "2026-09-10", "title": "Mandilla DFS update"}],
 "data": {
   "summary": "2-3 sentences on what the peer group is telling shareholders",
   "company_position": "1-2 sentences on how <TICKER>'s messaging compares",
   "themes": [{"theme": "Short name", "detail": "1-2 sentences", "companies": ["BM1"], "evidence": [0, 3]}],
   "quality": [{"ticker": "AAR", "strengths": "…", "concerns": "…", "evidence": [0]}],
   "recommendations": [{"point": "Consider …", "rationale": "…", "evidence": [2]}]}}
```

`generatedAt` is epoch milliseconds. `evidence` indices point into the
`evidence` array. Give 3-6 themes, one quality row per company with
announcements (including the company), and 3-5 recommendations.

4. Read it back once with `ArtifactData` `get` to confirm it saved.

In the page, anyone with contributor access can press **Refresh analysis** to
regenerate it with Claude. The new version is saved for everyone.

## 7. Hand over

Reply briefly with:

- the link, and that it is private until shared from the page's Share menu
  with the CEO, CFO, Chair and Company Secretary, each of whom needs the
  Investair connector
- that the company is fixed; another company means running setup again
- that peers can be adjusted in the page by contributors
- that the first open asks each person to allow the Investair connector (and
  Claude, for the analysis and Ask tab) for this page
- one line on what you checked (for example, the analysis saved and read back)

Offer to pin the artifact to their sidebar. Offer to schedule a weekly refresh
of the seeded analysis (repeat step 6 on the same URL) using the `schedule`
skill.
