// =============================================================================
// Quantangle Quest Labs & Gamification Arena — Types
// =============================================================================

import type { QuantumCircuitIR } from "@quantangle/quantum-ast";

export type QuestTrackId = "foundations" | "entanglement" | "bughunt" | "algorithms";

export type QuestDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Quest {
  id: string;
  trackId: QuestTrackId;
  trackTitle: string;
  title: string;
  subtitle: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  optimalDepth: number;
  requiredFidelity: number; // e.g. 0.999
  numQubits: number;
  numClbits: number;
  description: string;
  objective: string;
  hint: string;
  initialCircuit: QuantumCircuitIR;
  targetCircuit: QuantumCircuitIR;
  tags: string[];
  isBugHunt?: boolean;
  bugDiagnostic?: string;
}

export interface QuestEvaluation {
  passed: boolean;
  fidelity: number;
  requiredFidelity: number;
  actualDepth: number;
  optimalDepth: number;
  depthBonusEligible: boolean;
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  feedback: string;
  diagnosis?: string;
}

export interface CompletedQuestRecord {
  questId: string;
  completedAt: string;
  fidelity: number;
  depth: number;
  xpEarned: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  institution: string;
  xp: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}
