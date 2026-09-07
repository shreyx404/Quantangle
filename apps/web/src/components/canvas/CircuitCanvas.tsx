"use client";

import React, { useState } from "react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { useSimulationStore } from "../../stores/useSimulationStore";
import type { GateType, GateOperation } from "@quantangle/quantum-ast";
import {
  Plus,
  Minus,
  Trash2,
  Sliders,
  RotateCcw,
  Zap,
  Bot,
  Columns,
  Layers,
  Code2,
} from "lucide-react";
import { QuantumCodeEditor } from "../editor/QuantumCodeEditor";

interface CircuitCanvasProps {
  selectedPaletteGate: GateType | null;
  onClearPaletteGate: () => void;
  copilotOpen?: boolean;
  onToggleCopilot?: () => void;
  initialViewMode?: "split" | "canvas" | "code";
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  selectedPaletteGate,
  onClearPaletteGate,
  copilotOpen,
  onToggleCopilot,
  initialViewMode = "split",
}) => {
  const {
    numQubits,
    steps,
    addGate,
    removeGate,
    setQubits,
    addStep,
    removeStep,
    resetCircuit,
    updateGateParams,
  } = useCircuitStore();

  const { activeStep, setActiveStep } = useSimulationStore();
  const [viewMode, setViewMode] = useState<"split" | "canvas" | "code">(initialViewMode);

  const [activeParamModal, setActiveParamModal] = useState<{
    stepIndex: number;
    gateId: string;
    angle: number;
  } | null>(null);

  const [pendingControlQubit, setPendingControlQubit] = useState<{
    stepIndex: number;
    controlQubit: number;
    gateType: GateType;
  } | null>(null);

  // Ensure minimum number of visible steps for UI beauty
  const visibleStepsCount = Math.max(steps.length + 2, 8);

  const handleCellClick = (stepIndex: number, qubit: number) => {
    // If pending two-qubit gate selection (like CNOT target)
    if (pendingControlQubit) {
      if (pendingControlQubit.stepIndex === stepIndex && pendingControlQubit.controlQubit !== qubit) {
        const newOp: GateOperation = {
          id: `gate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          gate: pendingControlQubit.gateType,
          qubits: [pendingControlQubit.controlQubit, qubit],
        };
        addGate(stepIndex, newOp);
        setPendingControlQubit(null);
        onClearPaletteGate();
        return;
      }
      setPendingControlQubit(null);
    }

    if (!selectedPaletteGate) return;

    // Two-qubit gate requires 2 clicks (first control, then target)
    if (["CX", "CZ", "SWAP"].includes(selectedPaletteGate)) {
      setPendingControlQubit({
        stepIndex,
        controlQubit: qubit,
        gateType: selectedPaletteGate,
      });
      return;
    }

    // Single qubit or rotation gate
    const isRotation = ["RX", "RY", "RZ"].includes(selectedPaletteGate);
    const newOp: GateOperation = {
      id: `gate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      gate: selectedPaletteGate,
      qubits: [qubit],
      params: isRotation ? [Math.PI / 2] : undefined,
    };
    addGate(stepIndex, newOp);
  };

  const getGateAt = (stepIndex: number, qubit: number) => {
    if (stepIndex >= steps.length) return null;
    const step = steps[stepIndex];
    if (!step) return null;
    return step.operations.find((op) => op.qubits.includes(qubit));
  };

  const getGateBadgeStyle = (gate: GateType) => {
    switch (gate) {
      case "H":
        return "bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.3)]";
      case "X":
        return "bg-blue-500/30 text-blue-200 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
      case "Y":
        return "bg-indigo-500/30 text-indigo-200 border-indigo-400";
      case "Z":
        return "bg-purple-500/30 text-purple-200 border-purple-400";
      case "S":
      case "T":
        return "bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400";
      case "CX":
        return "bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
      case "CZ":
        return "bg-teal-500/30 text-teal-200 border-teal-400";
      case "SWAP":
        return "bg-amber-500/30 text-amber-200 border-amber-400";
      case "RX":
      case "RY":
      case "RZ":
        return "bg-violet-500/30 text-violet-200 border-violet-400";
      case "M":
        return "bg-rose-500/30 text-rose-200 border-rose-400";
      default:
        return "bg-slate-700 text-slate-200 border-slate-500";
    }
  };

  const renderGrid = () => (
    <div className="inline-block min-w-full">
      {/* Step numbers header row */}
      <div className="flex items-center pl-20 mb-2">
        {Array.from({ length: visibleStepsCount }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            onClick={() => setActiveStep(stepIdx)}
            className={`w-14 text-center text-[11px] font-mono cursor-pointer transition-all ${
              activeStep === stepIdx
                ? "text-cyan-400 font-bold scale-110"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            t{stepIdx}
          </div>
        ))}
      </div>

      {/* Qubit wire rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: numQubits }).map((_, qIdx) => (
          <div key={qIdx} className="flex items-center relative group">
            {/* Qubit Label */}
            <div className="w-20 pr-3 flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
              <span className="text-cyan-400">|q{qIdx}⟩</span>
              <span className="text-[10px] text-slate-500">|0⟩</span>
            </div>

            {/* Wire line running behind cells */}
            <div className="relative flex items-center">
              <div className="absolute left-0 right-0 h-[2px] bg-slate-700 group-hover:bg-slate-600 transition-colors z-0" />

              {/* Wire Cells */}
              {Array.from({ length: visibleStepsCount }).map((_, stepIdx) => {
                const op = getGateAt(stepIdx, qIdx);
                const isControl = op && op.qubits.length > 1 && op.qubits[0] === qIdx;
                const isTarget = op && op.qubits.length > 1 && op.qubits[1] === qIdx;
                const isPendingControl =
                  pendingControlQubit?.stepIndex === stepIdx &&
                  pendingControlQubit.controlQubit === qIdx;

                return (
                  <div
                    key={stepIdx}
                    onClick={() => handleCellClick(stepIdx, qIdx)}
                    className={`relative w-14 h-12 flex items-center justify-center z-10 cursor-pointer transition-all ${
                      activeStep === stepIdx ? "bg-cyan-500/5 rounded-lg" : ""
                    }`}
                  >
                    {/* Two-qubit connector line if multi-qubit gate */}
                    {op && op.qubits.length > 1 && isControl && (
                      <div
                        className="absolute w-[2px] bg-emerald-400 z-0 pointer-events-none"
                        style={{
                          top: "50%",
                          height: `${Math.abs(op.qubits[1] - op.qubits[0]) * 52}px`,
                          transform: op.qubits[1] > op.qubits[0] ? "none" : "scaleY(-1)",
                          transformOrigin: "top",
                        }}
                      />
                    )}

                    {/* Placed Gate Badge */}
                    {op ? (
                      <div
                        className={`relative px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-transform ${getGateBadgeStyle(
                          op.gate
                        )} group/gate hover:scale-110`}
                      >
                        {isControl ? (
                          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        ) : (
                          <span>
                            {op.gate}
                            {op.params && op.params.length > 0 && (
                              <span className="text-[9px] block text-center opacity-80">
                                {(op.params[0] / Math.PI).toFixed(2)}π
                              </span>
                            )}
                          </span>
                        )}

                        {/* Gate Actions Dropdown / Delete button */}
                        <div className="absolute -top-2 -right-2 hidden group-hover/gate:flex items-center gap-1 z-30">
                          {op.params && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveParamModal({
                                  stepIndex: stepIdx,
                                  gateId: op.id,
                                  angle: op.params![0],
                                });
                              }}
                              title="Edit rotation angle"
                              className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] hover:scale-110 shadow"
                            >
                              <Sliders className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGate(stepIdx, op.id);
                            }}
                            title="Remove gate"
                            className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:scale-110 shadow"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : isPendingControl ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse" />
                    ) : (
                      /* Empty slot hover target */
                      <div className="w-8 h-8 rounded-lg border border-dashed border-slate-700/60 hover:border-cyan-400/80 hover:bg-cyan-500/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                        <Plus className="w-3 h-3 text-cyan-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 border border-white/10 relative overflow-hidden">
      {/* Canvas Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Quantum Circuit Canvas
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Little-Endian: q₀ is LSB
          </span>
        </div>

        {/* Controls: View Modes, Qubits, Steps, Copilot */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual-Sync View Mode Switcher */}
          <div className="flex items-center bg-black/50 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "split"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Dual-Sync Split View: Visual Canvas + Live Python Qiskit Code"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual-Sync</span>
            </button>
            <button
              onClick={() => setViewMode("canvas")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "canvas"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Canvas Only View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 rounded flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "code"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Full Code Editor View"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Qubit controls */}
          <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/5 text-xs">
            <span className="text-slate-400 px-1 font-mono">Qubits:</span>
            <button
              onClick={() => setQubits(Math.max(1, numQubits - 1))}
              disabled={numQubits <= 1}
              className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-mono font-bold text-cyan-300">
              {numQubits}
            </span>
            <button
              onClick={() => setQubits(Math.min(16, numQubits + 1))}
              disabled={numQubits >= 16}
              className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={addStep}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Step
            </button>
            <button
              onClick={resetCircuit}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            {!copilotOpen && onToggleCopilot && (
              <button
                onClick={onToggleCopilot}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.15)] hover:scale-105 active:scale-95"
                title="Open Qu-Copilot AI Tutor"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Tutor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Banner for pending 2-qubit gate */}
      {pendingControlQubit && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-300 flex items-center justify-between animate-pulse">
          <span>
            Control qubit set on <span className="font-mono font-bold">q[{pendingControlQubit.controlQubit}]</span> at step {pendingControlQubit.stepIndex}. Now click target qubit!
          </span>
          <button
            onClick={() => setPendingControlQubit(null)}
            className="text-[11px] underline hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Workspace Display Area based on View Mode */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
          <div className="xl:col-span-7 flex flex-col justify-between overflow-x-auto pb-2 select-none min-w-0 bg-slate-950/40 rounded-xl p-2.5 border border-white/5">
            {renderGrid()}
          </div>
          <div className="xl:col-span-5 min-w-0 flex flex-col">
            <QuantumCodeEditor
              height="270px"
              compact={true}
              showHeader={true}
              defaultSdk="qiskit"
            />
          </div>
        </div>
      )}

      {viewMode === "canvas" && (
        <div className="overflow-x-auto pb-2 select-none">
          {renderGrid()}
        </div>
      )}

      {viewMode === "code" && (
        <div className="w-full">
          <QuantumCodeEditor
            height="360px"
            compact={false}
            showHeader={true}
            defaultSdk="qiskit"
          />
        </div>
      )}

      {/* Rotation Parameter Modal */}
      {activeParamModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-xl p-5 border border-violet-500/40 w-80 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-300 font-mono">
                Set Rotation Angle (θ)
              </span>
              <button
                onClick={() => setActiveParamModal(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Angle:</span>
              <span className="text-cyan-400 font-bold">
                {activeParamModal.angle.toFixed(4)} rad (
                {(activeParamModal.angle / Math.PI).toFixed(2)}π)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={0.05}
              value={activeParamModal.angle}
              onChange={(e) =>
                setActiveParamModal({
                  ...activeParamModal,
                  angle: parseFloat(e.target.value),
                })
              }
              className="w-full accent-cyan-400"
            />
            <div className="flex items-center gap-1.5 pt-2">
              <button
                onClick={() => {
                  updateGateParams(
                    activeParamModal.stepIndex,
                    activeParamModal.gateId,
                    [activeParamModal.angle]
                  );
                  setActiveParamModal(null);
                }}
                className="flex-1 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xs transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setActiveParamModal(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
