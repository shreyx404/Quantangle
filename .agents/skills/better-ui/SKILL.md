---
name: better-ui
description: Polishes UI surfaces, concentric border radii, optical alignment, layered transparent depth, and micro-interactions.
---

# UI Polish Guidelines

Polish comes from small details that compound.

## 1. Concentric Border Radius
- Always maintain: $R_{\text{outer}} = R_{\text{inner}} + \text{padding}$.
- Mismatched radii on nested elements immediately breaks visual harmony.

## 2. Optical Over Geometric Alignment
- Play icons, math symbols, Greek letters ($\theta, \phi$), and Dirac brackets require optical nudge (e.g. `ml-0.5`).

## 3. Shadows for Elevation, Hairline Borders for Structure
- Dark workstation interfaces need crisp hairline borders (`border-white/[0.08]` to `border-white/[0.12]`) and subtle layered transparent shadows.
- Avoid diffuse, blurry neon glows that feel like cheap AI slop.

## 4. Tactile Micro-Interactions
- Use `active:translate-y-[1px]` for tactile push feedback on hardware keys and buttons.
- Interruptible CSS transitions with `transition-colors duration-150`.
