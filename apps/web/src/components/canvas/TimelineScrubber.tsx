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
    simulationTimeMs,
  } = useSimulationStore();

  const { steps } = useCircuitStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  const maxSteps = Math.max(stepStates.length, steps.length, 1);

  // Playback loop
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
    <div className="bg-[#0b0f1a] rounded-xl p-3 border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 shadow-sm">
      {/* Playback Transport Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(0);
          }}
          aria-label="Reset timeline to step t=0"
          title="Reset to t=0"
          className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleStepBack}
          disabled={activeStep <= 0}
          aria-label="Step backward"
          title="Step Backward"
          className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Timeline Animation" : "Play Timeline Animation"}
          title={isPlaying ? "Pause" : "Play"}
          className="w-8 h-8 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center transition-colors active:translate-y-[1px] font-semibold"
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
          aria-label="Step forward"
          title="Step Forward"
          className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors active:translate-y-[1px]"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3">
        <span className="text-xs font-mono text-cyan-300 whitespace-nowrap bg-[#070b14] px-2.5 py-1 rounded-md border border-white/[0.06] tabular-nums font-semibold">
          Step {String(activeStep).padStart(2, "0")} / {String(Math.max(0, maxSteps - 1)).padStart(2, "0")} (t{activeStep})
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
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Speed Selector & Telemetry */}
      <div className="flex items-center gap-2.5">
        {/* Speed Switcher */}
        <div className="h-8 flex items-center bg-[#070b14] rounded-lg p-0.5 border border-white/[0.06] text-xs font-mono">
          {[
            { label: "0.5×", speed: 1500 },
            { label: "1×", speed: 1000 },
            { label: "2×", speed: 500 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setPlaybackSpeed(item.speed)}
              className={`h-7 px-2 rounded transition-all tabular-nums ${
                playbackSpeed === item.speed
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Engine Latency Readout */}
        <div className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-[#070b14] border border-white/[0.06] text-emerald-400 text-xs font-mono">
          <Zap className="w-3 h-3 flex-shrink-0" />
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
