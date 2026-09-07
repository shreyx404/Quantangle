"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "../components/header/Header";
import { GatePalette } from "../components/canvas/GatePalette";
import { CircuitCanvas } from "../components/canvas/CircuitCanvas";
import { TimelineScrubber } from "../components/canvas/TimelineScrubber";
import { BlochSphere } from "../components/visualizer/BlochSphere";
import { QSphere } from "../components/visualizer/QSphere";
import { ProbabilityHistogram } from "../components/visualizer/ProbabilityHistogram";
import { StatevectorTable } from "../components/visualizer/StatevectorTable";
import { QuantumCodeEditor } from "../components/editor/QuantumCodeEditor";
import { QuCopilot } from "../components/copilot/QuCopilot";

import { useCircuitStore } from "../stores/useCircuitStore";
import { useSimulationStore } from "../stores/useSimulationStore";
import { useCopilotStore } from "../stores/useCopilotStore";
import { simulateCircuitClient } from "../lib/clientSimulator";
import type { GateType } from "@quantangle/quantum-ast";

import {
  Globe2,
  BarChart3,
  Code2,
  Bot,
  Zap,
  Layers,
  Sparkles,
  Maximize2,
} from "lucide-react";

export default function Home() {
  const { getCircuitIR, steps, numQubits, loadCircuitFromIR } = useCircuitStore();
  const {
    setRunning,
    setStepStates,
    setSimulationTime,
    isRunning,
  } = useSimulationStore();

  const [selectedPaletteGate, setSelectedPaletteGate] = useState<GateType | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<"visualizer" | "measurements" | "editor">(
    "visualizer"
  );
  const { isOpen: copilotOpen, setOpen: setCopilotOpen } = useCopilotStore();

  // Initialize with Bell State |Φ⁺⟩ on first load
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      loadCircuitFromIR({
        version: "1.0",
        qubits: 2,
        clbits: 2,
        steps: [
          { stepIndex: 0, operations: [{ id: "init_1", gate: "H", qubits: [0] }] },
          { stepIndex: 1, operations: [{ id: "init_2", gate: "CX", qubits: [0, 1] }] },
        ],
      });
    }
  }, [loadCircuitFromIR]);

  // Simulation runner function
  const runSimulation = useCallback(() => {
    setRunning(true);
    const startTime = performance.now();

    try {
      const ir = getCircuitIR();
      const results = simulateCircuitClient(ir);
      const elapsed = performance.now() - startTime;

      setStepStates(results);
      setSimulationTime(elapsed);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setRunning(false);
    }
  }, [getCircuitIR, setRunning, setStepStates, setSimulationTime]);

  // Debounced auto-simulation on circuit mutations
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 50);
    return () => clearTimeout(timer);
  }, [steps, numQubits, runSimulation]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080b14] text-[#f0f4f8]">
      {/* Header */}
      <Header
        onRunSimulation={runSimulation}
        isRunningSimulation={isRunning}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 flex flex-col gap-4">
        {/* Top Grid: Canvas & Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Circuit Design Workspace (Canvas + Palette + Scrubber) */}
          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${
              copilotOpen ? "lg:col-span-8" : "lg:col-span-12"
            }`}
          >
            {/* Gate Palette */}
            <GatePalette
              selectedGate={selectedPaletteGate}
              onSelectGate={setSelectedPaletteGate}
            />

            {/* Circuit Grid Canvas */}
            <CircuitCanvas
              selectedPaletteGate={selectedPaletteGate}
              onClearPaletteGate={() => setSelectedPaletteGate(null)}
              copilotOpen={copilotOpen}
              onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
            />

            {/* Step-by-Step Timeline Scrubber */}
            <TimelineScrubber />
          </div>

          {/* Qu-Copilot AI Tutor Sidebar */}
          {copilotOpen && (
            <div className="lg:col-span-4 flex flex-col h-full">
              <QuCopilot onClose={() => setCopilotOpen(false)} />
            </div>
          )}
        </div>

        {/* Docked Action Button when Qu-Copilot is collapsed */}
        {!copilotOpen && (
          <button
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-5 right-5 z-50 px-3 py-2 rounded-md bg-[#101726] hover:bg-[#162035] text-cyan-300 font-mono text-xs flex items-center gap-2 border border-cyan-500/30 shadow-lg active:translate-y-[1px] transition-colors"
            title="Open Qu-Copilot AI Tutor"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Open Qu-Copilot</span>
            <span className="text-[10px] text-slate-500 border border-white/[0.1] px-1 rounded">AI</span>
          </button>
        )}

        {/* Bottom Inspector Tabs */}
        <div className="bg-[#0b0f19] rounded-xl border border-white/[0.08] flex flex-col overflow-hidden shadow-sm">
          {/* Tab Selection Bar */}
          <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-[#0d121f]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveBottomTab("visualizer")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 transition-colors ${
                  activeBottomTab === "visualizer"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Quantum State (Bloch & Q-Sphere)</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("measurements")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 transition-colors ${
                  activeBottomTab === "measurements"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Probabilities & State Amplitudes</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("editor")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 transition-colors ${
                  activeBottomTab === "editor"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Dual-Sync Code Studio (Qiskit & OpenQASM 3.0)</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[10px] font-telemetry text-slate-500">
              <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                {numQubits} Qubits Active
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Fidelity F = 1.0000
              </span>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="p-3">
            {activeBottomTab === "visualizer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <BlochSphere />
                <QSphere />
              </div>
            )}

            {activeBottomTab === "measurements" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ProbabilityHistogram />
                <StatevectorTable />
              </div>
            )}

            {activeBottomTab === "editor" && (
              <div className="w-full">
                <QuantumCodeEditor height="420px" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono bg-[#07090e]">
        Quantangle Platform — Smart India Hackathon (SIH 2026 Problem Statement SIH26140) • Little-Endian Architecture
      </footer>
    </div>
  );
}
