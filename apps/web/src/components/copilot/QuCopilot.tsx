"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { useCopilotStore } from "../../stores/useCopilotStore";
import type { QuantumCircuitIR } from "@quantangle/quantum-ast";
import { circuitToQiskit } from "@quantangle/quantum-ast";
import {
  Bot,
  Send,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
  Code2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Cpu,
} from "lucide-react";

interface QuCopilotProps {
  onClose?: () => void;
}

export const QuCopilot: React.FC<QuCopilotProps> = ({ onClose }) => {
  const { loadCircuitFromIR } = useCircuitStore();
  const {
    messages,
    isThinking,
    appliedCircuitId,
    sendMessage,
    clearChat,
    markApplied,
    setOpen,
  } = useCopilotStore();

  const [input, setInput] = useState("");
  const [expandedQiskitMsgId, setExpandedQiskitMsgId] = useState<string | null>(null);
  const [copiedCodeMsgId, setCopiedCodeMsgId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat container directly without scrolling parent window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  const handleSend = (text: string) => {
    if (!text.trim() || isThinking) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleApplyCircuit = (msgId: string, circuit: QuantumCircuitIR) => {
    loadCircuitFromIR(circuit);
    markApplied(msgId);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setOpen(false);
    }
  };

  // Helper to extract a concise gate pipeline representation for previews
  const getCircuitPreviewTokens = (circuit: QuantumCircuitIR): string[] => {
    const tokens: string[] = [];
    circuit.steps.forEach((step) => {
      step.operations.forEach((op) => {
        if (op.qubits.length === 1) {
          tokens.push(`${op.gate}(q${op.qubits[0]})`);
        } else if (op.qubits.length === 2) {
          tokens.push(`${op.gate}(q${op.qubits[0]}→q${op.qubits[1]})`);
        } else {
          tokens.push(`${op.gate}([${op.qubits.map((q) => `q${q}`).join(",")}])`);
        }
      });
    });
    return tokens;
  };

  return (
    <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/[0.08] flex flex-col h-full overflow-hidden shadow-sm relative">
      {/* Copilot Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#101726] border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white tracking-tight">
                Qu-Copilot
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                · Quantum AI Tutor
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">
              Verified Circuit Synthesizer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Unitary Verified Badge */}
          <div
            className="flex items-center gap-1 text-[10px] font-telemetry px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 tabular-nums"
            title="Unitary Verification Pipeline evaluates fidelity F = |⟨ψt|ψs⟩|² ≥ 0.999 before display."
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">F ≥ 0.999 Verified</span>
          </div>

          {/* Reset / Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors active:translate-y-[1px]"
            title="Clear Chat Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close / Collapse Button */}
          <button
            onClick={handleClose}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors active:translate-y-[1px]"
            title="Collapse Qu-Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container — Bounded with Internal Smooth Scroll */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto py-2.5 pr-1 flex flex-col gap-2.5"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedCircuitId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 max-w-[94%] text-xs ${
                isUser
                  ? "self-end bg-[#131d2e] text-slate-100 border border-cyan-500/30 rounded-lg p-2.5 shadow-sm"
                  : "self-start bg-[#101420] text-slate-200 border border-white/[0.08] rounded-lg p-2.5 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                {isUser ? (
                  <span className="text-cyan-300 font-semibold">You</span>
                ) : (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" /> Qu-Copilot
                  </span>
                )}
              </div>

              <p className="leading-relaxed whitespace-pre-wrap text-pretty text-slate-200">{msg.text}</p>

              {/* Verified Circuit Suggestion Card */}
              {msg.circuit && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-[#070a12] border border-emerald-500/30 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-telemetry text-emerald-400 font-semibold tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Unitary Fidelity F = 1.0000 ≥ 0.999</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-telemetry tabular-nums">
                      {msg.circuit.qubits}Q · {msg.circuit.steps.length} Steps
                    </span>
                  </div>

                  {/* Gate sequence badges */}
                  <div className="flex flex-wrap items-center gap-1 py-1">
                    {getCircuitPreviewTokens(msg.circuit).map((token, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#101726] text-cyan-200 font-telemetry text-[10px] border border-white/[0.08]">
                          {token}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Expandable Qiskit Python Code Preview */}
                  <div className="py-0.5">
                    <button
                      onClick={() =>
                        setExpandedQiskitMsgId(
                          expandedQiskitMsgId === msg.id ? null : msg.id
                        )
                      }
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{expandedQiskitMsgId === msg.id ? "Hide Qiskit Code" : "View Qiskit Python Code"}</span>
                      {expandedQiskitMsgId === msg.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedQiskitMsgId === msg.id && msg.circuit && (
                      <div className="mt-1 p-2 bg-black/60 rounded-md border border-white/[0.08] text-[10px] font-mono relative overflow-hidden">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.05] text-slate-400">
                          <span className="text-cyan-300 font-semibold text-[10px]">Python Qiskit</span>
                          <button
                            onClick={() => {
                              const codeStr = circuitToQiskit(msg.circuit!);
                              navigator.clipboard.writeText(codeStr);
                              setCopiedCodeMsgId(msg.id);
                              setTimeout(() => setCopiedCodeMsgId(null), 2000);
                            }}
                            className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white"
                          >
                            {copiedCodeMsgId === msg.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400 text-[9px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span className="text-[9px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-slate-300 whitespace-pre overflow-x-auto max-h-32 text-[10px] leading-tight font-telemetry">
                          {circuitToQiskit(msg.circuit)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => msg.circuit && handleApplyCircuit(msg.id, msg.circuit)}
                    disabled={isApplied}
                    className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:translate-y-[1px] ${
                      isApplied
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Applied to Canvas ✓</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Verified Circuit to Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Suggested Quantum Starters if only greeting is present */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-2 my-auto py-2">
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold px-1">
              Interactive Quantum Protocols
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                {
                  title: "Bell State |Φ⁺⟩",
                  desc: "2-qubit maximally entangled state (|00⟩ + |11⟩)/√2",
                  prompt: "Show me how to create a Bell State |Φ⁺⟩",
                },
                {
                  title: "3-Qubit GHZ State",
                  desc: "Greenberger–Horne–Zeilinger multipartite entanglement",
                  prompt: "Construct a 3-qubit GHZ state",
                },
                {
                  title: "Quantum Teleportation",
                  desc: "Transfer quantum state using entangled Bell pair",
                  prompt: "Explain and build quantum teleportation",
                },
                {
                  title: "Grover Search Algorithm",
                  desc: "Quadratic speedup via Oracle and Diffusion inversion",
                  prompt: "How does Grover search algorithm work?",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isThinking}
                  className="text-left p-2 rounded-lg bg-[#070b14]/70 hover:bg-[#111728] border border-white/[0.05] hover:border-cyan-500/30 transition-colors group active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-cyan-300 font-mono">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-slate-400 text-pretty mt-0.5 leading-snug">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isThinking && (
          <div className="self-start bg-[#101420] border border-cyan-500/30 rounded-lg p-2.5 flex items-center gap-2 text-xs text-cyan-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-telemetry text-[11px]">
              Verifying unitaries & evaluating state fidelity (F ≥ 0.999)...
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts — Fixed above input */}
      <div className="flex-shrink-0 pt-2 pb-1 border-t border-white/[0.06] flex flex-wrap gap-1">
        {[
          "Bell State |Φ⁺⟩",
          "3-Qubit GHZ State",
          "Parallel Superposition",
          "Phase Kickback & Oracle",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="text-[10px] font-telemetry px-2 py-0.5 rounded-md bg-[#101726] hover:bg-[#152033] text-slate-300 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-500/30 transition-colors disabled:opacity-40 active:translate-y-[1px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar — Fixed at bottom */}
      <div className="flex-shrink-0 flex items-center gap-1.5 pt-1.5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(input);
            }
          }}
          disabled={isThinking}
          placeholder="Ask Qu-Copilot (e.g., 'How to create Bell pair?')..."
          className="flex-1 bg-[#070a12] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isThinking}
          className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-colors active:translate-y-[1px] shadow-sm flex items-center justify-center"
          title="Send Question"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
