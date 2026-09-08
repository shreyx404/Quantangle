"use client";

import React from "react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { useSimulationStore } from "../../stores/useSimulationStore";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";
import {
  Atom,
  Play,
  Zap,
  BookOpen,
  Github,
  Trophy,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { useQuestStore } from "../../stores/useQuestStore";

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
  const {
    openArena,
    streakDays,
    totalXP,
    openCredentialModal,
    issuedCredentials,
  } = useQuestStore();

  const handleSelectPreset = (key: string) => {
    const preset = PRESET_CIRCUITS[key];
    if (preset) {
      loadCircuitFromIR(preset.ir);
    }
  };

  return (
    <header className="bg-[#0a0e18] border-b border-white/[0.05] px-5 lg:px-8 py-3.5 sticky top-0 z-40">
      <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Logo & Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#111726] border border-white/[0.06] flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[15px] font-semibold tracking-tight text-white">
                Quantangle
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06] tabular-nums">
                SIH26140
              </span>
            </div>
            <p className="text-[13px] text-slate-400 leading-snug mt-0.5">
              Quantum Circuit Designer & Simulation Hub
            </p>
          </div>
        </div>

        {/* Zone 2: Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live WASM Engine Telemetry */}
          <div className="h-9 flex items-center gap-2.5 px-3.5 rounded-xl bg-[#0d1220] border border-white/[0.05] text-[12px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">WASM Edge</span>
            <span className="text-white/[0.08]">·</span>
            <span className="text-emerald-400 font-mono tabular-nums text-[11px]">0.08ms</span>
          </div>

          {/* Quest Arena Button with Live Streak & XP Telemetry */}
          <button
            onClick={openArena}
            className="h-9 px-3.5 rounded-xl bg-[#0d1220] hover:bg-[#131b2e] border border-amber-500/25 hover:border-amber-500/40 text-amber-300 font-medium text-[13px] flex items-center gap-2 transition-all active:translate-y-[1px]"
            title="Open Quest Labs & Gamification Arena"
          >
            <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Quests</span>
            <span className="text-white/[0.1]">·</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
              <span>{streakDays}d</span>
            </span>
            <span className="text-white/[0.1]">·</span>
            <span className="font-mono text-[11px] text-amber-300 font-semibold">
              {totalXP} XP
            </span>
          </button>

          {/* NQM Micro-Credentials Button */}
          <button
            onClick={() => {
              if (Object.keys(issuedCredentials).length > 0) {
                openCredentialModal();
              } else {
                openArena();
              }
            }}
            className="h-9 px-3 rounded-xl bg-[#0d1220] hover:bg-[#131b2e] border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-medium text-[13px] flex items-center gap-1.5 transition-all active:translate-y-[1px]"
            title="National Quantum Mission Micro-Credentials"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>NQM Certs</span>
            {Object.keys(issuedCredentials).length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono leading-none">
                {Object.keys(issuedCredentials).length}
              </span>
            )}
          </button>

          {/* Preset Circuit Dropdown */}
          <div className="h-9 flex items-center gap-2 bg-[#0d1220] rounded-xl px-3 border border-white/[0.05] text-[13px] hover:border-white/[0.10] transition-colors">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              aria-label="Select a preset quantum circuit"
              onChange={(e) => handleSelectPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-[13px]"
            >
              <option value="" disabled>
                Load preset...
              </option>
              {Object.entries(PRESET_CIRCUITS).map(([key, item]) => (
                <option key={key} value={key} className="bg-[#0b0f19] text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Simulate Button */}
          <button
            onClick={onRunSimulation}
            disabled={isRunningSimulation}
            className="h-9 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[13px] flex items-center gap-2 transition-colors active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningSimulation ? (
              <>
                <Zap className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5 flex-shrink-0" />
                <span>Simulate</span>
              </>
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/shreyx404/Quantangle"
            target="_blank"
            rel="noreferrer"
            aria-label="View Quantangle on GitHub"
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-400 hover:text-white transition-colors active:translate-y-[1px]"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
