"use client";

import React from "react";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { BarChart3 } from "lucide-react";

export const ProbabilityHistogram: React.FC = () => {
  const { numQubits } = useCircuitStore();
  const { stepStates, activeStep } = useSimulationStore();

  const currentStep = stepStates[activeStep];
  const probabilities = currentStep?.probabilities || [1];
  const statevector = currentStep?.statevector || [1, 0];

  const totalStates = Math.pow(2, numQubits);

  const formatBasisState = (index: number) => {
    return index.toString(2).padStart(numQubits, "0");
  };

  const getPhaseColor = (index: number) => {
    if (!statevector || index * 2 + 1 >= statevector.length) {
      return "hsl(180, 80%, 50%)";
    }
    const re = statevector[index * 2];
    const im = statevector[index * 2 + 1];
    let phase = Math.atan2(im, re);
    if (phase < 0) phase += 2 * Math.PI;
    const hue = Math.round((phase / (2 * Math.PI)) * 360);
    return `hsl(${hue}, 85%, 55%)`;
  };

  return (
    <div className="bg-[#0b0f1a] rounded-xl p-3.5 border border-white/[0.06] flex flex-col h-full min-h-[260px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold font-mono text-white">
            Measurement Probabilities P(|j⟩)
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            · Born Rule
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-[11px] text-slate-400">Phase Hue:</span>
          <div className="w-16 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-cyan-400 to-purple-500 opacity-90" />
        </div>
      </div>

      {/* Histogram Bars */}
      <div className="flex-1 flex items-end gap-3 pt-3 px-2 overflow-x-auto min-h-[150px]">
        {Array.from({ length: totalStates }).map((_, idx) => {
          const prob = probabilities[idx] ?? (idx === 0 ? 1.0 : 0.0);
          const percent = Math.round(prob * 100);
          const phaseColor = getPhaseColor(idx);
          const basisLabel = formatBasisState(idx);

          return (
            <div
              key={idx}
              className="flex-1 min-w-[40px] max-w-[72px] flex flex-col items-center gap-1.5 group"
            >
              {/* Percentage label */}
              <span className="text-xs font-mono text-slate-200 font-bold tabular-nums">
                {percent > 0 ? `${percent}%` : ""}
              </span>

              {/* Bar Fill */}
              <div className="w-full h-28 bg-[#070b14] rounded-t-md relative flex items-end p-0.5 overflow-hidden border border-white/[0.06]">
                <div
                  className="w-full rounded-t-sm transition-[height] duration-200"
                  style={{
                    height: `${Math.max(prob > 0 ? 4 : 0, percent)}%`,
                    backgroundColor: phaseColor,
                  }}
                />
              </div>

              {/* Basis State Label */}
              <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-cyan-300 transition-colors tabular-nums">
                |{basisLabel}⟩
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
        <span>Order: |q_{numQubits - 1}...q_1 q_0⟩ (LSB right)</span>
        <span className="text-emerald-400 font-semibold">Σ P(|j⟩) = 1.0000</span>
      </div>
    </div>
  );
};
