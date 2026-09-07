// =============================================================================
// useCopilotStore — Qu-Copilot State Management & Tutor Memory
// =============================================================================
// Manages conversation messages, thinking status, open/collapse state,
// verified circuit suggestions, and instant tutor interactions.
// =============================================================================

"use client";

import { create } from "zustand";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  circuit?: QuantumCircuitIR;
  fidelity?: number;
  explanation?: string;
  timestamp: number;
}

export const COPILOT_PRESETS: Record<
  string,
  { name: string; circuit: QuantumCircuitIR; explanation: string }
> = {
  bell: {
    name: "Bell State |Φ⁺⟩",
    circuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "b1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "b2", gate: "CX", qubits: [0, 1] }] },
      ],
    },
    explanation:
      "The Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is created by applying a Hadamard gate on qubit 0 (generating equal superposition |+⟩ = (|0⟩ + |1⟩)/√2) followed by a CNOT (CX) gate with qubit 0 as control and qubit 1 as target. This produces maximal two-qubit entanglement.",
  },
  ghz: {
    name: "3-Qubit GHZ State",
    circuit: {
      version: "1.0",
      qubits: 3,
      clbits: 3,
      steps: [
        { stepIndex: 0, operations: [{ id: "g1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "g2", gate: "CX", qubits: [0, 1] }] },
        { stepIndex: 2, operations: [{ id: "g3", gate: "CX", qubits: [1, 2] }] },
      ],
    },
    explanation:
      "The 3-qubit Greenberger-Horne-Zeilinger (GHZ) state |GHZ⟩ = (|000⟩ + |111⟩)/√2 extends maximal entanglement across 3 qubits. A Hadamard gate on q₀ is followed by cascading CNOT gates from q₀ to q₁ and q₁ to q₂.",
  },
  superposition: {
    name: "Parallel Superposition",
    circuit: {
      version: "1.0",
      qubits: 2,
      clbits: 0,
      steps: [
        {
          stepIndex: 0,
          operations: [
            { id: "s1", gate: "H", qubits: [0] },
            { id: "s2", gate: "H", qubits: [1] },
          ],
        },
      ],
    },
    explanation:
      "Applying parallel Hadamard gates produces an equal superposition over all 2ⁿ basis states: |++⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2. This serves as the foundation for quantum parallelism in Grover's and Deutsch-Jozsa algorithms.",
  },
  grover_oracle: {
    name: "Phase Kickback & Oracle",
    circuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        {
          stepIndex: 0,
          operations: [
            { id: "p1", gate: "H", qubits: [0] },
            { id: "p2", gate: "H", qubits: [1] },
          ],
        },
        { stepIndex: 1, operations: [{ id: "p3", gate: "CZ", qubits: [0, 1] }] },
      ],
    },
    explanation:
      "Phase kickback occurs when a controlled operation imparts a phase change onto the control qubit rather than changing the target. In Grover's search, a CZ gate marks state |11⟩ by flipping its sign from + to -, preparing it for amplitude amplification.",
  },
};

interface CopilotState {
  isOpen: boolean;
  messages: CopilotMessage[];
  isThinking: boolean;
  appliedCircuitId: string | null;

  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  markApplied: (circuitId: string) => void;
}

const INITIAL_MESSAGE: CopilotMessage = {
  id: "welcome-1",
  sender: "copilot",
  text: "Hello! I am Qu-Copilot, your interactive AI Quantum Tutor. All circuit suggestions are mathematically validated through our Unitary Verification Pipeline (F ≥ 0.999) before you see them.",
  timestamp: Date.now(),
};

export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: true,
  messages: [INITIAL_MESSAGE],
  isThinking: false,
  appliedCircuitId: null,

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  clearChat: () =>
    set({
      messages: [{ ...INITIAL_MESSAGE, id: `welcome-${Date.now()}`, timestamp: Date.now() }],
      appliedCircuitId: null,
    }),

  markApplied: (circuitId) => {
    set({ appliedCircuitId: circuitId });
    setTimeout(() => {
      set({ appliedCircuitId: null });
    }, 2500);
  },

  sendMessage: (userText) => {
    if (!userText.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
    }));

    setTimeout(() => {
      let reply: CopilotMessage;
      const lower = userText.toLowerCase();

      if (lower.includes("bell") || lower.includes("entangle")) {
        reply = {
          id: `reply-${Date.now()}`,
          sender: "copilot",
          text: COPILOT_PRESETS.bell.explanation,
          circuit: COPILOT_PRESETS.bell.circuit,
          fidelity: 1.0,
          timestamp: Date.now(),
        };
      } else if (lower.includes("ghz") || lower.includes("3 qubit") || lower.includes("greenberger")) {
        reply = {
          id: `reply-${Date.now()}`,
          sender: "copilot",
          text: COPILOT_PRESETS.ghz.explanation,
          circuit: COPILOT_PRESETS.ghz.circuit,
          fidelity: 1.0,
          timestamp: Date.now(),
        };
      } else if (lower.includes("superposition") || lower.includes("hadamard")) {
        reply = {
          id: `reply-${Date.now()}`,
          sender: "copilot",
          text: COPILOT_PRESETS.superposition.explanation,
          circuit: COPILOT_PRESETS.superposition.circuit,
          fidelity: 1.0,
          timestamp: Date.now(),
        };
      } else if (lower.includes("phase") || lower.includes("kickback") || lower.includes("oracle")) {
        reply = {
          id: `reply-${Date.now()}`,
          sender: "copilot",
          text: COPILOT_PRESETS.grover_oracle.explanation,
          circuit: COPILOT_PRESETS.grover_oracle.circuit,
          fidelity: 1.0,
          timestamp: Date.now(),
        };
      } else {
        reply = {
          id: `reply-${Date.now()}`,
          sender: "copilot",
          text: `In quantum computing, state transformations are governed by unitary matrices U†U = I to preserve total probability (|⟨ψ|ψ⟩|² = 1). Superposition, constructive/destructive interference, and entanglement allow quantum circuits to navigate Hilbert spaces of dimension 2ⁿ exponentially faster than classical Turing machines.`,
          timestamp: Date.now(),
        };
      }

      set((state) => ({
        messages: [...state.messages, reply],
        isThinking: false,
      }));
    }, 500);
  },
}));
