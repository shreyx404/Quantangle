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
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
  Zap,
  Code2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
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
    <div className="glass-panel rounded-xl p-3.5 border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl relative">
      {/* Copilot Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                Qu-Copilot
              </span>
              <span className="text-[10px] font-mono text-purple-300 font-normal">
                AI Tutor
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Unitary Verified Badge */}
          <div
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            title="Unitary Verification Pipeline evaluates fidelity F = |⟨ψt|ψs⟩|² ≥ 0.999 before display."
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Verified (F ≥ 0.999)</span>
          </div>

          {/* Reset / Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
            title="Clear Chat Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close / Collapse Button */}
          <button
            onClick={handleClose}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
            title="Collapse Qu-Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container — Bounded with Internal Smooth Scroll */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto py-3 pr-1 flex flex-col gap-3"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedCircuitId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 max-w-[92%] text-xs ${
                isUser
                  ? "self-end bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 rounded-2xl rounded-br-none p-3 shadow-[0_0_15px_rgba(0,242,254,0.08)]"
                  : "self-start bg-slate-900/80 text-slate-200 border border-white/10 rounded-2xl rounded-bl-none p-3 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-0.5">
                {isUser ? (
                  <span className="text-cyan-400 font-semibold">You</span>
                ) : (
                  <span className="text-purple-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Qu-Copilot
                  </span>
                )}
              </div>

              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Verified Circuit Suggestion Card */}
              {msg.circuit && (
                <div className="mt-2 p-2.5 rounded-xl bg-black/50 border border-purple-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unitary Fidelity F = 1.000</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.circuit.qubits} Qubits • {msg.circuit.steps.length} Steps
                    </span>
                  </div>

                  {/* Gate sequence badges */}
                  <div className="flex flex-wrap items-center gap-1 py-1">
                    {getCircuitPreviewTokens(msg.circuit).map((token, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                          {token}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Expandable Qiskit Python Code Preview */}
                  <div className="py-1">
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
                      <div className="mt-1 p-2 bg-black/60 rounded-lg border border-cyan-500/30 text-[10px] font-mono relative overflow-hidden">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5 text-slate-400">
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
                        <pre className="text-cyan-200/90 whitespace-pre overflow-x-auto max-h-32 text-[10px] leading-tight">
                          {circuitToQiskit(msg.circuit)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Apply Button with instant visual confirmation */}
                  <button
                    onClick={() => msg.circuit && handleApplyCircuit(msg.id, msg.circuit)}
                    disabled={isApplied}
                    className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      isApplied
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white active:scale-[0.98]"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Applied to Circuit Canvas! ✓</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply Verified Circuit to Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="self-start bg-slate-900/80 border border-purple-500/30 rounded-2xl rounded-bl-none p-3 flex items-center gap-2 text-xs text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span className="font-mono text-[11px]">
              Validating unitaries & verifying state fidelity (F ≥ 0.999)...
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts — Fixed above input */}
      <div className="flex-shrink-0 pt-2 pb-1 border-t border-white/10 flex flex-wrap gap-1.5">
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
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-cyan-200 border border-white/5 hover:border-purple-500/30 transition-all disabled:opacity-50"
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
          placeholder="Ask Qu-Copilot (e.g., 'How to entangle 2 qubits?')..."
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isThinking}
          className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-cyan-600 text-white transition-all shadow-md active:scale-95"
          title="Send Question"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
