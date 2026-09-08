// =============================================================================
// QuestMissionHUD — Active Quest Mission Control HUD
// =============================================================================
// Docked mission controller above the Circuit Canvas when a Quest is active.
// Provides 0-latency client-side fidelity evaluation (F >= 0.999), depth scoring,
// diagnostic hints, and Qu-Copilot escalation per SIH26140 specs.
// =============================================================================

"use client";

import React, { useState } from "react";
import { useQuestStore } from "../../stores/useQuestStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { useCopilotStore } from "../../stores/useCopilotStore";
import { QUEST_CATALOG } from "../../content/quests/catalog";
import { evaluateCircuitFidelity } from "../../lib/clientSimulator";
import type { QuestEvaluation } from "../../content/quests/types";
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Bot,
  Layers,
} from "lucide-react";

export const QuestMissionHUD: React.FC = () => {
  const {
    activeQuestId,
    evaluation,
    setEvaluation,
    recordQuestCompletion,
    setActiveQuestId,
    openArena,
  } = useQuestStore();

  const { getCircuitIR, loadCircuitFromIR } = useCircuitStore();
  const { sendMessage, setOpen: setCopilotOpen } = useCopilotStore();

  const [showHint, setShowHint] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const quest = QUEST_CATALOG.find((q) => q.id === activeQuestId);

  if (!quest) return null;

  // Run the 0-latency fidelity verification against target circuit
  const handleVerify = () => {
    setIsVerifying(true);

    try {
      const studentIR = getCircuitIR();
      const result = evaluateCircuitFidelity(
        quest.targetCircuit,
        studentIR,
        quest.requiredFidelity
      );

      const actualDepth = result.actualDepth;
      const optimalDepth = quest.optimalDepth;
      const depthBonusEligible = actualDepth <= optimalDepth;
      const bonusXP = depthBonusEligible ? Math.round(quest.xpReward * 0.25) : 0;
      const totalXP = result.passed ? quest.xpReward + bonusXP : 0;

      let feedback = "";
      if (result.passed) {
        feedback = depthBonusEligible
          ? `Flawless solution! Target fidelity F = ${result.fidelity.toFixed(
              4
            )} reached at optimal depth ${actualDepth}.`
          : `Target fidelity F = ${result.fidelity.toFixed(
              4
            )} verified! Optimize circuit depth to ≤ ${optimalDepth} for a +${Math.round(
              quest.xpReward * 0.25
            )} XP bonus.`;
      } else {
        feedback =
          result.diagnosis ||
          `Current state fidelity F = ${result.fidelity.toFixed(
            4
          )} does not reach required threshold F ≥ ${quest.requiredFidelity}.`;
      }

      const evalData: QuestEvaluation = {
        passed: result.passed,
        fidelity: result.fidelity,
        requiredFidelity: quest.requiredFidelity,
        actualDepth,
        optimalDepth,
        depthBonusEligible,
        baseXP: quest.xpReward,
        bonusXP,
        totalXP,
        feedback,
        diagnosis: result.diagnosis,
      };

      setEvaluation(evalData);

      if (result.passed) {
        recordQuestCompletion(quest.id, evalData);
      }
    } catch (e) {
      console.error("Verification failed:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetToInitial = () => {
    loadCircuitFromIR(quest.initialCircuit);
    setEvaluation(null);
    setShowHint(false);
  };

  const handleAskCopilot = () => {
    setCopilotOpen(true);
    const prompt = `I am working on the Quest "${quest.title}" (${quest.trackTitle}).
Objective: ${quest.objective}
My current state fidelity is ${evaluation ? evaluation.fidelity.toFixed(4) : "unverified"} (required: ${quest.requiredFidelity}).
${evaluation?.diagnosis ? `Diagnostic info: ${evaluation.diagnosis}` : ""}
Can you guide me on how to adjust my circuit to satisfy the fidelity constraint?`;
    sendMessage(prompt);
  };

  return (
    <div className="bg-[#0b0f19] border border-white/[0.08] rounded-2xl overflow-hidden shadow-elevated transition-all">
      {/* HUD Header Bar */}
      <div className="px-5 py-3 bg-[#0e1424] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Quest Identifiers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {quest.trackTitle}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              quest.difficulty === "Beginner"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : quest.difficulty === "Intermediate"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {quest.difficulty}
          </span>

          {quest.isBugHunt && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>BUG HUNT</span>
            </span>
          )}

          <h2 className="text-[14px] font-semibold text-white tracking-tight">
            {quest.title}
          </h2>
        </div>

        {/* Telemetry & Target Specs */}
        <div className="flex items-center gap-3 text-[12px] font-mono">
          <div className="flex items-center gap-1.5 text-amber-400/90 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/15">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>+{quest.xpReward} XP</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/[0.05]">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>Depth ≤ {quest.optimalDepth}</span>
          </div>

          <button
            onClick={() => setActiveQuestId(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Exit Quest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mission Briefing & Objective */}
      <div className="px-5 py-3.5 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300 mr-1.5">Objective:</span>
            {quest.objective}
          </p>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`h-8 px-2.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 border transition-all ${
                showHint
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hint</span>
            </button>

            <button
              onClick={handleResetToInitial}
              className="h-8 px-2.5 rounded-lg text-[12px] font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center gap-1.5 transition-all"
              title="Reset circuit to starting state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="h-8 px-3.5 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-subtle active:translate-y-[1px] disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isVerifying ? "Verifying..." : "Verify & Grade"}</span>
            </button>
          </div>
        </div>

        {/* Bug Diagnostic Alert (if Bug Hunt) */}
        {quest.isBugHunt && quest.bugDiagnostic && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-300 flex items-start gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200">Bug Symptom: </span>
              {quest.bugDiagnostic}
            </div>
          </div>
        )}

        {/* Expandable Educational Hint */}
        {showHint && (
          <div className="p-3 rounded-xl bg-[#0e1628] border border-cyan-500/20 text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Quantum Principle Hint: </span>
              {quest.hint}
            </div>
          </div>
        )}

        {/* Real-Time Evaluation Result Banner */}
        {evaluation && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              evaluation.passed
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/30 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {evaluation.passed ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold">
                    {evaluation.passed
                      ? "Quest Cleared! State Fidelity Verified"
                      : "Verification Divergence"}
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.08] tabular-nums">
                    F = {evaluation.fidelity.toFixed(4)} (Req: ≥ {evaluation.requiredFidelity})
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/30 border border-white/[0.08] tabular-nums">
                    Depth: {evaluation.actualDepth}
                  </span>
                </div>

                <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">
                  {evaluation.feedback}
                </p>

                {evaluation.passed && (
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-medium">
                    <span>+{evaluation.baseXP} Base XP</span>
                    {evaluation.bonusXP > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-cyan-300">
                          +{evaluation.bonusXP} Optimal Depth Bonus!
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-amber-300">
                      Total: +{evaluation.totalXP} XP
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!evaluation.passed && (
                <button
                  onClick={handleAskCopilot}
                  className="h-8 px-3 rounded-lg text-[12px] font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Qu-Copilot</span>
                </button>
              )}

              {evaluation.passed && (
                <button
                  onClick={openArena}
                  className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-subtle"
                >
                  <span>More Quests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
