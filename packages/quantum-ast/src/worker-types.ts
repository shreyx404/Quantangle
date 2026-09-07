// =============================================================================
// @quantangle/quantum-ast — Web Worker Communication Types
// =============================================================================
// Defines the typed message protocol between the main UI thread and the
// quantum simulation Web Worker running the Rust WASM engine.
// =============================================================================

import type { QuantumCircuitIR, StepStateResult } from "./types";

// ---------------------------------------------------------------------------
// Worker Requests (Main Thread → Worker)
// ---------------------------------------------------------------------------

/**
 * Request to simulate a full quantum circuit step-by-step.
 * Returns intermediate statevectors, probabilities, and Bloch vectors per step.
 */
export interface SimulateCircuitRequest {
  type: "SIMULATE_CIRCUIT";
  /** Unique request ID for correlating responses */
  id: string;
  /** The circuit to simulate */
  payload: QuantumCircuitIR;
}

/**
 * Request to evaluate quantum state fidelity between two circuits.
 * Used by the grader and Qu-Copilot verifier.
 */
export interface EvaluateFidelityRequest {
  type: "EVALUATE_FIDELITY";
  /** Unique request ID for correlating responses */
  id: string;
  /** The target (expected) circuit */
  targetIR: QuantumCircuitIR;
  /** The student's (submitted) circuit */
  studentIR: QuantumCircuitIR;
}

/** Discriminated union of all possible worker requests */
export type WorkerRequest = SimulateCircuitRequest | EvaluateFidelityRequest;

// ---------------------------------------------------------------------------
// Worker Responses (Worker → Main Thread)
// ---------------------------------------------------------------------------

/**
 * Successful simulation result containing per-step state snapshots.
 */
export interface SimulationSuccessResponse {
  type: "SIMULATION_SUCCESS";
  /** Correlates with the original request ID */
  id: string;
  /** Step-by-step simulation results */
  results: StepStateResult[];
  /** Wall-clock simulation time in milliseconds */
  simulationTimeMs: number;
}

/**
 * Simulation error — invalid circuit, dimension mismatch, etc.
 */
export interface SimulationErrorResponse {
  type: "SIMULATION_ERROR";
  /** Correlates with the original request ID */
  id: string;
  /** Human-readable error message */
  error: string;
}

/**
 * Fidelity evaluation result.
 */
export interface FidelityResultResponse {
  type: "FIDELITY_RESULT";
  /** Correlates with the original request ID */
  id: string;
  /** Computed fidelity F = |⟨ψ_target|ψ_student⟩|² */
  fidelity: number;
  /** Whether fidelity passes threshold (F ≥ 0.999) */
  passed: boolean;
}

/**
 * WASM module ready notification.
 */
export interface WasmReadyResponse {
  type: "WASM_READY";
}

/** Discriminated union of all possible worker responses */
export type WorkerResponse =
  | SimulationSuccessResponse
  | SimulationErrorResponse
  | FidelityResultResponse
  | WasmReadyResponse;
