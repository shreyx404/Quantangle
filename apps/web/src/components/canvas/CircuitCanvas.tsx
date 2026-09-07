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
  initialViewMode = "canvas",
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
        return "bg-[#132236] text-sky-200 border-sky-500/40 hover:border-sky-400";
      case "X":
        return "bg-[#121e36] text-blue-200 border-blue-500/40 hover:border-blue-400";
      case "Y":
        return "bg-[#161a38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400";
      case "Z":
        return "bg-[#1d1433] text-purple-200 border-purple-500/40 hover:border-purple-400";
      case "S":
      case "T":
        return "bg-[#241330] text-fuchsia-200 border-fuchsia-500/40 hover:border-fuchsia-400";
      case "CX":
        return "bg-[#0e241f] text-emerald-200 border-emerald-500/40 hover:border-emerald-400";
      case "CZ":
        return "bg-[#0e2424] text-teal-200 border-teal-500/40 hover:border-teal-400";
      case "SWAP":
        return "bg-[#292212] text-amber-200 border-amber-500/40 hover:border-amber-400";
      case "RX":
      case "RY":
      case "RZ":
        return "bg-[#1f1733] text-violet-200 border-violet-500/40 hover:border-violet-400";
      case "M":
        return "bg-[#2e131d] text-rose-200 border-rose-500/40 hover:border-rose-400";
      default:
        return "bg-[#161d2d] text-slate-200 border-slate-600";
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
            className={`w-14 text-center text-[11px] font-telemetry cursor-pointer transition-colors py-0.5 rounded-md ${
              activeStep === stepIdx
                ? "text-cyan-300 font-semibold bg-cyan-500/15 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
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
            <div className="w-20 pr-3 flex items-center justify-between text-xs font-telemetry font-semibold text-slate-300">
              <span className="text-cyan-400">|q{qIdx}⟩</span>
              <span className="text-[10px] text-slate-500 font-normal">|0⟩</span>
            </div>

            {/* Wire line running behind cells */}
            <div className="relative flex items-center">
              <div className="absolute left-0 right-0 h-[1.5px] bg-[#222d42] group-hover:bg-[#324361] transition-colors z-0" />

              {/* Wire Cells */}
              {Array.from({ length: visibleStepsCount }).map((_, stepIdx) => {
                const op = getGateAt(stepIdx, qIdx);
                const isControl = op && op.qubits.length > 1 && op.qubits[0] === qIdx;
                const isPendingControl =
                  pendingControlQubit?.stepIndex === stepIdx &&
                  pendingControlQubit.controlQubit === qIdx;

                return (
                  <div
                    key={stepIdx}
                    onClick={() => handleCellClick(stepIdx, qIdx)}
                    className={`relative w-14 h-12 flex items-center justify-center z-10 cursor-pointer transition-colors ${
                      activeStep === stepIdx
                        ? "bg-cyan-500/[0.04] border-x border-cyan-500/15"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Two-qubit connector line if multi-qubit gate */}
                    {op && op.qubits.length > 1 && isControl && (
                      <div
                        className="absolute w-[1.5px] bg-emerald-400 z-0 pointer-events-none"
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
                        className={`relative px-2.5 py-1.5 rounded font-mono text-xs font-semibold border transition-colors ${getGateBadgeStyle(
                          op.gate
                        )} group/gate hover:border-cyan-400`}
                      >
                        {isControl ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
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

                        {/* Gate Actions: Edit & Delete */}
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
                              className="w-4 h-4 rounded bg-[#1f1733] border border-violet-500/40 text-violet-300 flex items-center justify-center text-[10px] hover:bg-violet-600 hover:text-white transition-colors"
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
                            className="w-4 h-4 rounded bg-[#2e131d] border border-rose-500/40 text-rose-300 flex items-center justify-center text-[10px] hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ) : isPendingControl ? (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-400/20" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/[0.04] group-hover:bg-cyan-500/30 transition-colors" />
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
    <div className="bg-[#0b0f19] rounded-xl p-3.5 flex flex-col gap-3 border border-white/[0.08] relative overflow-hidden shadow-sm">
      {/* Canvas Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white uppercase font-mono">
            Quantum Circuit Canvas
          </span>
          <span className="text-[10px] font-telemetry px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Little-Endian · q₀ is LSB
          </span>
        </div>

        {/* Controls: View Modes, Qubits, Steps, Copilot */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dual-Sync View Mode Switcher */}
          <div className="flex items-center bg-[#101726] rounded-lg p-0.5 border border-white/[0.08] text-xs">
            <button
              onClick={() => setViewMode("canvas")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === "canvas"
                  ? "bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Canvas Only View"
            >
              <Layers className="w-3 h-3" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Dual-Sync Split View: Visual Canvas + Live Python Qiskit Code"
            >
              <Columns className="w-3 h-3" />
              <span>Dual-Sync</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === "code"
                  ? "bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Full Code Editor View"
            >
              <Code2 className="w-3 h-3" />
              <span>Code</span>
            </button>
          </div>

          {/* Qubit controls */}
          <div className="flex items-center gap-1 bg-[#101726] rounded-lg px-2 py-0.5 border border-white/[0.08] text-xs">
            <span className="text-slate-400 pr-1 font-mono text-[11px]">Qubits:</span>
            <button
              onClick={() => setQubits(Math.max(1, numQubits - 1))}
              disabled={numQubits <= 1}
              className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 transition-colors active:translate-y-[1px]"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="w-5 text-center font-telemetry font-semibold text-cyan-300 text-xs">
              {numQubits}
            </span>
            <button
              onClick={() => setQubits(Math.min(16, numQubits + 1))}
              disabled={numQubits >= 16}
              className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 transition-colors active:translate-y-[1px]"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={addStep}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors active:translate-y-[1px] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Step
            </button>
            <button
              onClick={resetCircuit}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors active:translate-y-[1px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>

            {!copilotOpen && onToggleCopilot && (
              <button
                onClick={onToggleCopilot}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#101726] hover:bg-[#162035] border border-cyan-500/30 text-cyan-300 transition-colors active:translate-y-[1px] flex items-center gap-1.5"
                title="Open Qu-Copilot AI Tutor"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
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
          <div className="xl:col-span-7 flex flex-col justify-between overflow-x-auto pb-2 select-none min-w-0 bg-[#070b14] rounded-lg p-3 border border-white/[0.05]">
            {renderGrid()}
          </div>
          <div className="xl:col-span-5 min-w-0 flex flex-col">
            <QuantumCodeEditor
              height="280px"
              compact={true}
              showHeader={true}
              defaultSdk="qiskit"
            />
          </div>
        </div>
      )}

      {viewMode === "canvas" && (
        <div className="overflow-x-auto pb-3 select-none bg-[#070b14] rounded-lg p-3 border border-white/[0.05]">
          {renderGrid()}
        </div>
      )}

      {viewMode === "code" && (
        <div className="w-full">
          <QuantumCodeEditor
            height="380px"
            compact={false}
            showHeader={true}
            defaultSdk="qiskit"
          />
        </div>
      )}

      {/* Rotation Parameter Modal */}
      {activeParamModal && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1422] rounded-lg p-4 border border-white/[0.12] w-80 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-semibold text-white font-mono tracking-wide">
                Set Rotation Angle (θ)
              </span>
              <button
                onClick={() => setActiveParamModal(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Angle:</span>
              <span className="text-cyan-300 font-semibold">
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
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  updateGateParams(
                    activeParamModal.stepIndex,
                    activeParamModal.gateId,
                    [activeParamModal.angle]
                  );
                  setActiveParamModal(null);
                }}
                className="flex-1 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors active:translate-y-[1px]"
              >
                Apply Angle
              </button>
              <button
                onClick={() => setActiveParamModal(null)}
                className="flex-1 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs transition-colors"
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
