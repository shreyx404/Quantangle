// =============================================================================
// Quantangle Client-Side Simulator & Fidelity Grader Unit Tests
// Ground truth tests specified in TESTING_GUIDE.md
// =============================================================================

import { describe, it, expect } from "vitest";
import {
  simulateCircuitClient,
  evaluateCircuitFidelity,
} from "../lib/clientSimulator";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";

describe("Client-Side Quantum Simulator (Ground Truth Tests)", () => {
  // Test 1: Bell State |Phi+> Preparation
  it("Test 1: Bell State |Phi+> Preparation (H on q0 -> CX 0->1)", () => {
    const ir: QuantumCircuitIR = {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        {
          stepIndex: 0,
          operations: [{ id: "op_h0", gate: "H", qubits: [0] }],
        },
        {
          stepIndex: 1,
          operations: [{ id: "op_cx01", gate: "CX", qubits: [0, 1] }],
        },
      ],
    };

    const results = simulateCircuitClient(ir);
    expect(results).toHaveLength(3); // Initial (t=0), after H, after CX

    const finalState = results[2];
    // In Little-Endian: state[0] = |00>, state[1] = |01>, state[2] = |10>, state[3] = |11>
    // |Phi+> = 1/sqrt(2) |00> + 1/sqrt(2) |11>
    expect(finalState.probabilities[0]).toBeCloseTo(0.5, 5); // |00>
    expect(finalState.probabilities[1]).toBeCloseTo(0.0, 5); // |01>
    expect(finalState.probabilities[2]).toBeCloseTo(0.0, 5); // |10>
    expect(finalState.probabilities[3]).toBeCloseTo(0.5, 5); // |11>

    // Bell state is maximally entangled, so single-qubit reduced states are completely mixed (purity=0)
    expect(finalState.blochVectors[0].purity).toBeCloseTo(0.0, 5);
    expect(finalState.blochVectors[1].purity).toBeCloseTo(0.0, 5);
  });

  // Test 2: Phase Kickback in Deutsch-Jozsa
  it("Test 2: Phase Kickback in Deutsch-Jozsa (q0=|+>, q1=|-> -> CX 0->1 -> H on q0 => q0=|1>)", () => {
    const ir: QuantumCircuitIR = {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        // Prepare q0 in |+> and q1 in |-> (X then H)
        {
          stepIndex: 0,
          operations: [
            { id: "pk_1", gate: "H", qubits: [0] },
            { id: "pk_2", gate: "X", qubits: [1] },
          ],
        },
        {
          stepIndex: 1,
          operations: [{ id: "pk_3", gate: "H", qubits: [1] }],
        },
        // CX from q0 (control) to q1 (target) -> phase kicks back to q0
        {
          stepIndex: 2,
          operations: [{ id: "pk_4", gate: "CX", qubits: [0, 1] }],
        },
        // Measure in Hadamard basis on q0
        {
          stepIndex: 3,
          operations: [{ id: "pk_5", gate: "H", qubits: [0] }],
        },
      ],
    };

    const results = simulateCircuitClient(ir);
    const finalState = results[results.length - 1];

    // After phase kickback, q0 is |1> with 100% probability:
    // Any state with q0=1 (odd indices in Little-Endian: 1, 3) must sum to 1.0
    const probQ0IsOne =
      finalState.probabilities[1] + finalState.probabilities[3];
    expect(probQ0IsOne).toBeCloseTo(1.0, 5);

    // Bloch vector for q0 must point to South pole (z = -1, purity = 1)
    expect(finalState.blochVectors[0].z).toBeCloseTo(-1.0, 5);
    expect(finalState.blochVectors[0].purity).toBeCloseTo(1.0, 5);
  });

  // Test 3: Three-Qubit GHZ State
  it("Test 3: Three-Qubit GHZ State (|000> + |111>) / sqrt(2)", () => {
    const ir: QuantumCircuitIR = {
      version: "1.0",
      qubits: 3,
      clbits: 3,
      steps: [
        {
          stepIndex: 0,
          operations: [{ id: "ghz_1", gate: "H", qubits: [0] }],
        },
        {
          stepIndex: 1,
          operations: [{ id: "ghz_2", gate: "CX", qubits: [0, 1] }],
        },
        {
          stepIndex: 2,
          operations: [{ id: "ghz_3", gate: "CX", qubits: [1, 2] }],
        },
      ],
    };

    const results = simulateCircuitClient(ir);
    const finalState = results[results.length - 1];

    // Probabilities of |000> (index 0) and |111> (index 7) must each be 0.5
    expect(finalState.probabilities[0]).toBeCloseTo(0.5, 5);
    expect(finalState.probabilities[7]).toBeCloseTo(0.5, 5);

    // All intermediate states |001>..|110> must have 0.0 probability
    for (let i = 1; i < 7; i++) {
      expect(finalState.probabilities[i]).toBeCloseTo(0.0, 5);
    }
  });

  // Test 4: Single Qubit Cardinal States on Bloch Sphere
  it("Test 4: Single Qubit Cardinal States on Bloch Sphere", () => {
    // State |0>: points to North Pole (0, 0, 1)
    const ir0: QuantumCircuitIR = {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [],
    };
    const res0 = simulateCircuitClient(ir0)[0];
    expect(res0.blochVectors[0].x).toBeCloseTo(0.0, 5);
    expect(res0.blochVectors[0].y).toBeCloseTo(0.0, 5);
    expect(res0.blochVectors[0].z).toBeCloseTo(1.0, 5);

    // State |1>: X gate -> points to South Pole (0, 0, -1)
    const ir1: QuantumCircuitIR = {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [{ stepIndex: 0, operations: [{ id: "card_x", gate: "X", qubits: [0] }] }],
    };
    const res1 = simulateCircuitClient(ir1)[1];
    expect(res1.blochVectors[0].x).toBeCloseTo(0.0, 5);
    expect(res1.blochVectors[0].y).toBeCloseTo(0.0, 5);
    expect(res1.blochVectors[0].z).toBeCloseTo(-1.0, 5);

    // State |+>: H gate -> points along +X axis (1, 0, 0)
    const irPlus: QuantumCircuitIR = {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [{ stepIndex: 0, operations: [{ id: "card_h", gate: "H", qubits: [0] }] }],
    };
    const resPlus = simulateCircuitClient(irPlus)[1];
    expect(resPlus.blochVectors[0].x).toBeCloseTo(1.0, 5);
    expect(resPlus.blochVectors[0].y).toBeCloseTo(0.0, 5);
    expect(resPlus.blochVectors[0].z).toBeCloseTo(0.0, 5);

    // State |+i>: H then S gate -> points along +Y axis (0, 1, 0)
    const irPlusI: QuantumCircuitIR = {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [
        { stepIndex: 0, operations: [{ id: "card_h2", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "card_s", gate: "S", qubits: [0] }] },
      ],
    };
    const resPlusI = simulateCircuitClient(irPlusI)[2];
    expect(resPlusI.blochVectors[0].x).toBeCloseTo(0.0, 5);
    expect(resPlusI.blochVectors[0].y).toBeCloseTo(1.0, 5);
    expect(resPlusI.blochVectors[0].z).toBeCloseTo(0.0, 5);
  });
});

describe("Circuit Fidelity Evaluator (F >= 0.999 Prime Directive)", () => {
  const bellTarget: QuantumCircuitIR = {
    version: "1.0",
    qubits: 2,
    clbits: 2,
    steps: [
      { stepIndex: 0, operations: [{ id: "tgt_h", gate: "H", qubits: [0] }] },
      { stepIndex: 1, operations: [{ id: "tgt_cx", gate: "CX", qubits: [0, 1] }] },
    ],
  };

  it("evaluates identical circuits with fidelity 1.0 (passes threshold)", () => {
    const evaluation = evaluateCircuitFidelity(bellTarget, bellTarget);
    expect(evaluation.passed).toBe(true);
    expect(evaluation.fidelity).toBeGreaterThanOrEqual(0.999);
  });

  it("rejects orthogonal states with fidelity 0.0", () => {
    // Inverted state |Psi+> = (|01> + |10>) / sqrt(2)
    const orthogonalCandidate: QuantumCircuitIR = {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "orth_x", gate: "X", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "orth_h", gate: "H", qubits: [0] }] },
        { stepIndex: 2, operations: [{ id: "orth_cx", gate: "CX", qubits: [0, 1] }] },
      ],
    };

    const evaluation = evaluateCircuitFidelity(bellTarget, orthogonalCandidate);
    expect(evaluation.passed).toBe(false);
    expect(evaluation.fidelity).toBeCloseTo(0.0, 3);
  });

  it("detects relative phase error when basis probabilities match", () => {
    // Target |Phi+> = (|00> + |11>) / sqrt(2)
    // Candidate |Phi-> = (|00> - |11>) / sqrt(2) by adding Z gate on q0
    const phaseErrorCandidate: QuantumCircuitIR = {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "ph_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "ph_z", gate: "Z", qubits: [0] }] },
        { stepIndex: 2, operations: [{ id: "ph_cx", gate: "CX", qubits: [0, 1] }] },
      ],
    };

    const evaluation = evaluateCircuitFidelity(bellTarget, phaseErrorCandidate);
    expect(evaluation.passed).toBe(false);
    expect(evaluation.diagnosis).toContain("Phase Error");
  });
});
