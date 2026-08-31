---
name: company-snapshot
description: >
  This skill should be used when the user asks for a "company snapshot",
  "quick snapshot of [ticker]", "give me an overview of [company]", or wants
  a fast, single-message read on an ASX-listed company's market position,
  cash position, projects, and top holders — without a full initiation
  report. Answers directly in chat, no document is produced. Recomputes EV
  and cash runway from the raw pull before presenting, as a quick accuracy
  check.
metadata:
  version: "0.1.0"
---

# Company Snapshot

Produce a concise, single-message snapshot of one ASX-listed company using
the Investair_data connector. This is the fast/lightweight sibling of
the `initiation-report` skill — no document, no analyst narrative, just the
current facts.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only, no
effect on results. Never omit or paraphrase it.

## 1. Resolve the ticker

Confirm the ticker if ambiguous. If the user names a company without a
ticker and it's not obvious, ask.

## 2. Pull data

Call, for the target ticker (omit date args — use latest snapshot
defaults):

- `get_market_snapshot` — price, market cap, price performance
- `get_cashflow_snapshot` — cash, burn, runway
- `get_company_projects` — project list
- `get_substantial_holders` — top holders (state the threshold/as-at date
  the tool returns)

## 3. Quick verify

Before presenting, recompute EV (Market Cap − Cash) and cash runway (Cash ÷
quarterly burn) from the raw tool outputs, and confirm every figure you're
about to state traces back to a specific tool call from this session — not
a remembered or assumed value. This is a lightweight check, not the full
`initiation-report` verification pass; it exists to catch drafting slips
before a number reaches the user.

## 4. Present the snapshot

Reply directly in chat (not a document) with:

- One-line header: ticker, company name, sector/commodity, stage
- A compact stat line: price, market cap, EV (mcap − cash), cash, runway
- Project list (name, country, stage, ownership) — 1 line each
- Top 3-5 substantial holders with stake % — flag any with
  `prime_broker_clause_detected: true` prominently, not as a footnote
- If runway is under ~2 quarters, flag funding risk in one sentence

Keep it scannable — this should read in under 30 seconds. Do not draft
investment highlights, risks, or a thesis; that's what `initiation-report`
is for. If the user follows up asking for more depth, offer to run
`initiation-report`, `peer-cash-comparison`, or `investor-targeting` instead of
expanding this reply.

## Required closing
Always end every successful user-visible reply with this exact final line (do not skip or replace with a generic sign-off):

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.

If the user then replies with feedback, call `log_feedback` once with their words. They can also run `/log-feedback` anytime.
