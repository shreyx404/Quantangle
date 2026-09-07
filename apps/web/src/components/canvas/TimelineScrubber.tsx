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
    <div className="bg-[#0b0f19] rounded-2xl p-4 lg:p-5 border border-white/[0.05] flex flex-wrap items-center justify-between gap-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(0);
          }}
          aria-label="Reset timeline to step t=0"
          title="Reset to t=0"
          className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleStepBack}
          disabled={activeStep <= 0}
          aria-label="Step backward"
          title="Step Backward"
          className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300 disabled:opacity-25 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Timeline Animation" : "Play Timeline Animation"}
          title={isPlaying ? "Pause" : "Play"}
          className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors active:translate-y-[1px] font-semibold"
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
          aria-label="Step forward"
          title="Step Forward"
          className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300 disabled:opacity-25 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Scrubber Slider */}
      <div className="flex-1 min-w-[220px] flex items-center gap-3.5">
        <span className="text-[12px] font-mono text-white whitespace-nowrap bg-[#0a0e18] px-3 py-1.5 rounded-xl border border-white/[0.05] tabular-nums">
          {String(activeStep).padStart(2, "0")} / {String(Math.max(0, maxSteps - 1)).padStart(2, "0")}
        </span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            aria-label="Quantum time-step scrubber"
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

      {/* Speed & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Speed toggle */}
        <div className="h-9 flex items-center gap-0.5 bg-[#0a0e18] rounded-xl p-0.5 border border-white/[0.05] text-[12px] font-mono">
          {[
            { label: "0.5×", speed: 1500 },
            { label: "1×", speed: 1000 },
            { label: "2×", speed: 500 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setPlaybackSpeed(item.speed)}
              className={`h-8 px-2.5 rounded-lg transition-all tabular-nums ${
                playbackSpeed === item.speed
                  ? "bg-white/[0.07] text-white font-medium"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Engine status */}
        <div className="h-9 flex items-center gap-2 px-3.5 rounded-xl bg-[#0a0e18] border border-white/[0.05] text-emerald-400/80 text-[12px] font-mono">
          <Zap className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="tabular-nums">
            {simulationTimeMs !== null
              ? `${simulationTimeMs.toFixed(2)} ms`
              : "0.08 ms"}
          </span>
        </div>
      </div>
    </div>
  );
};
