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
    <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/[0.08] flex flex-col h-full min-h-[240px] shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-cyan-400" />
          <span className="type-heading font-mono text-white">
            Statevector Amplitudes |ψ⟩
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            · Quantum State Coefficients
          </span>
        </div>
        <span className="type-telemetry text-cyan-300 bg-[#101726] px-2.5 py-1 rounded-md border border-white/[0.08] tabular-nums font-semibold shadow-sm">
          Step {activeStep}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[180px] pt-1 font-telemetry text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] type-label text-slate-400 font-mono">
              <th className="py-2 px-2.5 font-semibold">Basis |j⟩</th>
              <th className="py-2 px-2.5 font-semibold">Re(α)</th>
              <th className="py-2 px-2.5 font-semibold">Im(α)</th>
              <th className="py-2 px-2.5 font-semibold">Phase θ</th>
              <th className="py-2 px-2.5 text-right font-semibold">P(|j⟩)</th>
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
                      ? "bg-cyan-500/[0.07] text-cyan-200"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <td className="py-2 px-2.5 font-bold font-mono text-white">
                    |{formatBasis(idx)}⟩
                  </td>
                  <td className="py-2 px-2.5 tabular-nums text-slate-200">{re.toFixed(4)}</td>
                  <td className="py-2 px-2.5 tabular-nums text-slate-200">{im.toFixed(4)}i</td>
                  <td className="py-2 px-2.5 tabular-nums text-slate-300">
                    {prob > 0.0001 ? `${(phase / Math.PI).toFixed(2)}π` : "—"}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold tabular-nums text-cyan-300">
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
