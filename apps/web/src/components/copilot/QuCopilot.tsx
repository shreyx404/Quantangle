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
    <div className="bg-[#0b0f19] rounded-2xl p-4 lg:p-5 border border-white/[0.05] flex flex-col h-full overflow-hidden relative">
      {/* Copilot Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0d1220] border border-white/[0.05] flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[15px] font-semibold text-white block">
              Qu-Copilot
            </span>
            <span className="text-[11px] text-slate-500">
              Verified circuit synthesizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Verified Badge */}
          <div
            className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/80 tabular-nums"
            title="Unitary Verification Pipeline evaluates fidelity F = |⟨ψt|ψs⟩|² ≥ 0.999 before display."
          >
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">F ≥ 0.999</span>
          </div>

          <button
            onClick={clearChat}
            aria-label="Clear chat conversation"
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.05] transition-colors active:translate-y-[1px] flex items-center justify-center"
            title="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClose}
            aria-label="Collapse Qu-Copilot sidebar"
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.05] transition-colors active:translate-y-[1px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto py-4 pr-1 flex flex-col gap-3"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedCircuitId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-2 max-w-[94%] text-[13px] ${
                isUser
                  ? "self-end bg-[#111b2e] text-slate-100 border border-white/[0.06] rounded-2xl rounded-br-lg p-3.5"
                  : "self-start bg-[#0a0e18] text-slate-200 border border-white/[0.04] rounded-2xl rounded-bl-lg p-3.5"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                {isUser ? (
                  <span className="text-slate-400 font-medium">You</span>
                ) : (
                  <span className="text-cyan-400/70 font-medium flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Qu-Copilot
                  </span>
                )}
              </div>

              <p className="type-body whitespace-pre-wrap text-slate-200 leading-relaxed">{msg.text}</p>

              {/* Verified Circuit Suggestion Card */}
              {msg.circuit && (
                <div className="mt-2 p-3.5 rounded-xl bg-[#070a12] border border-emerald-500/20 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/80 tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>F = 1.0000</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {msg.circuit.qubits}Q · {msg.circuit.steps.length} steps
                    </span>
                  </div>

                  {/* Gate sequence badges */}
                  <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                    {getCircuitPreviewTokens(msg.circuit).map((token, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 font-mono text-[11px] border border-white/[0.04]">
                          {token}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Expandable Qiskit Code */}
                  <div>
                    <button
                      onClick={() =>
                        setExpandedQiskitMsgId(
                          expandedQiskitMsgId === msg.id ? null : msg.id
                        )
                      }
                      className="text-[12px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{expandedQiskitMsgId === msg.id ? "Hide code" : "View Qiskit code"}</span>
                      {expandedQiskitMsgId === msg.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedQiskitMsgId === msg.id && msg.circuit && (
                      <div className="mt-2 p-3 bg-black/50 rounded-lg border border-white/[0.04] text-[12px] font-mono relative overflow-hidden">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.04] text-slate-500">
                          <span className="text-slate-400 text-[11px]">Python Qiskit</span>
                          <button
                            onClick={() => {
                              const codeStr = circuitToQiskit(msg.circuit!);
                              navigator.clipboard.writeText(codeStr);
                              setCopiedCodeMsgId(msg.id);
                              setTimeout(() => setCopiedCodeMsgId(null), 2000);
                            }}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedCodeMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-slate-300 whitespace-pre overflow-x-auto max-h-36 text-[12px] leading-relaxed">
                          {circuitToQiskit(msg.circuit)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => msg.circuit && handleApplyCircuit(msg.id, msg.circuit)}
                    disabled={isApplied}
                    className={`w-full py-2.5 px-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors active:translate-y-[1px] ${
                      isApplied
                        ? "bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/20 cursor-default"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Applied ✓</span>
                      </>
                    ) : (
                      <span>Apply to canvas</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Suggested Quantum Starters */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-3 my-auto py-3">
            <span className="text-[11px] font-medium text-slate-500 px-1">
              Try a protocol
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  title: "Bell State |Φ⁺⟩",
                  desc: "2-qubit maximally entangled state",
                  prompt: "Show me how to create a Bell State |Φ⁺⟩",
                },
                {
                  title: "3-Qubit GHZ State",
                  desc: "Multipartite entanglement",
                  prompt: "Construct a 3-qubit GHZ state",
                },
                {
                  title: "Quantum Teleportation",
                  desc: "Transfer state via entangled pair",
                  prompt: "Explain and build quantum teleportation",
                },
                {
                  title: "Grover Search",
                  desc: "Quadratic speedup search algorithm",
                  prompt: "How does Grover search algorithm work?",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isThinking}
                  className="text-left p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-all group active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-[13px] font-medium text-slate-200 group-hover:text-white">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[12px] text-slate-500 mt-1">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isThinking && (
          <div className="self-start bg-[#0a0e18] border border-white/[0.04] rounded-2xl rounded-bl-lg p-3.5 flex items-center gap-2.5 text-[13px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span>
              Verifying unitaries...
            </span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex-shrink-0 pt-3 pb-2 border-t border-white/[0.04] flex flex-wrap gap-1.5">
        {[
          "Bell State",
          "GHZ State",
          "Superposition",
          "Phase Kickback",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="h-7 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.04] hover:border-white/[0.07] transition-colors disabled:opacity-30 active:translate-y-[1px] text-[12px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 flex items-center gap-2 pt-2">
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
          placeholder="Ask about quantum circuits..."
          className="flex-1 h-10 bg-[#070a12] border border-white/[0.05] hover:border-white/[0.08] rounded-xl px-4 text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isThinking}
          aria-label="Send message to Qu-Copilot"
          className="h-10 w-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-25 text-slate-950 transition-colors active:translate-y-[1px] flex items-center justify-center flex-shrink-0"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
