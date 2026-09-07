---
name: better-accessibility
description: Enforces WCAG 2.2 accessibility standards, hit target sizing, keyboard focus loops, ARIA state announcements, and reduced motion.
---

# Accessibility Guidelines

A professional scientific interface must be operable by everyone, across mouse, keyboard, and screen readers.

## 1. Hit Target Sizing
- Touch-friendly controls should be at least $44 \times 44\text{px}$.
- Compact desktop tools/chips must have an effective hit area of at least $24 \times 24\text{px}$ (or $28 \times 28\text{px}$ with padding).
- Maintain at least $8\text{px}$ between adjacent interactive targets to prevent mis-clicks.

## 2. Visible Focus Rings
- All focusable elements (`button`, `input`, `select`, `[tabindex]`) must have distinct `:focus-visible` styles.
- Use `outline: 2px solid rgba(0, 229, 255, 0.7)` with `outline-offset: 2px`.
- Never remove focus rings without providing a customized, accessible replacement.

## 3. Keyboard Navigation
- Interactive circuit cells, gate palette chips, and scrubber controls must be navigable via Tab / Enter / Space / Arrow keys.
- Modals must trap focus and close cleanly on Escape.

## 4. Screen Readers & Semantic Elements
- Use `<header>`, `<main>`, `<footer>`, `<button>`, `<select>`, `<input>` semantically.
- Non-text buttons (icons only) must have `aria-label` or `title` attributes.
- Live telemetry and simulation results should declare `aria-live="polite"` or `role="status"`.

## 5. Motion Reduction
- Respect `prefers-reduced-motion: reduce`:
  - Instantaneous or minimal transitions ($0.01\text{ms}$).
  - Disable continuous ambient pulses and spinning indicators.
