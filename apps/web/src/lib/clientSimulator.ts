// =============================================================================
// Quantangle Client-Side Fast Simulation Engine & Fallback
// =============================================================================
// Provides immediate zero-latency simulation for <= 16 qubits on the client,
// calculating intermediate statevectors, probabilities, reduced density matrices,
// and Bloch vectors per SIMULATION_SPEC.md.
// Endianness: Little-Endian (q_0 is LSB, index 0 is |00...0⟩).
// =============================================================================

import type {
  QuantumCircuitIR,
  StepStateResult,
  BlochVector,
} from "@quantangle/quantum-ast";

export function simulateCircuitClient(ir: QuantumCircuitIR): StepStateResult[] {
  const n = ir.qubits;
  const numStates = 1 << n;
  const stepResults: StepStateResult[] = [];

  // Statevector buffer: interleaved [real, imag] of length 2 * numStates
  // Initial state: |00...0⟩ = 1.0 + 0.0i
  let state: Float64Array<ArrayBufferLike> = new Float64Array(numStates * 2);
  state[0] = 1.0;

  // Record initial state (t = 0 before any gates)
  stepResults.push(captureSnapshot(0, state, n));

  for (let s = 0; s < ir.steps.length; s++) {
    const step = ir.steps[s];
    for (const op of step.operations) {
      if (op.gate === "M") continue; // Measurement leaves state projected

      if (op.qubits.length === 1) {
        state = applySingleQubitGate(state, n, op.qubits[0], op.gate, op.params);
      } else if (op.qubits.length === 2) {
        state = applyTwoQubitGate(state, n, op.qubits[0], op.qubits[1], op.gate);
      }
    }
    stepResults.push(captureSnapshot(s + 1, state, n));
  }

  return stepResults;
}

function captureSnapshot(
  stepIndex: number,
  state: Float64Array,
  n: number
): StepStateResult {
  const numStates = 1 << n;
  const probabilities: number[] = new Array(numStates);
  const stateArray: number[] = new Array(state.length);

  for (let i = 0; i < numStates; i++) {
    const re = state[i * 2];
    const im = state[i * 2 + 1];
    probabilities[i] = re * re + im * im;
    stateArray[i * 2] = re;
    stateArray[i * 2 + 1] = im;
  }

  // Calculate Bloch vectors via partial trace
  const blochVectors: BlochVector[] = [];
  for (let q = 0; q < n; q++) {
    blochVectors.push(calculateBlochVector(state, n, q));
  }

  return {
    stepIndex,
    statevector: stateArray,
    probabilities,
    blochVectors,
  };
}

function calculateBlochVector(
  state: Float64Array,
  n: number,
  targetQubit: number
): BlochVector {
  const numStates = 1 << n;
  const bit = 1 << targetQubit;

  let rho00 = 0.0;
  let rho11 = 0.0;
  let rho01_re = 0.0;
  let rho01_im = 0.0;

  for (let i = 0; i < numStates; i++) {
    if ((i & bit) === 0) {
      const j = i | bit; // state with target qubit = 1
      const a_re = state[i * 2];
      const a_im = state[i * 2 + 1];
      const b_re = state[j * 2];
      const b_im = state[j * 2 + 1];

      rho00 += a_re * a_re + a_im * a_im;
      rho11 += b_re * b_re + b_im * b_im;

      // rho01 += a * b*
      rho01_re += a_re * b_re + a_im * b_im;
      rho01_im += a_im * b_re - a_re * b_im;
    }
  }

  const x = 2.0 * rho01_re;
  const y = -2.0 * rho01_im;
  const z = rho00 - rho11;
  const purity = Math.min(1.0, Math.sqrt(x * x + y * y + z * z));

  return { qubit: targetQubit, x, y, z, purity };
}

function applySingleQubitGate(
  state: Float64Array,
  n: number,
  target: number,
  gate: string,
  params?: number[]
): Float64Array {
  const newState = new Float64Array(state.length);
  const numStates = 1 << n;
  const bit = 1 << target;

  // 2x2 Unitary matrix: [[u00, u01], [u10, u11]] as [re, im]
  let u00_re = 1, u00_im = 0;
  let u01_re = 0, u01_im = 0;
  let u10_re = 0, u10_im = 0;
  let u11_re = 1, u11_im = 0;

  const SQRT1_2 = Math.SQRT1_2;

  switch (gate) {
    case "H":
      u00_re = SQRT1_2; u01_re = SQRT1_2;
      u10_re = SQRT1_2; u11_re = -SQRT1_2;
      break;
    case "X":
      u00_re = 0; u01_re = 1;
      u10_re = 1; u11_re = 0;
      break;
    case "Y":
      u00_re = 0; u01_im = -1;
      u10_im = 1; u11_re = 0;
      break;
    case "Z":
      u00_re = 1; u01_re = 0;
      u10_re = 0; u11_re = -1;
      break;
    case "S":
      u00_re = 1;
      u11_re = 0; u11_im = 1;
      break;
    case "T":
      u00_re = 1;
      u11_re = SQRT1_2; u11_im = SQRT1_2;
      break;
    case "RX": {
      const theta = params?.[0] ?? 0;
      u00_re = Math.cos(theta / 2);
      u11_re = Math.cos(theta / 2);
      u01_im = -Math.sin(theta / 2);
      u10_im = -Math.sin(theta / 2);
      break;
    }
    case "RY": {
      const theta = params?.[0] ?? 0;
      u00_re = Math.cos(theta / 2);
      u11_re = Math.cos(theta / 2);
      u01_re = -Math.sin(theta / 2);
      u10_re = Math.sin(theta / 2);
      break;
    }
    case "RZ": {
      const theta = params?.[0] ?? 0;
      u00_re = Math.cos(theta / 2); u00_im = -Math.sin(theta / 2);
      u11_re = Math.cos(theta / 2); u11_im = Math.sin(theta / 2);
      break;
    }
    default:
      return state;
  }

  for (let i = 0; i < numStates; i++) {
    if ((i & bit) === 0) {
      const j = i | bit;
      const a_re = state[i * 2];
      const a_im = state[i * 2 + 1];
      const b_re = state[j * 2];
      const b_im = state[j * 2 + 1];

      // New amplitude for |i⟩ = u00*a + u01*b
      newState[i * 2] =
        (u00_re * a_re - u00_im * a_im) + (u01_re * b_re - u01_im * b_im);
      newState[i * 2 + 1] =
        (u00_re * a_im + u00_im * a_re) + (u01_re * b_im + u01_im * b_re);

      // New amplitude for |j⟩ = u10*a + u11*b
      newState[j * 2] =
        (u10_re * a_re - u10_im * a_im) + (u11_re * b_re - u11_im * b_im);
      newState[j * 2 + 1] =
        (u10_re * a_im + u10_im * a_re) + (u11_re * b_im + u11_im * b_re);
    }
  }

  return newState;
}

function applyTwoQubitGate(
  state: Float64Array,
  n: number,
  ctrl: number,
  tgt: number,
  gate: string
): Float64Array {
  const newState = new Float64Array(state);
  const numStates = 1 << n;
  const ctrlBit = 1 << ctrl;
  const tgtBit = 1 << tgt;

  for (let i = 0; i < numStates; i++) {
    if (gate === "CX") {
      // CNOT: flip target if control is 1
      if ((i & ctrlBit) !== 0 && (i & tgtBit) === 0) {
        const j = i | tgtBit;
        const temp_re = newState[i * 2];
        const temp_im = newState[i * 2 + 1];
        newState[i * 2] = newState[j * 2];
        newState[i * 2 + 1] = newState[j * 2 + 1];
        newState[j * 2] = temp_re;
        newState[j * 2 + 1] = temp_im;
      }
    } else if (gate === "CZ") {
      // CZ: negate if both control and target are 1
      if ((i & ctrlBit) !== 0 && (i & tgtBit) !== 0) {
        newState[i * 2] = -newState[i * 2];
        newState[i * 2 + 1] = -newState[i * 2 + 1];
      }
    } else if (gate === "SWAP") {
      // SWAP: swap state if ctrl != tgt
      const bit1 = (i & ctrlBit) !== 0;
      const bit2 = (i & tgtBit) !== 0;
      if (bit1 && !bit2) {
        const j = (i ^ ctrlBit) | tgtBit;
        const temp_re = newState[i * 2];
        const temp_im = newState[i * 2 + 1];
        newState[i * 2] = newState[j * 2];
        newState[i * 2 + 1] = newState[j * 2 + 1];
        newState[j * 2] = temp_re;
        newState[j * 2 + 1] = temp_im;
      }
    }
  }

  return newState;
}
