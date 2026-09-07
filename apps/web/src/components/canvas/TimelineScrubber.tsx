"use client";

import React, { useEffect, useState } from "react";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Zap,
} from "lucide-react";

export const TimelineScrubber: React.FC = () => {
  const {
    stepStates,
    activeStep,
    setActiveStep,
    isRunning,
    simulationTimeMs,
  } = useSimulationStore();

  const { steps } = useCircuitStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  const maxSteps = Math.max(stepStates.length, steps.length, 1);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setActiveStep((activeStep + 1) % maxSteps);
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, activeStep, maxSteps, playbackSpeed, setActiveStep]);

  const handleStepBack = () => {
    setIsPlaying(false);
    setActiveStep(Math.max(0, activeStep - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setActiveStep(Math.min(maxSteps - 1, activeStep + 1));
  };

  return (
    <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(0);
          }}
          title="Reset to t=0 (Initial State)"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleStepBack}
          disabled={activeStep <= 0}
          title="Step Backward"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Timeline" : "Play Timeline Animation"}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={handleStepForward}
          disabled={activeStep >= maxSteps - 1}
          title="Step Forward"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrubber Slider */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3">
        <span className="text-xs font-mono text-cyan-400 font-bold whitespace-nowrap">
          Step {activeStep} / {Math.max(0, maxSteps - 1)}
        </span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, maxSteps - 1)}
            value={activeStep}
            onChange={(e) => {
              setIsPlaying(false);
              setActiveStep(parseInt(e.target.value, 10));
            }}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Speed & Simulator Info */}
      <div className="flex items-center gap-3">
        {/* Speed toggle */}
        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5 text-[11px] font-mono">
          {[
            { label: "0.5x", speed: 1500 },
            { label: "1x", speed: 1000 },
            { label: "2x", speed: 500 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setPlaybackSpeed(item.speed)}
              className={`px-2 py-0.5 rounded ${
                playbackSpeed === item.speed
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Zap className="w-3.5 h-3.5" />
          <span>
            {simulationTimeMs !== null
              ? `${simulationTimeMs.toFixed(2)} ms`
              : "0 ms"}
          </span>
        </div>
      </div>
    </div>
  );
};
