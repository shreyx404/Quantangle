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
    <div className="min-h-screen flex flex-col bg-[#060912]">
      {/* Header */}
      <Header
        onRunSimulation={runSimulation}
        isRunningSimulation={isRunning}
      />

      {/* Main Workspace Layout — generous spacing */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-5 lg:px-8 py-5 lg:py-6 flex flex-col gap-5 animate-instrument-ready">
        {/* Top Grid: Canvas & Copilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Circuit Design Workspace (Canvas + Palette + Scrubber) */}
          <div
            className={`flex flex-col gap-4 transition-all duration-300 ${
              copilotOpen ? "lg:col-span-8" : "lg:col-span-12"
            }`}
          >
            {/* Active Quest Mission HUD */}
            {activeQuestId && <QuestMissionHUD />}

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
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101726] hover:bg-[#162035] text-slate-300 hover:text-white text-[13px] font-medium flex items-center gap-2.5 border border-white/[0.06] hover:border-white/[0.12] shadow-elevated active:translate-y-[1px] transition-all"
            title="Open Qu-Copilot AI Tutor"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Qu-Copilot</span>
          </button>
        )}

        {/* Bottom Inspector Panel */}
        <div className="bg-[#0b0f19] rounded-2xl border border-white/[0.05] flex flex-col overflow-hidden">
          {/* Tab Selection Bar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-[#0a0e18]">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveBottomTab("visualizer")}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "visualizer"
                    ? "bg-white/[0.07] text-white shadow-subtle"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>Quantum State</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("measurements")}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "measurements"
                    ? "bg-white/[0.07] text-white shadow-subtle"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Probabilities</span>
              </button>

              <button
                onClick={() => setActiveBottomTab("editor")}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${
                  activeBottomTab === "editor"
                    ? "bg-white/[0.07] text-white shadow-subtle"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Code Studio</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="tabular-nums">
                {numQubits} qubits
              </span>
              <span className="text-white/[0.08]">·</span>
              <span className="text-emerald-400/80 tabular-nums">
                F = 1.0000
              </span>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="p-5">
            {activeBottomTab === "visualizer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tab-content-enter" key="tab-visualizer">
                <BlochSphere />
                <QSphere />
              </div>
            )}

            {activeBottomTab === "measurements" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tab-content-enter" key="tab-measurements">
                <ProbabilityHistogram />
                <StatevectorTable />
              </div>
            )}

            {activeBottomTab === "editor" && (
              <div className="w-full tab-content-enter" key="tab-editor">
                <QuantumCodeEditor height="420px" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.03] py-3.5 px-6 lg:px-8 flex items-center justify-between text-[11px] text-slate-500/80 bg-[#060912]">
        <span className="tracking-wide">Quantangle Platform · SIH 2026</span>
        <span className="font-mono text-[10px] text-slate-600/70 tabular-nums">Little-Endian · |q₀⟩ LSB</span>
      </footer>

      {/* Quest Arena & Leaderboard Modal */}
      <QuestArenaModal />

      {/* National Quantum Mission Micro-Credential Modal */}
      <MicroCredentialModal />
    </div>
  );
}
