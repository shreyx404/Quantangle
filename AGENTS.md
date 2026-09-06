# AGENTS.md — Quantangle AI Agent Operating Protocol

> **Universal Manifesto for Autonomous AI Coding Agents & Vibe Coders**  
> Targets: Antigravity, Cursor, Windsurf, Claude Code, Copilot Workspace, Roo Code, Aider, and custom LLM agents.

---

## 1. Prime Directive

You are working on **Quantangle**, an ultra-interactive, AI-guided Quantum Computing learning and multi-engine simulation platform designed for the Smart India Hackathon (SIH 2026 Problem Statement `SIH26140`).

Your goal is to build an educational deep-tech platform combining:
1. **Dual-Sync Circuit Designer** (Visual Drag-and-Drop $\leftrightarrow$ Bi-directional AST $\leftrightarrow$ Python Qiskit/Cirq/PennyLane/OpenQASM 3.0).
2. **0-Latency Edge Simulation Engine** (Client-side Rust WebAssembly running $\le 16$ qubit statevector calculations in Web Workers).
3. **Cloud Simulation Hub** (FastAPI backend handling $>16$ qubits, noisy simulation via Qiskit Aer, and variational algorithms via PennyLane).
4. **3D Quantum State Inspector** (Three.js WebGL rendering of multi-qubit Bloch Spheres, Q-Spheres, and Density Matrices with gate-by-gate timeline scrubbing).
5. **Qu-Copilot AI Tutor** (RAG-assisted quantum debugger with pre-execution AST & Unitary Matrix Verification guaranteeing zero hallucinations).
6. **Gamified Quest Arena** (Bite-sized quest rooms, daily streaks, circuit depth optimization battles, and verifiable credentials).

---

## 2. The Agent Workflow Loop (Every Session)

Whenever you (the AI agent) begin a new turn or pick up a task, follow this exact 5-step loop:

```
┌────────────────────────────────────────────────────────┐
│ 1. READ ACTIVE_CONTEXT.md                              │
│    Understand current progress, active focus & blockers│
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. CHECK TASKS.md                                      │
│    Pick the first unchecked [ ] task in current phase │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. CONSULT SPECS                                       │
│    Read ARCHITECTURE.md, SIMULATION_SPEC.md,           │
│    SYSTEM_PATTERNS.md, or API_SPEC.md as needed        │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. IMPLEMENT & VERIFY                                  │
│    Write clean code, run tests per TESTING_GUIDE.md,   │
│    verify quantum state fidelity F >= 0.999            │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. UPDATE ACTIVE_CONTEXT.md & TASKS.md                 │
│    Mark task [x], document changes, state next task    │
└────────────────────────────────────────────────────────┘
```

---

## 3. Strict Architectural Rules & Guardrails

1. **Quantum Endianness Rule (NON-NEGOTIABLE)**:
   - Quantangle follows standard **Little-Endian (Qiskit standard)** convention for qubit indexing:
     $$|q_{n-1} \dots q_1 q_0\rangle$$
     where Qubit 0 is the Least Significant Bit (LSB).
   - In statevector arrays of length $2^n$, index `0` represents $|00\dots0\rangle$, index `1` represents $|00\dots1\rangle$ (qubit 0 is 1), index `2` represents $|00\dots10\rangle$ (qubit 1 is 1).
   - Never reverse or mix up endianness between the Rust-WASM engine, canvas, and code editor. See [SIMULATION_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SIMULATION_SPEC.md).

2. **Zero-Hallucination AI Rule**:
   - Never show AI-generated circuit fixes to a learner without passing the **Unitary Verification Pipeline**.
   - A circuit suggestion must be evaluated against the target unitary or state fidelity $F = |\langle\psi_t|\psi_s\rangle|^2 \ge 0.999$. If it fails, trigger the internal self-correction loop.

3. **No Heavy Computation on the Main UI Thread**:
   - Statevector simulations ($\le 16$ qubits) must run in a dedicated **Web Worker** via WebAssembly (`wasm-bindgen`).
   - The Three.js 3D render loop (`requestAnimationFrame`) must never be blocked by quantum matrix multiplication.

4. **Bi-Directional AST Synchronization**:
   - The Canvas (visual node-wire model) and Monaco Editor (code) communicate via a single source of truth: the **Quantum Circuit Intermediate Representation (IR)** JSON AST.
   - User edits canvas $\rightarrow$ updates AST $\rightarrow$ code generator outputs Python/OpenQASM.
   - User types code $\rightarrow$ parser generates AST $\rightarrow$ canvas re-renders nodes.

5. **No Placeholders or Fake Stubs**:
   - Do not write mock algorithms with `// TODO: implement later` or hardcoded fake probability arrays when completing a task.
   - Implement authentic linear algebra (complex matrix multiplication, Kronecker products) or use designated helper libraries.

---

## 4. How to Handle Errors & Blockers

- If a test fails: Do NOT mark the task complete in [TASKS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TASKS.md). Fix the root cause.
- If an architectural trade-off arises: Document the decision in [ACTIVE_CONTEXT.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ACTIVE_CONTEXT.md) under "Open Decisions".
- If quantum math fails: Check [SIMULATION_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SIMULATION_SPEC.md) for gate matrix matrices and phase factor conventions ($\pm i$, $\frac{1}{\sqrt{2}}$, $e^{i\theta}$).

---

## 5. File System & Documentation Map

- **Ground Rules**: [AGENTS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/AGENTS.md) (this file)
- **Fast CLI & Claude Cheatsheet**: [CLAUDE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/CLAUDE.md)
- **Cursor / Vibe Rules**: [.cursorrules](file:///c:/Users/shrey/Downloads/SIH%20Ideation/.cursorrules)
- **Live Context Memory**: [ACTIVE_CONTEXT.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ACTIVE_CONTEXT.md)
- **Product Requirements**: [PRD.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/PRD.md)
- **System Architecture**: [ARCHITECTURE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ARCHITECTURE.md)
- **Design Patterns & Standards**: [SYSTEM_PATTERNS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SYSTEM_PATTERNS.md)
- **Tech Stack & Tooling**: [TECH_STACK.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TECH_STACK.md)
- **Quantum Simulation Mathematics**: [SIMULATION_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SIMULATION_SPEC.md)
- **API Contracts (REST & WebSockets)**: [API_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/API_SPEC.md)
- **Self-Testing & Verification**: [TESTING_GUIDE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TESTING_GUIDE.md)
- **Atomic Implementation Roadmap**: [TASKS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TASKS.md)
