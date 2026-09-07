"use client";

import React from "react";
import type { GateType } from "@quantangle/quantum-ast";
import { Layers, X } from "lucide-react";

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
  // Single-qubit Clifford & Pauli
  {
    type: "H",
    name: "H",
    category: "single",
    desc: "Hadamard — creates equal superposition (|0⟩ + |1⟩)/√2",
    chipClass: "bg-[#101726] text-sky-200 border-sky-500/30 hover:border-sky-400/60 hover:bg-[#152033]",
    selectedClass: "bg-sky-500/20 text-sky-100 border-sky-400 ring-1 ring-sky-400/50",
  },
  {
    type: "X",
    name: "X",
    category: "single",
    desc: "Pauli-X (NOT) — bit flip |0⟩ ↔ |1⟩",
    chipClass: "bg-[#101726] text-blue-200 border-blue-500/30 hover:border-blue-400/60 hover:bg-[#152033]",
    selectedClass: "bg-blue-500/20 text-blue-100 border-blue-400 ring-1 ring-blue-400/50",
  },
  {
    type: "Y",
    name: "Y",
    category: "single",
    desc: "Pauli-Y — bit & phase flip with factor i",
    chipClass: "bg-[#101726] text-indigo-200 border-indigo-500/30 hover:border-indigo-400/60 hover:bg-[#152033]",
    selectedClass: "bg-indigo-500/20 text-indigo-100 border-indigo-400 ring-1 ring-indigo-400/50",
  },
  {
    type: "Z",
    name: "Z",
    category: "single",
    desc: "Pauli-Z — phase flip |1⟩ → -|1⟩",
    chipClass: "bg-[#101726] text-purple-200 border-purple-500/30 hover:border-purple-400/60 hover:bg-[#152033]",
    selectedClass: "bg-purple-500/20 text-purple-100 border-purple-400 ring-1 ring-purple-400/50",
  },
  {
    type: "S",
    name: "S",
    category: "single",
    desc: "Phase S gate — π/2 relative phase (√Z)",
    chipClass: "bg-[#101726] text-fuchsia-200 border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:bg-[#152033]",
    selectedClass: "bg-fuchsia-500/20 text-fuchsia-100 border-fuchsia-400 ring-1 ring-fuchsia-400/50",
  },
  {
    type: "T",
    name: "T",
    category: "single",
    desc: "T gate — π/4 relative phase (∜Z non-Clifford)",
    chipClass: "bg-[#101726] text-pink-200 border-pink-500/30 hover:border-pink-400/60 hover:bg-[#152033]",
    selectedClass: "bg-pink-500/20 text-pink-100 border-pink-400 ring-1 ring-pink-400/50",
  },

  // Two-qubit Entanglement
  {
    type: "CX",
    name: "CNOT",
    category: "two",
    badge: "2q",
    desc: "Controlled-NOT — entangles control and target qubits",
    chipClass: "bg-[#0b1d19] text-emerald-200 border-emerald-500/35 hover:border-emerald-400/60 hover:bg-[#102924]",
    selectedClass: "bg-emerald-500/20 text-emerald-100 border-emerald-400 ring-1 ring-emerald-400/50",
  },
  {
    type: "CZ",
    name: "CZ",
    category: "two",
    badge: "2q",
    desc: "Controlled-Z — flips sign if both qubits are |1⟩",
    chipClass: "bg-[#0b1d19] text-teal-200 border-teal-500/35 hover:border-teal-400/60 hover:bg-[#102924]",
    selectedClass: "bg-teal-500/20 text-teal-100 border-teal-400 ring-1 ring-teal-400/50",
  },
  {
    type: "SWAP",
    name: "SWAP",
    category: "two",
    badge: "2q",
    desc: "SWAP gate — exchanges quantum states between two qubits",
    chipClass: "bg-[#1f1a10] text-amber-200 border-amber-500/35 hover:border-amber-400/60 hover:bg-[#2c2415]",
    selectedClass: "bg-amber-500/20 text-amber-100 border-amber-400 ring-1 ring-amber-400/50",
  },

  // Parametric Rotations
  {
    type: "RX",
    name: "Rx",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around X axis by angle θ",
    chipClass: "bg-[#181226] text-violet-200 border-violet-500/35 hover:border-violet-400/60 hover:bg-[#211933]",
    selectedClass: "bg-violet-500/20 text-violet-100 border-violet-400 ring-1 ring-violet-400/50",
  },
  {
    type: "RY",
    name: "Ry",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Y axis by angle θ",
    chipClass: "bg-[#181226] text-purple-200 border-purple-500/35 hover:border-purple-400/60 hover:bg-[#211933]",
    selectedClass: "bg-purple-500/20 text-purple-100 border-purple-400 ring-1 ring-purple-400/50",
  },
  {
    type: "RZ",
    name: "Rz",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Z axis by angle θ",
    chipClass: "bg-[#181226] text-cyan-200 border-cyan-500/35 hover:border-cyan-400/60 hover:bg-[#211933]",
    selectedClass: "bg-cyan-500/20 text-cyan-100 border-cyan-400 ring-1 ring-cyan-400/50",
  },

  // Measurement
  {
    type: "M",
    name: "MEAS",
    category: "measure",
    desc: "Computational Z-basis measurement collapsing state to classical bit",
    chipClass: "bg-[#221018] text-rose-200 border-rose-500/35 hover:border-rose-400/60 hover:bg-[#2e1420]",
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
    <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/[0.08] flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="type-label text-slate-300">
            Quantum Gate Palette
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            · Unitary Operations & Measurements
          </span>
        </div>

        {selectedGate && (
          <button
            onClick={() => onSelectGate(null)}
            className="text-[11px] font-mono text-cyan-300 hover:text-white px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1 transition-colors active:translate-y-[1px]"
          >
            <span>Deselect [{selectedGate}]</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Categorized Gate Rack Modules (2x Gap Rule: 12px inter-module, 6px intra-module) */}
      <div className="flex flex-wrap items-stretch gap-3">
        {/* Module 1: Clifford & Pauli */}
        <div className="flex flex-col bg-[#070b14]/80 rounded-lg p-2 border border-white/[0.05]">
          <span className="type-label text-slate-400 px-1 mb-1.5">
            Pauli & Clifford
          </span>
          <div className="flex items-center gap-1.5">
            {GATE_DEFINITIONS.filter((g) => g.category === "single").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-8 min-w-[34px] px-2.5 rounded-md font-mono text-xs font-bold border transition-colors active:translate-y-[1px] flex items-center justify-center ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  {def.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 2: Two-Qubit Entangling Gates */}
        <div className="flex flex-col bg-[#070b14]/80 rounded-lg p-2 border border-white/[0.05]">
          <span className="type-label text-slate-400 px-1 mb-1.5">
            Entangling (2-Qubit)
          </span>
          <div className="flex items-center gap-1.5">
            {GATE_DEFINITIONS.filter((g) => g.category === "two").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-8 px-2.5 rounded-md font-mono text-xs font-bold border transition-colors active:translate-y-[1px] flex items-center gap-1.5 ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  <span>{def.name}</span>
                  {def.badge && (
                    <span className="text-[9px] font-normal text-slate-300 bg-black/40 px-1 py-0.2 rounded font-mono">
                      {def.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 3: Parametric Rotations */}
        <div className="flex flex-col bg-[#070b14]/80 rounded-lg p-2 border border-white/[0.05]">
          <span className="type-label text-slate-400 px-1 mb-1.5">
            Parametric Rotations
          </span>
          <div className="flex items-center gap-1.5">
            {GATE_DEFINITIONS.filter((g) => g.category === "rotation").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-8 px-2.5 rounded-md font-mono text-xs font-bold border transition-colors active:translate-y-[1px] flex items-center gap-1.5 ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  <span>{def.name}</span>
                  {def.badge && (
                    <span className="text-[10px] font-normal text-violet-300 bg-black/40 px-1 py-0.2 rounded font-serif italic">
                      {def.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 4: Measurement */}
        <div className="flex flex-col bg-[#070b14]/80 rounded-lg p-2 border border-white/[0.05]">
          <span className="type-label text-slate-400 px-1 mb-1.5">
            Measurement
          </span>
          <div className="flex items-center gap-1.5">
            {GATE_DEFINITIONS.filter((g) => g.category === "measure").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-8 px-3 rounded-md font-mono text-xs font-bold border transition-colors active:translate-y-[1px] flex items-center justify-center ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  {def.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contextual Status / Instructions Readout */}
      <div className="text-xs font-telemetry px-2.5 py-1.5 rounded-lg bg-[#070b14]/60 border border-white/[0.04] text-slate-300 flex items-center gap-2.5">
        {selectedDef ? (
          <>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="text-cyan-300 font-semibold font-mono">[{selectedDef.type}]</span>
            <span className="text-slate-200 text-pretty">{selectedDef.desc}</span>
            <span className="text-cyan-400/90 ml-auto hidden md:inline flex-shrink-0 font-mono text-[11px]">
              Click any wire slot to place.
            </span>
          </>
        ) : (
          <>
            <span className="text-slate-400 font-medium font-mono text-[11px]">Ready:</span>
            <span className="text-slate-300 text-pretty">
              Select a gate chip above, then click any grid cell on a qubit wire to insert.
            </span>
          </>
        )}
      </div>
    </div>
  );
};
