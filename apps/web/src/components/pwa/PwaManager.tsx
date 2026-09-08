// =============================================================================
// PwaManager — Service Worker Lifecycle & Offline Notification Component
// =============================================================================
// Initializes Service Worker registration, handles network connectivity events,
// and presents a high-aesthetic Superconducting Quantum Workstation offline banner.
// =============================================================================

"use client";

import React, { useEffect } from "react";
import { usePwaStore, type BeforeInstallPromptEvent } from "../../stores/usePwaStore";
import { WifiOff, Cpu, X, Download, ShieldCheck, RefreshCw } from "lucide-react";

export const PwaManager: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    effectiveOnline,
    swRegistered,
    canInstall,
    offlineToastVisible,
    setOnline,
    setSwRegistered,
    setDeferredPrompt,
    triggerInstall,
    dismissOfflineToast,
    toggleSimulatedOffline,
  } = usePwaStore();

  useEffect(() => {
    // 1. Check initial navigator online status
    if (typeof window !== "undefined") {
      setOnline(navigator.onLine);

      const handleOnline = () => {
        console.log("[PWA] Network connection restored: Online");
        setOnline(true);
      };

      const handleOffline = () => {
        console.log("[PWA] Network connection lost: Offline");
        setOnline(false);
      };

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        console.log("[PWA] beforeinstallprompt event captured");
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // 2. Register Service Worker in production and localhost
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log(
              "[PWA] Service Worker registered successfully with scope:",
              registration.scope
            );
            setSwRegistered(true, "v1.0.0");

            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      console.log(
                        "[PWA] New content available; please refresh."
                      );
                    } else {
                      console.log("[PWA] Content is cached for offline use.");
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, [setOnline, setSwRegistered, setDeferredPrompt]);

  return (
    <>
      {/* Floating Offline Notification Banner */}
      {offlineToastVisible && (
        <div id="offline-status-banner" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-none">
          <div className="pointer-events-auto bg-[#0a0f1d]/95 backdrop-blur-md border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-[13px] tracking-tight">
                    {isSimulatedOffline ? "Simulated Offline Mode Active" : "Offline Mode Active"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                    <Cpu className="w-3 h-3" />
                    <span>0ms Edge Sim</span>
                  </span>
                </div>
                <p className="text-[12px] text-slate-300 truncate mt-0.5">
                  Rust-WASM engine & all 9 Quest Labs running 100% locally. Zero latency.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isSimulatedOffline && (
                <button
                  id="resume-online-btn"
                  onClick={toggleSimulatedOffline}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] font-medium border border-white/[0.08] transition-colors"
                  title="Restore online mode"
                >
                  Resume Online
                </button>
              )}
              <button
                id="dismiss-offline-btn"
                onClick={dismissOfflineToast}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
                aria-label="Dismiss offline banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
