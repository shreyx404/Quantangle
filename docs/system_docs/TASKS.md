# TASKS.md — Quantangle Phased Engineering Roadmap

> **Actionable, Checkable Engineering Task Ledger for Developers and AI Agents.**  
> *Rule for AI Agents:* Pick the first unchecked `[ ]` task, implement it, verify per `TESTING_GUIDE.md`, and check it off `[x]`.

---

## Phase 0: Workspace Setup & System Documentation Suite
- [x] **TASK-0.1: Clean Workspace & Archive Pitch Artifacts**
  - *Input*: Root workspace directory with hackathon ideation and presentation files.
  - *Output*: Redundant duplicates deleted (`PRESENTER_MASTER_GUIDE_EXPANDED.md`, `PRESENTER_MASTER_GUIDE_TTS.txt`, `SIHPPT.md`), pitch assets safely archived to `docs/pitch_archive/`.
  - *Acceptance Criteria*: Root directory contains only production system docs and clean project subfolders.
- [x] **TASK-0.2: Author AI Agent Operating Infrastructure**
  - *Input*: Multi-agent / vibe coding requirements.
  - *Output*: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `ACTIVE_CONTEXT.md`.
  - *Acceptance Criteria*: Every AI tool has clear rules of engagement, CLI shortcuts, and session memory handover.
- [x] **TASK-0.3: Author Core System Architecture & Specifications**
  - *Input*: SIH26140 problem statement and technical architecture requirements.
  - *Output*: `PRD.md`, `ARCHITECTURE.md`, `SYSTEM_PATTERNS.md`, `TECH_STACK.md`, `SIMULATION_SPEC.md`, `API_SPEC.md`, `TESTING_GUIDE.md`, `TASKS.md`, `README.md`.
  - *Acceptance Criteria*: Mathematical formulations, API contracts, testing criteria, and project blueprints fully specified.

---

## Phase 1: Monorepo Scaffolding & Shared Types
- [x] **TASK-1.1: Initialize Monorepo Structure & Package Configs**
  - *Input*: Turborepo configuration and package layout per `TECH_STACK.md`.
  - *Output*: Root `package.json`, `turbo.json`, `/apps/web`, `/apps/api`, `/packages/wasm-engine`, `/packages/quantum-ast`.
  - *Acceptance Criteria*: Running `npm install` installs all workspace packages cleanly without dependency conflicts.
- [x] **TASK-1.2: Implement Shared Quantum Circuit IR TypeScript Types**
  - *Input*: Circuit AST definitions from `ARCHITECTURE.md`.
  - *Output*: `/packages/quantum-ast/src/types.ts` defining `QuantumCircuitIR`, `CircuitStep`, `GateOperation`, `MeasurementResult`.
  - *Acceptance Criteria*: Types compile cleanly under TypeScript strict mode; exported for use across `apps/web`.

---

## Phase 2: Rust WebAssembly Quantum Simulation Engine
- [x] **TASK-2.1: Implement Core Statevector & Complex Number Engine**
  - *Input*: Mathematical formulas from `SIMULATION_SPEC.md`.
  - *Output*: `packages/wasm-engine/src/statevector.rs` supporting $1$ to $16$ qubits ($2^n$ `Complex64` buffer) initialized to $|00\dots0\rangle$.
  - *Acceptance Criteria*: Statevector normalization $\sum |\alpha_i|^2 = 1.0$ verified.
- [x] **TASK-2.2: Implement Unitary Gate Operations**
  - *Input*: Gate matrices from `SIMULATION_SPEC.md` ($H, X, Y, Z, S, T, CX, CZ, SWAP, R_x, R_y, R_z, U_3$).
  - *Output*: `packages/wasm-engine/src/gates.rs` using in-place amplitude pair updates.
  - *Acceptance Criteria*: Bell state and GHZ state test suites pass with zero floating-point drift.
- [x] **TASK-2.3: Implement Partial Trace & Bloch Vector Projections**
  - *Input*: Reduced density matrix equations from `SIMULATION_SPEC.md`.
  - *Output*: `packages/wasm-engine/src/bloch.rs` calculating $(x_k, y_k, z_k)$ and purity $r_k$ for every qubit $k$.
  - *Acceptance Criteria*: Single-qubit $|0\rangle, |1\rangle, |+\rangle, |-\rangle, |+i\rangle, |-i\rangle$ yield exact expected $(x, y, z)$ unit vectors.
- [x] **TASK-2.4: WASM Bindings & Web Worker Wrapper**
  - *Input*: Rust engine compiled with `wasm-pack build --target web`.
  - *Output*: `apps/web/src/workers/quantum.worker.ts` providing asynchronous simulation via `postMessage`.
  - *Acceptance Criteria*: Main UI thread remains at 60 FPS while worker simulates circuit with zero jank.

---

## Phase 3: Dual-Sync Circuit Canvas & Monaco Editor
- [x] **TASK-3.1: Build Interactive Circuit Grid Canvas**
  - *Input*: UI design tokens and React components.
  - *Output*: `apps/web/src/components/canvas/CircuitCanvas.tsx` with dynamic qubit wires, time-step columns, drag-and-drop gate palette, and parameter sliders.
  - *Acceptance Criteria*: Users can add, move, delete gates and modify rotation angles smoothly.
- [x] **TASK-3.2: Implement AST Transpiler (Canvas $\leftrightarrow$ Qiskit / OpenQASM 3.0 [Cirq & PennyLane in v2])**
  - *Input*: `QuantumCircuitIR` schemas.
  - *Output*: `packages/quantum-ast/src/transpiler/` emitters and parsers for Qiskit and OpenQASM 3.0 (architected for v2 Cirq & PennyLane plugins).
  - *Acceptance Criteria*: Transpiler round-trip test passes: Canvas edits reflect in Python Qiskit and OpenQASM 3.0 code, typing valid code updates canvas nodes without loops.
- [x] **TASK-3.3: Embed Monaco Editor with Syntax Highlighting & Diff Support**
  - *Input*: Monaco editor React wrapper.
  - *Output*: `apps/web/src/components/editor/QuantumCodeEditor.tsx` with language toggles (Qiskit, OpenQASM 3.0; Cirq & PennyLane badge-marked as v2 targets) and error squiggles.
  - *Acceptance Criteria*: Code changes update circuit canvas with 250ms debounce; invalid code shows inline non-intrusive warning.
- [x] **TASK-3.4: Dual-Sync Split View & Live Qiskit Python Code Visibility**
  - *Input*: `QuantumCodeEditor` and `CircuitCanvas` workspace integration.
  - *Output*: Real-time side-by-side Dual-Sync Split View mode in `CircuitCanvas.tsx`, View Mode switcher (`Dual-Sync` | `Canvas` | `Code`), reactivity to gate placements/deletions, explicit container heights eliminating Monaco 18px collapse, and expandable Qiskit snippets in Qu-Copilot.
  - *Acceptance Criteria*: Qiskit Python code is immediately visible on app load; dropping gates immediately updates the Python code; code editing immediately updates canvas wires.

---

## Phase 4: 3D Quantum State Inspector & Timeline Scrubber
- [x] **TASK-4.1: Build Interactive Three.js 3D Bloch Sphere**
  - *Input*: Three.js / React Three Fiber scene setup.
  - *Output*: `apps/web/src/components/visualizer/BlochSphere.tsx` with coordinate axes, translucent geodesic sphere, vector arrow, projection disks, and phase hue.
  - *Acceptance Criteria*: Rotations animate smoothly with `slerp`; axes and poles correctly labeled.
- [x] **TASK-4.2: Build 3D Q-Sphere Multi-Qubit Visualizer**
  - *Input*: Multi-qubit statevector amplitudes.
  - *Output*: `apps/web/src/components/visualizer/QSphere.tsx` mapping $2^n$ basis states with amplitude node sizing and phase color mapping.
  - *Acceptance Criteria*: Bell states show two equal nodes at $|00\rangle$ and $|11\rangle$ with matching phases.
- [x] **TASK-4.3: Implement Step-by-Step Quantum Time-Travel Scrubber**
  - *Input*: Intermediate statevector snapshots from WASM worker.
  - *Output*: `apps/web/src/components/canvas/TimelineScrubber.tsx` with Play/Pause, Step Forward, Step Back, and speed slider.
  - *Acceptance Criteria*: Scrubbing to step $k$ instantly updates the 3D Bloch sphere and probability histogram to that exact moment.

---

## Phase 5: Qu-Copilot AI Quantum Tutor & Verified Circuit Generation
- [x] **TASK-5.1: Implement Quantum AST Parser & Pre-Execution Filter**
  - *Input*: AI-generated Python code string.
  - *Output*: `apps/api/services/verifier.py` and AST transpiler converting code into canonical `QuantumCircuitIR`.
  - *Acceptance Criteria*: Catches syntax errors and non-unitary operations before simulation.
- [x] **TASK-5.2: Implement Unitary Matrix & State Fidelity Verifier ($F \ge 0.999$)**
  - *Input*: Candidate circuit vs target specification.
  - *Output*: `apps/api/services/verifier.py` evaluating state fidelity $F = |\langle\psi_t|\psi_s\rangle|^2$.
  - *Acceptance Criteria*: Guarantees Verified Circuit Generation — mathematically validates circuit suggestions before displaying them to students; rejects unphysical circuits and triggers self-correction loop.
- [x] **TASK-5.3: Build Qu-Copilot Chat UI with Verified Diff Apply**
  - *Input*: Streaming SSE chat endpoint.
  - *Output*: `apps/web/src/components/copilot/QuCopilot.tsx` with chat history, LaTeX math rendering, code snippets, and one-click "Apply to Canvas" button.
  - *Acceptance Criteria*: Learner receives verified quantum explanations and can import suggested circuits directly into their workspace.
- [x] **TASK-5.4: Qu-Copilot Design Fault & Layout Refactor**
  - *Input*: Browser audit of Qu-Copilot UX and layout overflow.
  - *Output*: `apps/web/src/stores/useCopilotStore.ts`, updated `apps/web/src/components/copilot/QuCopilot.tsx`, updated `apps/web/src/app/page.tsx`, and updated `apps/web/tailwind.config.ts`.
  - *Acceptance Criteria*: Fixed unconstrained vertical layout expansion with internal scroll (`min-h-0 flex-1 overflow-y-auto`); pinned prompt chips and input bar to the bottom; header close `✕` and clear conversation controls; persistent state in `useCopilotStore` across collapse/reopen; mini gate preview badges (`H(q0) -> CX(q0->q1)`); instant "Applied to Circuit Canvas! ✓" confirmation; and removed misplaced collapse button from bottom inspector tabs.
- [x] **TASK-5.5: Anti-AI-Slop Superconducting Workstation Aesthetic Overhaul**
  - *Input*: Anti-AI-slop skills (`hallmark` 58-gate validation suite and `frontend-design` aesthetic restraint) and user requirement to eliminate generic hackathon AI slop.
  - *Output*: `.agents/skills/hallmark/`, `.agents/skills/frontend-design/`, `.agents/rules/anti-ai-slop.md`, refactored `globals.css`, `Header.tsx`, `GatePalette.tsx`, `CircuitCanvas.tsx`, `TimelineScrubber.tsx`, `QuCopilot.tsx`, `page.tsx`, `QuantumCodeEditor.tsx`, `BlochSphere.tsx`, `QSphere.tsx`, `ProbabilityHistogram.tsx`, `StatevectorTable.tsx`.
  - *Acceptance Criteria*: Eliminated spinning atom logos, neon purple-to-cyan text gradients, floating candy pill buttons, and blurry glassmorphism; replaced with cryogenic void `#06080e`, copper/slate wire rails (`#222d42`), tactile gate depression (`active:translate-y-[1px]`), hardware transport scrubber, monospaced coordinate telemetry, and verified against all 10 anti-slop gates.
- [x] **TASK-5.6: Layout & Typography Overhaul via Agent Skills (better-typography, better-layout, better-ui)**
  - *Input*: Discovered premier UI agent skills (`better-typography`, `better-layout`, `better-ui` from Jakub Krehel) and user requirement to overhaul layout and typography.
  - *Output*: `.agents/skills/better-typography/`, `.agents/skills/better-layout/`, `.agents/skills/better-ui/`, corrected font mapping in `tailwind.config.ts` (JetBrains Mono + Inter OpenType `cv02`, `cv03`, `cv11`, `tnum`), concentric border radii formula ($R_{\text{outer}} = R_{\text{inner}} + \text{padding}$), categorized hardware gate modules with micro-labels, full-width default canvas view mode, non-clipped responsive Dual-Sync Code Studio header, and interactive quantum protocol starter cards eliminating the empty Qu-Copilot void.
  - *Acceptance Criteria*: Zero text clipping in split view; crisp JetBrains Mono on all telemetry/code; `tabular-nums` on all coordinates/timings; 100% production build pass (`next build`); visual verification in browser with 0 errors.
- [x] **TASK-5.7: Layout & Typography Upgrade with Top Design Skills (better-interface, better-colors, better-accessibility, frontend-ui-engineering, design-tokens)**
  - *Input*: Deep search of top frontend & UI/UX engineering skills (`jakubkrehel/skills`, `addyosmani/agent-skills`, `plugin87/ux-ui-agent-skills`).
  - *Output*: `.agents/skills/better-interface/`, `.agents/skills/better-colors/`, `.agents/skills/better-accessibility/`, `.agents/skills/frontend-ui-engineering/`, `.agents/skills/design-tokens/`, updated `globals.css` with semantic typography tokens and focus rings, 3-zone header with 2x gap rule, 34px gate palette chips, 2px canvas wire rails, unified transport scrubber controls, accessible chat input in Qu-Copilot, and high-contrast HUD overlays on 3D visualizers.
  - *Acceptance Criteria*: WCAG 2.2 AA compliance, target size $\ge 34\text{px}$, 100% TypeScript compile pass, AST tests pass, and complete browser subagent visual verification with zero regressions.

---

## Phase 6: Quest Labs & Gamification Arena
- [x] **TASK-6.1: Build Quest Catalog for Tracks 1 & 2**
  - *Input*: Foundations & Entanglement curriculum.
  - *Output*: `apps/web/src/content/quests/` containing structured JSON labs for Superposition, Pauli Gates, Bell States, and Teleportation.
  - *Acceptance Criteria*: Each quest specifies starting circuit, target state fidelity, explanation markdown, and XP rewards.
- [x] **TASK-6.2: Build Quantum Bug-Hunting Sandbox**
  - *Input*: Broken circuit challenges (e.g. inverted CNOT, missing phase kickback).
  - *Output*: Interactive challenge screen where student must diagnose and patch the circuit to reach $F \ge 0.999$.
  - *Acceptance Criteria*: Automated grader evaluates submission upon clicking "Run Verification" and rewards XP on success.
- [x] **TASK-6.3: Implement Daily Streaks & Redis Leaderboard Engine**
  - *Input*: User completions and XP transactions.
  - *Output*: `apps/api/routers/arena.py` managing Redis Sorted Sets for national and college-level rankings.
  - *Acceptance Criteria*: Leaderboard queries resolve in $<20$ms; streak counter increments on daily activity.

---

## Phase 7: Verification, Polish & National Quantum Mission Deployment
- [x] **TASK-7.1: Implement Cryptographically Signed Micro-Credentials**
  - *Input*: Completed track requirements.
  - *Output*: Ed25519 digitally signed certificate with unique QR code verification URL.
  - *Acceptance Criteria*: Certificate signature validates against public key; tampering invalidates verification.
- [x] **TASK-7.2: PWA Offline Mode & Service Worker Caching**
  - *Input*: Next.js PWA configuration.
  - *Output*: Service Worker caching static assets, quest labs, and WebAssembly binary.
  - *Acceptance Criteria*: User can disconnect WiFi and fully design circuits and simulate $\le 16$ qubits locally.
- [ ] **TASK-7.3: Comprehensive End-to-End System Test & Demonstration**
  - *Input*: Complete platform workflow.
  - *Output*: Automated Playwright test covering: Quest selection $\to$ Canvas gate placement $\to$ 3D Bloch update $\to$ AI explanation $\to$ Grader submission.
  - *Acceptance Criteria*: All automated tests pass with 0 failures.
