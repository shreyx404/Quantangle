---
name: better-interface
description: Combines all of the better-* skills into a single review across accessibility, layout, writing, typography, color and UI polish.
---

# Interface Review

This skill runs a cross-discipline review. It routes the interface to each `better-*` skill, collects their evidence and consolidates one ranked verdict.

Orchestration is all it owns:
1. `better-accessibility`: Hit areas, keyboard navigation, screen reader affordances, contrast ratios.
2. `better-layout`: Grouping with space (2x gap rule), alignment edges, visual hierarchy, importance ordering.
3. `better-typography`: Type scale, tabular numbers (`tnum`, `zero`), line-height, text wrapping (`balance`/`pretty`).
4. `better-colors`: Perceptual lightness, dark-mode desaturation, state signaling, color-blind safe palettes.
5. `better-ui`: Concentric border radii ($R_{\text{outer}} = R_{\text{inner}} + \text{padding}$), optical alignment, layered depth, tactile feedback.

## Core Principles

### 1. Evidence, Not Taste
- A trigger is a failure whatever the style guide says (e.g. text failing WCAG contrast, numbers jittering on playback).
- A density, radius, or voice you merely disagree with is not a finding.
- The bar for reporting is verifiable evidence.

### 2. Recon Before Judgment
- Identify the styling system (Tailwind CSS), component library, design tokens, and viewports.
- Write every fix in the project's own idiom and design system.
- Preserve deliberate scientific workstation chrome and Little-Endian telemetry.

### 3. Review Priority Order
1. `better-accessibility`
2. `better-layout`
3. `better-typography`
4. `better-colors`
5. `better-ui`
