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

#### 2.5.1 Pipeline Topology & Self-Correction Loop
```
[ Learner Query / Stuck Circuit ]
             │
             ▼
[ Hybrid Retriever: Vector Store (Nielsen & Chuang, Preskill, Qiskit Docs) ]
             │
             ▼
[ LLM Generator: Google Gemini 2.5 Flash (Fallback: Gemini 2.5 Pro) ]
             │
             ▼
[ Quantum AST Validator (Syntax, Wire Index Bounds, Unitary Determinant) ]
             │
             ▼
[ Background Fast Simulation: Evaluate State Fidelity F = |<ψ_t|ψ_s>|² ]
             │
      F >= 0.999 ?
     ┌───────┴────────────────────────────────────────┐
     ▼ (YES)                                          ▼ (NO: Verification Failed)
[ Present Verified Circuit ]             [ Iteration Counter < 3 ? ]
[ & Grounded Explanation   ]              ┌───────────┴───────────┐
                                          ▼ (YES)                 ▼ (NO: Max Retries Exceeded)
                              [ Self-Reflection Loop: ]   [ Graceful Fallback: ]
                              [ Feed error diagnostic ]   [ • Emit warning message ]
                              [ back to LLM prompt    ]   [ • Present closest canonical circuit ]
                                                          [ • Anchor to textbook citation ]
```

#### 2.5.2 Convergence Guarantees & Fallback Protocol
1. **Model Hierarchy**:
   - **Tier 1 (Fast Generator)**: Google Gemini 2.5 Flash executes initial AST generation and conversational tutoring with sub-500ms time-to-first-token.
   - **Tier 2 (Deep Reasoner)**: If the first attempt fails unitary verification, Google Gemini 2.5 Pro is invoked with the failure diagnostics (e.g. uncomputed ancilla, phase sign inversion) for deep quantum gate synthesis.
2. **Convergence Bounds**:
   - The self-correction loop is strictly capped at **3 iterations**.
   - If $F < 0.999$ persists after 3 cycles, the engine triggers **Graceful Degradation**:
     - Displays: *"Qu-Copilot was unable to synthesize a validated circuit matching your exact target specification ($F < 0.999$)."*
     - Injects the nearest canonical reference circuit from the pre-verified curriculum repository.
     - Cites specific authoritative literature sections (e.g., *Nielsen & Chuang, Quantum Computation and Quantum Information, Section 4.5*).
3. **Hallucination-Proof Explanation Grounding**:
   - The LLM explanation text is strictly bound to retrieved context chunks using citation anchors `[ref:N&C-4.3]`. Unsubstantiated claims trigger automated red-flag filters before user presentation.

### 2.6 State Fidelity Grader (The Automated Evaluator)
Instead of matching Python strings, the Quantangle grading engine evaluates circuits mathematically:
1. Simulates student circuit $\to$ obtains statevector $|\psi_{\text{student}}\rangle$.
2. Simulates reference circuit $\to$ obtains target statevector $|\psi_{\text{target}}\rangle$.
3. Computes Quantum State Fidelity:
   $$F = |\langle\psi_{\text{target}}|\psi_{\text{student}}\rangle|^2$$
4. A submission passes if $F \ge 0.999$.
5. Evaluates circuit depth and gate count for leaderboard rankings (bonus XP for minimal 2-qubit gate depth).

### 2.7 Universal Design & Accessibility Engine
To deliver an inclusive experience compliant with WCAG 2.1 AA and National Quantum Mission workforce goals:
1. **Keyboard-First Virtual Focus Bus**:
   - The circuit canvas implements a 2D virtual coordinate grid (`wireIndex`, `timeStepIndex`).
   - Standard directional controls (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) traverse coordinates without DOM reflow.
   - Shortcut palette: `H`, `X`, `Y`, `Z`, `C` (CNOT control), `T` (target), `R` (rotation dialog), `Delete` (remove gate).
2. **ARIA Live Quantum State Narrator**:
   - Implements an invisible `aria-live="polite"` speech region.
   - Whenever gates are placed or scrubbed, the engine synthesizes mathematical states into clear natural language:
     - *"Step 2: Applied Hadamard to Qubit 0. Qubit 0 is now in an equal superposition of state 0 and state 1 with zero relative phase."*
3. **Multimodal State & Phase Encoding**:
   - State amplitudes and phase angles do not rely on color hue alone.
   - Each phase bracket is encoded via **dual-channel visual tokens**:
     - *Color Channel*: Okabe-Ito color-blind safe 12-tier palette.
     - *Pattern Channel*: Distinct SVG fill patterns (dots for $0$, diagonal stripes for $\pi/2$, cross-hatch for $\pi$, horizontal waves for $-\pi/2$).
     - *Glyph Channel*: Directional phase-clock vector rendered inside each state node.

### 2.8 Zero-Trust Cloud Execution & Sandboxing Architecture
To safeguard infrastructure and student data:
1. **gVisor / Firecracker Container Isolation**:
   - Cloud simulation jobs (Qiskit Aer $>16$ qubits, v2 PennyLane optimization) run inside ephemeral, unprivileged microVM containers.
   - Hard cgroup constraints: 10 seconds maximum CPU wall time, 512MB RAM ceiling, non-root user execution (`nobody:nogroup`).
   - Network namespace is completely sandboxed: zero external network egress (`--net=none`), preventing data exfiltration or socket scraping.
2. **Token Bucket Rate Limiting (Redis Gateway)**:
   - Every API consumer is rate-limited via a Redis-backed token bucket:
     - Cloud Simulation (`/api/v1/sim/cloud`): 10 requests / minute per user.
     - Qu-Copilot Chat (`/api/v1/copilot/chat`): 30 requests / minute per user.
   - Exceeded limits yield HTTP `429 Too Many Requests` with a descriptive `Retry-After` header.
3. **Data Privacy & DPDP Act 2023 Compliance**:
   - Explicit user consent for learning analytics collection; data minimization principle strictly enforced.
   - At-rest encryption using AES-256-GCM for student profiles and grades; TLS 1.3 enforced for all transport.
   - Automated cryptographic audit logging (SHA-256) of all credential issuances and AI verification results.

---

## 3. Communication Protocols

| Component Link | Protocol | Payload | Latency Target |
|---|---|---|---|
| Main Thread $\leftrightarrow$ WASM Worker | `postMessage` (Transferable ArrayBuffer) | Circuit IR $\to$ Statevector Amplitudes | $< 15$ms |
| Frontend $\leftrightarrow$ FastAPI Cloud Sim | WebSocket / HTTP POST | Circuit IR $\to$ Aer Shots/Density Matrix | $< 200$ms |
| Frontend $\leftrightarrow$ Qu-Copilot AI | Server-Sent Events (SSE) | Streamed Markdown + Verified Circuit JSON | $< 500$ms TTFT |
| Frontend $\leftrightarrow$ Arena Leaderboard | Redis Pub/Sub / WebSocket | Real-time score updates & rank shifts | $< 100$ms |
