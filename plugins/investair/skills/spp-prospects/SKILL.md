---
name: spp-prospects
description: >
  This skill should be used when a broker asks to "find SPP prospects",
  "which companies can do an SPP?", "show me SPP candidates",
  "companies that have done an SPP before", or wants a screen of ASX-listed
  companies that previously conducted a Share Purchase Plan more than 9 months
  ago and may be due for another. Returns a tabular report ordered by market
  cap. Broker-facing deal flow tool.
metadata:
  version: "0.1.1"
---

# SPP Prospects

Screen ASX-listed companies for Share Purchase Plan candidacy using the
Investair_data connector. Companies that previously ran an SPP more than
9 months ago — potentially overdue for another.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only.

---

## 1. Run the SPP history screen

Tell the user: *"Running screen across ASX announcements — one moment."*

Run via `run_readonly_sql`:

```sql
SELECT
    primary_stock,
    MAX(date) AS last_spp_date,
    DATEDIFF(CURDATE(), MAX(date)) AS days_since_spp
FROM Feed_Public.feed_new
WHERE (
    INSTR(LOWER(title), 'share purchase plan') > 0
    OR INSTR(LOWER(title), ' spp ') > 0
    OR INSTR(LOWER(title), ' spp-') > 0
    OR INSTR(LOWER(title), ' spp:') > 0
    OR LEFT(title, 4) = 'SPP '
    OR LEFT(title, 4) = 'SPP-'
    OR LEFT(title, 4) = 'SPP:'
)
AND primary_stock IS NOT NULL
GROUP BY primary_stock
HAVING days_since_spp > 270
ORDER BY days_since_spp DESC
LIMIT 150
```

**Note:** Use `INSTR` and `LEFT` patterns only — never `LIKE '%...%'` (the
`%` character triggers a Python format-string substitution bug in the
gateway).

---

## 2. Enrich with market and cashflow context

Rather than looping per-ticker tool calls (too slow at this scale), enrich
the result set with a single joined `run_readonly_sql` query:

```sql
SELECT
    m.ticker,
    m.market_cap_aud,
    c.cash_today_aud,
    c.adjusted_estimated_quarters_funding
FROM ASX_Market.ASX_MarketSnapshot m
LEFT JOIN Cashflow.cashflow_daily c
    ON UPPER(c.asx_code) = UPPER(m.ticker)
WHERE m.ticker IN ([comma-separated ticker list from step 1])
  AND m.snapshot_date = (SELECT MAX(snapshot_date) FROM ASX_Market.ASX_MarketSnapshot)
  AND (c.report_date IS NULL OR c.report_date = (
    SELECT MAX(c2.report_date) FROM Cashflow.cashflow_daily c2
    WHERE UPPER(c2.asx_code) = UPPER(m.ticker)
  ))
```

**Note:** Verify table and column names via `describe_table` if this query
fails — the snapshot table name may differ from the structured `get_market_snapshot`
tool's underlying table. Fall back to separate `run_readonly_sql` calls on
each table if a join is not feasible.

---

## 3. Present the report

**Table — SPP history > 9 months:**
Order by market cap descending. Cap at 100 rows.

| Ticker | Market Cap (AUD) | Last SPP | Months since | Cash (AUD) | Runway (qtrs) |
|--------|-----------------|----------|-------------|-----------|--------------|

If the raw result exceeds 100 rows before the cap, note the total count
and suggest adding a market cap floor:
> "X companies matched — showing top 100 by market cap. To narrow further,
> specify a minimum market cap (e.g. 'filter to companies above $20m mcap')."

State plainly: results are sourced from ASX announcement titles — companies
that conducted an SPP but did not announce it with standard title language
may be missed.

---

## Required closing
Always end every successful user-visible reply with this feedback prompt (do not skip or replace with a generic sign-off):

How useful was this? Rate 1–5 (1 = not useful, 5 = excellent) and add any comments — reply with your score and feedback to log it.

If the user replies, extract their numeric score (if given) and their comment text, then call `log_feedback` once with their full reply as the feedback text. They can also run `/log-feedback` anytime.
