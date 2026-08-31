---
name: peer-cash-comparison
description: >
  This skill should be used when the user asks to "find peers for [ticker]",
  "generate a peer group for [company]", "compare [ticker] to its peers", or
  wants comparative metrics (market cap, cash, EV, burn, runway) across a
  company's peer set. Answers in chat with a comparison table; can build a
  chart on request.
metadata:
  version: "0.2.0"
---

# Peer Comparison

Generate a peer group and comparative-metrics table using the
Investair_data MCP connector.

**Peer selection is owned by MCP `get_peers`.** Do not redefine peer tiers,
tables, or fallbacks in this skill. Read `tool_response.peer_source` and
`business_context` from the tool response and narrate in plain business
language only (never raw table/tier/engine labels unless the user asks for
internals).

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words.

## 1. Resolve the ticker

Confirm the target ticker if ambiguous.

## 2. Pull peers and metrics

- `get_peers` (ticker) — use returned peers and `peer_source`
- Batch target + peers into ONE call each of `get_market_snapshots` and
  `get_cashflow_snapshots` (max 30 tickers per call; split if needed)
- Compute EV = Market Cap − Cash per row from the raw snapshots

If the user wants best peer brokers for a raise, use `screen_peer_brokers`
— do not walk `get_peers` × `list_capital_raises` × `list_deal_brokers`.

## 3. Quick verify

Recompute EV for every row; confirm the target appears once; every figure
must trace to a tool call from this session.

## 4. Present

Before the table: 1–2 sentences on why this peer set was selected, drawn
from the fields `get_peers` actually returned for this `peer_source`. List
peer tickers. Then table: Ticker, Company, Country/Focus, Stage, Market
Cap, Cash, EV, Burn/Qtr, Runway — target first, peers by EV ascending.

If the set looks wrong or incomplete, say peer matching is still being
improved and invite feedback (`log_feedback`).

## 5. Optional chart

Only if the user asks — simple EV or market-cap comparison.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
