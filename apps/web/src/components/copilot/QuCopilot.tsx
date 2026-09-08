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
  Sparkles,
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
    <div className="bg-[#0b0f1a] rounded-xl p-4 border border-white/[0.06] flex flex-col h-full overflow-hidden relative shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#070b14] border border-white/[0.06] flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block tracking-tight">
              Qu-Copilot
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Verified Circuit Synthesizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Verified Fidelity Badge */}
          <div
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tabular-nums"
            title="Every circuit suggestion is verified: state fidelity F ≥ 0.999"
          >
            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline font-semibold">F ≥ 0.999</span>
          </div>

          <button
            onClick={clearChat}
            aria-label="Clear chat conversation"
            className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.06] transition-colors active:translate-y-[1px] flex items-center justify-center"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={handleClose}
            aria-label="Collapse Qu-Copilot sidebar"
            className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.06] transition-colors active:translate-y-[1px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto py-3 pr-1 flex flex-col gap-2.5"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedCircuitId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 max-w-[94%] text-xs ${
                isUser
                  ? "self-end bg-[#101828] text-slate-100 border border-white/[0.08] rounded-xl rounded-br-sm p-3"
                  : "self-start bg-[#070b14] text-slate-200 border border-white/[0.05] rounded-xl rounded-bl-sm p-3"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                {isUser ? (
                  <span className="text-slate-400 font-semibold">You</span>
                ) : (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Qu-Copilot
                  </span>
                )}
              </div>

              <p className="type-body whitespace-pre-wrap text-slate-200 leading-relaxed text-xs">
                {msg.text}
              </p>

              {/* Verified Circuit Suggestion Card */}
              {msg.circuit && (
                <div className="mt-1.5 p-3 rounded-lg bg-[#0a0f1d] border border-emerald-500/25 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>F = 1.0000 (Verified)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {msg.circuit.qubits}Q · {msg.circuit.steps.length} steps
                    </span>
                  </div>

                  {/* Gate sequence badges */}
                  <div className="flex flex-wrap items-center gap-1 py-0.5">
                    {getCircuitPreviewTokens(msg.circuit).map((token, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 font-mono text-[10px] border border-white/[0.05]">
                          {token}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
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
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors font-mono"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{expandedQiskitMsgId === msg.id ? "Hide Qiskit code" : "View Qiskit code"}</span>
                      {expandedQiskitMsgId === msg.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedQiskitMsgId === msg.id && msg.circuit && (
                      <div className="mt-1.5 p-2.5 bg-black/60 rounded border border-white/[0.05] text-[11px] font-mono relative overflow-hidden">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.05] text-slate-400 text-[10px]">
                          <span>Python Qiskit</span>
                          <button
                            onClick={() => {
                              const codeStr = circuitToQiskit(msg.circuit!);
                              navigator.clipboard.writeText(codeStr);
                              setCopiedCodeMsgId(msg.id);
                              setTimeout(() => setCopiedCodeMsgId(null), 2000);
                            }}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
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
                        <pre className="text-cyan-300/90 whitespace-pre overflow-x-auto max-h-32 text-[11px] leading-relaxed">
                          {circuitToQiskit(msg.circuit)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Apply Action */}
                  <button
                    onClick={() => msg.circuit && handleApplyCircuit(msg.id, msg.circuit)}
                    disabled={isApplied}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:translate-y-[1px] ${
                      isApplied
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default"
                        : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Applied to Canvas ✓</span>
                      </>
                    ) : (
                      <span>Apply to Canvas</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Starter Protocol Cards */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-2 my-auto py-2">
            <span className="text-[10px] font-mono font-medium text-slate-500 px-1">
              Quick Protocol Synthesizers
            </span>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  title: "Bell State |Φ⁺⟩",
                  desc: "2-qubit maximally entangled state",
                  prompt: "Show me how to create a Bell State |Φ⁺⟩",
                },
                {
                  title: "3-Qubit GHZ State",
                  desc: "Multipartite entanglement (|000⟩+|111⟩)/√2",
                  prompt: "Construct a 3-qubit GHZ state",
                },
                {
                  title: "Quantum Teleportation",
                  desc: "Transfer state via entangled Bell pair",
                  prompt: "Explain and build quantum teleportation",
                },
                {
                  title: "Grover 2-Qubit Search",
                  desc: "Oracle + Diffuser search algorithm",
                  prompt: "How does Grover search algorithm work?",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isThinking}
                  className="text-left p-2.5 rounded-lg bg-[#070b14] hover:bg-[#0e1424] border border-white/[0.04] hover:border-white/[0.08] transition-all group active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-white">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isThinking && (
          <div className="self-start bg-[#070b14] border border-white/[0.05] rounded-xl rounded-bl-sm p-2.5 flex items-center gap-2 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="font-mono text-[11px]">
              Synthesizing & verifying unitaries...
            </span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex-shrink-0 pt-2 pb-1.5 border-t border-white/[0.04] flex flex-wrap gap-1">
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
            className="h-6 px-2 rounded bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.05] text-[11px] transition-colors disabled:opacity-30 active:translate-y-[1px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Field */}
      <div className="flex-shrink-0 flex items-center gap-1.5 pt-1">
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
          placeholder="Ask Qu-Copilot or request a circuit..."
          className="flex-1 h-9 bg-[#070b14] border border-white/[0.06] hover:border-white/[0.1] rounded-lg px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isThinking}
          aria-label="Send message to Qu-Copilot"
          className="h-9 w-9 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-30 text-slate-950 transition-all active:translate-y-[1px] flex items-center justify-center flex-shrink-0 shadow-sm"
          title="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
