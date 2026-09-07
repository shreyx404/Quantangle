---
name: better-typography
description: Focuses on type scale, spacing, sizing, variable fonts, OpenType features, wrapping, truncation, tabular numbers, and scientific interface typography.
---

# Typography Guidelines for Scientific & Quantum Interfaces

Typography is mostly restraint: a sensible scale, comfortable spacing, enough contrast. A label, a table cell, a code editor, a mathematical symbol, and a header do not share one set of rules.

## 1. Serve the Right Formats & Weights
- Use variable fonts or explicitly needed weights (`400`, `500`, `600`, `700`).
- Avoid font synthesis distortion (`font-synthesis: none` where distinct faces are loaded).
- Never use weights under `400` at small text sizes (<13px).

## 2. Properties Over Raw Tags
- Use CSS properties when available:
  - `font-variant-numeric: tabular-nums;`
  - `font-optical-sizing: auto;`
- For OpenType stylistic sets in Inter, use `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum", "zero"`.
- For code and telemetry, map to JetBrains Mono with explicit tabular numbers.

## 3. Tabular Numbers in Scientific Instruments (CRITICAL)
- Coordinates $(x, y, z)$, statevector amplitudes, probabilities, execution timers ($0.08\text{ ms}$), step indices, and Dirac notation $|q_0\dots q_n\rangle$ MUST use `font-mono` and `tabular-nums` (`tnum`).
- This completely prevents visual jitter when scrubbing timelines or re-evaluating quantum statevectors.

## 4. Hierarchy & Type Scale
- Descending scale:
  - Section Eyebrows: `text-[10px] font-mono font-semibold tracking-widest uppercase text-slate-400`
  - Panel / Card Headings: `text-xs font-semibold tracking-tight text-slate-100`
  - Subheadings: `text-xs font-medium text-slate-300`
  - Body & Descriptions: `text-xs text-slate-300 leading-relaxed text-pretty`
  - Code / AST IR: `font-mono text-xs leading-normal`
  - Telemetry & Badges: `text-[10px] sm:text-[11px] font-mono font-medium tabular-nums`

## 5. Deliberate Text Wrapping
- `text-wrap: balance` on headers and section titles to distribute lines evenly.
- `text-wrap: pretty` on descriptions, AI tutor messages, and tooltips to stop single-word orphans.
- `white-space: nowrap` on badges, status pills, and action chips.
- Cap line length around 60–75 characters (`max-w-prose`) for long-form explanatory text.

## 6. Contrast Standards (WCAG 2.2 AA)
- In dark themes, ensure all readable text has at least 4.5:1 contrast against `#0b0f19` background.
- Replace low-contrast `#64748b` (slate-500) text with `#94a3b8` (slate-400) or `#cbd5e1` (slate-300).
