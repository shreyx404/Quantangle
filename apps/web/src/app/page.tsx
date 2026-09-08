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
import { QuestMissionHUD } from "../components/quest/QuestMissionHUD";
import { QuestArenaModal } from "../components/quest/QuestArenaModal";
import { MicroCredentialModal } from "../components/quest/MicroCredentialModal";

import { useCircuitStore } from "../stores/useCircuitStore";
import { useSimulationStore } from "../stores/useSimulationStore";
import { useCopilotStore } from "../stores/useCopilotStore";
import { useQuestStore } from "../stores/useQuestStore";
import { simulateCircuitClient } from "../lib/clientSimulator";
import type { GateType } from "@quantangle/quantum-ast";

import {
  Globe2,
  BarChart3,
  Code2,
  Bot,
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
  const { activeQuestId } = useQuestStore();

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

  // Simulation runner
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

  // Auto-simulation debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 50);
    return () => clearTimeout(timer);
  }, [steps, numQubits, runSimulation]);

  return (
    <div className="min-h-screen flex flex-col bg-[#06080f]">
      {/* Precision Instrument Header */}
      <Header
        onRunSimulation={runSimulation}
        isRunningSimulation={isRunning}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 lg:px-6 py-4 lg:py-5 flex flex-col gap-4 animate-instrument-ready">
        {/* Top Grid: Canvas & Qu-Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Circuit Design Workspace */}
          <div
            className={`flex flex-col gap-3.5 transition-all duration-300 ${
              copilotOpen ? "lg:col-span-8" : "lg:col-span-12"
            }`}
          >
            {/* Active Quest Mission HUD */}
            {activeQuestId && <QuestMissionHUD />}

            {/* Instruction Gate Palette */}
            <GatePalette
              selectedGate={selectedPaletteGate}
              onSelectGate={setSelectedPaletteGate}
            />

            {/* Quantum Circuit Canvas */}
            <CircuitCanvas
              selectedPaletteGate={selectedPaletteGate}
              onClearPaletteGate={() => setSelectedPaletteGate(null)}
              copilotOpen={copilotOpen}
              onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
            />

            {/* Timeline Phase Scrubber */}
            <TimelineScrubber />
          </div>

          {/* Qu-Copilot AI Sidebar */}
          {copilotOpen && (
            <div className="lg:col-span-4 flex flex-col h-full min-h-[500px]">
              <QuCopilot onClose={() => setCopilotOpen(false)} />
            </div>
          )}
        </div>

        {/* Floating Quick Action Button when Qu-Copilot is collapsed */}
        {!copilotOpen && (
          <button
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-6 right-6 z-50 px-3.5 py-2 rounded-xl bg-[#0e1424] hover:bg-[#131b2e] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-white/[0.08] hover:border-cyan-400/40 shadow-xl active:translate-y-[1px] transition-all"
            title="Open Qu-Copilot AI Quantum Tutor"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Qu-Copilot</span>
          </button>
        )}

        {/* Bottom Quantum Inspector Panel */}
        <div className="bg-[#0b0f1a] rounded-xl border border-white/[0.06] flex flex-col overflow-hidden shadow-sm">
          {/* Inspector Tab Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-[#070b14]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveBottomTab("visualizer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "visualizer"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quantum State (3D)</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("measurements")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "measurements"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Probabilities & Amplitudes</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("editor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "editor"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Code Studio</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
              <span className="tabular-nums font-semibold text-slate-300">
                {numQubits} Qubits
              </span>
              <span className="text-white/[0.12]">·</span>
              <span className="text-emerald-400 font-semibold tabular-nums">
                F = 1.0000 (Coherent)
              </span>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="p-4">
            {activeBottomTab === "visualizer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 tab-content-enter" key="tab-visualizer">
                <BlochSphere />
                <QSphere />
              </div>
            )}

            {activeBottomTab === "measurements" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 tab-content-enter" key="tab-measurements">
                <ProbabilityHistogram />
                <StatevectorTable />
              </div>
            )}

            {activeBottomTab === "editor" && (
              <div className="w-full tab-content-enter" key="tab-editor">
                <QuantumCodeEditor height="380px" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-3 px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500 bg-[#06080f]">
        <span className="tracking-tight">Quantangle Platform · SIH 2026</span>
        <span className="font-mono text-[10px] text-slate-500 tabular-nums">
          Little-Endian Standard · |q₀⟩ LSB
        </span>
      </footer>

      {/* Modals */}
      <QuestArenaModal />
      <MicroCredentialModal />
    </div>
  );
}
