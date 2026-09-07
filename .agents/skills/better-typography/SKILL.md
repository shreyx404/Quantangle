---
name: better-typography
description: Focuses on type scale, spacing, sizing, variable fonts, OpenType features, wrapping, truncation, tabular numbers, and scientific interface typography.
---

# Typography Guidelines for Scientific & Quantum Interfaces

Typography is mostly restraint: a sensible scale, comfortable spacing, enough contrast. A label, a table cell, a code editor, a mathematical symbol, and a header do not share one set of rules.

## 1. Serve the Right Formats & Weights
- Use variable fonts or load explicitly needed weights (`400`, `500`, `600`, `700`).
- Avoid font synthesis distortion (`font-synthesis: none` where distinct faces are loaded).
- Never use weights under `300` at text sizes (<28px).

## 2. Properties Over Raw Tags
- Use CSS properties when available:
  - `font-variant-numeric: tabular-nums` (instead of raw feature strings)
  - `font-optical-sizing: auto`
- For OpenType stylistic sets in Inter, use `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"`.

## 3. Tabular Numbers in Scientific Instruments (CRITICAL)
- Coordinates $(x, y, z)$, statevector amplitudes, probabilities, execution timers ($0.08\text{ ms}$), step indices, and Dirac notation $|q_0\dots q_n\rangle$ MUST use `font-mono` and `tabular-nums` (`tnum`).
- This prevents visual jitter when scrubbing timelines or re-evaluating quantum statevectors.

## 4. Hierarchy & Type Scale
- Descending scale:
  - Section Eyebrows: `text-[10px] font-mono font-medium tracking-widest uppercase text-slate-400`
  - Panel / Card Headings: `text-xs font-semibold tracking-tight text-slate-100`
  - Body & Descriptions: `text-xs text-slate-300 leading-relaxed`
  - Code / Ast IR: `font-mono text-xs leading-normal`
  - Telemetry & Badges: `text-[10px] font-mono font-semibold`

## 5. Deliberate Text Wrapping
- `text-wrap: balance` on headers and section titles to distribute lines evenly.
- `text-wrap: pretty` on descriptions, AI tutor messages, and tooltips to stop single-word orphans.
- `white-space: nowrap` on badges, status pills, and action chips.
- Cap line length around 60–75 characters (`max-w-prose`) for long-form explanatory text.

## 6. Letter-Spacing Calibration
- Large headings: slightly negative (`tracking-tight` / `-0.015em`).
- Small uppercase labels / badges: positive letter-spacing (`tracking-wider` / `0.05em`).
- Body text: normal tracking.
