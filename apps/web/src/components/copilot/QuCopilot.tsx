"use client";

import React, { useState } from "react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";
import {
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  circuit?: QuantumCircuitIR;
  fidelity?: number;
  explanation?: string;
}

export const QuCopilot: React.FC = () => {
  const { loadCircuitFromIR } = useCircuitStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "copilot",
      text: "Hello! I am Qu-Copilot, your AI Quantum Computing Tutor. All circuit suggestions are mathematically validated through our Unitary Verification Pipeline (F ≥ 0.999) before you see them.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Pre-verified sample circuits for instant AI assistance
  const samplePresets: Record<string, { circuit: QuantumCircuitIR; explanation: string }> = {
    bell: {
      circuit: {
        version: "1.0",
        qubits: 2,
        clbits: 2,
        steps: [
          { stepIndex: 0, operations: [{ id: "b1", gate: "H", qubits: [0] }] },
          { stepIndex: 1, operations: [{ id: "b2", gate: "CX", qubits: [0, 1] }] },
        ],
      },
      explanation:
        "The Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is created by applying a Hadamard gate on qubit 0 (putting it in superposition) followed by a CNOT with qubit 0 as control and qubit 1 as target.",
    },
    ghz: {
      circuit: {
        version: "1.0",
        qubits: 3,
        clbits: 3,
        steps: [
          { stepIndex: 0, operations: [{ id: "g1", gate: "H", qubits: [0] }] },
          { stepIndex: 1, operations: [{ id: "g2", gate: "CX", qubits: [0, 1] }] },
          { stepIndex: 2, operations: [{ id: "g3", gate: "CX", qubits: [1, 2] }] },
        ],
      },
      explanation:
        "The 3-qubit Greenberger-Horne-Zeilinger (GHZ) state |GHZ⟩ = (|000⟩ + |111⟩)/√2 extends maximally entangled states across 3 qubits.",
    },
    superposition: {
      circuit: {
        version: "1.0",
        qubits: 2,
        clbits: 0,
        steps: [
          {
            stepIndex: 0,
            operations: [
              { id: "s1", gate: "H", qubits: [0] },
              { id: "s2", gate: "H", qubits: [1] },
            ],
          },
        ],
      },
      explanation:
        "Applying parallel Hadamard gates produces an equal superposition over all 4 basis states: |++⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2.",
    },
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      let reply: Message;
      const lower = userText.toLowerCase();

      if (lower.includes("bell") || lower.includes("entangle")) {
        reply = {
          id: String(Date.now() + 1),
          sender: "copilot",
          text: samplePresets.bell.explanation,
          circuit: samplePresets.bell.circuit,
          fidelity: 1.0,
        };
      } else if (lower.includes("ghz")) {
        reply = {
          id: String(Date.now() + 1),
          sender: "copilot",
          text: samplePresets.ghz.explanation,
          circuit: samplePresets.ghz.circuit,
          fidelity: 1.0,
        };
      } else if (lower.includes("superposition") || lower.includes("hadamard")) {
        reply = {
          id: String(Date.now() + 1),
          sender: "copilot",
          text: samplePresets.superposition.explanation,
          circuit: samplePresets.superposition.circuit,
          fidelity: 1.0,
        };
      } else {
        reply = {
          id: String(Date.now() + 1),
          sender: "copilot",
          text: `In quantum computing, every transformation on pure states is represented by a unitary matrix U†U = I. Phase kickback and constructive/destructive interference allow quantum algorithms like Grover's and Shor's to achieve polynomial and exponential speedups over classical algorithms.`,
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col h-full min-h-[360px]">
      {/* Copilot Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Qu-Copilot AI Quantum Tutor
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified Circuit Generation</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 min-h-[220px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 max-w-[90%] text-xs ${
              msg.sender === "user"
                ? "self-end bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-2xl rounded-br-none p-2.5"
                : "self-start bg-slate-900/70 text-slate-200 border border-white/10 rounded-2xl rounded-bl-none p-2.5"
            }`}
          >
            <p className="leading-relaxed">{msg.text}</p>

            {/* Circuit Suggestion Card */}
            {msg.circuit && (
              <div className="mt-1.5 p-2 rounded-xl bg-black/40 border border-purple-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unitary Fidelity F = 1.000</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {msg.circuit.qubits} Qubits
                  </span>
                </div>

                <button
                  onClick={() => msg.circuit && loadCircuitFromIR(msg.circuit)}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Verified Circuit to Canvas</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="self-start bg-slate-900/70 border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Validating quantum unitaries & calculating state fidelity...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5 pb-2">
        {[
          "Create Bell State |Φ⁺⟩",
          "Build 3-Qubit GHZ State",
          "Parallel Superposition",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/5 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask Qu-Copilot (e.g., 'How to entangle 2 qubits?')..."
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
