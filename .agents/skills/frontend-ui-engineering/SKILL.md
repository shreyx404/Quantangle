---
name: frontend-ui-engineering
description: Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces, implementing layouts, meeting WCAG requirements, managing state, or when the output needs to feel production-engineered rather than AI-generated.
---

# Frontend UI Engineering

Production-grade engineering principles for modern scientific web applications.

## 1. Composition Over Configuration
- Build composable, single-purpose components rather than monolithic God components with dozens of boolean flags.
- Separate business/simulation logic from presentational rendering.

## 2. Eliminate AI Slop Aesthetics
- **No Purple/Indigo Gradients**: AI default models overuse purple-to-cyan neon fades and glassmorphic blurs. Stick to authentic deep hardware palettes (`#06080e`, slate borders, titanium accents).
- **No Indiscriminate Rounded-2xl**: Use mathematically derived concentric border radii ($R_{\text{outer}} = R_{\text{inner}} + \text{padding}$).
- **No Empty Voids**: Fill empty states with actionable, contextual starter protocols and interactive guidance.
- **Realistic Data**: Never show mock "Lorem ipsum" or fake placeholder probabilities. Show genuine normalized quantum state amplitudes $\sum |\alpha_i|^2 = 1.0$.

## 3. Layout Ergonomics
- Layout should not jitter during data updates.
- Assign explicit or min-heights to code editors and WebGL viewports to eliminate content layout shifts (CLS).
- Scroll containers must have bounded heights (`min-h-0 flex-1 overflow-y-auto`) so child scroll doesn't hijack the page.

## 4. State Isolation & Performance
- Heavy math (statevector updates) offloaded from the UI thread (Web Workers / WebAssembly).
- React state updates throttled/debounced appropriately to preserve 60 FPS animation loops.
