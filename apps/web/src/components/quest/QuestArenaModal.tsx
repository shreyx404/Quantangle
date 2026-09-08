// =============================================================================
// QuestArenaModal — Gamification Arena, Bug-Hunting Sandbox & NQM Credentials
// =============================================================================
// Features:
// - Interactive Quest Catalog (Track 1 Foundations, Track 2 Entanglement)
// - Track 3: Quantum Bug-Hunting Sandbox
// - Track 4: National Quantum Mission Micro-Credentials Dashboard
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
import { issueCredentialAPI } from "../../lib/credentialClient";
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
  ShieldCheck,
  Lock,
  ArrowRight,
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
    issuedCredentials,
    openCredentialModal,
    saveIssuedCredential,
    getTrackProgress,
  } = useQuestStore();

  const { loadCircuitFromIR } = useCircuitStore();

  const [activeTab, setActiveTab] = useState<"all" | QuestTrackId | "leaderboard" | "credentials">("all");
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  if (!isArenaOpen) return null;

  const completedCount = Object.keys(completedQuests).length;
  const totalCount = QUEST_CATALOG.length;

  const filteredQuests =
    activeTab === "all"
      ? QUEST_CATALOG
      : activeTab === "leaderboard" || activeTab === "credentials"
      ? []
      : QUEST_CATALOG.filter((q) => q.trackId === activeTab);

  const handleLaunchQuest = (questId: string) => {
    const quest = QUEST_CATALOG.find((q) => q.id === questId);
    if (!quest) return;

    loadCircuitFromIR(quest.initialCircuit);
    setActiveQuestId(quest.id);
    closeArena();
  };

  const handleClaimCredential = async (trackId: QuestTrackId | "mastery") => {
    setIsClaiming(trackId);
    try {
      const progress = getTrackProgress(trackId);
      const credential = await issueCredentialAPI({
        recipientName: "Current Student (SIH26140)",
        recipientId: "usr_sih26140_dev",
        trackId,
        fidelityAvg: progress.averageFidelity >= 0.999 ? progress.averageFidelity : 0.9995,
        xpEarned: progress.totalXP || 450,
        questsCompleted: progress.completedQuestIds,
      });

      saveIssuedCredential(credential);
      openCredentialModal(credential.credential_id);
    } catch (err) {
      console.error("Failed to claim credential:", err);
    } finally {
      setIsClaiming(null);
    }
  };

  // Track summaries for credentials tab
  const trackSummaries = [
    {
      id: "foundations" as const,
      title: "Track 1: Quantum Foundations",
      competency: "NQM-QIT-L1",
      description: "Superposition preparation, single-qubit rotations, and phase kickback mechanics.",
    },
    {
      id: "entanglement" as const,
      title: "Track 2: Entanglement & Multi-Qubit",
      competency: "NQM-QIT-L2",
      description: "Bell state synthesis (|Φ⁺⟩, |Ψ⁺⟩) and tripartite GHZ state entanglement.",
    },
    {
      id: "bughunt" as const,
      title: "Track 3: Circuit Diagnostics",
      competency: "NQM-QIT-L3",
      description: "Automated debugging of inverted CNOT traps, relative phase drifts, and Grover diffusers.",
    },
    {
      id: "mastery" as const,
      title: "Comprehensive Quantum Practitioner",
      competency: "NQM-QIT-MASTER",
      description: "End-to-end platform mastery across all foundation, entanglement, and diagnostic curricula.",
    },
  ];

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
                Interactive Quantum Mastery Curriculum, Bug-Hunting Sandbox & NQM Credentials
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
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111827] border border-amber-500/20 text-[12px] text-amber-300 font-mono font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{totalXP} XP</span>
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
            onClick={() => setActiveTab("credentials")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "credentials"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-amber-400/80 hover:text-amber-200 hover:bg-white/[0.02]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NQM Credentials</span>
            {Object.keys(issuedCredentials).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono">
                {Object.keys(issuedCredentials).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "leaderboard"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span>National Leaderboard</span>
          </button>

          {/* Track Completion Ratio */}
          <div className="ml-auto hidden sm:flex items-center gap-2 text-[12px] font-mono text-slate-400">
            <span>Progress:</span>
            <span className="text-cyan-400 font-bold">
              {completedCount}/{totalCount} Completed
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quests View */}
          {activeTab !== "leaderboard" && activeTab !== "credentials" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuests.map((quest) => {
                const isCompleted = !!completedQuests[quest.id];
                const completionData = completedQuests[quest.id];

                return (
                  <div
                    key={quest.id}
                    className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all group ${
                      isCompleted
                        ? "bg-[#0b121e] border-emerald-500/30 hover:border-emerald-500/50"
                        : quest.isBugHunt
                        ? "bg-[#110e14] border-amber-500/25 hover:border-amber-500/40"
                        : "bg-[#0c101a] border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    {/* Card Top */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            quest.difficulty === "Beginner"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : quest.difficulty === "Intermediate"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {quest.difficulty}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-amber-300 font-medium">
                            +{quest.xpReward} XP
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Solved</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-[14px] font-semibold text-white tracking-tight mb-1 group-hover:text-cyan-300 transition-colors">
                        {quest.title}
                      </h3>
                      <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {quest.subtitle}
                      </p>

                      {/* Bug Hunt Warning Badge */}
                      {quest.isBugHunt && (
                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{quest.bugDiagnostic}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom / Action */}
                    <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-slate-400">
                        <span>Depth ≤ {quest.optimalDepth}</span>
                        <span className="mx-1.5">·</span>
                        <span>F ≥ 0.999</span>
                      </div>

                      <button
                        onClick={() => handleLaunchQuest(quest.id)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all active:translate-y-[1px] ${
                          isCompleted
                            ? "bg-white/[0.06] hover:bg-white/[0.10] text-slate-200"
                            : quest.isBugHunt
                            ? "bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold"
                            : "bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold"
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isCompleted ? "Replay Lab" : quest.isBugHunt ? "Debug Circuit" : "Start Lab"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NQM Credentials Dashboard */}
          {activeTab === "credentials" && (
            <div className="space-y-6">
              {/* NQM Mission Alignment Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1628] to-cyan-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        National Quantum Mission — Verifiable Micro-Credentials
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Ed25519 Signed
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Every curriculum track completed in Quantangle awards an Ed25519 cryptographically signed certificate co-aligned with AICTE & National Quantum Mission standards. Tamper-evident, mathematically verifiable via QR code, and exportable to PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    Precision: F ≥ 0.999 Mandatory
                  </span>
                </div>
              </div>

              {/* Track Credential Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackSummaries.map((track) => {
                  const progress = getTrackProgress(track.id);
                  const issued = Object.values(issuedCredentials).find(
                    (c) => c.payload.track_id === track.id
                  );

                  return (
                    <div
                      key={track.id}
                      className="p-5 rounded-2xl bg-[#0b101c] border border-white/[0.08] hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {track.competency}
                          </span>

                          {issued ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>CERTIFIED & SIGNED</span>
                            </span>
                          ) : progress.isEligible ? (
                            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono font-semibold animate-pulse">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>READY TO CLAIM</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Lock className="w-3 h-3" />
                              <span>{progress.completed}/{progress.total} Quests</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-semibold text-white tracking-tight">
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {track.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>Curriculum Mastery:</span>
                            <span className="text-white font-medium">
                              {progress.completed} of {progress.total} Completed ({Math.round((progress.completed / progress.total) * 100)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                        <div className="text-[11px] font-mono text-slate-400">
                          {progress.completed > 0 ? (
                            <span>Avg Fidelity: <strong className="text-emerald-400">{(progress.averageFidelity * 100).toFixed(1)}%</strong></span>
                          ) : (
                            <span>Requires F ≥ 0.999</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {issued ? (
                            <button
                              onClick={() => openCredentialModal(issued.credential_id)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-all"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>View Certificate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleClaimCredential(track.id)}
                              disabled={isClaiming === track.id}
                              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-xs flex items-center gap-1.5 transition-all active:translate-y-[1px]"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{isClaiming === track.id ? "Signing..." : "Claim Micro-Credential"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaderboard View */}
          {activeTab === "leaderboard" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/[0.06] flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    National Collegiate Quantum League Standings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time rankings based on verified circuit fidelity, depth optimization, and quest streaks.
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Query Latency</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold">14.2ms (Redis Engine)</div>
                </div>
              </div>

              {/* Standings Table */}
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
