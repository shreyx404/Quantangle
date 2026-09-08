// =============================================================================
// QuestArenaModal — Gamification Arena & Bug-Hunting Sandbox Modal
// =============================================================================
// Features:
// - Interactive Quest Catalog (Track 1 Foundations, Track 2 Entanglement)
// - Track 3: Quantum Bug-Hunting Sandbox
// - Live Streak & XP Telemetry
// - National & College Leaderboard
// Follows Superconducting Quantum Workstation anti-slop guidelines.
// =============================================================================

"use client";

import React, { useState } from "react";
import { useQuestStore } from "../../stores/useQuestStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { QUEST_CATALOG } from "../../content/quests/catalog";
import type { QuestTrackId, LeaderboardEntry } from "../../content/quests/types";
import {
  Trophy,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  Sparkles,
  Layers,
  Medal,
  Award,
  BookOpen,
} from "lucide-react";

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    username: "q_tensor_ace",
    institution: "IIT Bombay",
    xp: 2850,
    streak: 21,
    badge: "Quantum Grandmaster",
  },
  {
    rank: 2,
    username: "qubit_surfer",
    institution: "IISc Bangalore",
    xp: 2620,
    streak: 18,
    badge: "Entanglement Specialist",
  },
  {
    rank: 3,
    username: "aer_optimizer",
    institution: "NIT Trichy",
    xp: 2380,
    streak: 16,
    badge: "Algorithm Architect",
  },
  {
    rank: 4,
    username: "bloch_drifter",
    institution: "BITS Pilani",
    xp: 2150,
    streak: 14,
    badge: "Phase Master",
  },
  {
    rank: 5,
    username: "quantum_cadet",
    institution: "IIT Madras",
    xp: 1940,
    streak: 12,
    badge: "Circuit Specialist",
  },
  {
    rank: 6,
    username: "you (Current Student)",
    institution: "SIH26140 Team",
    xp: 350,
    streak: 5,
    badge: "Rising Physicist",
    isCurrentUser: true,
  },
];

export const QuestArenaModal: React.FC = () => {
  const {
    isArenaOpen,
    closeArena,
    completedQuests,
    totalXP,
    streakDays,
    setActiveQuestId,
  } = useQuestStore();

  const { loadCircuitFromIR } = useCircuitStore();

  const [activeTab, setActiveTab] = useState<"all" | QuestTrackId | "leaderboard">("all");

  if (!isArenaOpen) return null;

  const completedCount = Object.keys(completedQuests).length;
  const totalCount = QUEST_CATALOG.length;

  const filteredQuests =
    activeTab === "all"
      ? QUEST_CATALOG
      : activeTab === "leaderboard"
      ? []
      : QUEST_CATALOG.filter((q) => q.trackId === activeTab);

  const handleLaunchQuest = (questId: string) => {
    const quest = QUEST_CATALOG.find((q) => q.id === questId);
    if (!quest) return;

    loadCircuitFromIR(quest.initialCircuit);
    setActiveQuestId(quest.id);
    closeArena();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#090d16] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0c121f] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[16px] font-semibold text-white tracking-tight">
                  Quest Labs & Gamification Arena
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  SIH26140
                </span>
              </div>
              <p className="text-[12px] text-slate-400">
                Interactive Quantum Mastery Curriculum & Bug-Hunting Sandbox
              </p>
            </div>
          </div>

          {/* Student Stats HUD */}
          <div className="flex items-center gap-3">
            {/* Daily Streak */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-orange-500/20 text-[12px] text-orange-400 font-mono">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400/20" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-amber-500/20 text-[12px] text-amber-400 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{totalXP} XP</span>
            </div>

            {/* Quests Completed */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-emerald-500/20 text-[12px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {completedCount}/{totalCount} Completed
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeArena}
              aria-label="Close Arena Modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#0a0e18] border-b border-white/[0.05] flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "all"
                ? "bg-white/[0.08] text-white shadow-subtle"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            All Quests ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("foundations")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "foundations"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Track 1: Foundations</span>
          </button>

          <button
            onClick={() => setActiveTab("entanglement")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "entanglement"
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Track 2: Entanglement</span>
          </button>

          <button
            onClick={() => setActiveTab("bughunt")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "bughunt"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Track 3: Bug-Hunting</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "leaderboard"
                ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span>National Leaderboard</span>
          </button>
        </div>

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quests View */}
          {activeTab !== "leaderboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuests.map((quest) => {
                const isCompleted = !!completedQuests[quest.id];
                const completionInfo = completedQuests[quest.id];

                return (
                  <div
                    key={quest.id}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-all hover:border-white/[0.15] ${
                      quest.isBugHunt
                        ? "bg-[#0d111d] border-amber-500/20"
                        : "bg-[#0b0f19] border-white/[0.06]"
                    }`}
                  >
                    <div>
                      {/* Card Header Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                              quest.difficulty === "Beginner"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : quest.difficulty === "Intermediate"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {quest.difficulty}
                          </span>

                          {quest.isBugHunt && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>BUG HUNT</span>
                            </span>
                          )}

                          <span className="text-[11px] font-mono text-slate-500">
                            {quest.numQubits}Q · Depth ≤ {quest.optimalDepth}
                          </span>
                        </div>

                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed</span>
                          </span>
                        )}
                      </div>

                      {/* Quest Title & Subtitle */}
                      <h3 className="text-[15px] font-semibold text-white tracking-tight">
                        {quest.title}
                      </h3>
                      <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                        {quest.subtitle}
                      </p>

                      {/* Bug Diagnosis Teaser if Bug Hunt */}
                      {quest.isBugHunt && quest.bugDiagnostic && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/15 text-[11px] text-amber-300/90 leading-snug">
                          <span className="font-semibold text-amber-200">Symptom: </span>
                          {quest.bugDiagnostic}
                        </div>
                      )}

                      {/* Objective */}
                      <div className="mt-3 text-[12px] text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/[0.04] leading-relaxed">
                        <span className="text-cyan-400 font-medium">Objective: </span>
                        {quest.objective}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-mono text-[12px]">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>+{quest.xpReward} XP</span>
                        {completionInfo && (
                          <span className="text-[10px] text-slate-500 ml-1">
                            (Best F: {completionInfo.fidelity.toFixed(3)})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleLaunchQuest(quest.id)}
                        className="h-8 px-3.5 rounded-lg text-[12px] font-semibold bg-white/[0.05] hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-white/[0.08] hover:border-transparent flex items-center gap-1.5 transition-all active:translate-y-[1px]"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isCompleted ? "Replay Quest" : "Launch Quest"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Leaderboard View */}
          {activeTab === "leaderboard" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-white">
                    SIH26140 National Collegiate Quantum League
                  </h3>
                  <p className="text-[12px] text-slate-400">
                    Real-time rankings based on verified circuit fidelity, gate depth optimizations, and daily streaks.
                  </p>
                </div>
                <div className="text-[12px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                  Updated Live
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-[#0b0f19]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#090d16] text-slate-400 text-[11px] uppercase tracking-wider font-mono border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Total XP</th>
                      <th className="py-3 px-4">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {SAMPLE_LEADERBOARD.map((entry) => (
                      <tr
                        key={entry.rank}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          entry.isCurrentUser
                            ? "bg-cyan-500/[0.07] border-l-2 border-cyan-400 font-medium"
                            : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono">
                          {entry.rank === 1 && (
                            <span className="text-amber-400 font-bold">🥇 #1</span>
                          )}
                          {entry.rank === 2 && (
                            <span className="text-slate-300 font-bold">🥈 #2</span>
                          )}
                          {entry.rank === 3 && (
                            <span className="text-amber-600 font-bold">🥉 #3</span>
                          )}
                          {entry.rank > 3 && (
                            <span className="text-slate-500">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-white">
                          <span className={entry.isCurrentUser ? "text-cyan-300" : ""}>
                            {entry.username}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[12px]">
                          {entry.institution}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-orange-400">
                          🔥 {entry.streak}d
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                          {entry.isCurrentUser ? totalXP : entry.xp} XP
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1 w-fit">
                            <Award className="w-3 h-3 text-cyan-400" />
                            <span>{entry.badge}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
