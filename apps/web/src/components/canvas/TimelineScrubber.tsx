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
    <div className="bg-[#0b0f19] rounded-lg p-3 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-sm">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(0);
          }}
          title="Reset to t=0 (Initial State)"
          className="w-8 h-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleStepBack}
          disabled={activeStep <= 0}
          title="Step Backward"
          className="w-8 h-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause Timeline" : "Play Timeline Animation"}
          className="w-8 h-8 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors active:translate-y-[1px] shadow-sm"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={handleStepForward}
          disabled={activeStep >= maxSteps - 1}
          title="Step Forward"
          className="w-8 h-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrubber Slider */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3">
        <span className="text-xs font-mono text-cyan-300 font-semibold whitespace-nowrap bg-[#101726] px-2 py-0.5 rounded border border-white/[0.06] tabular-nums">
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
      <div className="flex items-center gap-2.5">
        {/* Speed toggle */}
        <div className="flex items-center gap-0.5 bg-[#101726] rounded-md p-0.5 border border-white/[0.08] text-[11px] font-mono">
          {[
            { label: "0.5x", speed: 1500 },
            { label: "1x", speed: 1000 },
            { label: "2x", speed: 500 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setPlaybackSpeed(item.speed)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackSpeed === item.speed
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101726] border border-white/[0.08] text-emerald-400 text-xs font-mono">
          <Zap className="w-3 h-3" />
          <span>
            {simulationTimeMs !== null
              ? `${simulationTimeMs.toFixed(2)} ms`
              : "0.08 ms"}
          </span>
        </div>
      </div>
    </div>
  );
};
