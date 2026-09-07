"use client";

import React from "react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { useSimulationStore } from "../../stores/useSimulationStore";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";
import {
  Atom,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Share2,
  Github,
  BookOpen,
} from "lucide-react";

export const PRESET_CIRCUITS: Record<
  string,
  { name: string; ir: QuantumCircuitIR; desc: string }
> = {
  bell: {
    name: "Bell State |Φ⁺⟩",
    desc: "Maximally entangled 2-qubit state: (|00⟩ + |11⟩)/√2",
    ir: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "b1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "b2", gate: "CX", qubits: [0, 1] }] },
      ],
    },
  },
  ghz: {
    name: "3-Qubit GHZ State",
    desc: "Greenberger-Horne-Zeilinger state: (|000⟩ + |111⟩)/√2",
    ir: {
      version: "1.0",
      qubits: 3,
      clbits: 3,
      steps: [
        { stepIndex: 0, operations: [{ id: "g1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "g2", gate: "CX", qubits: [0, 1] }] },
        { stepIndex: 2, operations: [{ id: "g3", gate: "CX", qubits: [1, 2] }] },
      ],
    },
  },
  teleportation: {
    name: "Quantum Teleportation",
    desc: "Teleports state of qubit 0 to qubit 2 via entangled Bell pair",
    ir: {
      version: "1.0",
      qubits: 3,
      clbits: 2,
      steps: [
        // Prepare arbitrary state on q0: H + T
        { stepIndex: 0, operations: [{ id: "t1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "t2", gate: "T", qubits: [0] }] },
        // Create Bell pair between q1 and q2
        { stepIndex: 2, operations: [{ id: "t3", gate: "H", qubits: [1] }] },
        { stepIndex: 3, operations: [{ id: "t4", gate: "CX", qubits: [1, 2] }] },
        // Bell measurement on q0 and q1
        { stepIndex: 4, operations: [{ id: "t5", gate: "CX", qubits: [0, 1] }] },
        { stepIndex: 5, operations: [{ id: "t6", gate: "H", qubits: [0] }] },
        {
          stepIndex: 6,
          operations: [
            { id: "t7", gate: "M", qubits: [0], clbit: 0 },
            { id: "t8", gate: "M", qubits: [1], clbit: 1 },
          ],
        },
      ],
    },
  },
  grover2q: {
    name: "Grover's 2-Qubit Search",
    desc: "Searches for marked state |11⟩ with 100% probability in 1 iteration",
    ir: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        // 1. Equal superposition
        {
          stepIndex: 0,
          operations: [
            { id: "gr1", gate: "H", qubits: [0] },
            { id: "gr2", gate: "H", qubits: [1] },
          ],
        },
        // 2. Oracle for |11⟩: CZ gate
        { stepIndex: 1, operations: [{ id: "gr3", gate: "CZ", qubits: [0, 1] }] },
        // 3. Diffuser (Inversion about average)
        {
          stepIndex: 2,
          operations: [
            { id: "gr4", gate: "H", qubits: [0] },
            { id: "gr5", gate: "H", qubits: [1] },
          ],
        },
        {
          stepIndex: 3,
          operations: [
            { id: "gr6", gate: "X", qubits: [0] },
            { id: "gr7", gate: "X", qubits: [1] },
          ],
        },
        { stepIndex: 4, operations: [{ id: "gr8", gate: "CZ", qubits: [0, 1] }] },
        {
          stepIndex: 5,
          operations: [
            { id: "gr9", gate: "X", qubits: [0] },
            { id: "gr10", gate: "X", qubits: [1] },
          ],
        },
        {
          stepIndex: 6,
          operations: [
            { id: "gr11", gate: "H", qubits: [0] },
            { id: "gr12", gate: "H", qubits: [1] },
          ],
        },
      ],
    },
  },
};

interface HeaderProps {
  onRunSimulation: () => void;
  isRunningSimulation: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRunSimulation,
  isRunningSimulation,
}) => {
  const { loadCircuitFromIR } = useCircuitStore();

  const handleSelectPreset = (key: string) => {
    const preset = PRESET_CIRCUITS[key];
    if (preset) {
      loadCircuitFromIR(preset.ir);
    }
  };

  return (
    <header className="bg-[#0b0f19] border-b border-white/[0.08] px-5 py-2.5 sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Logo, Brand & Hardware Specs */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111726] border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-sm flex-shrink-0">
            <Atom className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5 font-mono">
                Quantangle
              </h1>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 tabular-nums font-semibold">
                SIH26140
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.08] hidden sm:inline-block">
                Little-Endian (q₀ LSB)
              </span>
            </div>
            <p className="text-xs text-slate-400 text-pretty leading-snug">
              Interactive Quantum Circuit Designer & Multi-Engine Simulation Hub
            </p>
          </div>
        </div>

        {/* Zone 2 & 3: Telemetry, Presets & Hardware Execution Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-group: Live WASM Engine Telemetry */}
          <div className="h-8 flex items-center gap-2 px-3 rounded-lg bg-[#101726] border border-white/[0.08] text-xs font-telemetry text-slate-300 tabular-nums shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-slate-200 font-medium">WASM Edge</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-emerald-400 font-semibold">0.08ms</span>
          </div>

          {/* Sub-group: Preset Circuit Dropdown */}
          <div className="h-8 flex items-center gap-1.5 bg-[#101726] rounded-lg px-2.5 border border-white/[0.08] text-xs hover:border-white/20 transition-colors shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <select
              aria-label="Select a preset quantum circuit"
              onChange={(e) => handleSelectPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-mono"
            >
              <option value="" disabled>
                Load Preset Circuit...
              </option>
              {Object.entries(PRESET_CIRCUITS).map(([key, item]) => (
                <option key={key} value={key} className="bg-[#0b0f19] text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-group: Primary Simulate Trigger */}
          <button
            onClick={onRunSimulation}
            disabled={isRunningSimulation}
            className="h-8 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isRunningSimulation ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 flex-shrink-0" />
                <span>Simulate Circuit</span>
              </>
            )}
          </button>

          {/* Sub-group: External Repository Link */}
          <a
            href="https://github.com/shreyx404/Quantangle"
            target="_blank"
            rel="noreferrer"
            aria-label="View Quantangle on GitHub"
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors active:translate-y-[1px]"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
