"use client";

import React, { useState, useEffect } from "react";
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
  Download,
} from "lucide-react";
import { useQuestStore } from "../../stores/useQuestStore";
import { usePwaStore } from "../../stores/usePwaStore";

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
        { stepIndex: 0, operations: [{ id: "t1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "t2", gate: "T", qubits: [0] }] },
        { stepIndex: 2, operations: [{ id: "t3", gate: "H", qubits: [1] }] },
        { stepIndex: 3, operations: [{ id: "t4", gate: "CX", qubits: [1, 2] }] },
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
        {
          stepIndex: 0,
          operations: [
            { id: "gr1", gate: "H", qubits: [0] },
            { id: "gr2", gate: "H", qubits: [1] },
          ],
        },
        { stepIndex: 1, operations: [{ id: "gr3", gate: "CZ", qubits: [0, 1] }] },
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
  const [mounted, setMounted] = useState(false);
  const { loadCircuitFromIR } = useCircuitStore();
  const {
    openArena,
    streakDays,
    totalXP,
    openCredentialModal,
    issuedCredentials,
  } = useQuestStore();

  const {
    effectiveOnline,
    canInstall,
    triggerInstall,
    toggleSimulatedOffline,
  } = usePwaStore();

  // Mount guard to prevent hydration mismatch on client-persisted store items
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectPreset = (key: string) => {
    const preset = PRESET_CIRCUITS[key];
    if (preset) {
      loadCircuitFromIR(preset.ir);
    }
  };

  const certsCount = mounted ? Object.keys(issuedCredentials).length : 0;
  const currentStreak = mounted ? streakDays : 5;
  const currentXP = mounted ? totalXP : 350;

  return (
    <header className="bg-[#070b14] border-b border-white/[0.06] px-5 lg:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Zone 1: Brand & Hardware Tag */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0e1422] border border-white/[0.08] flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-sm">
            <Atom className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">
                Quantangle
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] tabular-nums">
                SIH26140
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-none mt-0.5">
              Quantum Circuit Designer & Simulation Hub
            </p>
          </div>
        </div>

        {/* Zone 2: Telemetry Deck */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live WASM Edge / Offline Sim Status */}
          <button
            id="pwa-offline-toggle-btn"
            data-testid="pwa-offline-toggle-btn"
            onClick={toggleSimulatedOffline}
            className={`h-8 flex items-center gap-2 px-3 rounded-lg border text-xs transition-all active:translate-y-[1px] ${
              effectiveOnline
                ? "bg-[#0b101c] border-white/[0.06] hover:border-emerald-500/30 text-slate-300"
                : "bg-amber-950/30 border-amber-500/40 text-amber-300"
            }`}
            title={
              effectiveOnline
                ? "Online: Rust WASM Edge Active (Click to toggle Simulated Offline Mode)"
                : "Offline Mode: Local Rust WASM executing with 0ms edge latency (Click to resume online)"
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                effectiveOnline ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="font-medium">
              {effectiveOnline ? "WASM Edge" : "Offline Sim"}
            </span>
            <span className="text-white/[0.12]">·</span>
            <span
              className={`font-mono text-[11px] tabular-nums ${
                effectiveOnline ? "text-emerald-400" : "text-amber-400 font-semibold"
              }`}
            >
              {effectiveOnline ? "0.08ms" : "Local Edge"}
            </span>
          </button>

          {/* Install PWA Standalone App Button */}
          {mounted && canInstall && (
            <button
              onClick={() => triggerInstall()}
              className="h-8 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-all active:translate-y-[1px]"
              title="Install Quantangle as a Standalone Desktop/Mobile App"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install App</span>
            </button>
          )}

          {/* Quest Arena Button with Live Streak & XP */}
          <button
            onClick={openArena}
            className="h-8 px-3 rounded-lg bg-[#0b101c] hover:bg-[#101726] border border-amber-500/20 hover:border-amber-500/35 text-amber-300 font-medium text-xs flex items-center gap-2 transition-all active:translate-y-[1px]"
            title="Open Quest Labs & Gamification Arena"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Quests</span>
            <span className="text-white/[0.12]">·</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-orange-400">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400/20" />
              <span className="tabular-nums">{currentStreak}d</span>
            </span>
            <span className="text-white/[0.12]">·</span>
            <span className="font-mono text-[11px] text-amber-300 font-semibold tabular-nums">
              {currentXP} XP
            </span>
          </button>

          {/* NQM Micro-Credentials Button */}
          <button
            onClick={() => {
              if (certsCount > 0) {
                openCredentialModal();
              } else {
                openArena();
              }
            }}
            className="h-8 px-3 rounded-lg bg-[#0b101c] hover:bg-[#101726] border border-amber-500/20 hover:border-amber-500/35 text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-all active:translate-y-[1px]"
            title="National Quantum Mission Micro-Credentials"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>NQM Certs</span>
            {certsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono leading-none tabular-nums">
                {certsCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: Control Deck */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Circuit Dropdown */}
          <div className="h-8 flex items-center gap-2 bg-[#0b101c] rounded-lg px-2.5 border border-white/[0.06] hover:border-white/[0.12] transition-colors text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              aria-label="Select a preset quantum circuit"
              onChange={(e) => handleSelectPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="" disabled>
                Load preset...
              </option>
              {Object.entries(PRESET_CIRCUITS).map(([key, item]) => (
                <option key={key} value={key} className="bg-[#0b101c] text-white">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action: Simulate */}
          <button
            onClick={onRunSimulation}
            disabled={isRunningSimulation}
            className="h-8 px-3.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all active:translate-y-[1px] disabled:opacity-50 shadow-sm"
          >
            {isRunningSimulation ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 flex-shrink-0" />
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
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-400 hover:text-white transition-colors active:translate-y-[1px]"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
