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
    <header className="glass-panel border-b border-white/10 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)]">
            <Atom className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Quant<span className="quantum-text-gradient">angle</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SIH26140
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive AI-Guided Quantum Computing Platform
            </p>
          </div>
        </div>

        {/* Engine Status & Preset Picker */}
        <div className="flex items-center gap-3">
          {/* Edge Simulator Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WASM Edge (0ms Latency)</span>
          </div>

          {/* Preset Circuits Dropdown */}
          <div className="flex items-center gap-1.5 bg-black/40 rounded-lg px-2.5 py-1 border border-white/10 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <select
              onChange={(e) => handleSelectPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                Load Preset Circuit...
              </option>
              {Object.entries(PRESET_CIRCUITS).map(([key, item]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Run Simulation Trigger */}
          <button
            onClick={onRunSimulation}
            disabled={isRunningSimulation}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            {isRunningSimulation ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Circuit</span>
              </>
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/shreyx404/Quantangle"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
