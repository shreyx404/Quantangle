// =============================================================================
// useQuantumWorker — React Hook for Quantum Simulation Web Worker
// =============================================================================
// Provides a clean async API for circuit simulation from React components.
// Manages Worker lifecycle, request correlation, and Promise-based results.
// =============================================================================

"use client";

import { useEffect, useRef, useCallback } from "react";
import type {
  QuantumCircuitIR,
  StepStateResult,
  WorkerRequest,
  WorkerResponse,
} from "@quantangle/quantum-ast";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

interface SimulationResult {
  results: StepStateResult[];
  simulationTimeMs: number;
}

interface FidelityResult {
  fidelity: number;
  passed: boolean;
}

/**
 * React hook that manages a Web Worker running the Rust WASM quantum simulator.
 *
 * Usage:
 * ```tsx
 * const { simulateCircuit, evaluateFidelity, isReady } = useQuantumWorker();
 *
 * const results = await simulateCircuit(circuitIR);
 * ```
 */
export function useQuantumWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const isReadyRef = useRef(false);
  const readyResolveRef = useRef<(() => void) | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    const worker = new Worker(
      new URL("./quantum.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;

      // Handle WASM ready signal
      if (data.type === "WASM_READY") {
        isReadyRef.current = true;
        readyResolveRef.current?.();
        return;
      }

      // Resolve or reject pending promises
      const pending = pendingRef.current.get(data.id);
      if (!pending) return;

      pendingRef.current.delete(data.id);

      switch (data.type) {
        case "SIMULATION_SUCCESS":
          pending.resolve({
            results: data.results,
            simulationTimeMs: data.simulationTimeMs,
          });
          break;

        case "SIMULATION_ERROR":
          pending.reject(new Error(data.error));
          break;

        case "FIDELITY_RESULT":
          pending.resolve({
            fidelity: data.fidelity,
            passed: data.passed,
          });
          break;
      }
    };

    worker.onerror = (error) => {
      console.error("[QuantumWorker] Worker error:", error);
      // Reject all pending requests
      for (const [, pending] of pendingRef.current) {
        pending.reject(new Error("Worker crashed"));
      }
      pendingRef.current.clear();
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  /**
   * Generate a unique request ID for correlating responses.
   */
  const generateId = useCallback((): string => {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  /**
   * Send a request to the worker and return a promise for the response.
   */
  const sendRequest = useCallback(
    <T>(request: WorkerRequest): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not initialized"));
          return;
        }

        pendingRef.current.set(request.id, {
          resolve: resolve as (value: unknown) => void,
          reject,
        });

        workerRef.current.postMessage(request);
      });
    },
    []
  );

  /**
   * Simulate a quantum circuit step-by-step.
   * Returns per-step statevectors, probabilities, and Bloch vectors.
   */
  const simulateCircuit = useCallback(
    async (ir: QuantumCircuitIR): Promise<SimulationResult> => {
      const id = generateId();
      return sendRequest<SimulationResult>({
        type: "SIMULATE_CIRCUIT",
        id,
        payload: ir,
      });
    },
    [generateId, sendRequest]
  );

  /**
   * Evaluate the quantum state fidelity between a target and student circuit.
   * Returns F = |⟨ψ_target|ψ_student⟩|² and whether it passes the 0.999 threshold.
   */
  const evaluateFidelity = useCallback(
    async (
      targetIR: QuantumCircuitIR,
      studentIR: QuantumCircuitIR
    ): Promise<FidelityResult> => {
      const id = generateId();
      return sendRequest<FidelityResult>({
        type: "EVALUATE_FIDELITY",
        id,
        targetIR,
        studentIR,
      });
    },
    [generateId, sendRequest]
  );

  return {
    simulateCircuit,
    evaluateFidelity,
    isReady: isReadyRef.current,
  };
}
