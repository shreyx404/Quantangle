// =============================================================================
// usePwaStore — Progressive Web App & Network State Management
// =============================================================================
// Tracks online/offline connectivity, Service Worker registration status,
// PWA installability prompts, and simulation toggles for SIH demonstration.
// =============================================================================

"use client";

import { create } from "zustand";

// Web API BeforeInstallPromptEvent interface
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  swRegistered: boolean;
  swVersion: string | null;
  canInstall: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  offlineToastVisible: boolean;

  // Actions
  setOnline: (online: boolean) => void;
  setSimulatedOffline: (simulated: boolean) => void;
  toggleSimulatedOffline: () => void;
  setSwRegistered: (registered: boolean, version?: string) => void;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  triggerInstall: () => Promise<boolean>;
  dismissOfflineToast: () => void;
  showToast: () => void;
}

export const usePwaStore = create<PwaState>((set, get) => ({
  isOnline: true,
  isSimulatedOffline: false,
  effectiveOnline: true,
  swRegistered: false,
  swVersion: null,
  canInstall: false,
  deferredPrompt: null,
  offlineToastVisible: false,

  setOnline: (online: boolean) => {
    const isSimulated = get().isSimulatedOffline;
    const effective = online && !isSimulated;
    set({
      isOnline: online,
      effectiveOnline: effective,
      offlineToastVisible: !effective,
    });
  },

  setSimulatedOffline: (simulated: boolean) => {
    const effective = get().isOnline && !simulated;
    set({
      isSimulatedOffline: simulated,
      effectiveOnline: effective,
      offlineToastVisible: !effective,
    });
  },

  toggleSimulatedOffline: () => {
    const nextSimulated = !get().isSimulatedOffline;
    const effective = get().isOnline && !nextSimulated;
    set({
      isSimulatedOffline: nextSimulated,
      effectiveOnline: effective,
      offlineToastVisible: !effective,
    });
  },

  setSwRegistered: (registered: boolean, version?: string) => {
    set({
      swRegistered: registered,
      swVersion: version || "v1.0.0",
    });
  },

  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => {
    set({
      deferredPrompt: prompt,
      canInstall: !!prompt,
    });
  },

  triggerInstall: async (): Promise<boolean> => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        set({ canInstall: false, deferredPrompt: null });
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Installation error:", err);
      return false;
    }
  },

  dismissOfflineToast: () => {
    set({ offlineToastVisible: false });
  },

  showToast: () => {
    set({ offlineToastVisible: true });
  },
}));
