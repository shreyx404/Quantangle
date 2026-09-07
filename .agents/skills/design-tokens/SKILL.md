---
name: design-tokens
description: Structured DTCG design tokens for colors, typography, spacing, border radii, and elevation shadows.
---

# Design Tokens Architecture

Structure design tokens in three tiers: Primitive $\to$ Semantic $\to$ Component.

## 1. Typography Tokens
- **Display**: Inter 18px / line-height 24px / font-semibold / tracking-tight
- **Heading**: Inter 14px / line-height 20px / font-semibold / tracking-tight
- **Subheading**: Inter 12px / line-height 16px / font-medium / tracking-normal
- **Label / Eyebrow**: JetBrains Mono 10px / line-height 14px / font-semibold / tracking-widest / uppercase
- **Body**: Inter 12px / line-height 18px / font-normal / text-slate-300 / text-pretty
- **Telemetry**: JetBrains Mono 11px / line-height 14px / font-medium / tabular-nums
- **Code**: JetBrains Mono 12px / line-height 18px / font-normal

## 2. Spacing & Rhythm (8-Point Grid with 4px Sub-step)
- `space-1`: 4px (micro-gap within chip or badge)
- `space-2`: 8px (standard gap between sibling controls)
- `space-3`: 12px (panel padding, inter-group gap)
- `space-4`: 16px (standard section gap)
- `space-6`: 24px (major module separation)

## 3. Concentric Border Radii
- **Outer Shell**: `12px` (`rounded-xl`)
- **Inner Panel**: `8px` (`rounded-lg`)
- **Control / Chip**: `6px` (`rounded-md`)
- **Micro Badge**: `4px` (`rounded`)

## 4. Workstation Elevation Surfaces
- Base background: `#06080e` (cryogenic void)
- Primary panel: `#0b0f19` (titanium instrument surface)
- Elevated card: `#101726` (sub-rack module)
- Interactive hover: `#162238` (active state)
- Border subtle: `rgba(255, 255, 255, 0.07)`
- Border elevated: `rgba(255, 255, 255, 0.12)`
- Border accent: `rgba(0, 229, 255, 0.35)`
