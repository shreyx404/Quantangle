// =============================================================================
// useQuestStore — Quest Labs & Gamification Arena State Management
// =============================================================================

"use client";

import { create } from "zustand";
import type { QuestEvaluation, CompletedQuestRecord, QuestTrackId } from "../content/quests/types";
import { QUEST_CATALOG } from "../content/quests/catalog";
import type { SignedMicroCredential } from "../types/credentials";

interface TrackProgressInfo {
  total: number;
  completed: number;
  isEligible: boolean;
  averageFidelity: number;
  totalXP: number;
  completedQuestIds: string[];
}

interface QuestStoreState {
  activeQuestId: string | null;
  completedQuests: Record<string, CompletedQuestRecord>;
  totalXP: number;
  streakDays: number;
  lastActiveDate: string | null;
  isArenaOpen: boolean;
  evaluation: QuestEvaluation | null;
  pendingOfflineSync: string[];

  // Micro-Credentials State
  issuedCredentials: Record<string, SignedMicroCredential>;
  isCredentialModalOpen: boolean;
  selectedCredentialId: string | null;

  // Actions
  setActiveQuestId: (questId: string | null) => void;
  openArena: () => void;
  closeArena: () => void;
  setEvaluation: (evaluation: QuestEvaluation | null) => void;
  recordQuestCompletion: (questId: string, evaluation: QuestEvaluation) => void;
  resetActiveQuest: () => void;
  syncOfflineQuestsToCloud: () => Promise<void>;

  // Credential Actions
  openCredentialModal: (credentialId?: string | null) => void;
  closeCredentialModal: () => void;
  saveIssuedCredential: (credential: SignedMicroCredential) => void;
  getTrackProgress: (trackId: QuestTrackId | "mastery") => TrackProgressInfo;
}

const STORAGE_KEY = "quantangle_quest_progress_v2";

function loadSavedState(): Partial<QuestStoreState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load quest progress:", e);
    return {};
  }
}

function saveState(state: {
  completedQuests: Record<string, CompletedQuestRecord>;
  totalXP: number;
  streakDays: number;
  lastActiveDate: string | null;
  issuedCredentials: Record<string, SignedMicroCredential>;
  pendingOfflineSync: string[];
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save quest progress:", e);
  }
}

// Initial streak & starter mock XP if new user (5 days streak, 350 XP) to demonstrate live telemetry
const saved = loadSavedState();

export const useQuestStore = create<QuestStoreState>((set, get) => ({
  activeQuestId: null,
  completedQuests: saved.completedQuests ?? {},
  totalXP: saved.totalXP ?? 350,
  streakDays: saved.streakDays ?? 5,
  lastActiveDate: saved.lastActiveDate ?? new Date().toISOString().split("T")[0],
  isArenaOpen: false,
  evaluation: null,
  pendingOfflineSync: saved.pendingOfflineSync ?? [],

  // Micro-Credentials
  issuedCredentials: saved.issuedCredentials ?? {},
  isCredentialModalOpen: false,
  selectedCredentialId: null,

  setActiveQuestId: (questId) => {
    set({
      activeQuestId: questId,
      evaluation: null,
    });
  },

  openArena: () => set({ isArenaOpen: true }),
  closeArena: () => set({ isArenaOpen: false }),

  setEvaluation: (evaluation) => set({ evaluation }),

  recordQuestCompletion: (questId, evaluation) => {
    const state = get();
    const today = new Date().toISOString().split("T")[0];
    const isAlreadyCompleted = !!state.completedQuests[questId];

    // Calculate XP: award full XP if first time, 25% practice XP if replay
    const xpToAdd = isAlreadyCompleted
      ? Math.round(evaluation.totalXP * 0.25)
      : evaluation.totalXP;

    // Increment streak if not already recorded today
    let newStreak = state.streakDays;
    if (state.lastActiveDate !== today) {
      newStreak += 1;
    }

    const updatedCompleted = {
      ...state.completedQuests,
      [questId]: {
        questId,
        completedAt: new Date().toISOString(),
        fidelity: evaluation.fidelity,
        depth: evaluation.actualDepth,
        xpEarned: (state.completedQuests[questId]?.xpEarned ?? 0) + xpToAdd,
      },
    };

    const newTotalXP = state.totalXP + xpToAdd;
    const updatedPending = Array.from(new Set([...state.pendingOfflineSync, questId]));

    set({
      completedQuests: updatedCompleted,
      totalXP: newTotalXP,
      streakDays: newStreak,
      lastActiveDate: today,
      evaluation,
      pendingOfflineSync: updatedPending,
    });

    saveState({
      completedQuests: updatedCompleted,
      totalXP: newTotalXP,
      streakDays: newStreak,
      lastActiveDate: today,
      issuedCredentials: state.issuedCredentials,
      pendingOfflineSync: updatedPending,
    });

    // Attempt background cloud sync if online
    get().syncOfflineQuestsToCloud();
  },

  syncOfflineQuestsToCloud: async () => {
    const state = get();
    if (
      typeof window === "undefined" ||
      !navigator.onLine ||
      state.pendingOfflineSync.length === 0
    ) {
      return;
    }

    const queue = [...state.pendingOfflineSync];
    const successfullySynced: string[] = [];

    for (const qId of queue) {
      const record = state.completedQuests[qId];
      if (!record) continue;
      try {
        const res = await fetch(`/api/v1/quests/${qId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            circuit: { version: "1.0", qubits: 2, clbits: 2, steps: [] },
            fidelity: record.fidelity,
            depth: record.depth,
          }),
        });
        if (res.ok) {
          successfullySynced.push(qId);
        }
      } catch {
        // Network deferred
        break;
      }
    }

    if (successfullySynced.length > 0) {
      const remaining = state.pendingOfflineSync.filter(
        (id) => !successfullySynced.includes(id)
      );
      set({ pendingOfflineSync: remaining });
      saveState({
        completedQuests: state.completedQuests,
        totalXP: state.totalXP,
        streakDays: state.streakDays,
        lastActiveDate: state.lastActiveDate,
        issuedCredentials: state.issuedCredentials,
        pendingOfflineSync: remaining,
      });
    }
  },

  resetActiveQuest: () => {
    set({
      activeQuestId: null,
      evaluation: null,
    });
  },

  openCredentialModal: (credentialId = null) => {
    set({
      isCredentialModalOpen: true,
      selectedCredentialId: credentialId,
    });
  },

  closeCredentialModal: () => {
    set({
      isCredentialModalOpen: false,
      selectedCredentialId: null,
    });
  },

  saveIssuedCredential: (credential) => {
    const state = get();
    const updated = {
      ...state.issuedCredentials,
      [credential.credential_id]: credential,
    };
    set({
      issuedCredentials: updated,
      selectedCredentialId: credential.credential_id,
    });
    saveState({
      completedQuests: state.completedQuests,
      totalXP: state.totalXP,
      streakDays: state.streakDays,
      lastActiveDate: state.lastActiveDate,
      issuedCredentials: updated,
      pendingOfflineSync: state.pendingOfflineSync,
    });
  },

  getTrackProgress: (trackId) => {
    const state = get();
    const trackQuests =
      trackId === "mastery"
        ? QUEST_CATALOG
        : QUEST_CATALOG.filter((q) => q.trackId === trackId);

    const total = trackQuests.length;
    const completedList = trackQuests.filter((q) => !!state.completedQuests[q.id]);
    const completed = completedList.length;

    let fidelitySum = 0;
    let xpSum = 0;
    for (const q of completedList) {
      fidelitySum += state.completedQuests[q.id]?.fidelity ?? 1.0;
      xpSum += state.completedQuests[q.id]?.xpEarned ?? q.xpReward;
    }

    const averageFidelity = completed > 0 ? fidelitySum / completed : 1.0;
    const isEligible = completed === total && total > 0 && averageFidelity >= 0.999;

    return {
      total,
      completed,
      isEligible,
      averageFidelity: Number(averageFidelity.toFixed(4)),
      totalXP: xpSum,
      completedQuestIds: completedList.map((q) => q.id),
    };
  },
}));
