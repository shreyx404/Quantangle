// =============================================================================
// quantangle-wasm-engine — WASM Entry Point & Bindings
// =============================================================================
// This is the main crate entry point. It exports:
// 1. Internal Rust modules (complex, statevector, gates, bloch)
// 2. wasm-bindgen public API for the Web Worker to call
// =============================================================================

pub mod complex;
pub mod statevector;
pub mod gates;
pub mod bloch;

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

use crate::statevector::Statevector;
use crate::gates::apply_gate;
use crate::bloch::{all_bloch_vectors, fidelity};

// ===========================================================================
// Serialization Types (JSON interchange with JavaScript)
// ===========================================================================

/// A gate operation as received from JavaScript.
#[derive(Debug, Deserialize)]
pub struct JsGateOperation {
    pub gate: String,
    pub qubits: Vec<usize>,
    #[serde(default)]
    pub params: Vec<f64>,
}

/// A circuit step containing multiple gate operations.
#[derive(Debug, Deserialize)]
pub struct JsCircuitStep {
    #[serde(rename = "stepIndex")]
    pub step_index: usize,
    pub operations: Vec<JsGateOperation>,
}

/// The full circuit IR as received from JavaScript.
#[derive(Debug, Deserialize)]
pub struct JsCircuitIR {
    pub qubits: usize,
    pub steps: Vec<JsCircuitStep>,
}

/// Bloch vector result for a single qubit.
#[derive(Debug, Serialize)]
pub struct JsBlochVector {
    pub qubit: usize,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub purity: f64,
}

/// Simulation result for a single circuit step.
#[derive(Debug, Serialize)]
pub struct JsStepResult {
    #[serde(rename = "stepIndex")]
    pub step_index: usize,
    /// Interleaved [re, im, re, im, ...] statevector
    pub statevector: Vec<f64>,
    /// Probability distribution over basis states
    pub probabilities: Vec<f64>,
    /// Bloch vectors for each qubit
    #[serde(rename = "blochVectors")]
    pub bloch_vectors: Vec<JsBlochVector>,
}

/// Full simulation output.
#[derive(Debug, Serialize)]
pub struct JsSimulationOutput {
    #[serde(rename = "numQubits")]
    pub num_qubits: usize,
    #[serde(rename = "stepResults")]
    pub step_results: Vec<JsStepResult>,
}

// ===========================================================================
// WASM-Bindgen Public API
// ===========================================================================

/// Simulate a quantum circuit step-by-step.
///
/// Takes a JSON string representing the QuantumCircuitIR and returns a JSON
/// string with step-by-step simulation results (statevectors, probabilities,
/// Bloch vectors).
///
/// This function is called from the Web Worker via wasm-bindgen.
#[wasm_bindgen(js_name = "simulateCircuit")]
pub fn simulate_circuit(circuit_ir_json: &str) -> Result<String, JsValue> {
    let circuit: JsCircuitIR = serde_json::from_str(circuit_ir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse circuit IR: {e}")))?;

    if circuit.qubits == 0 || circuit.qubits > statevector::MAX_QUBITS {
        return Err(JsValue::from_str(&format!(
            "Qubit count must be between 1 and {}, got {}",
            statevector::MAX_QUBITS,
            circuit.qubits
        )));
    }

    let mut sv = Statevector::new(circuit.qubits);
    let mut step_results = Vec::with_capacity(circuit.steps.len());

    // Capture initial state (before any gates)
    step_results.push(capture_step_result(&sv, 0));

    // Apply each step and capture the resulting state
    for step in &circuit.steps {
        for op in &step.operations {
            // Skip measurement (handled at a higher level)
            if op.gate == "M" {
                continue;
            }

            // Validate qubit indices
            for &q in &op.qubits {
                if q >= circuit.qubits {
                    return Err(JsValue::from_str(&format!(
                        "Qubit index {} out of range for {}-qubit circuit (gate: {})",
                        q, circuit.qubits, op.gate
                    )));
                }
            }

            apply_gate(&mut sv, &op.gate, &op.qubits, &op.params);
        }

        step_results.push(capture_step_result(&sv, step.step_index + 1));
    }

    let output = JsSimulationOutput {
        num_qubits: circuit.qubits,
        step_results,
    };

    serde_json::to_string(&output)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize output: {e}")))
}

/// Compute the fidelity between two circuits.
///
/// Takes two circuit IR JSON strings, simulates both, and returns the state
/// fidelity F = |⟨ψ_target|ψ_student⟩|².
#[wasm_bindgen(js_name = "computeFidelity")]
pub fn compute_fidelity(target_ir_json: &str, student_ir_json: &str) -> Result<f64, JsValue> {
    let target_sv = simulate_to_final_state(target_ir_json)?;
    let student_sv = simulate_to_final_state(student_ir_json)?;

    Ok(fidelity(&target_sv, &student_sv))
}

// ===========================================================================
// Internal Helpers
// ===========================================================================

/// Simulate a circuit and return just the final statevector.
fn simulate_to_final_state(circuit_ir_json: &str) -> Result<Statevector, JsValue> {
    let circuit: JsCircuitIR = serde_json::from_str(circuit_ir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse circuit IR: {e}")))?;

    if circuit.qubits == 0 || circuit.qubits > statevector::MAX_QUBITS {
        return Err(JsValue::from_str(&format!(
            "Qubit count must be between 1 and {}, got {}",
            statevector::MAX_QUBITS,
            circuit.qubits
        )));
    }

    let mut sv = Statevector::new(circuit.qubits);

    for step in &circuit.steps {
        for op in &step.operations {
            if op.gate == "M" {
                continue;
            }
            apply_gate(&mut sv, &op.gate, &op.qubits, &op.params);
        }
    }

    Ok(sv)
}

/// Capture the current statevector as a step result.
fn capture_step_result(sv: &Statevector, step_index: usize) -> JsStepResult {
    let bloch_vecs = all_bloch_vectors(sv);

    JsStepResult {
        step_index,
        statevector: sv.to_interleaved(),
        probabilities: sv.probabilities(),
        bloch_vectors: bloch_vecs
            .iter()
            .enumerate()
            .map(|(i, b)| JsBlochVector {
                qubit: i,
                x: b.x,
                y: b.y,
                z: b.z,
                purity: b.purity,
            })
            .collect(),
    }
}
