---
name: better-layout
description: Helps with grouping, alignment, reading order, progressive disclosure, 2x gap rule, and scientific dashboard ergonomics.
---

# Layout Guidelines for Scientific Dashboards

Position, spacing, and alignment carry hierarchy before a word is read.

## 1. Group with Space, Not Lines (The 2× Gap Rule)
- Space groups first, background fills second, separator lines last and only where space alone cannot carry the structure.
- The gap between groups must be at least 2× the gap within one:
  - Intra-group (between chips in a module): `4px` to `8px`
  - Inter-group (between different modules/sections): `16px` to `24px`
- This ensures visual chunking and prevents the layout from reading as a chaotic sea of buttons.

## 2. Keep Controls Distinct from Content
- Give every interactive element a background shape, a border, or a consistent placement zone.
- A control styled like static text beside it fails affordance.
- Interactive controls must have tactile feedback: `:hover` brightness increase, `:active:translate-y-[1px]`, and `:focus-visible` outlines.

## 3. Align to Shared Edges & Zero Jitter
- Stick to a consistent spacing grid (`4px`, `8px`, `12px`, `16px`, `24px`).
- In split views (e.g. Canvas $\leftrightarrow$ Code), align headers, toolbars, and borders horizontally.
- In multi-step circuit grids, center the time-step ticks (`t0`, `t1`...) directly over the wire cell midpoints, and align wire horizontal rails through the exact center of gate badges.

## 4. Breathing Room & Hit Targets
- Keep at least `8px` to `12px` between adjacent interactive chips/buttons.
- Ensure hit areas are accessible ($\ge 24\text{px}$ compact, $\ge 44\text{px}$ touch) and do not overlap.

## 5. Concentric Radii (Surface Continuity)
- Nested radius formula: $R_{\text{outer}} = R_{\text{inner}} + \text{padding}$.
- A `rounded-xl` card ($12\text{px}$) with `p-3` ($12\text{px}$) should contain `rounded-md` ($6\text{px}$) child controls or `rounded-lg` ($8\text{px}$) nested racks, creating harmonious concentric curves.
