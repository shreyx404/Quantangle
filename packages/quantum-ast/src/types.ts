// =============================================================================
// @quantangle/quantum-ast — Quantum Circuit Intermediate Representation Types
// =============================================================================
// These types form the single source of truth for the bi-directional sync
// between the visual canvas, Monaco editor, WASM simulator, and cloud backend.
// =============================================================================

/**
 * Supported quantum gate types in Quantangle.
 * MVP: All gates listed below.
 * v2 targets: Additional gates (Toffoli, Fredkin, etc.) may be added.
 */
export type GateType =
  | "H"    // Hadamard
  | "X"    // Pauli-X (NOT)
  | "Y"    // Pauli-Y
  | "Z"    // Pauli-Z
  | "S"    // Phase gate (π/2)
  | "T"    // T gate (π/4)
  | "CX"   // Controlled-NOT (CNOT)
  | "CZ"   // Controlled-Z
  | "SWAP" // SWAP gate
  | "RX"   // Rotation around X-axis
  | "RY"   // Rotation around Y-axis
  | "RZ"   // Rotation around Z-axis
  | "U3"   // Universal single-qubit gate U3(θ, φ, λ)
  | "M";   // Measurement

/**
 * Represents a single quantum gate operation within a circuit step.
 */
export interface GateOperation {
  /** Unique identifier for this gate instance (UUID) */
  id: string;
  /** The type of quantum gate */
  gate: GateType;
  /** Target qubit indices — e.g. [0] for single-qubit, [control, target] for CX */
  qubits: number[];
  /** Gate parameters — e.g. [theta] for RX, [theta, phi, lambda] for U3 */
  params?: number[];
  /** Target classical bit index for measurement gate 'M' */
  clbit?: number;
}

/**
 * Represents a single time step in the quantum circuit.
 * Multiple gates can execute in the same step if they act on different qubits.
 */
export interface CircuitStep {
  /** Zero-based index of this step in the circuit timeline */
  stepIndex: number;
  /** All gate operations executing at this time step */
  operations: GateOperation[];
}

/**
 * The canonical Quantum Circuit Intermediate Representation (IR).
 * This is the single source of truth shared across all Quantangle subsystems:
 * - Visual Canvas → IR → Code Editor
 * - Code Editor → IR → Visual Canvas
 * - IR → WASM Simulator → Visualization
 * - IR → Cloud Backend → Noisy Simulation
 */
export interface QuantumCircuitIR {
  /** Schema version for forward compatibility */
  version: "1.0";
  /** Number of quantum bits (qubits) in the circuit */
  qubits: number;
  /** Number of classical bits for measurement results */
  clbits: number;
  /** Ordered sequence of circuit steps */
  steps: CircuitStep[];
}

/**
 * Measurement outcome for a single shot.
 */
export interface MeasurementResult {
  /** Classical bit values after measurement, indexed by clbit */
  bits: Record<number, 0 | 1>;
  /** Probability of this outcome */
  probability: number;
}

/**
 * Bloch sphere coordinates for a single qubit.
 * Calculated via partial trace of the full statevector.
 */
export interface BlochVector {
  /** Qubit index this Bloch vector represents */
  qubit: number;
  /** X-component: Tr(ρ_k · X) = 2·Re(ρ₀₁) */
  x: number;
  /** Y-component: Tr(ρ_k · Y) = -2·Im(ρ₀₁) */
  y: number;
  /** Z-component: Tr(ρ_k · Z) = ρ₀₀ - ρ₁₁ */
  z: number;
  /** Purity r = √(x² + y² + z²) ∈ [0, 1]. r < 1 indicates entanglement. */
  purity: number;
}

/**
 * Complete simulation result for a single circuit step.
 * The WASM engine produces one of these for every step in the circuit.
 */
export interface StepStateResult {
  /** Step index this result corresponds to */
  stepIndex: number;
  /**
   * Full statevector as interleaved [real, imag, real, imag, ...] Float64Array.
   * Length = 2^(n+1) where n = number of qubits.
   */
  statevector: number[];
  /**
   * Probability distribution over computational basis states.
   * probabilities[j] = |α_j|² for basis state |j⟩.
   * Length = 2^n.
   */
  probabilities: number[];
  /** Bloch sphere coordinates for each qubit */
  blochVectors: BlochVector[];
}

/**
 * Complete simulation output for an entire circuit.
 */
export interface SimulationOutput {
  /** Number of qubits in the simulated circuit */
  numQubits: number;
  /** Per-step state snapshots for timeline scrubbing */
  stepResults: StepStateResult[];
  /** Total wall-clock simulation time in milliseconds */
  simulationTimeMs: number;
}

/**
 * Target SDK for code generation.
 * MVP: "qiskit" | "qasm3"
 * v2 targets: "cirq" | "pennylane"
 */
export type TargetSDK = "qiskit" | "qasm3" | "cirq" | "pennylane";
