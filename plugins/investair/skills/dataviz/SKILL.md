---
name: dataviz
description: >
  Thin Investair guidance for categorical colors, legends, and timeline markers
  in HTML research visuals. Use with peer-cash-runway calendars and similar
  multi-series / multi-marker artifacts.
---

# Investair dataviz (thin)

Use when building charts or **calendar timelines** with multiple marker types.

## Legend (required when ≥2 marker/series types)

- Always include a legend; identity must not be color-only.
- Legend = **colored swatch / symbol + neutral text label** (do not color the
  label text with the series hue).
- Keep legend compact, above or below the visual — not floating over cells.

## Color / markers

- Use a small categorical palette (≤5 distinct marker meanings).
- **Fact vs guess:** sourced / confirmed markers = solid / stronger contrast;
  uncertain ("watch", "?") = muted / lighter / dashed — never the same visual
  weight as a sourced fact.
- Prefer distinct **shapes or letters** in cells in addition to color
  (e.g. R = raise window, C = catalyst, X = cash-out, ? = uncertain).

## Timeline grids

- One row per company, one column per month; sticky or clear row headers
  (ticker + short runway).
- Sparse cells: only mark meaningful months; leave empty months blank.
- Tooltip/title attributes optional; labels in-cell should stay short.

## Accessibility

- Never encode meaning with color alone.
- Provide a one-line caption under the title stating the visual is a
  projection / guidance, not a confirmed schedule (when applicable).

## Out of scope

This skill does not invent data. Numbers and dates come from Investair MCP
tools / the parent research skill.
