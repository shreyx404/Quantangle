---
name: better-layout
description: Helps with grouping, alignment, reading order, progressive disclosure, 2x gap rule, and scientific dashboard ergonomics.
---

# Layout Guidelines for Scientific Dashboards

Position, spacing, and alignment carry hierarchy before a word is read.

## 1. Group with Space, Not Lines
- Space groups first, background fills second, separator lines last.
- The gap between groups must be at least 2× the gap within one (e.g. `8px` intra-group to `16px`+ inter-group).
- Avoid unnecessary nested card boxes where whitespace can group elements cleanly.

## 2. Keep Controls Distinct from Content
- Give every interactive element a background shape, a border, or a consistent placement zone.
- A control styled like static text beside it fails affordance.

## 3. Align to Shared Edges
- Stick to a consistent spacing grid (`4px`, `8px`, `12px`, `16px`, `24px`).
- In split views, balance column widths and avoid squeezing multi-action toolbars into narrow containers.

## 4. Breathing Room Between Targets
- Keep at least `8px` to `12px` between adjacent interactive chips/buttons.
- Ensure hit areas are accessible and do not overlap.

## 5. Concentric Radii (Surface Continuity)
- Nested radius formula: $R_{\text{outer}} = R_{\text{inner}} + \text{padding}$.
- A `rounded-xl` card ($12\text{px}$) with `p-3` ($12\text{px}$) should contain `rounded-md` ($6\text{px}$) child controls, creating smooth concentric curves.
