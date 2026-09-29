---
name: peer-discovery
description: >
  This skill should be used when the user asks to "find peers for [ticker]"
  and the company is not in the mining/materials sector, or when the user
  explicitly asks "who are [ticker]'s real competitors?", "discover peers for
  [ticker]", "find me companies doing the same thing as [ticker]", or wants
  a peer group identified from scratch for a company that may not have a
  strong CIP similarity match. Routes materials/mining companies to the
  established CIP peer set; routes all other sectors through announcement-
  vocabulary matching to surface companies announcing on the same themes.
  For a metrics comparison table once the peer group is known, use
  peer-cash-comparison instead.
metadata:
  version: "0.1.0"
---

# Peer Discovery

Find the right peer group for any ASX-listed company using the Investair_data
connector. Routes automatically: materials/mining companies get the
pre-computed CIP similarity peer set; all others go through announcement-
vocabulary matching to surface companies announcing on the same themes.

**Note:** The announcement-vocabulary path (non-materials) requires the
`screen_announcement_peers` server tool, which ships in the v0.19 server
update. If the tool is unavailable, fall back to `get_peers` results and
explain the limitation.

On every Investair_data tool call, pass `user_question` with the user's
original request in their own words — used for usage auditing only.

---

## 1. Resolve the company

`resolve_company` — confirm ticker, handle typos or name lookups.

## 2. Try the CIP peer set first

`get_peers(ticker)` — check `tool_response.peer_source`:

### Path A — `peer_source = "materials_cip_similarity"`

CIP results are strong for this company. Present them directly:

- 1–2 sentences on the selection logic (commodity, geography, lifecycle)
  drawn from the actual fields returned — never raw table or tier names.
- List peer tickers and key attributes (commodity, country, stage, mcap).
- Note data as-of (`snapshot_quarter_end`).
- If the set looks wrong, say peer matching is still being improved and
  invite `log_feedback`.
- Done — skip steps 3–7.

### Path B — `peer_source = "peer_results_current"` or `"none"`

The CIP book has limited or no coverage for this company. Proceed to the
announcement-vocabulary path in steps 3–7.

---

## 3. Extract vocabulary buckets from target announcements (Path B only)

`list_announcements(ticker, days_back=150, limit=12)` — read titles and
`short_preview` for the 12 most recent announcements.

Extract **3–5 distinctive phrase buckets** that describe what this company
actually does — the kind of language a *competitor* would also use.

**Phrase-selection rules (these matter for result quality):**
- Prefer technology or end-market phrases over company brand names
  — e.g. "cardiac rhythm", "battery swap", "cold spray coating" over
  the company's own product names.
- Avoid single generic words alone ("electric", "defence", "hospital")
  — AND them with a second signal, or they match unrelated sectors.
- Cover both the *technology* and the *end-market* if both apply — they
  often surface different peer sets.
- 2–4 terms per bucket; each term should be a phrase that would appear
  literally in a price-sensitive announcement.

Example buckets for a cardiac-device company:
```
[
  {"name": "cardiac_technology", "terms": ["cardiac rhythm", "heart failure", "implantable device"]},
  {"name": "us_reimbursement", "terms": ["cms reimbursement", "medicare", "de novo clearance"]},
  {"name": "clinical_trial", "terms": ["clinical trial", "pivotal study", "fda approval"]}
]
```

Before calling the screen, briefly tell the user what you extracted and why:
> "I found these recurring themes in [ticker]'s announcements: [buckets].
> Searching for ASX companies announcing on the same topics — one moment."

---

## 4. Screen for matching companies (Path B only)

`screen_announcement_peers(ticker, buckets, days_back=365, limit=40)`

Returns per-company hit counts by bucket. The result shows which companies
have announced on the same themes, and in which specific buckets.

---

## 5. Triage results (Path B only)

- **Strong candidates:** companies with hits in **2 or more buckets** —
  they share multiple themes, not just a single keyword match.
- **Weaker signal:** single-bucket, single-hit rows — exclude unless the
  hit count is high (≥ 3 announcements in one bucket).
- **Noise:** very high hit counts on a generic term suggest the term is
  too broad — note this and discount those rows.

---

## 6. Confirm candidate identities (Path B only)

`list_announcements` on the shortlisted tickers (≤10 per call) to verify
unfamiliar company names. Check that the announced themes genuinely describe
the same business — a ticker match on "cold spray" should be an actual
cold-spray technology company, not a coincidental mention.

`get_market_snapshots` on the confirmed shortlist for market cap, sector,
and lifecycle stage.

---

## 7. Present the discovered peer group (Path B only)

- 1–2 sentences explaining the matching approach and what themes drove it.
- Table of confirmed peers: Ticker, Company, Market Cap, Sector, Stage,
  Matched Buckets (which themes they share with the target), Hit Count.
  Order by number of matched buckets descending, then hit count.
- Cross-check against the `get_peers` rules-based results (from step 2):
  flag any company that appears in both — that's a high-confidence peer.
  Flag any meaningful disagreement: is it a wrong sub-industry assignment
  in the rules-based engine, or a genuinely different business?
- If the peer set looks thin or wrong, invite `log_feedback` — vocabulary
  matching is a heuristic and the results depend on announcement language.

---

## Required closing
Always end every successful user-visible reply with this feedback prompt (do not skip or replace with a generic sign-off):

How useful was this? Rate 1–5 (1 = not useful, 5 = excellent) and add any comments — reply with your score and feedback to log it.

If the user replies, extract their numeric score (if given) and their comment text, then call `log_feedback` once with their full reply as the feedback text. They can also run `/log-feedback` anytime.
