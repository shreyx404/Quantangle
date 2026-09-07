"use client";

import React from "react";
import type { GateType } from "@quantangle/quantum-ast";
import { Sparkles, Layers } from "lucide-react";

interface GateDef {
  type: GateType;
  name: string;
  category: "single" | "two" | "rotation" | "measure";
  desc: string;
  color: string;
  border: string;
}

export const GATE_DEFINITIONS: GateDef[] = [
  // Single-qubit Clifford & Pauli
  { type: "H", name: "H", category: "single", desc: "Hadamard — creates equal superposition (|0⟩ + |1⟩)/√2", color: "bg-cyan-500/20 text-cyan-300", border: "border-cyan-500/40 hover:border-cyan-400" },
  { type: "X", name: "X", category: "single", desc: "Pauli-X (NOT) — bit flip |0⟩ ↔ |1⟩", color: "bg-blue-500/20 text-blue-300", border: "border-blue-500/40 hover:border-blue-400" },
  { type: "Y", name: "Y", category: "single", desc: "Pauli-Y — bit & phase flip with factor i", color: "bg-indigo-500/20 text-indigo-300", border: "border-indigo-500/40 hover:border-indigo-400" },
  { type: "Z", name: "Z", category: "single", desc: "Pauli-Z — phase flip |1⟩ → -|1⟩", color: "bg-purple-500/20 text-purple-300", border: "border-purple-500/40 hover:border-purple-400" },
  { type: "S", name: "S", category: "single", desc: "Phase S gate — π/2 relative phase (√Z)", color: "bg-fuchsia-500/20 text-fuchsia-300", border: "border-fuchsia-500/40 hover:border-fuchsia-400" },
  { type: "T", name: "T", category: "single", desc: "T gate — π/4 relative phase (∜Z)", color: "bg-pink-500/20 text-pink-300", border: "border-pink-500/40 hover:border-pink-400" },

  // Two-qubit Entanglement
  { type: "CX", name: "CNOT", category: "two", desc: "Controlled-NOT — entangles control and target qubits", color: "bg-emerald-500/20 text-emerald-300", border: "border-emerald-500/40 hover:border-emerald-400" },
  { type: "CZ", name: "CZ", category: "two", desc: "Controlled-Z — flips sign if both qubits are |1⟩", color: "bg-teal-500/20 text-teal-300", border: "border-teal-500/40 hover:border-teal-400" },
  { type: "SWAP", name: "SWAP", category: "two", desc: "SWAP gate — exchanges states of two qubits", color: "bg-amber-500/20 text-amber-300", border: "border-amber-500/40 hover:border-amber-400" },

  // Parametric Rotations
  { type: "RX", name: "Rx(θ)", category: "rotation", desc: "Rotation around X axis by angle θ", color: "bg-violet-500/20 text-violet-300", border: "border-violet-500/40 hover:border-violet-400" },
  { type: "RY", name: "Ry(θ)", category: "rotation", desc: "Rotation around Y axis by angle θ", color: "bg-purple-500/20 text-purple-300", border: "border-purple-500/40 hover:border-purple-400" },
  { type: "RZ", name: "Rz(θ)", category: "rotation", desc: "Rotation around Z axis by angle θ", color: "bg-sky-500/20 text-sky-300", border: "border-sky-500/40 hover:border-sky-400" },

  // Measurement
  { type: "M", name: "MEAS", category: "measure", desc: "Measurement — collapses quantum state into classical bit", color: "bg-rose-500/20 text-rose-300", border: "border-rose-500/40 hover:border-rose-400" },
];

interface GatePaletteProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType | null) => void;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGate,
  onSelectGate,
}) => {
  return (
    <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Quantum Gate Palette
          </span>
        </div>
        {selectedGate && (
          <button
            onClick={() => onSelectGate(null)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 transition-colors"
          >
            Clear Selected ({selectedGate})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        {GATE_DEFINITIONS.map((def) => {
          const isSelected = selectedGate === def.type;
          return (
            <button
              key={def.type}
              onClick={() => onSelectGate(isSelected ? null : def.type)}
              title={def.desc}
              className={`relative px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all duration-150 flex items-center gap-1.5 ${
                def.color
              } ${def.border} ${
                isSelected
                  ? "ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)] scale-105"
                  : "hover:scale-105 active:scale-95"
              }`}
            >
              <span>{def.name}</span>
              {def.category === "two" && (
                <span className="text-[9px] opacity-70">2q</span>
              )}
              {def.category === "rotation" && (
                <span className="text-[9px] opacity-70">θ</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-slate-400 px-1">
        {selectedGate ? (
          <span className="text-cyan-300 font-medium">
            ✦ Selected <span className="font-mono font-bold text-white">[{selectedGate}]</span>: Click any cell in the circuit grid to place.
          </span>
        ) : (
          <span>Select a gate above, then click on the circuit grid to place it on a qubit wire.</span>
        )}
      </div>
    </div>
  );
};
