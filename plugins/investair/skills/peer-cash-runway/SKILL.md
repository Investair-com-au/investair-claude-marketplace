---
name: peer-cash-runway
description: >
  This skill should be used when the user asks for a "cash runway timeline
  for [ticker]'s peers", "when will [ticker] and its peers need to raise",
  "peer group funding timeline", "raising window timeline", or wants a
  visual, forward-looking view of when a company and its peer group are
  likely to run low on cash and what near-term catalysts (drilling
  results, studies, corporate actions) might precede or support a capital
  raise before then. Produces a chat summary plus a visual timeline
  artifact (one row per company, one column per month). Every date on the
  timeline is either a calculated figure or sourced from an actual
  announcement — never an invented catalyst or date.
metadata:
  version: "0.1.0"
---

# Peer Cash Runway Timeline

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

## 3. Compute a cash-out estimate per company

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

## 6. Present the summary (chat, before the visual)

- One-paragraph headline: peer group size, how many companies show
  imminent risk (under ~1-2 quarters) vs. comfortably funded, and any
  standout name.
- One line per company: ticker, runway (quarters + estimated cash-out
  month), near-term catalyst if any (with its source announcement date),
  and the raise-window estimate.
- State plainly, once: catalyst timing comes from company-stated guidance
  in recent announcements (not confirmed schedules), and every cash-out
  estimate assumes the current burn rate continues unchanged.

## 7. Build the visual timeline

Load the Investair `artifact-design` skill (HTML artifact polish) and the
Investair `dataviz` skill (categorical color / legend / marker weight) before
building. Build an HTML artifact: a calendar-grid timeline, one row per
company (target first, then peers), one column per month across the
window — company name/ticker/runway in the row header. Cell content per
company/month:
- A raise-window marker in the estimated month, naming the driving
  catalyst if there is one
- A catalyst marker in the month a stated near-term catalyst falls,
  citing what it is
- A cash-out marker in the projected depletion month when no raise is
  otherwise flagged
- A visually lighter/muted marker for anything genuinely uncertain
  (e.g. "watch", "?") — never give a guess the same visual weight as a
  sourced fact
Include a legend explaining what each marker color/style means, and a
one-line disclaimer under the title that this is a projection built from
current cash data and company-stated guidance, not a confirmed schedule.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
