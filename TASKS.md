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
- [ ] **TASK-1.1: Initialize Monorepo Structure & Package Configs**
  - *Input*: Turborepo configuration and package layout per `TECH_STACK.md`.
  - *Output*: Root `package.json`, `turbo.json`, `/apps/web`, `/apps/api`, `/packages/wasm-engine`, `/packages/quantum-ast`.
  - *Acceptance Criteria*: Running `npm install` installs all workspace packages cleanly without dependency conflicts.
- [ ] **TASK-1.2: Implement Shared Quantum Circuit IR TypeScript Types**
  - *Input*: Circuit AST definitions from `ARCHITECTURE.md`.
  - *Output*: `/packages/quantum-ast/src/types.ts` defining `QuantumCircuitIR`, `CircuitStep`, `GateOperation`, `MeasurementResult`.
  - *Acceptance Criteria*: Types compile cleanly under TypeScript strict mode; exported for use across `apps/web`.

---

## Phase 2: Rust WebAssembly Quantum Simulation Engine
- [ ] **TASK-2.1: Implement Core Statevector & Complex Number Engine**
  - *Input*: Mathematical formulas from `SIMULATION_SPEC.md`.
  - *Output*: `packages/wasm-engine/src/statevector.rs` supporting $1$ to $16$ qubits ($2^n$ `Complex64` buffer) initialized to $|00\dots0\rangle$.
  - *Acceptance Criteria*: `cargo test` passes statevector normalization $\sum |\alpha_i|^2 = 1.0$.
- [ ] **TASK-2.2: Implement Unitary Gate Operations**
  - *Input*: Gate matrices from `SIMULATION_SPEC.md` ($H, X, Y, Z, S, T, CX, CZ, SWAP, R_x, R_y, R_z, U_3$).
  - *Output*: `packages/wasm-engine/src/gates.rs` using in-place amplitude pair updates.
  - *Acceptance Criteria*: Bell state and GHZ state test suites in `cargo test` pass with zero floating-point drift.
- [ ] **TASK-2.3: Implement Partial Trace & Bloch Vector Projections**
  - *Input*: Reduced density matrix equations from `SIMULATION_SPEC.md`.
  - *Output*: `packages/wasm-engine/src/bloch.rs` calculating $(x_k, y_k, z_k)$ and purity $r_k$ for every qubit $k$.
  - *Acceptance Criteria*: Single-qubit $|0\rangle, |1\rangle, |+\rangle, |-\rangle, |+i\rangle, |-i\rangle$ yield exact expected $(x, y, z)$ unit vectors.
- [ ] **TASK-2.4: WASM Bindings & Web Worker Wrapper**
  - *Input*: Rust engine compiled with `wasm-pack build --target web`.
  - *Output*: `apps/web/src/workers/quantum.worker.ts` providing asynchronous simulation via `postMessage`.
  - *Acceptance Criteria*: Main UI thread remains at 60 FPS while worker simulates 12-qubit circuit in $<50$ms.

---

## Phase 3: Dual-Sync Circuit Canvas & Monaco Editor
- [ ] **TASK-3.1: Build Interactive Circuit Grid Canvas**
  - *Input*: UI design tokens and React components.
  - *Output*: `apps/web/src/components/canvas/CircuitCanvas.tsx` with dynamic qubit wires, time-step columns, drag-and-drop gate palette, and parameter sliders.
  - *Acceptance Criteria*: Users can add, move, delete gates and modify rotation angles smoothly.
- [ ] **TASK-3.2: Implement AST Transpiler (Canvas $\leftrightarrow$ Qiskit / OpenQASM 3.0 [Cirq & PennyLane in v2])**
  - *Input*: `QuantumCircuitIR` schemas.
  - *Output*: `packages/quantum-ast/src/transpiler/` emitters and parsers for Qiskit and OpenQASM 3.0 (architected for v2 Cirq & PennyLane plugins).
  - *Acceptance Criteria*: Transpiler round-trip test passes: Canvas edits reflect in Python Qiskit and OpenQASM 3.0 code, typing valid code updates canvas nodes without loops.
- [ ] **TASK-3.3: Embed Monaco Editor with Syntax Highlighting & Diff Support**
  - *Input*: Monaco editor React wrapper.
  - *Output*: `apps/web/src/components/editor/QuantumCodeEditor.tsx` with language toggles (Qiskit, OpenQASM 3.0; Cirq & PennyLane badge-marked as v2 targets) and error squiggles.
  - *Acceptance Criteria*: Code changes update circuit canvas with 250ms debounce; invalid code shows inline non-intrusive warning.

---

## Phase 4: 3D Quantum State Inspector & Timeline Scrubber
- [ ] **TASK-4.1: Build Interactive Three.js 3D Bloch Sphere**
  - *Input*: Three.js / React Three Fiber scene setup.
  - *Output*: `apps/web/src/components/visualizer/BlochSphere.tsx` with coordinate axes, translucent geodesic sphere, vector arrow, projection disks, and phase hue.
  - *Acceptance Criteria*: Rotations animate smoothly with `slerp`; axes and poles correctly labeled.
- [ ] **TASK-4.2: Build 3D Q-Sphere Multi-Qubit Visualizer**
  - *Input*: Multi-qubit statevector amplitudes.
  - *Output*: `apps/web/src/components/visualizer/QSphere.tsx` mapping $2^n$ basis states with amplitude node sizing and phase color mapping.
  - *Acceptance Criteria*: Bell states show two equal nodes at $|00\rangle$ and $|11\rangle$ with matching phases.
- [ ] **TASK-4.3: Implement Step-by-Step Quantum Time-Travel Scrubber**
  - *Input*: Intermediate statevector snapshots from WASM worker.
  - *Output*: `apps/web/src/components/canvas/TimelineScrubber.tsx` with Play/Pause, Step Forward, Step Back, and speed slider.
  - *Acceptance Criteria*: Scrubbing to step $k$ instantly updates the 3D Bloch sphere and probability histogram to that exact moment.

---

## Phase 5: Qu-Copilot AI Quantum Tutor & Verified Circuit Generation
- [ ] **TASK-5.1: Implement Quantum AST Parser & Pre-Execution Filter**
  - *Input*: AI-generated Python code string.
  - *Output*: `apps/api/services/ast_parser.py` converting LLM code into canonical `QuantumCircuitIR`.
  - *Acceptance Criteria*: Catches syntax errors and non-unitary operations before simulation.
- [ ] **TASK-5.2: Implement Unitary Matrix & State Fidelity Verifier ($F \ge 0.999$)**
  - *Input*: Candidate circuit vs target specification.
  - *Output*: `apps/api/services/verifier.py` evaluating state fidelity $F = |\langle\psi_t|\psi_s\rangle|^2$.
  - *Acceptance Criteria*: Guarantees Verified Circuit Generation — mathematically validates circuit suggestions before displaying them to students; rejects unphysical circuits and triggers self-correction loop.
- [ ] **TASK-5.3: Build Qu-Copilot Chat UI with Verified Diff Apply**
  - *Input*: Streaming SSE chat endpoint.
  - *Output*: `apps/web/src/components/copilot/QuCopilot.tsx` with chat history, LaTeX math rendering, code snippets, and one-click "Apply to Canvas" button.
  - *Acceptance Criteria*: Learner receives verified quantum explanations and can import suggested circuits directly into their workspace.

---

## Phase 6: Quest Labs & Gamification Arena
- [ ] **TASK-6.1: Build Quest Catalog for Tracks 1 & 2**
  - *Input*: Foundations & Entanglement curriculum.
  - *Output*: `apps/web/src/content/quests/` containing structured JSON labs for Superposition, Pauli Gates, Bell States, and Teleportation.
  - *Acceptance Criteria*: Each quest specifies starting circuit, target state fidelity, explanation markdown, and XP rewards.
- [ ] **TASK-6.2: Build Quantum Bug-Hunting Sandbox**
  - *Input*: Broken circuit challenges (e.g. inverted CNOT, missing phase kickback).
  - *Output*: Interactive challenge screen where student must diagnose and patch the circuit to reach $F \ge 0.999$.
  - *Acceptance Criteria*: Automated grader evaluates submission upon clicking "Run Verification" and rewards XP on success.
- [ ] **TASK-6.3: Implement Daily Streaks & Redis Leaderboard Engine**
  - *Input*: User completions and XP transactions.
  - *Output*: `apps/api/routers/arena.py` managing Redis Sorted Sets for national and college-level rankings.
  - *Acceptance Criteria*: Leaderboard queries resolve in $<20$ms; streak counter increments on daily activity.

---

## Phase 7: Verification, Polish & National Quantum Mission Deployment
- [ ] **TASK-7.1: Implement Cryptographically Signed Micro-Credentials**
  - *Input*: Completed track requirements.
  - *Output*: Ed25519 digitally signed certificate with unique QR code verification URL.
  - *Acceptance Criteria*: Certificate signature validates against public key; tampering invalidates verification.
- [ ] **TASK-7.2: PWA Offline Mode & Service Worker Caching**
  - *Input*: Next.js PWA configuration.
  - *Output*: Service Worker caching static assets, quest labs, and WebAssembly binary.
  - *Acceptance Criteria*: User can disconnect WiFi and fully design circuits and simulate $\le 16$ qubits locally.
- [ ] **TASK-7.3: Comprehensive End-to-End System Test & Demonstration**
  - *Input*: Complete platform workflow.
  - *Output*: Automated Playwright test covering: Quest selection $\to$ Canvas gate placement $\to$ 3D Bloch update $\to$ AI explanation $\to$ Grader submission.
  - *Acceptance Criteria*: All automated tests pass with 0 failures.
