---
name: peer-catalyst-calendar
description: >
  This skill should be used when the user asks for a "peer catalyst calendar",
  "catalyst timeline for [ticker]'s peers", "cash runway timeline for [ticker]'s
  peers", "when will [ticker] and its peers need to raise", "peer group funding
  timeline", "raising window timeline", or wants a visual, forward-looking view
  of when a company and its peer group are likely to run low on cash and what
  near-term catalysts (drilling results, studies, corporate actions) might
  precede or support a capital raise before then. Produces a chat summary plus
  a visual calendar timeline artifact (one row per company, one column per
  month). Every date on the timeline is either a calculated figure or sourced
  from an actual announcement — never an invented catalyst or date.
  For a simple cash-out table without the visual artifact, use peer-cash-runway instead.
metadata:
  version: "0.2.0"
---

# Peer Catalyst Calendar

Build a forward-looking cash runway timeline across a company and its peer
group using the Investair_data connector: when each company is projected
to run low on cash, and what stated near-term catalysts might precede or
support a raise before then.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the ticker and window

Confirm the target ticker if ambiguous. Default the forward window to 6
months from today; use a different window only if the user names one.

## 2. Pull the peer group and cash data

- `get_peers` (target ticker) — MCP owns the cascade. Check
  `tool_response.peer_source` and follow `business_context` for how to
  narrate the set in plain business language. Do not redefine peer tiers,
  tables, or fallbacks in this skill. If the set looks wrong, note that
  peer matching is still being improved and invite `log_feedback`.

- `get_cashflow_snapshots` — ONE batch call for the target ticker plus
  every peer ticker (not a loop of `get_cashflow_snapshot` per company).
  Gives `report_date`, `cash_today_aud`, `adjusted_cash_today_aud`,
  `daily_cash_flow_aud`, and `adjusted_estimated_quarters_funding` per
  company. A company with `found: false` has no current cashflow row —
  note it as excluded from the timeline rather than guessing its runway.

## 3. Check 7.1 placement capacity

After getting the ticker list from step 2, run two `run_readonly_sql`
queries against `Placement.deals_daily`. Verify exact column names via
`describe_table('Placement.deals_daily')` if needed — the 7.1 flag column
may be named `rule_7_1`, `exceeds_7_1`, or similar; the issuer ticker
field may be `issuer_asx_code` or `asx_code`.

**7.1 limit reached:**
```sql
SELECT [ticker_col] AS ticker, MAX(deal_date) AS last_7_1_raise
FROM Placement.deals_daily
WHERE [7_1_column] = 1
  AND deal_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  AND [ticker_col] IN ([comma-separated tickers])
GROUP BY [ticker_col]
```

**Placement-active** (2+ placements in 12 months, no 7.1 flag — may be
approaching the limit):
```sql
SELECT [ticker_col] AS ticker, COUNT(*) AS placements_12m
FROM Placement.deals_daily
WHERE deal_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  AND [ticker_col] IN ([comma-separated tickers])
GROUP BY [ticker_col]
HAVING COUNT(*) >= 2
```

If either query fails, skip the 7.1 flag and note placement capacity data
was unavailable.

## 4. Compute a cash-out estimate per company

For each company with cash data: estimated cash-out month ≈
`report_date` + (`adjusted_estimated_quarters_funding` × ~91 days),
rounded to the nearest month. This assumes the current burn rate
(`daily_cash_flow_aud`) continues unchanged — state that assumption
whenever a cash-out estimate is shown; it is not a guarantee, and a raise,
cost reduction, or asset sale changes it.

## 4. Pull near-term catalysts from actual announcements

- `list_announcements` with `tickers` set to the target + peer list,
  `days_back=180`, `limit` sized to the group (this tool already accepts
  up to 10 tickers per call — for a peer group larger than 9, split into
  consecutive batches of up to 10 tickers and merge the results; it is
  NOT a per-company loop like the old `get_market_snapshot` pattern).
- Scan `title`/`short_preview` for explicit forward-looking language only
  — e.g. "expected", "targeting", "planned for", "due in", "scheduled",
  "on track for" — naming a study (PFS/DFS/scoping/MRE update), drill
  programme, corporate action, or asset sale with an approximate
  timeframe. **Only use a catalyst and its timing if the announcement
  text actually states or clearly implies both** — do not infer a
  catalyst that isn't named, and do not invent a date that isn't stated.
  Do **not** set `include_body=true` on this multi-ticker screen. If one
  announcement needs the full long summary, call `get_announcement`
  with that row's `feed_id` after listing.
- If a company has no forward-looking announcement in the window, leave
  its row without a catalyst marker rather than guessing one. Cite the
  announcement date next to any catalyst you do use.

## 5. Build the raise-window estimate — label it as an estimate, always

For each company, in one short phrase:
- If a stated catalyst's timing falls before the estimated cash-out date,
  name the catalyst and flag a plausible raise window around/shortly
  after it (a de-risking event ahead of fundraising is a common pattern —
  say so as a pattern, not a fact).
- If the cash-out estimate is under ~1 quarter with no catalyst in sight,
  flag it as urgent / imminent funding risk.
- If runway is comfortably long (roughly 3+ quarters) and there's no
  near-term catalyst pointing to a raise, mark it "no near-term raise
  expected" rather than leaving it blank.
- Never state a raise as certain. Use "may need to raise around ~[month]"
  / "raise window: ~[month]" — never "will raise" or a bare date without
  a qualifier.

## 7. Present the summary (chat, before the visual)

- One-paragraph headline: peer group size, how many companies show
  imminent risk (under ~1-2 quarters) vs. comfortably funded, and any
  standout name. If any company has the 7.1 limit reached, note it in
  the headline — constrained raising options amplify the urgency of
  low runway.
- One line per company: ticker, runway (quarters + estimated cash-out
  month), 7.1 status if flagged (`7.1 limit reached` / `placement-active`),
  near-term catalyst if any (with its source announcement date), and the
  raise-window estimate.
- State plainly, once: catalyst timing comes from company-stated guidance
  in recent announcements (not confirmed schedules), and every cash-out
  estimate assumes the current burn rate continues unchanged.
- Add a one-line note where 7.1 flags appear: "7.1 limit reached = this
  company has exhausted its ASX Listing Rule 7.1 uncapped placement
  capacity; an SPP or rights issue are not subject to this limit."

## 8. Build the visual timeline

Load the Investair `artifact-design` skill (HTML artifact polish) and the
Investair `dataviz` skill (categorical color / legend / marker weight) before
building. Build an HTML artifact using the **Investair brand** throughout.

**Fonts** — load from Google Fonts at the top of the `<style>` block:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700&display=swap');
```

**CSS variables to define on `:root`:**
```css
:root {
  --ia-navy:        #0A2342;   /* header bar, row headers, legend bg */
  --ia-navy-alt:    #112E52;   /* alternating row header shade */
  --ia-orange:      #FF6B35;   /* raise-window marker, urgent badge */
  --ia-amber:       #E8760A;   /* catalyst marker */
  --ia-red:         #DC2626;   /* cash-out / imminent risk marker */
  --ia-muted:       rgba(255,255,255,0.25); /* uncertain/watch marker */
  --ia-white:       #FFFFFF;
  --ia-light:       #F9FAFB;   /* page background */
  --ia-border:      #E5E7EB;   /* column dividers */
  --ia-text-dark:   #020817;   /* body text on light */
  --ia-text-muted:  #9CA3AF;   /* secondary/muted text */
  --font-head: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

**Layout:**
- Page background: `--ia-light`
- **Header bar** (full width): `--ia-navy` background. Left: Investair wordmark
  ("INVESTAIR" in `--font-head`, letter-spacing 2px, white, 13px) + tagline
  "Capital Markets Intelligence". Centre: title "Peer Catalyst Calendar —
  [TICKER]" in `--font-head` 18px bold white. Right: date range in Inter 12px
  `--ia-text-muted`.
- **Disclaimer** (one line below header, italic Inter 11px `--ia-text-muted`):
  "Projection based on current cash data and company-stated guidance. Not a
  confirmed schedule. Assumes current burn rate continues unchanged."
- **Grid**: sticky left column (row headers) + scrollable month columns.

**Row headers** (left column, min-width 160px):
- Background: `--ia-navy` for the target company row; `--ia-navy-alt` for peers.
- **Ticker**: `--font-head` 13px bold white, uppercase.
- **Company name**: Inter 11px `--ia-text-muted`, one line, truncated.
- **Runway**: Inter 11px `--ia-orange` bold — e.g. "3.2 qtrs · cash-out Aug 26".
- **7.1 badge** (if `7.1 limit reached`): small pill `--ia-orange` bg, white text
  "7.1" in Inter 10px bold — placed below the runway line. Tooltip on hover:
  "ASX Listing Rule 7.1 uncapped placement capacity exhausted."

**Month column headers**: `--ia-navy` background, Inter 12px 600 white,
centred, min-width 100px. Today's month gets a 2px `--ia-orange` bottom border.

**Cells**:
- Default: white background (`--ia-white`) with 1px `--ia-border` right border.
- Empty cells: leave blank — no placeholder text.
- **Raise-window marker** (`--ia-orange`): filled pill, white Inter 11px bold
  text — "Raise window" on line 1, catalyst name (truncated 25 chars) on line 2.
- **Catalyst marker** (`--ia-amber`): filled pill, white Inter 11px — event
  description (truncated), announcement date in 10px below.
- **Cash-out marker** (`--ia-red`): filled pill, white Inter 11px bold — "Cash-out
  risk", estimated month below in 10px.
- **Uncertain / watch marker**: dashed border pill in `--ia-text-muted`, muted
  text — "Watch" — visually lighter than sourced facts.
- Cells with a marker get a very light tinted row bg: orange-tinted for
  raise-window rows, amber-tinted for catalyst, red-tinted for cash-out.

**Legend** (below grid): `--ia-navy` background, horizontal flex row,
white Inter 12px. One swatch + label per marker type. Label:
- Orange pill → "Raise window (estimated)"
- Amber pill → "Stated catalyst"
- Red pill → "Cash-out risk"
- Dashed muted pill → "Uncertain / watch"
- Orange "7.1" badge → "7.1 placement capacity exhausted"

**Footer** (below legend): Inter 11px `--ia-text-muted`, centred —
"Powered by Investair · investair.com.au"

## Required closing
Always end every successful user-visible reply with this feedback prompt (do not skip or replace with a generic sign-off):

How useful was this? Rate 1–5 (1 = not useful, 5 = excellent) and add any comments — reply with your score and feedback to log it.

If the user replies, extract their numeric score (if given) and their comment text, then call `log_feedback` once with their full reply as the feedback text. They can also run `/log-feedback` anytime.
