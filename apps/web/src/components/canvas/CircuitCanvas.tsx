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
        return "bg-[#132236] text-sky-200 border-sky-500/30 hover:border-sky-400/50";
      case "X":
        return "bg-[#121e36] text-blue-200 border-blue-500/30 hover:border-blue-400/50";
      case "Y":
        return "bg-[#161a38] text-indigo-200 border-indigo-500/30 hover:border-indigo-400/50";
      case "Z":
        return "bg-[#1d1433] text-purple-200 border-purple-500/30 hover:border-purple-400/50";
      case "S":
      case "T":
        return "bg-[#241330] text-fuchsia-200 border-fuchsia-500/30 hover:border-fuchsia-400/50";
      case "CX":
        return "bg-[#0e241f] text-emerald-200 border-emerald-500/30 hover:border-emerald-400/50";
      case "CZ":
        return "bg-[#0e2424] text-teal-200 border-teal-500/30 hover:border-teal-400/50";
      case "SWAP":
        return "bg-[#292212] text-amber-200 border-amber-500/30 hover:border-amber-400/50";
      case "RX":
      case "RY":
      case "RZ":
        return "bg-[#1f1733] text-violet-200 border-violet-500/30 hover:border-violet-400/50";
      case "M":
        return "bg-[#2e131d] text-rose-200 border-rose-500/30 hover:border-rose-400/50";
      default:
        return "bg-[#161d2d] text-slate-200 border-slate-600";
    }
  };

  const renderGrid = () => (
    <div className="inline-block min-w-full">
      {/* Step numbers header row */}
      <div className="flex items-center pl-24 mb-3">
        {Array.from({ length: visibleStepsCount }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            onClick={() => setActiveStep(stepIdx)}
            className={`w-16 text-center text-[11px] font-mono tabular-nums cursor-pointer transition-colors py-1.5 rounded-lg ${
              activeStep === stepIdx
                ? "text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/25"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            t{stepIdx}
          </div>
        ))}
      </div>

      {/* Qubit wire rows */}
      <div className="flex flex-col gap-3.5">
        {Array.from({ length: numQubits }).map((_, qIdx) => (
          <div key={qIdx} className="flex items-center relative group">
            {/* Qubit Label */}
            <div className="w-24 pr-4 flex items-center justify-between text-[13px] font-mono text-slate-300 select-none">
              <span className="text-slate-200">|q{qIdx}⟩</span>
              <span className="text-[11px] text-slate-500 tabular-nums">|0⟩</span>
            </div>

            {/* Wire line running behind cells */}
            <div className="relative flex items-center">
              <div className="absolute left-0 right-0 h-[2px] bg-[#1e2a3e] group-hover:bg-[#2a3a52] transition-colors z-0" />

              {/* Wire Cells — bigger for breathing room */}
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
                    className={`relative w-16 h-14 flex items-center justify-center z-10 cursor-pointer transition-colors ${
                      activeStep === stepIdx
                        ? "bg-cyan-500/[0.04] border-x border-cyan-500/15"
                        : "hover:bg-white/[0.015]"
                    }`}
                  >
                    {/* Two-qubit connector line if multi-qubit gate */}
                    {op && op.qubits.length > 1 && isControl && (
                      <div
                        className="absolute w-[2px] bg-emerald-400/80 z-0 pointer-events-none"
                        style={{
                          top: "50%",
                          height: `${Math.abs(op.qubits[1] - op.qubits[0]) * 58}px`,
                          transform: op.qubits[1] > op.qubits[0] ? "none" : "scaleY(-1)",
                          transformOrigin: "top",
                        }}
                      />
                    )}

                    {/* Placed Gate Badge */}
                    {op ? (
                      <div
                        className={`relative px-3 py-2 rounded-lg font-mono text-[13px] font-semibold border transition-colors ${getGateBadgeStyle(
                          op.gate
                        )} group/gate`}
                      >
                        {isControl ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                        ) : (
                          <span>
                            {op.gate}
                            {op.params && op.params.length > 0 && (
                              <span className="text-[10px] block text-center font-mono tabular-nums opacity-75 mt-0.5">
                                {(op.params[0] / Math.PI).toFixed(2)}π
                              </span>
                            )}
                          </span>
                        )}

                        {/* Gate Actions: Edit & Delete */}
                        <div className="absolute -top-2.5 -right-2.5 hidden group-hover/gate:flex items-center gap-1 z-30">
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
                              className="w-5 h-5 rounded-md bg-[#1f1733] border border-violet-500/30 text-violet-300 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors"
                            >
                              <Sliders className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGate(stepIdx, op.id);
                            }}
                            title="Remove gate"
                            className="w-5 h-5 rounded-md bg-[#2e131d] border border-rose-500/30 text-rose-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : isPendingControl ? (
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-400/20" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/[0.05] group-hover:bg-white/[0.12] transition-colors" />
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
    <div className="bg-[#0b0f19] rounded-2xl p-5 flex flex-col gap-4 border border-white/[0.05] relative overflow-hidden">
      {/* Canvas Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold text-white">
            Circuit Canvas
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.04] tabular-nums">
            Little-Endian · q₀ LSB
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="h-9 flex items-center bg-[#0a0e18] rounded-xl p-0.5 border border-white/[0.05] text-[13px]">
            <button
              onClick={() => setViewMode("canvas")}
              className={`h-8 px-3.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "canvas"
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Canvas Only View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`h-8 px-3.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "split"
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dual-Sync Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`h-8 px-3.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "code"
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Full Code Editor View"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Qubit controls */}
          <div className="h-9 flex items-center gap-1.5 bg-[#0a0e18] rounded-xl px-3 border border-white/[0.05] text-[13px]">
            <span className="text-slate-400 pr-1 text-[12px]">Qubits</span>
            <button
              onClick={() => setQubits(Math.max(1, numQubits - 1))}
              disabled={numQubits <= 1}
              aria-label="Decrease qubit count"
              className="w-6 h-6 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 transition-colors active:translate-y-[1px]"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-mono font-semibold text-white text-[13px] tabular-nums">
              {numQubits}
            </span>
            <button
              onClick={() => setQubits(Math.min(16, numQubits + 1))}
              disabled={numQubits >= 16}
              aria-label="Increase qubit count"
              className="w-6 h-6 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 transition-colors active:translate-y-[1px]"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addStep}
              className="h-9 px-3.5 rounded-xl text-[13px] font-medium bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300 transition-colors active:translate-y-[1px] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Step
            </button>
            <button
              onClick={resetCircuit}
              className="h-9 px-3.5 rounded-xl text-[13px] font-medium bg-rose-500/8 hover:bg-rose-500/15 border border-rose-500/20 text-rose-300 transition-colors active:translate-y-[1px] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            {!copilotOpen && onToggleCopilot && (
              <button
                onClick={onToggleCopilot}
                className="h-9 px-3.5 rounded-xl text-[13px] font-medium bg-[#0d1220] hover:bg-[#131b2e] border border-white/[0.05] text-slate-300 hover:text-white transition-colors active:translate-y-[1px] flex items-center gap-1.5"
                title="Open Qu-Copilot AI Tutor"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI Tutor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Banner for pending 2-qubit gate */}
      {pendingControlQubit && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-[13px] text-emerald-300 flex items-center justify-between">
          <span>
            Control qubit set on <span className="font-mono font-bold">q[{pendingControlQubit.controlQubit}]</span> at step {pendingControlQubit.stepIndex}. Now click target qubit.
          </span>
          <button
            onClick={() => setPendingControlQubit(null)}
            className="text-[12px] underline hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Workspace Display Area */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-7 flex flex-col justify-between overflow-x-auto pb-2 select-none min-w-0 bg-[#070b14] rounded-xl p-4 border border-white/[0.03]">
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
        <div className="overflow-x-auto pb-3 select-none bg-[#070b14] rounded-xl p-4 border border-white/[0.03]">
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
          <div className="bg-[#0f1422] rounded-xl p-5 border border-white/[0.08] w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
              <span className="text-[14px] font-semibold text-white">
                Rotation Angle (θ)
              </span>
              <button
                onClick={() => setActiveParamModal(null)}
                className="text-slate-400 hover:text-white text-[13px]"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-400">Angle</span>
              <span className="text-white font-mono font-medium tabular-nums">
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
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  updateGateParams(
                    activeParamModal.stepIndex,
                    activeParamModal.gateId,
                    [activeParamModal.angle]
                  );
                  setActiveParamModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold text-[13px] transition-colors active:translate-y-[1px]"
              >
                Apply
              </button>
              <button
                onClick={() => setActiveParamModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 border border-white/[0.06] text-[13px] transition-colors"
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
