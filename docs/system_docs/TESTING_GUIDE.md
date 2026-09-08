# TESTING_GUIDE.md — Quantangle Self-Verification & Testing Protocol

> **Testing Standards and Verification Checklists for AI Agents and Developers.**

---

## 1. Prime Testing Rule for AI Agents

> [!IMPORTANT]
> **No Task Completion Without Verification!**  
> An AI agent must never mark a task as `- [x]` in `TASKS.md` or claim work is done without running the corresponding verification test listed below.

---

## 2. Test Execution Commands

### 2.1 Rust WebAssembly Simulator Tests
Run from `/packages/wasm-engine`:
```bash
# Run all unit tests for gates, statevectors, and partial trace
cargo test --verbose

# Run statevector benchmarks
cargo bench
```

### 2.2 Frontend Unit & Component Tests
Run from `/apps/web`:
```bash
# Run Vitest test suite
npm run test

# Run Vitest in UI watch mode (interactive)
npm run test:ui

# Run AST Transpiler round-trip tests only
npx vitest run src/transpiler/__tests__/
```

### 2.3 Backend Python & Cloud Simulator Tests
Run from `/apps/api`:
```bash
# Run pytest with coverage
pytest -v --cov=services tests/

# Run state fidelity grader tests only
pytest tests/test_fidelity_grader.py
```

---

## 3. Quantum Unit Test Assertions (Ground Truth Tests)

Every quantum simulation engine implementation must pass these 4 canonical baseline tests:

### Test 1: Bell State $|\Phi^+\rangle$ Preparation
- **Circuit**: $q_0: H \to \bullet$; $q_1: \oplus$ ($CX_{0 \to 1}$).
- **Expected Statevector**:
  $$|\Phi^+\rangle = \frac{1}{\sqrt{2}}|00\rangle + 0|01\rangle + 0|10\rangle + \frac{1}{\sqrt{2}}|11\rangle$$
- **Array Representation (Little-Endian)**:
  - `state[0]` ($|00\rangle$) = $0.70710678 + 0.0i$
  - `state[1]` ($|01\rangle$) = $0.0 + 0.0i$
  - `state[2]` ($|10\rangle$) = $0.0 + 0.0i$
  - `state[3]` ($|11\rangle$) = $0.70710678 + 0.0i$
- **Pass Criteria**: $|\text{state}[0]|^2 + |\text{state}[3]|^2 = 1.0 \pm 10^{-6}$.

### Test 2: Phase Kickback in Deutsch-Jozsa
- **Circuit**:
  - $q_0 = |+\rangle$ ($H |0\rangle$)
  - $q_1 = |-\rangle$ ($X$ then $H |0\rangle$)
  - Apply $CX_{0 \to 1}$
- **Expected Result**:
  - The relative phase $(-1)$ from $q_1$ kicks back to $q_0$.
  - Applying Hadamard on $q_0$ yields $|1\rangle$.
- **Pass Criteria**: Measuring $q_0$ yields `1` with $100\%$ probability.

### Test 3: Three-Qubit GHZ State
- **Circuit**: $q_0: H \to \bullet \to \text{wire}$; $q_1: \oplus \to \bullet$; $q_2: \text{wire} \to \oplus$.
- **Expected Statevector**:
  $$|GHZ\rangle = \frac{1}{\sqrt{2}}|000\rangle + \frac{1}{\sqrt{2}}|111\rangle$$
- **Pass Criteria**: `state[0]` and `state[7]` each have amplitude $\frac{1}{\sqrt{2}}$, all other 6 amplitudes are zero.

### Test 4: Grover Diffusion Operator Unitary Check
- **Formula**: $D = 2|s\rangle\langle s| - I$, where $|s\rangle = H^{\otimes n}|0\rangle^{\otimes n}$.
- **Pass Criteria**: $D^\dagger D = I$ (Unitary check) and trace $\text{Tr}(D) = 2 - 2^n$.

---

## 4. Bi-Directional Transpiler Round-Trip Verification

Whenever making changes to `quantum-ast` or Monaco editor parsers, verify round-trip fidelity:

$$\text{Circuit IR} \xrightarrow{\text{emit}} \text{Qiskit Code} \xrightarrow{\text{parse}} \text{Circuit IR}'$$

**Assertion**:
$$\text{JSON.stringify}(\text{Circuit IR}) \equiv \text{JSON.stringify}(\text{Circuit IR}')$$
Test with circuits containing:
1. Single-qubit gates ($H, X, Y, Z, S, T$).
2. Parametric gates ($R_x(1.5708), R_z(3.14159)$).
3. Multi-qubit gates ($CX, CZ, SWAP, CCX$).
4. Measurement operations on classical registers.

---

## 5. WebGL / Three.js Visualizer Verification Checklist

When editing 3D visualizers:
- [ ] **No WebGL Context Leaks**: Confirm WebGL context is not lost during tab switches or timeline scrubs. Check `console.warn` for `WARNING: Too many active WebGL contexts`.
- [ ] **FPS Benchmark**: Ensure Three.js canvas maintains steady 60 FPS while scrubbing through a 10-step, 4-qubit circuit.
- [ ] **Bloch Sphere Coordinates**: For single-qubit states:
  - $|0\rangle$: Vector points to North Pole $(0, 0, 1)$.
  - $|1\rangle$: Vector points to South Pole $(0, 0, -1)$.
  - $|+\rangle$: Vector points to $(1, 0, 0)$.
  - $|-\rangle$: Vector points to $(-1, 0, 0)$.
  - $|+i\rangle$: Vector points to $(0, 1, 0)$.
  - $|-i\rangle$: Vector points to $(0, -1, 0)$.
