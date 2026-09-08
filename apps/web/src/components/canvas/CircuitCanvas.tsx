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
  Bot,
  Columns,
  Layers,
  Code2,
  Sparkles,
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

  const visibleStepsCount = Math.max(steps.length + 2, 8);

  const handleCellClick = (stepIndex: number, qubit: number) => {
    // If pending two-qubit gate selection
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

    // Two-qubit gate selection requires 2 steps
    if (["CX", "CZ", "SWAP"].includes(selectedPaletteGate)) {
      setPendingControlQubit({
        stepIndex,
        controlQubit: qubit,
        gateType: selectedPaletteGate,
      });
      return;
    }

    // Single-qubit or rotation gate
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
      case "X":
      case "Y":
      case "Z":
      case "S":
      case "T":
        return "bg-[#0e1628] text-sky-200 border-sky-500/40 hover:border-sky-400";
      case "CX":
      case "CZ":
        return "bg-[#0c1c18] text-emerald-200 border-emerald-500/40 hover:border-emerald-400";
      case "SWAP":
        return "bg-[#1f1b0e] text-amber-200 border-amber-500/40 hover:border-amber-400";
      case "RX":
      case "RY":
      case "RZ":
        return "bg-[#1a1228] text-violet-200 border-violet-500/40 hover:border-violet-400";
      case "M":
        return "bg-[#25101b] text-rose-200 border-rose-500/40 hover:border-rose-400";
      default:
        return "bg-[#141b2b] text-slate-200 border-slate-600";
    }
  };

  const renderGrid = () => (
    <div className="inline-block min-w-full">
      {/* Time-step column headers */}
      <div className="flex items-center pl-24 mb-2">
        {Array.from({ length: visibleStepsCount }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            onClick={() => setActiveStep(stepIdx)}
            className={`w-16 text-center text-[11px] font-mono tabular-nums cursor-pointer transition-colors py-1 rounded-md ${
              activeStep === stepIdx
                ? "text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            t{stepIdx}
          </div>
        ))}
      </div>

      {/* Qubit Wire Rails */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: numQubits }).map((_, qIdx) => (
          <div key={qIdx} className="flex items-center relative group">
            {/* Qubit Label */}
            <div className="w-24 pr-4 flex items-center justify-between text-xs font-mono text-slate-300 select-none">
              <span className="text-white font-semibold">|q{qIdx}⟩</span>
              <span className="text-[11px] text-slate-500 tabular-nums">|0⟩</span>
            </div>

            {/* Wire line behind grid cells */}
            <div className="relative flex items-center">
              {/* Dual-rail superconducting guide */}
              <div className="absolute left-0 right-0 h-[2px] bg-[#1e293b] group-hover:bg-[#2d3d56] transition-colors z-0" />

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
                    className={`relative w-16 h-14 flex items-center justify-center z-10 cursor-pointer transition-colors ${
                      activeStep === stepIdx
                        ? "bg-cyan-500/[0.04] border-x border-cyan-500/20"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Vertical entangling bus connector line */}
                    {op && op.qubits.length > 1 && isControl && (
                      <div
                        className="absolute w-[2px] bg-emerald-400 z-0 pointer-events-none"
                        style={{
                          top: "50%",
                          height: `${Math.abs(op.qubits[1] - op.qubits[0]) * 56}px`,
                          transform: op.qubits[1] > op.qubits[0] ? "none" : "scaleY(-1)",
                          transformOrigin: "top",
                        }}
                      />
                    )}

                    {/* Placed Gate Chip */}
                    {op ? (
                      <div
                        className={`relative px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${getGateBadgeStyle(
                          op.gate
                        )} group/gate shadow-sm`}
                      >
                        {isControl ? (
                          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                        ) : isTarget && op.gate === "CX" ? (
                          <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-400 text-xs">
                            +
                          </div>
                        ) : (
                          <span>
                            {op.gate}
                            {op.params && op.params.length > 0 && (
                              <span className="text-[10px] block text-center font-mono tabular-nums opacity-85 mt-0.5">
                                {(op.params[0] / Math.PI).toFixed(2)}π
                              </span>
                            )}
                          </span>
                        )}

                        {/* Gate Quick Actions */}
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
                              title="Adjust rotation angle"
                              className="w-5 h-5 rounded bg-[#1f1733] border border-violet-500/40 text-violet-200 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors"
                            >
                              <Sliders className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGate(stepIdx, op.id);
                            }}
                            title="Delete gate"
                            className="w-5 h-5 rounded bg-[#2e131d] border border-rose-500/40 text-rose-200 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : isPendingControl ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 bg-emerald-400/30 animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/[0.08] group-hover:bg-white/[0.18] transition-colors" />
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
    <div className="bg-[#0b0f1a] rounded-xl p-4 flex flex-col gap-3.5 border border-white/[0.06] relative overflow-hidden shadow-sm">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-white tracking-tight">
            Circuit Canvas
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] tabular-nums">
            Little-Endian · q₀ LSB
          </span>
        </div>

        {/* Toolbar Deck */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="h-8 flex items-center bg-[#070b14] rounded-lg p-0.5 border border-white/[0.06] text-xs">
            <button
              onClick={() => setViewMode("canvas")}
              className={`h-7 px-3 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "canvas"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Canvas Full View"
            >
              <Layers className="w-3 h-3" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`h-7 px-3 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "split"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dual-Sync Split View"
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`h-7 px-3 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                viewMode === "code"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Code Studio View"
            >
              <Code2 className="w-3 h-3" />
              <span>Code</span>
            </button>
          </div>

          {/* Qubit Stepper */}
          <div className="h-8 flex items-center gap-1.5 bg-[#070b14] rounded-lg px-2.5 border border-white/[0.06] text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Qubits</span>
            <button
              onClick={() => setQubits(Math.max(1, numQubits - 1))}
              disabled={numQubits <= 1}
              aria-label="Decrease qubit count"
              className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 transition-colors active:translate-y-[1px]"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-mono font-bold text-white text-xs tabular-nums">
              {numQubits}
            </span>
            <button
              onClick={() => setQubits(Math.min(16, numQubits + 1))}
              disabled={numQubits >= 16}
              aria-label="Increase qubit count"
              className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 transition-colors active:translate-y-[1px]"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={addStep}
              className="h-8 px-2.5 rounded-lg text-xs font-medium bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 transition-colors active:translate-y-[1px] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Step
            </button>
            <button
              onClick={resetCircuit}
              className="h-8 px-2.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-colors active:translate-y-[1px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>

            {!copilotOpen && onToggleCopilot && (
              <button
                onClick={onToggleCopilot}
                className="h-8 px-2.5 rounded-lg text-xs font-medium bg-[#0e1424] hover:bg-[#131b2e] border border-white/[0.06] text-slate-300 hover:text-white transition-colors active:translate-y-[1px] flex items-center gap-1.5"
                title="Open Qu-Copilot AI Tutor"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Tutor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Banner for Pending 2-Qubit Target */}
      {pendingControlQubit && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3.5 py-2 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Control wire set on <strong className="font-mono text-white">|q{pendingControlQubit.controlQubit}⟩</strong>. Click target qubit wire on step t{pendingControlQubit.stepIndex} to complete {pendingControlQubit.gateType}.
            </span>
          </div>
          <button
            onClick={() => setPendingControlQubit(null)}
            className="text-[11px] underline hover:text-white font-mono"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Canvas Display View */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
          <div className="xl:col-span-7 flex flex-col justify-between overflow-x-auto pb-2 select-none min-w-0 bg-[#070b14] rounded-lg p-3.5 border border-white/[0.04]">
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
        <div className="overflow-x-auto pb-2 select-none bg-[#070b14] rounded-lg p-3.5 border border-white/[0.04]">
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

      {/* Parametric Rotation Angle Modal */}
      {activeParamModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e1424] rounded-xl p-4 border border-white/[0.1] w-80 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-xs font-semibold text-white">
                Rotation Angle (θ)
              </span>
              <button
                onClick={() => setActiveParamModal(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Angle</span>
              <span className="text-cyan-300 font-mono font-bold tabular-nums">
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
              className="w-full"
            />

            {/* Quick Angle Presets */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[
                { label: "π/4", val: Math.PI / 4 },
                { label: "π/2", val: Math.PI / 2 },
                { label: "π", val: Math.PI },
                { label: "3π/2", val: (3 * Math.PI) / 2 },
                { label: "2π", val: 2 * Math.PI },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() =>
                    setActiveParamModal({
                      ...activeParamModal,
                      angle: p.val,
                    })
                  }
                  className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-white border border-white/[0.06]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  updateGateParams(
                    activeParamModal.stepIndex,
                    activeParamModal.gateId,
                    [activeParamModal.angle]
                  );
                  setActiveParamModal(null);
                }}
                className="flex-1 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors active:translate-y-[1px]"
              >
                Apply
              </button>
              <button
                onClick={() => setActiveParamModal(null)}
                className="flex-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] text-xs transition-colors"
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
