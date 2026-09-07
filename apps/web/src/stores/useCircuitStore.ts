// =============================================================================
// useCircuitStore — Single Source of Truth for Circuit IR
// =============================================================================
// Zustand store managing the quantum circuit state. Every mutation to this
// store should trigger a debounced simulation dispatch to the Web Worker.
//
// From SYSTEM_PATTERNS.md §1.1
// =============================================================================

"use client";

import { create } from "zustand";
import type {
  QuantumCircuitIR,
  CircuitStep,
  GateOperation,
  TargetSDK,
} from "@quantangle/quantum-ast";

interface CircuitState {
  // State
  numQubits: number;
  numClbits: number;
  steps: CircuitStep[];
  selectedStep: number | null;
  targetSDK: TargetSDK;

  // Actions
  addGate: (stepIndex: number, gate: GateOperation) => void;
  removeGate: (stepIndex: number, gateId: string) => void;
  updateGateParams: (stepIndex: number, gateId: string, params: number[]) => void;
  setQubits: (n: number) => void;
  setClbits: (n: number) => void;
  setSelectedStep: (step: number | null) => void;
  setTargetSDK: (sdk: TargetSDK) => void;
  addStep: () => void;
  removeStep: (stepIndex: number) => void;
  loadCircuitFromIR: (ir: QuantumCircuitIR) => void;
  resetCircuit: () => void;
  getCircuitIR: () => QuantumCircuitIR;
}

const DEFAULT_QUBITS = 2;
const DEFAULT_CLBITS = 2;

export const useCircuitStore = create<CircuitState>((set, get) => ({
  // Initial state
  numQubits: DEFAULT_QUBITS,
  numClbits: DEFAULT_CLBITS,
  steps: [],
  selectedStep: null,
  targetSDK: "qiskit",

  // Actions
  addGate: (stepIndex: number, gate: GateOperation) => {
    set((state) => {
      const newSteps = [...state.steps];

      // Ensure the step exists
      while (newSteps.length <= stepIndex) {
        newSteps.push({
          stepIndex: newSteps.length,
          operations: [],
        });
      }

      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        operations: [...newSteps[stepIndex].operations, gate],
      };

      return { steps: newSteps };
    });
  },

  removeGate: (stepIndex: number, gateId: string) => {
    set((state) => {
      const newSteps = [...state.steps];
      if (stepIndex < newSteps.length) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          operations: newSteps[stepIndex].operations.filter(
            (op) => op.id !== gateId
          ),
        };
      }
      return { steps: newSteps };
    });
  },

  updateGateParams: (stepIndex: number, gateId: string, params: number[]) => {
    set((state) => {
      const newSteps = [...state.steps];
      if (stepIndex < newSteps.length) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          operations: newSteps[stepIndex].operations.map((op) =>
            op.id === gateId ? { ...op, params } : op
          ),
        };
      }
      return { steps: newSteps };
    });
  },

  setQubits: (n: number) => {
    set({ numQubits: Math.max(1, Math.min(16, n)) });
  },

  setClbits: (n: number) => {
    set({ numClbits: Math.max(0, n) });
  },

  setSelectedStep: (step: number | null) => {
    set({ selectedStep: step });
  },

  setTargetSDK: (sdk: TargetSDK) => {
    set({ targetSDK: sdk });
  },

  addStep: () => {
    set((state) => ({
      steps: [
        ...state.steps,
        { stepIndex: state.steps.length, operations: [] },
      ],
    }));
  },

  removeStep: (stepIndex: number) => {
    set((state) => ({
      steps: state.steps
        .filter((_, i) => i !== stepIndex)
        .map((step, i) => ({ ...step, stepIndex: i })),
    }));
  },

  loadCircuitFromIR: (ir: QuantumCircuitIR) => {
    set({
      numQubits: ir.qubits,
      numClbits: ir.clbits,
      steps: ir.steps,
      selectedStep: null,
    });
  },

  resetCircuit: () => {
    set({
      numQubits: DEFAULT_QUBITS,
      numClbits: DEFAULT_CLBITS,
      steps: [],
      selectedStep: null,
    });
  },

  getCircuitIR: (): QuantumCircuitIR => {
    const state = get();
    return {
      version: "1.0",
      qubits: state.numQubits,
      clbits: state.numClbits,
      steps: state.steps,
    };
  },
}));
