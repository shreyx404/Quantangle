"use client";

import React from "react";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { Binary } from "lucide-react";

export const StatevectorTable: React.FC = () => {
  const { numQubits } = useCircuitStore();
  const { stepStates, activeStep } = useSimulationStore();

  const currentStep = stepStates[activeStep];
  const statevector = currentStep?.statevector || [1, 0];
  const probabilities = currentStep?.probabilities || [1];

  const totalStates = Math.pow(2, numQubits);

  const formatBasis = (idx: number) => idx.toString(2).padStart(numQubits, "0");

  return (
    <div className="bg-[#0b0f19] rounded-lg p-3 border border-white/[0.08] flex flex-col h-full min-h-[240px] shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Statevector Amplitudes |ψ⟩
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-[#101726] px-2 py-0.5 rounded border border-white/[0.06]">
          Step {activeStep}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[180px] pt-1 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-1 px-2 font-medium">Basis |j⟩</th>
              <th className="py-1 px-2 font-medium">Re(α)</th>
              <th className="py-1 px-2 font-medium">Im(α)</th>
              <th className="py-1 px-2 font-medium">Phase θ</th>
              <th className="py-1 px-2 text-right font-medium">P(|j⟩)</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalStates }).map((_, idx) => {
              const re = statevector[idx * 2] ?? (idx === 0 ? 1 : 0);
              const im = statevector[idx * 2 + 1] ?? 0;
              const prob = probabilities[idx] ?? (idx === 0 ? 1 : 0);
              let phase = Math.atan2(im, re);
              if (phase < 0) phase += 2 * Math.PI;

              const isSignificant = prob > 0.0001;

              return (
                <tr
                  key={idx}
                  className={`border-b border-white/[0.04] transition-colors ${
                    isSignificant
                      ? "bg-cyan-500/[0.06] text-cyan-200"
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  <td className="py-1 px-2 font-semibold text-white">
                    |{formatBasis(idx)}⟩
                  </td>
                  <td className="py-1 px-2 tabular-nums">{re.toFixed(4)}</td>
                  <td className="py-1 px-2 tabular-nums">{im.toFixed(4)}i</td>
                  <td className="py-1 px-2 tabular-nums">
                    {prob > 0.0001 ? `${(phase / Math.PI).toFixed(2)}π` : "—"}
                  </td>
                  <td className="py-1 px-2 text-right font-semibold tabular-nums text-slate-200">
                    {(prob * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
