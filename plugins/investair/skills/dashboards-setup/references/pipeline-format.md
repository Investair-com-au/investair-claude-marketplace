# Pipeline dashboard format (sector raise pipeline and broker sweet-spot pipeline)

Inline this spec into every scheduled prompt that builds a pipeline dashboard. Build a single self-contained HTML page and republish it to the same artifact URL each run.

## Branding (Investair Style Guide)
- Every dashboard is built from **`investair-page-template.html`**, which carries the Investair wordmark (embedded as a data URI), the navy masthead and footer bands, and the brand stylesheet **`investair-brand.css`**. The stylesheet's tokens come from the Investair Style Guide (investair.com.au production CSS). Fill the `{{…}}` placeholders and the `<main>` content; never restyle the masthead, logo or footer.
- **Palette:** `brand-navy #0a2342` for bands, headings and table heads; `brand-amber #e8760a` for the 4px card rule, figure highlights and primary chips; `brand-orange #ff6b35` for focus and hover only; `brand-teal #1a7f8e` as a second data series. Body text is `#4a5568` on `#f9fafb`/white.
- **Accessibility rules from the style guide:** on white, set small text in navy and never in orange or amber. Chips on amber use navy labels. Use amber text only on navy bands or at 24px and above.
- **Type:** Montserrat 700 for headings and tickers, Inter for everything else, with tabular numerals for figures.
- **Logo:** use the supplied wordmark tile only. Never recolour or redraw it, and never separate "AI" from the rest.
- **Re-runs:** a scheduled run first **reads the existing artifact** at its URL and keeps its `<head>`, masthead band, logo and footer exactly. It regenerates only the masthead text and the `<main>` content, then republishes to the same URL. If the artifact can't be read, it rebuilds from the template text inlined in the scheduled prompt.
- **Segments (sweet spot):** #1 uses amber, #2 navy and #3 teal (classes: none, `bz`, `cu`; `nt` for an out-of-sweet-spot existing client). Cells inside the 4–10 week window are `--danger` red, with the legend under the chip strip.

## Sections, in order
1. **Masthead** (navy `ia-top` band from the template).
   - Logo row: the wordmark (left) and the audience label in amber caps (right), e.g. "Internal pitch list" or "Prepared for <Broker>".
   - Eyebrow (`mh-brand`): Inter 600 13px, amber caps, e.g. "Sweet spot pipeline · Argonaut".
   - Title: Montserrat 700, 32px, white.
   - Badge: amber pill with navy Inter 600 12px label, e.g. "4–10 Week Runway · ASX", followed by "Updated <date>".
   - Note: 2–4 sentences, answer first, with week-over-week entries and exits.
2. **Strip.**
   - Label: "SWEET SPOT", or "FOCUS" for a universe pipeline.
   - Ranked chips: Inter 600 12px, radius 6px, filled with the segment accent (amber with navy text, navy or teal with white), e.g. "#1 Gold", "#2 Copper".
   - Add one outline chip for the band, e.g. "Mkt cap A$5–50M · median disc 12%".
3. **Active Pipeline** (or **Confirmed** for sweet-spot). Section header (`sec-head`): Montserrat 700 13px navy caps with a short amber bar and a hairline rule. Each deal card has:
   - **Frame:** surface background, 1px border, 4px left border in the commodity accent, radius 4px.
   - **Top row:** ticker in Montserrat 700 30px navy (add a "NEW" `flag` for this week's entrants) and company name in Inter 500 14px muted. The commodity badge sits on the right.
   - **Metrics row:** a 4-column grid with hairline dividers: Runway Wks | Cash A$ | Burn / Qtr | Mkt Cap A$. Labels in Inter 600 11px muted caps, values in Inter 700 18px navy, on a light grey strip.
   - **Note:** 2–3 sentences covering the catalyst, last raise and broker, and likely cornerstones. Prefix inferences with "Inferred:".
   - **Runway bar:** 13 cells of 2 weeks each, spanning 0–26 weeks, 10px tall with 2px gaps. Fill cells up to the runway with the accent. Cells inside 4–10 weeks (cells 3–5) turn `--urgent` when filled; unfilled cells use `--border`. Scale labels: 0wk, 4wk, 10wk, 26wk.
   - **Flags:** Inter 600 11.5px pills (`flag urgent` red dot + tint, `flag ok` teal tint), e.g. "Existing client" (urgent colour), "Open mandate · no incumbent broker" (forest colour).
4. **Watch / Approaching Window.** Same cards at 0.85–0.9 opacity, with a 26px ticker and smaller metrics. Each note says why the company is on watch: an adjacent commodity, a borderline market cap, or 10–26 weeks of runway.
5. **Excluded This Week.** Table with columns Ticker | Mkt Cap | Runway | Reason.
   - Navy header row with white caps; tickers in Montserrat 700 13px; numbers in Inter with tabular numerals.
   - Reasons are short and specific: "Mktcap too large >A$50M", "Wrong commodity (Uranium)", "Under takeover", "Net cash inflow".
6. **Method line** (12.5px, `--mid`): how runway weeks are calculated and what is inferred.
7. **Footer:** the template's navy `ia-foot` band with the logo and "Data: Investair · <owner> internal use only · <date>".

## Rules
- No localStorage and no external scripts. Use a `<title>` that names the pipeline, e.g. "WA Gold Raise Pipeline" or "Argonaut Sweet Spot Pipeline".
- Attribute figures to Investair. Never invent cash, runway, brokers or holders.
- After republishing, post a 2–3 line chat summary covering how many Active/Confirmed and Watch names there are, and what entered or exited since last week.
