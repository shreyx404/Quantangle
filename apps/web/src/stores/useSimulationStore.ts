// =============================================================================
// useSimulationStore — Simulation Results & Timeline State
// =============================================================================
// Zustand store managing simulation results received from the Web Worker.
// Controls the timeline scrubber position and active visualization step.
//
// From SYSTEM_PATTERNS.md §1.2
// =============================================================================

"use client";

import { create } from "zustand";
import type { StepStateResult } from "@quantangle/quantum-ast";

interface SimulationState {
  // State
  isRunning: boolean;
  stepStates: StepStateResult[];
  activeStep: number;
  error: string | null;
  simulationTimeMs: number | null;

  // Actions
  setRunning: (running: boolean) => void;
  setStepStates: (results: StepStateResult[]) => void;
  setActiveStep: (step: number) => void;
  setError: (error: string | null) => void;
  setSimulationTime: (ms: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Initial state
  isRunning: false,
  stepStates: [],
  activeStep: 0,
  error: null,
  simulationTimeMs: null,

  // Actions
  setRunning: (running: boolean) => set({ isRunning: running }),

  setStepStates: (results: StepStateResult[]) =>
    set({
      stepStates: results,
      activeStep: results.length > 0 ? results.length - 1 : 0,
      error: null,
    }),

  setActiveStep: (step: number) =>
    set((state) => ({
      activeStep: Math.max(0, Math.min(step, state.stepStates.length - 1)),
    })),

  setError: (error: string | null) =>
    set({ error, isRunning: false }),

  setSimulationTime: (ms: number) =>
    set({ simulationTimeMs: ms }),

  reset: () =>
    set({
      isRunning: false,
      stepStates: [],
      activeStep: 0,
      error: null,
      simulationTimeMs: null,
    }),
}));
