# Anti-AI-Slop Engineering & Design Directive

> **Quantangle Project Quality & Aesthetic Standard**  
> Synthesized from `hallmark` (58-gate validation) and Anthropic `frontend-design`.  
> Applies to all AI coding agents working on Quantangle.

---

## 1. Core Mandate: Eradicate "AI Slop"

"AI Slop" is the generic, homogenizing aesthetic that unconstrained LLMs produce due to distributional convergence in training data. It cheapens deep-tech platforms into generic hackathon templates.

Quantangle is a **precision deep-tech scientific computing workstation** (merging the aesthetics of IBM Quantum System One, Linear, Teenage Engineering, and Vercel's high-density interfaces). Every interface element must feel engineered with intention, restraint, and tactile precision.

---

## 2. The 10 Banned AI Tells (Auto-Fail Gates)

1. **Banned: Purple-to-Cyan/Blue/Magenta Gradients**:
   - Never use purple-to-blue or cyan-to-magenta linear gradients on headers, text, cards, or hero backgrounds.
   - No `background-clip: text` gradient headlines (`quantum-text-gradient` is banned).
   - Use solid, high-contrast, calibrated neutral text (`#f8fafc`, `#cbd5e1`, `#94a3b8`).
2. **Banned: Generic Glassmorphism Everywhere**:
   - Do not slap `backdrop-blur bg-white/5 border border-white/10 rounded-2xl` onto every container.
   - Use crisp, high-density instrument panels with subtle solid or semi-translucent surfaces (`#0c101b`, `#111726`), calibrated hairline borders (`border-slate-800/80` or `border-cyan-500/20`), and no blurry mush.
3. **Banned: Over-Saturated Neon Glow Shadows**:
   - Never use `shadow-[0_0_20px_rgba(0,242,254,0.4)]` or `shadow-[0_0_20px_rgba(181,55,242,0.4)]` on buttons, badges, or cards.
   - Shadows must be subtle optical depth cues (`shadow-sm`, `shadow-md`, or crisp directional borders).
4. **Banned: Gratuitous Unprompted Animations**:
   - No `animate-spin` on logo icons or `animate-ping` on status dots.
   - Motion is reserved for user-triggered state changes or active computation telemetry (e.g. quantum timeline progression, actual simulation execution).
5. **Banned: Uniform `hover:scale-105` and `transition-all`**:
   - Never put `hover:scale-105` across multiple buttons or cards.
   - Never use `transition-all` or `transition: all`. Always specify the exact properties: `transition-colors`, `transition-opacity`, or `transition-[border-color,background-color]`.
   - Use tactile physics: `active:translate-y-[1px]` or subtle border highlight.
6. **Banned: Floating Neon Pill AI Widgets**:
   - Do not float a candy-colored gradient pill in the bottom right corner.
   - Integrate AI tutors and tools directly into the instrument panel layout with clean command bar shortcuts (`AI Inspector`, `⌘K` or clean docked panel toggle).
7. **Banned: Inter-Everywhere Without Hierarchy**:
   - Do not use generic unweighted Inter everywhere.
   - Pair crisp, clean UI typography with **JetBrains Mono** / **Geist Mono** for all quantum coordinates, basis states, matrix indices, timings ($t_0, t_1$), and code.
8. **Banned: 3-Column Equal Feature Cards**:
   - Never build a standard 3-equal-card grid with icon-above-heading. Use asymmetric, data-dense, workbench-style layouts.
9. **Banned: Card-in-Card Nesting**:
   - Avoid nesting bordered cards inside bordered cards without semantic reason. One containment level per region.
10. **Banned: Startup Cliché Copy**:
    - No "Unleash the power of...", "Seamless quantum experience...", or "Revolutionize...".
    - Use technical, precise, active-voice scientific terminology.

---

## 3. The Scientific Instrument Design System

- **Anchor Neutrals**: Deep Obsidian (`#080b12`), Cryo Slate (`#0d1322`), Panel Border (`rgba(255, 255, 255, 0.08)` / `#1e293b`).
- **Telemetry Accents**:
  - Telemetry Cyan: `#00e5ff` (Used sparingly for active wires, active steps, statevector markers; < 5% viewport area).
  - Coherence Emerald: `#10b981` (For verified fidelity $F \ge 0.999$, active engine status).
  - Purity Amber: `#f59e0b` (For phase rotations, warning thresholds).
  - Entanglement Violet: `#8b5cf6` (Solely for multi-qubit entangling gates CX/CZ/SWAP).
- **Surface Elevation**:
  - Base: `#080b12`
  - Layer 1 (Workstation Panels): `#0d1322` with `1px solid rgba(255, 255, 255, 0.07)`
  - Layer 2 (Active cells, inputs): `#131b2e` with `1px solid rgba(0, 229, 255, 0.25)`
- **Typography Scale**:
  - Technical labels: `font-mono text-[11px] tracking-wider uppercase text-slate-400`
  - Quantum states: `font-mono text-xs font-semibold tabular-nums`
  - Headers: Solid `#f8fafc` semibold, tight tracking (`tracking-tight`), no gradient fills.
