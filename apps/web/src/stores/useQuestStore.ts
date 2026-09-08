// =============================================================================
// useQuestStore — Quest Labs & Gamification Arena State Management
// =============================================================================

"use client";

import { create } from "zustand";
import type { QuestEvaluation, CompletedQuestRecord } from "../content/quests/types";
import { QUEST_CATALOG } from "../content/quests/catalog";

interface QuestStoreState {
  activeQuestId: string | null;
  completedQuests: Record<string, CompletedQuestRecord>;
  totalXP: number;
  streakDays: number;
  lastActiveDate: string | null;
  isArenaOpen: boolean;
  evaluation: QuestEvaluation | null;

  // Actions
  setActiveQuestId: (questId: string | null) => void;
  openArena: () => void;
  closeArena: () => void;
  setEvaluation: (evaluation: QuestEvaluation | null) => void;
  recordQuestCompletion: (questId: string, evaluation: QuestEvaluation) => void;
  resetActiveQuest: () => void;
}

const STORAGE_KEY = "quantangle_quest_progress_v1";

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

    set({
      completedQuests: updatedCompleted,
      totalXP: newTotalXP,
      streakDays: newStreak,
      lastActiveDate: today,
      evaluation,
    });

    saveState({
      completedQuests: updatedCompleted,
      totalXP: newTotalXP,
      streakDays: newStreak,
      lastActiveDate: today,
    });
  },

  resetActiveQuest: () => {
    set({
      activeQuestId: null,
      evaluation: null,
    });
  },
}));
