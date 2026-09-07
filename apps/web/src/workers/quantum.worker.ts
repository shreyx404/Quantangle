// =============================================================================
// Quantum Simulation Web Worker
// =============================================================================
// Runs the Rust WebAssembly quantum simulator in a dedicated Web Worker thread.
// Receives QuantumCircuitIR messages from the main thread, simulates step-by-step,
// and returns statevectors, probabilities, and Bloch vectors.
//
// This ensures zero jank on the main UI thread during simulation.
// =============================================================================

import type {
  WorkerRequest,
  WorkerResponse,
} from "@quantangle/quantum-ast";

// Type definition for the imported WASM module
type WasmModuleType = typeof import("@quantangle/wasm-engine");
let wasmModule: WasmModuleType | null = null;

/**
 * Initialize the WASM module.
 * Called once when the worker starts.
 */
async function initWasm(): Promise<void> {
  try {
    const wasm = await import("@quantangle/wasm-engine");
    // Call default initialization function for web target
    if (typeof wasm.default === "function") {
      await wasm.default();
    }
    wasmModule = wasm;
    postMessage({ type: "WASM_READY" });
  } catch (error) {
    postMessage({
      type: "SIMULATION_ERROR",
      id: "__init__",
      error: `Failed to initialize WASM module: ${error}`,
    });
  }
}

/**
 * Handle incoming messages from the main thread.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  // Ensure WASM is initialized
  if (!wasmModule) {
    await initWasm();
    if (!wasmModule) return;
  }

  const startTime = performance.now();

  try {
    switch (request.type) {
      case "SIMULATE_CIRCUIT": {
        const circuitJson = JSON.stringify(request.payload);
        const resultJson = wasmModule.simulateCircuit(circuitJson);
        const result = JSON.parse(resultJson);
        const elapsed = performance.now() - startTime;

        const response: WorkerResponse = {
          type: "SIMULATION_SUCCESS",
          id: request.id,
          results: result.stepResults,
          simulationTimeMs: elapsed,
        };
        postMessage(response);
        break;
      }

      case "EVALUATE_FIDELITY": {
        const targetJson = JSON.stringify(request.targetIR);
        const studentJson = JSON.stringify(request.studentIR);
        const fidelityValue = wasmModule.computeFidelity(targetJson, studentJson);

        const response: WorkerResponse = {
          type: "FIDELITY_RESULT",
          id: request.id,
          fidelity: fidelityValue,
          passed: fidelityValue >= 0.999,
        };
        postMessage(response);
        break;
      }

      default:
        postMessage({
          type: "SIMULATION_ERROR",
          id: (request as WorkerRequest & { id: string }).id || "__unknown__",
          error: `Unknown request type: ${(request as { type: string }).type}`,
        } satisfies WorkerResponse);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: "SIMULATION_ERROR",
      id: request.id,
      error: error instanceof Error ? error.message : String(error),
    };
    postMessage(response);
  }
};

// Initialize WASM on worker startup
initWasm();
