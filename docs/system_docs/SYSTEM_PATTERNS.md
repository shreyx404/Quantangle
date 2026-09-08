# SYSTEM_PATTERNS.md — Architecture Standards & Coding Patterns

> **Design Patterns, Coding Conventions, and Best Practices for Quantangle Developers and AI Agents.**

---

## 1. State Management Patterns (Zustand Stores)

Quantangle isolates state into specialized, decoupled Zustand stores:

### 1.1 `useCircuitStore` (Single Source of Truth for Circuit IR)
```typescript
interface CircuitState {
  numQubits: number;
  numClbits: number;
  steps: CircuitStep[];
  selectedStep: number | null;
  targetSDK: "qiskit" | "qasm3" | "cirq" | "pennylane"; // MVP: "qiskit" | "qasm3"; v2 targets: "cirq" | "pennylane"
  
  // Actions
  addGate: (stepIndex: number, gate: GateOperation) => void;
  removeGate: (stepIndex: number, gateId: string) => void;
  setQubits: (n: number) => void;
  setSelectedStep: (step: number | null) => void;
  setTargetSDK: (sdk: "qiskit" | "qasm3" | "cirq" | "pennylane") => void;
  loadCircuitFromIR: (ir: QuantumCircuitIR) => void;
}
```
- **Rule**: Every mutation to `useCircuitStore` automatically triggers a debounced simulation dispatch to the Web Worker.

### 1.2 `useSimulationStore` (Simulation Results & Step States)
```typescript
interface SimulationState {
  isRunning: boolean;
  stepStates: StepStateResult[];   // Statevector, Bloch vectors, probabilities per step
  activeStep: number;             // Current timeline scrubber index
  error: string | null;
  
  setStepStates: (results: StepStateResult[]) => void;
  setActiveStep: (step: number) => void;
}
```

---

## 2. Web Worker & WebAssembly Communication Pattern

To guarantee zero main-thread lag:
1. Initialize the Web Worker once via a custom hook `useQuantumWorker`.
2. Pass data via `Transferable` Float64Array buffers whenever possible.
3. Message structure:

```typescript
// Worker Request
export type WorkerRequest = 
  | { type: "SIMULATE_CIRCUIT"; id: string; payload: QuantumCircuitIR }
  | { type: "EVALUATE_FIDELITY"; id: string; targetIR: QuantumCircuitIR; studentIR: QuantumCircuitIR };

// Worker Response
export type WorkerResponse = 
  | { type: "SIMULATION_SUCCESS"; id: string; results: StepStateResult[] }
  | { type: "SIMULATION_ERROR"; id: string; error: string }
  | { type: "FIDELITY_RESULT"; id: string; fidelity: number; passed: boolean };
```

---

## 3. Three.js / WebGL Visualizer Patterns

When building or editing 3D visualizers (Bloch Sphere, Q-Sphere):
1. **Clean Resource Disposal**:
   - Always hook into cleanup lifecycle:
   ```typescript
   useEffect(() => {
     return () => {
       geometry.dispose();
       material.dispose();
       renderer.dispose();
     };
   }, []);
   ```
2. **Phase Angle Hue Color Mapping**:
   - Map phase $\phi \in [-\pi, \pi]$ to an HSV color circle:
     $$\text{Hue} = \frac{\phi + \pi}{2\pi} \times 360^\circ$$
   - A phase of $0$ is red, $\pi/2$ is green/cyan, $\pi$ is blue/violet, $-\pi/2$ is amber.
3. **Smooth Slerp Interpolation**:
   - When the user scrubs between steps, do not snap the Bloch vector abruptly. Use spherical linear interpolation (`Quaternion.slerp`) with a 200ms easing curve.

---

## 4. AST Synchronization & Reconciliation Pattern

To avoid infinite update loops between Canvas and Monaco Editor:
- **Canvas $\to$ Code**:
  - Sets a synchronization flag `isCanvasOrigin = true`.
  - Transpiles `QuantumCircuitIR` to code string.
  - Updates Monaco editor value without triggering editor change listener.
  - Clears flag on next microtask.
- **Code $\to$ Canvas**:
  - Debounces input by `250ms`.
  - Checks if code was modified from Monaco editor directly.
  - Parses into `QuantumCircuitIR`.
  - Compares hash of new IR with current IR in `useCircuitStore`. If identical, skips update.
  - If different and valid, updates `useCircuitStore`.

---

## 5. Error Handling & Quantum Guardrails

1. **Custom Error Classes**:
   - `QuantumSyntaxError`: Invalid gate name or wrong qubit wire index.
   - `NonUnitaryError`: Matrix determinant is not 1 or $U^\dagger U \ne I$.
   - `DimensionMismatchError`: Attempting multi-qubit gate on disconnected qubits.
2. **Graceful UI Fallbacks**:
   - If user code has a syntax error, show an inline Monaco squiggle marker with an actionable explanation, but keep the previous valid circuit rendered on canvas.
   - Never crash the React component tree or blank the screen.

---

## 6. Directory & File Organization Standards

```
quantangle/
├── apps/
│   ├── web/                     # Next.js 14 Frontend
│   │   ├── src/
│   │   │   ├── app/             # App Router pages (routes: /designer, /arena, /quests)
│   │   │   ├── components/
│   │   │   │   ├── canvas/      # Circuit grid, wires, gate pills, parameter dialogs
│   │   │   │   ├── visualizer/  # Three.js Bloch Sphere, Q-Sphere, Density Matrix
│   │   │   │   ├── editor/      # Monaco editor wrapper, SDK language toggle
│   │   │   │   ├── copilot/     # Qu-Copilot chat UI, verified diff view
│   │   │   │   └── arena/       # Quest cards, streak trackers, leaderboards
│   │   │   ├── stores/          # Zustand stores (useCircuitStore, useSimulationStore)
│   │   │   ├── workers/         # Web Worker script & WASM loader
│   │   │   ├── transpiler/      # AST parsers & emitters (MVP: Qiskit, QASM3; v2: PennyLane, Cirq)
│   │   │   └── types/           # Shared TypeScript interfaces (IR, simulation types)
│   └── api/                     # Python FastAPI Backend
│       ├── routers/             # Endpoints (/sim, /copilot, /arena, /credentials)
│       ├── services/            # Qiskit Aer, RAG pipeline & unitary verifier (v2: PennyLane VQE engine)
│       └── models/              # Pydantic schemas
└── packages/
    └── wasm-engine/             # Rust Statevector & Density Matrix Simulator
        ├── src/
        │   ├── lib.rs           # WASM bindings & entry point
        │   ├── statevector.rs   # 2^n Complex64 buffer operations
        │   ├── gates.rs         # Unitary gate matrices & Kronecker products
        │   └── bloch.rs         # Partial trace & Bloch vector projections
        └── Cargo.toml
```

---

## 7. Anti-AI-Slop & Superconducting Workstation Design Standards

Per `.agents/skills/hallmark/` and `.agents/skills/frontend-design/`, Quantangle adheres to strict scientific instrument UI standards:

### 7.1 Design Tokens & Instrument Surfaces
- **Background Base**: `#06080e` (pure cryogenic deep void).
- **Instrument Surface**: `#0b0f19` with hairline titanium borders (`#1a2336`).
- **Telemetry Amber / Copper**: `#d97706` / `#f59e0b` (superconducting coaxial line resonance).
- **Quantum Cyan**: `#06b6d4` / `#0ea5e9` reserved strictly for active physical eigenstates and measurement.
- **Wire Rails**: `#222d42` solid copper/slate tracks with logic analyzer step ticks (`t0`, `t1`, ...).

### 7.2 The 10 Anti-Slop Auto-Fail Gates
1. **No Purple-to-Cyan Gradients**: Never use multi-stop neon gradients on text or general container borders.
2. **No Blurry Glassmorphism Overuse**: Replace diffuse backdrop blur with crisp, opaque instrument panels and 1px borders.
3. **No Unweighted Inter Monoculture**: Pair `JetBrains Mono` / `Geist Mono` for all coordinate readouts, gate matrices, and telemetry.
4. **No Gimmick Animations**: Prohibit spinning atom logos (`animate-spin` on logos), pulsing ping dots (`animate-ping`), or continuous idle bobbing.
5. **No Floating Candy Pill Buttons**: Use precision rectangular buttons with subtle radius (`rounded-md` or `rounded`), sharp borders, and physical depression (`active:translate-y-[1px]`).
6. **No Fake Metrics or Placeholders**: All state vectors, fidelity values, and probabilities must stem from authentic WebAssembly simulation.
7. **No Equal-Grid Card Uniformity**: Layouts reflect functional hierarchy (Canvas 60%, Inspector 40%, pinned copilot assistant).
8. **No Layout Scroll Hijacking**: Message lists and code editors must have bounded height with internal overflow scrolling.
9. **No Meaningless Decorative Blobs**: Every pixel, grid line, and tick mark must correspond to physical quantum hardware concepts.
10. **Tactile Microinteraction Physics**: Transitions must be fast (75ms–150ms), property-specific, with active state key travel (`translate-y-[1px]`).

