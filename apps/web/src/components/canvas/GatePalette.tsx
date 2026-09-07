"use client";

import React from "react";
import type { GateType } from "@quantangle/quantum-ast";
import { X } from "lucide-react";

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
    chipClass: "bg-[#101726] text-sky-200 border-sky-500/25 hover:border-sky-400/50 hover:bg-[#152033]",
    selectedClass: "bg-sky-500/15 text-sky-100 border-sky-400/60 ring-1 ring-sky-400/30",
  },
  {
    type: "X",
    name: "X",
    category: "single",
    desc: "Pauli-X (NOT) — bit flip |0⟩ ↔ |1⟩",
    chipClass: "bg-[#101726] text-blue-200 border-blue-500/25 hover:border-blue-400/50 hover:bg-[#152033]",
    selectedClass: "bg-blue-500/15 text-blue-100 border-blue-400/60 ring-1 ring-blue-400/30",
  },
  {
    type: "Y",
    name: "Y",
    category: "single",
    desc: "Pauli-Y — bit & phase flip with factor i",
    chipClass: "bg-[#101726] text-indigo-200 border-indigo-500/25 hover:border-indigo-400/50 hover:bg-[#152033]",
    selectedClass: "bg-indigo-500/15 text-indigo-100 border-indigo-400/60 ring-1 ring-indigo-400/30",
  },
  {
    type: "Z",
    name: "Z",
    category: "single",
    desc: "Pauli-Z — phase flip |1⟩ → -|1⟩",
    chipClass: "bg-[#101726] text-purple-200 border-purple-500/25 hover:border-purple-400/50 hover:bg-[#152033]",
    selectedClass: "bg-purple-500/15 text-purple-100 border-purple-400/60 ring-1 ring-purple-400/30",
  },
  {
    type: "S",
    name: "S",
    category: "single",
    desc: "Phase S gate — π/2 relative phase (√Z)",
    chipClass: "bg-[#101726] text-fuchsia-200 border-fuchsia-500/25 hover:border-fuchsia-400/50 hover:bg-[#152033]",
    selectedClass: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-400/60 ring-1 ring-fuchsia-400/30",
  },
  {
    type: "T",
    name: "T",
    category: "single",
    desc: "T gate — π/4 relative phase (∜Z non-Clifford)",
    chipClass: "bg-[#101726] text-pink-200 border-pink-500/25 hover:border-pink-400/50 hover:bg-[#152033]",
    selectedClass: "bg-pink-500/15 text-pink-100 border-pink-400/60 ring-1 ring-pink-400/30",
  },

  // Two-qubit Entanglement
  {
    type: "CX",
    name: "CNOT",
    category: "two",
    badge: "2q",
    desc: "Controlled-NOT — entangles control and target qubits",
    chipClass: "bg-[#0b1d19] text-emerald-200 border-emerald-500/25 hover:border-emerald-400/50 hover:bg-[#102924]",
    selectedClass: "bg-emerald-500/15 text-emerald-100 border-emerald-400/60 ring-1 ring-emerald-400/30",
  },
  {
    type: "CZ",
    name: "CZ",
    category: "two",
    badge: "2q",
    desc: "Controlled-Z — flips sign if both qubits are |1⟩",
    chipClass: "bg-[#0b1d19] text-teal-200 border-teal-500/25 hover:border-teal-400/50 hover:bg-[#102924]",
    selectedClass: "bg-teal-500/15 text-teal-100 border-teal-400/60 ring-1 ring-teal-400/30",
  },
  {
    type: "SWAP",
    name: "SWAP",
    category: "two",
    badge: "2q",
    desc: "SWAP gate — exchanges quantum states between two qubits",
    chipClass: "bg-[#1f1a10] text-amber-200 border-amber-500/25 hover:border-amber-400/50 hover:bg-[#2c2415]",
    selectedClass: "bg-amber-500/15 text-amber-100 border-amber-400/60 ring-1 ring-amber-400/30",
  },

  // Parametric Rotations
  {
    type: "RX",
    name: "Rx",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around X axis by angle θ",
    chipClass: "bg-[#181226] text-violet-200 border-violet-500/25 hover:border-violet-400/50 hover:bg-[#211933]",
    selectedClass: "bg-violet-500/15 text-violet-100 border-violet-400/60 ring-1 ring-violet-400/30",
  },
  {
    type: "RY",
    name: "Ry",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Y axis by angle θ",
    chipClass: "bg-[#181226] text-purple-200 border-purple-500/25 hover:border-purple-400/50 hover:bg-[#211933]",
    selectedClass: "bg-purple-500/15 text-purple-100 border-purple-400/60 ring-1 ring-purple-400/30",
  },
  {
    type: "RZ",
    name: "Rz",
    category: "rotation",
    badge: "θ",
    desc: "Rotation around Z axis by angle θ",
    chipClass: "bg-[#181226] text-cyan-200 border-cyan-500/25 hover:border-cyan-400/50 hover:bg-[#211933]",
    selectedClass: "bg-cyan-500/15 text-cyan-100 border-cyan-400/60 ring-1 ring-cyan-400/30",
  },

  // Measurement
  {
    type: "M",
    name: "MEAS",
    category: "measure",
    desc: "Computational Z-basis measurement collapsing state to classical bit",
    chipClass: "bg-[#221018] text-rose-200 border-rose-500/25 hover:border-rose-400/50 hover:bg-[#2e1420]",
    selectedClass: "bg-rose-500/15 text-rose-100 border-rose-400/60 ring-1 ring-rose-400/30",
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
    <div className="bg-[#0b0f19] rounded-2xl p-4 lg:p-5 border border-white/[0.05] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-slate-300">
            Gate Palette
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Unitary operations & measurements
          </span>
        </div>

        {selectedGate && (
          <button
            onClick={() => onSelectGate(null)}
            className="text-[12px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] flex items-center gap-1.5 transition-colors active:translate-y-[1px]"
          >
            <span>Deselect</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Gate Rack Modules — 2× gap rule: 16px inter-module, 8px intra-module */}
      <div className="flex flex-wrap items-stretch gap-3.5">
        {/* Module 1: Clifford & Pauli */}
        <div className="flex flex-col gap-2 bg-white/[0.015] rounded-xl p-3 border border-white/[0.03]">
          <span className="text-[11px] font-medium text-slate-500 px-0.5">
            Pauli & Clifford
          </span>
          <div className="flex items-center gap-2">
            {GATE_DEFINITIONS.filter((g) => g.category === "single").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-9 min-w-[38px] px-3 rounded-lg font-mono text-[13px] font-bold border transition-all active:translate-y-[1px] flex items-center justify-center ${
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
        <div className="flex flex-col gap-2 bg-white/[0.015] rounded-xl p-3 border border-white/[0.03]">
          <span className="text-[11px] font-medium text-slate-500 px-0.5">
            Entangling
          </span>
          <div className="flex items-center gap-2">
            {GATE_DEFINITIONS.filter((g) => g.category === "two").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-9 px-3 rounded-lg font-mono text-[13px] font-bold border transition-all active:translate-y-[1px] flex items-center gap-1.5 ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  <span>{def.name}</span>
                  {def.badge && (
                    <span className="text-[9px] font-normal text-slate-400 bg-black/30 px-1 rounded font-mono">
                      {def.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 3: Parametric Rotations */}
        <div className="flex flex-col gap-2 bg-white/[0.015] rounded-xl p-3 border border-white/[0.03]">
          <span className="text-[11px] font-medium text-slate-500 px-0.5">
            Rotations
          </span>
          <div className="flex items-center gap-2">
            {GATE_DEFINITIONS.filter((g) => g.category === "rotation").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-9 px-3 rounded-lg font-mono text-[13px] font-bold border transition-all active:translate-y-[1px] flex items-center gap-1.5 ${
                    isSelected ? def.selectedClass : def.chipClass
                  }`}
                >
                  <span>{def.name}</span>
                  {def.badge && (
                    <span className="text-[10px] font-normal text-violet-300/70 font-serif italic">
                      {def.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 4: Measurement */}
        <div className="flex flex-col gap-2 bg-white/[0.015] rounded-xl p-3 border border-white/[0.03]">
          <span className="text-[11px] font-medium text-slate-500 px-0.5">
            Measurement
          </span>
          <div className="flex items-center gap-2">
            {GATE_DEFINITIONS.filter((g) => g.category === "measure").map((def) => {
              const isSelected = selectedGate === def.type;
              return (
                <button
                  key={def.type}
                  onClick={() => onSelectGate(isSelected ? null : def.type)}
                  title={def.desc}
                  className={`h-9 px-3.5 rounded-lg font-mono text-[13px] font-bold border transition-all active:translate-y-[1px] flex items-center justify-center ${
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

      {/* Status Readout */}
      <div className="text-[12px] px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] text-slate-400 flex items-center gap-3">
        {selectedDef ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
            <span className="text-white font-medium font-mono">{selectedDef.type}</span>
            <span className="text-slate-300">{selectedDef.desc}</span>
            <span className="text-slate-500 ml-auto hidden md:inline text-[11px]">
              Click any wire slot to place
            </span>
          </>
        ) : (
          <span className="text-slate-500">
            Select a gate, then click a grid cell on a qubit wire to insert
          </span>
        )}
      </div>
    </div>
  );
};
