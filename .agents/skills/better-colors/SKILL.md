---
name: better-colors
description: Focuses on color contrast, perceptual lightness, dark-mode desaturation, state signaling, and color-blind safe palettes.
---

# Color & Palette Guidelines

Color communicates state, relationship, and status before text is parsed.

## 1. Contrast & Accessibility First (WCAG 2.2 AA)
- Normal text requires at least 4.5:1 contrast against its background.
- Large text (≥18pt or ≥14pt bold) and active UI controls/borders require at least 3:1 contrast.
- In dark themes (`#06080e` / `#0b0f19`), never use dark muted grays like `#475569` (slate-600) for important reading text. Elevate secondary labels to `#94a3b8` (slate-400) or `#cbd5e1` (slate-300).

## 2. Desaturate Colors in Dark Mode
- Full saturation against a near-black background vibrates and strains the eye.
- Reduce saturation on broad surfaces and background badges (`opacity 10%–20%` fills).
- Reserve saturated accents (`#00e5ff` cyan, `#10b981` emerald, `#f59e0b` amber, `#f43f5e` rose) for small, meaningful focal points (active indicators, needle markers, status dots).

## 3. Dual-Channel Encoding (Color-Blind Safe)
- Never rely on color alone to convey state or identity.
- Always pair color with an icon, badge text, or geometric glyph (e.g. `H`, `CX 2q`, `Rx θ`, `MEAS`, `F ≥ 0.999 ✓`).
- In quantum state phase representations, provide numerical readout alongside phase color hue.

## 4. Semantic State Hierarchy
- **Informational / Quantum**: Calibrated Cyan (`#00e5ff` / `sky-400`)
- **Success / Verified**: Emerald (`#10b981`)
- **Warning / Non-Clifford / Rotation**: Amber (`#f59e0b` / `violet-400`)
- **Destructive / Reset**: Rose (`#f43f5e`)
- **Surface Elevation**: Cryogenic Base (`#06080e`) $\to$ Instrument Panel (`#0b0f19`) $\to$ Elevated Module (`#101726`) $\to$ Active Control (`#152033`).
