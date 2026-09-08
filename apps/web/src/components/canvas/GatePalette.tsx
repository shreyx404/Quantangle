"use client";

import React from "react";
import type { GateType } from "@quantangle/quantum-ast";
import { X, Sparkles } from "lucide-react";

interface GateDef {
  type: GateType;
  name: string;
  category: "single" | "two" | "rotation" | "measure";
  desc: string;
  badge?: string;
  chipClass: string;
  selectedClass: string;
}

export const GATE_DEFINITIONS: GateDef[] = [
  // 1. Single-qubit Clifford & Pauli
  {
    type: "H",
    name: "H",
    category: "single",
    desc: "Hadamard — creates equal superposition (|0⟩ + |1⟩)/√2",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "X",
    name: "X",
    category: "single",
    desc: "Pauli-X (NOT) — bit flip |0⟩ ↔ |1⟩",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "Y",
    name: "Y",
    category: "single",
    desc: "Pauli-Y — bit & phase flip with factor i",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "Z",
    name: "Z",
    category: "single",
    desc: "Pauli-Z — phase flip |1⟩ → -|1⟩",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "S",
    name: "S",
    category: "single",
    desc: "Phase S gate — π/2 relative phase (√Z)",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "T",
    name: "T",
    category: "single",
    desc: "T gate — π/4 relative phase (∜Z non-Clifford)",
    chipClass: "bg-[#0e1526] text-sky-200 border-white/[0.08] hover:border-sky-400/40 hover:bg-[#131d33]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },

  // 2. Two-qubit Entanglement
  {
    type: "CX",
    name: "CNOT",
    category: "two",
    badge: "2q",
    desc: "Controlled-NOT — maximally entangles control and target qubits",
    chipClass: "bg-[#0c1a17] text-emerald-200 border-white/[0.08] hover:border-emerald-400/40 hover:bg-[#112420]",
    selectedClass: "bg-emerald-500/20 text-emerald-100 border-emerald-400 ring-1 ring-emerald-400/50",
  },
  {
    type: "CZ",
    name: "CZ",
    category: "two",
    badge: "2q",
    desc: "Controlled-Z — flips sign if both qubits are in |1⟩",
    chipClass: "bg-[#0c1a17] text-emerald-200 border-white/[0.08] hover:border-emerald-400/40 hover:bg-[#112420]",
    selectedClass: "bg-emerald-500/20 text-emerald-100 border-emerald-400 ring-1 ring-emerald-400/50",
  },
  {
    type: "SWAP",
    name: "SWAP",
    category: "two",
    badge: "2q",
    desc: "SWAP — exchanges quantum states between two wires",
    chipClass: "bg-[#18160e] text-amber-200 border-white/[0.08] hover:border-amber-400/40 hover:bg-[#221f14]",
    selectedClass: "bg-amber-500/20 text-amber-100 border-amber-400 ring-1 ring-amber-400/50",
  },

  // 3. Parametric Rotations
  {
    type: "RX",
    name: "Rx",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around X-axis by angle θ",
    chipClass: "bg-[#181224] text-violet-200 border-white/[0.08] hover:border-violet-400/40 hover:bg-[#201830]",
    selectedClass: "bg-violet-500/20 text-violet-100 border-violet-400 ring-1 ring-violet-400/50",
  },
  {
    type: "RY",
    name: "Ry",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Y-axis by angle θ",
    chipClass: "bg-[#181224] text-violet-200 border-white/[0.08] hover:border-violet-400/40 hover:bg-[#201830]",
    selectedClass: "bg-violet-500/20 text-violet-100 border-violet-400 ring-1 ring-violet-400/50",
  },
  {
    type: "RZ",
    name: "Rz",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Z-axis by angle θ",
    chipClass: "bg-[#181224] text-violet-200 border-white/[0.08] hover:border-violet-400/40 hover:bg-[#201830]",
    selectedClass: "bg-violet-500/20 text-violet-100 border-violet-400 ring-1 ring-violet-400/50",
  },

  // 4. Measurement
  {
    type: "M",
    name: "MEAS",
    category: "measure",
    desc: "Computational Z-basis measurement collapsing quantum state to classical bit",
    chipClass: "bg-[#201018] text-rose-200 border-white/[0.08] hover:border-rose-400/40 hover:bg-[#2c1521]",
    selectedClass: "bg-rose-500/20 text-rose-100 border-rose-400 ring-1 ring-rose-400/50",
  },
];

interface GatePaletteProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType | null) => void;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGate,
  onSelectGate,
}) => {
  const selectedDef = GATE_DEFINITIONS.find((g) => g.type === selectedGate);

  return (
    <div className="bg-[#0b0f1a] rounded-xl p-3.5 border border-white/[0.06] flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200 tracking-tight">
            Gate Palette
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            · 13 Quantum Operators
          </span>
        </div>

        {selectedGate && (
          <button
            onClick={() => onSelectGate(null)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center gap-1 transition-colors active:translate-y-[1px]"
          >
            <span>Deselect</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Unified Instruction Rack */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Module 1: Clifford & Pauli */}
        <div className="flex items-center gap-1.5 bg-[#070b14] rounded-lg p-1.5 border border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 px-1 select-none">
            Clifford
          </span>
          {GATE_DEFINITIONS.filter((g) => g.category === "single").map((def) => {
            const isSelected = selectedGate === def.type;
            return (
              <button
                key={def.type}
                onClick={() => onSelectGate(isSelected ? null : def.type)}
                title={def.desc}
                className={`h-8 w-8 rounded font-mono text-xs font-bold border transition-all active:translate-y-[1px] flex items-center justify-center ${
                  isSelected ? def.selectedClass : def.chipClass
                }`}
              >
                {def.name}
              </button>
            );
          })}
        </div>

        {/* Module 2: Entangling (2-Qubit) */}
        <div className="flex items-center gap-1.5 bg-[#070b14] rounded-lg p-1.5 border border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 px-1 select-none">
            2-Qubit
          </span>
          {GATE_DEFINITIONS.filter((g) => g.category === "two").map((def) => {
            const isSelected = selectedGate === def.type;
            return (
              <button
                key={def.type}
                onClick={() => onSelectGate(isSelected ? null : def.type)}
                title={def.desc}
                className={`h-8 px-2.5 rounded font-mono text-xs font-bold border transition-all active:translate-y-[1px] flex items-center gap-1 ${
                  isSelected ? def.selectedClass : def.chipClass
                }`}
              >
                <span>{def.name}</span>
                {def.badge && (
                  <span className="text-[9px] font-normal text-slate-400 bg-black/40 px-1 rounded font-mono">
                    {def.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Module 3: Parametric Rotations */}
        <div className="flex items-center gap-1.5 bg-[#070b14] rounded-lg p-1.5 border border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 px-1 select-none">
            Rotations
          </span>
          {GATE_DEFINITIONS.filter((g) => g.category === "rotation").map((def) => {
            const isSelected = selectedGate === def.type;
            return (
              <button
                key={def.type}
                onClick={() => onSelectGate(isSelected ? null : def.type)}
                title={def.desc}
                className={`h-8 px-2 rounded font-mono text-xs font-bold border transition-all active:translate-y-[1px] flex items-center gap-1 ${
                  isSelected ? def.selectedClass : def.chipClass
                }`}
              >
                <span>{def.name}</span>
                {def.badge && (
                  <span className="text-[10px] font-normal text-violet-300/80 font-serif italic">
                    {def.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Module 4: Measurement */}
        <div className="flex items-center gap-1.5 bg-[#070b14] rounded-lg p-1.5 border border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 px-1 select-none">
            Measure
          </span>
          {GATE_DEFINITIONS.filter((g) => g.category === "measure").map((def) => {
            const isSelected = selectedGate === def.type;
            return (
              <button
                key={def.type}
                onClick={() => onSelectGate(isSelected ? null : def.type)}
                title={def.desc}
                className={`h-8 px-2.5 rounded font-mono text-xs font-bold border transition-all active:translate-y-[1px] flex items-center justify-center ${
                  isSelected ? def.selectedClass : def.chipClass
                }`}
              >
                {def.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status Readout */}
      <div className="text-xs px-3 py-2 rounded-lg bg-[#070b14] border border-white/[0.04] text-slate-400 flex items-center gap-2.5">
        {selectedDef ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />
            <span className="text-cyan-300 font-medium font-mono">
              {selectedDef.type}
            </span>
            <span className="text-slate-300 truncate">{selectedDef.desc}</span>
            <span className="text-slate-500 ml-auto hidden md:inline text-[11px] font-mono flex-shrink-0">
              Click wire cell to insert
            </span>
          </>
        ) : (
          <span className="text-slate-500 text-[11px] font-mono">
            Select a quantum gate, then click any wire intersection to place
          </span>
        )}
      </div>
    </div>
  );
};
