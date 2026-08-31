---
name: artifact-design
description: >
  Thin Investair guidance for HTML artifacts (timelines, one-pagers). Use when
  building a Claude HTML artifact for research visuals — especially peer cash
  runway calendars. Prefer readable, product-like layout over decorative chrome.
  Helper only — not a user slash command.
user-invocable: false
---

# Investair artifact design (thin)

Build a **single HTML artifact** (one self-contained page). Goals: scannable in
under a minute, suitable for equity research — not a marketing landing page.

## Layout

- One clear title + one-line subtitle/disclaimer under it.
- Prefer full-width content; avoid card grids in the hero/header.
- Generous but consistent spacing; readable type (system UI stack is fine:
  `ui-sans-serif, system-ui, sans-serif`).
- Dark text on light background by default (`#111` on `#fafafa` / white).
- Keep chrome minimal: no purple gradients, glow, or floating badge clutter.

## Hierarchy

1. Title / disclaimer  
2. Main visual (timeline, table, or chart)  
3. Short legend / notes  
4. Optional compact data table if numbers must be copied  

## Accessibility

- Do not rely on color alone for meaning — pair with text labels or symbols.
- Contrast: body text dark enough on the page background.
- Prefer semantic HTML (`table`, `caption`, headings) when it fits.

## Investair-specific

- Always note figures come from Investair data where relevant.
- Projections / raise windows are estimates — say so in the subtitle.
- When the parent skill specifies markers/legend, follow that skill exactly;
  this skill only covers general artifact polish.
