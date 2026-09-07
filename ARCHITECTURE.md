# ARCHITECTURE.md — Quantangle System Architecture & Design

> Comprehensive Technical Architecture, Data Flows, and Subsystem Specifications for **Quantangle**.

---

## 1. High-Level System Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND LAYER (Next.js 14 / React 18)                   │
│                                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────────────────────┐  │
│  │ Dual-Sync Canvas      │  │ Code Editor          │  │ 3D State Visualizer         │  │
│  │ (Interactive Gates,   │  │ (Monaco Editor       │  │ (Three.js / WebGL           │  │
│  │  Wires, Param Sliders)│  │  Python/OpenQASM 3)  │  │  Bloch Sphere & Q-Sphere)   │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────────────┬──────────────┘  │
│              │                         │                             │                 │
│              └─────────────────────────┼─────────────────────────────┘                 │
│                                        ▼                                               │
│                        Bi-Directional AST & Transpiler                                 │
│                   (Single Source of Truth: Circuit JSON IR)                            │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼ (<= 16 Qubits / Interactive)                  ▼ (> 16 Qubits / Noisy / VQE)
┌──────────────────────────────────┐            ┌────────────────────────────────────────┐
│  EDGE LAYER (Client WebAssembly) │            │     BACKEND CLOUD SERVICES (FastAPI)   │
│  • Rust-based Statevector Sim    │            │  ┌──────────────────────────────────┐  │
│  • Dedicated Web Worker (0ms UI) │            │  │ Cloud Simulation Engine          │  │
│  • Step-by-Step State Inspector  │            │  │ (Qiskit Aer [MVP]; PennyLane v2) │  │
│  • PWA IndexedDB Offline Cache   │            │  └──────────────────────────────────┘  │
└──────────────────────────────────┘            │  ┌──────────────────────────────────┐  │
                                                │  │ Qu-Copilot AI & Quantum RAG      │  │
                                                │  │ • Verified Circuit Generation    │  │
                                                │  │ • Unitary Verifier (F >= 0.999)  │  │
                                                │  └──────────────────────────────────┘  │
                                                │  ┌──────────────────────────────────┐  │
                                                │  │ Automated Arena Grader           │  │
                                                │  │ • State Fidelity Grader          │  │
                                                │  │ • Redis Leaderboards & Streaks   │  │
                                                │  │ • Verifiable Credential Signer   │  │
                                                │  └──────────────────────────────────┘  │
                                                └──────────────────┬─────────────────────┘
                                                                   ▼
                                                ┌────────────────────────────────────────┐
                                                │ PERSISTENCE: PostgreSQL + Redis Cache  │
                                                └────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 The Intermediate Representation (Circuit JSON IR)
Both the visual canvas and the Monaco code editor sync to a single canonical AST representation:

```typescript
export interface QuantumCircuitIR {
  version: "1.0";
  qubits: number;
  clbits: number;
  steps: CircuitStep[];
}

export interface CircuitStep {
  stepIndex: number;
  operations: GateOperation[];
}

export interface GateOperation {
  id: string;
  gate: "H" | "X" | "Y" | "Z" | "S" | "T" | "CX" | "CZ" | "SWAP" | "RX" | "RY" | "RZ" | "U3" | "M";
  qubits: number[];         // e.g. [0] for single qubit, [0, 1] for CX (control=0, target=1)
  params?: number[];        // e.g. [theta] for RX, [theta, phi, lambda] for U3
  clbit?: number;           // Target classical bit for measurement 'M'
}
```

### 2.2 Bi-Directional Transpiler Pipeline
1. **Canvas $\to$ Code**:
   - Canvas dispatch actions mutate the Zustand Circuit Store.
   - The Transpiler compiles `QuantumCircuitIR` to:
     - **Qiskit (MVP)**: `QuantumCircuit(qubits, clbits)` + `qc.h(0)`, `qc.cx(0, 1)`, etc.
     - **OpenQASM 3.0 (MVP)**: Native `OPENQASM 3.0; include "stdgates.inc"; ...`
     - **PennyLane & Cirq (v2 Targets)**: `@qml.qnode(dev)` and `cirq.Circuit()` planned for v2 multi-SDK expansion.
2. **Code $\to$ Canvas**:
   - Monaco debounces user keystrokes (250ms).
   - AST parser parses Python Qiskit / OpenQASM 3.0 into `QuantumCircuitIR` (extensible to Cirq and PennyLane in v2).
   - If syntax and unitary validation succeed, the Canvas nodes and wires update dynamically.
   - If invalid syntax, a non-intrusive Monaco inline warning appears without breaking the canvas state.

### 2.3 Edge Simulation Engine (Rust WebAssembly)
- **Engine Architecture**:
  - Written in Rust using `wasm-bindgen` and `num-complex`.
  - Compiled to target `web` with release flags (`opt-level = 3`, `lto = true`).
- **Memory Layout**:
  - Statevector of $n$ qubits is a continuous buffer of $2^n \times 2$ float64 numbers (real and imaginary parts).
  - Pre-allocated memory up to 16 qubits ($2^{16} = 65,536$ amplitudes $\times 16$ bytes = 1.05 MB RAM).
- **Web Worker Offloading**:
  - The UI thread sends the `QuantumCircuitIR` over `postMessage`.
  - The Web Worker runs the step-by-step simulation and returns:
    1. Intermediate statevector array at every gate step.
    2. Final probability distribution.
    3. Density matrices and single-qubit Bloch vector coordinates $(x_k, y_k, z_k)$ for each qubit $k$.
  - Guarantees 0ms jank on the main thread and smooth 60 FPS Three.js rendering.

### 2.4 3D State Visualizer (Three.js / WebGL)
- **Bloch Sphere Rendering**:
  - Unit sphere with transparent geodesic mesh, coordinate axes ($X, Y, Z$), and state vector arrow.
  - Arrow coordinates calculated via partial trace:
    $$x_k = \text{Tr}(\rho_k X),\quad y_k = \text{Tr}(\rho_k Y),\quad z_k = \text{Tr}(\rho_k Z)$$
  - Projection disks on the $xy$ equatorial plane show phase angle $\phi = \text{atan2}(y, x)$.
- **Q-Sphere Multi-Qubit Visualizer**:
  - Represents full $n$-qubit statevector on a sphere.
  - Basis states $|00\dots0\rangle$ at North Pole, $|11\dots1\rangle$ at South Pole, Hamming weight layers in between.
  - Node markers scaled by $|\alpha_i|$ and colored by complex phase $\arg(\alpha_i)$ using an HSV color wheel.

### 2.5 Qu-Copilot RAG & Verified Circuit Generation Pipeline

> **Core Guarantee**: Every circuit suggestion is mathematically validated before being shown to the student.

```
[ Learner Query / Stuck Circuit ]
             │
             ▼
[ Hybrid Retriever: Qiskit Docs + Nielsen & Chuang Knowledge ]
             │
             ▼
[ LLM Generator (Code + Conceptual Explanation) ]
             │
             ▼
[ Quantum AST Validator (Syntax & Valid Unitary Check) ]
             │
             ▼
[ Background Fast Simulation (Target State vs AI State) ]
             │
      F >= 0.999 ?
     ┌───────┴───────┐
     ▼ (YES)         ▼ (NO: Verification Failed)
[ Present to ]   [ Self-Reflection Loop: ]
[  Learner   ]   [ "Discrepancy: missing phase kickback" ]
                 [ Re-prompt generator with error trace   ]
```

### 2.6 State Fidelity Grader (The Automated Evaluator)
Instead of matching Python strings, the Quantangle grading engine evaluates circuits mathematically:
1. Simulates student circuit $\to$ obtains statevector $|\psi_{\text{student}}\rangle$.
2. Simulates reference circuit $\to$ obtains target statevector $|\psi_{\text{target}}\rangle$.
3. Computes Quantum State Fidelity:
   $$F = |\langle\psi_{\text{target}}|\psi_{\text{student}}\rangle|^2$$
4. A submission passes if $F \ge 0.999$.
5. Evaluates circuit depth and gate count for leaderboard rankings (bonus XP for minimal 2-qubit gate depth).

---

## 3. Communication Protocols

| Component Link | Protocol | Payload | Latency Target |
|---|---|---|---|
| Main Thread $\leftrightarrow$ WASM Worker | `postMessage` (Transferable ArrayBuffer) | Circuit IR $\to$ Statevector Amplitudes | $< 15$ms |
| Frontend $\leftrightarrow$ FastAPI Cloud Sim | WebSocket / HTTP POST | Circuit IR $\to$ Aer Shots/Density Matrix | $< 200$ms |
| Frontend $\leftrightarrow$ Qu-Copilot AI | Server-Sent Events (SSE) | Streamed Markdown + Verified Circuit JSON | $< 500$ms TTFT |
| Frontend $\leftrightarrow$ Arena Leaderboard | Redis Pub/Sub / WebSocket | Real-time score updates & rank shifts | $< 100$ms |
