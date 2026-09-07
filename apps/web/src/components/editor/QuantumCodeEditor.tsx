"use client";

import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useCircuitStore } from "../../stores/useCircuitStore";
import {
  circuitToQiskit,
  qiskitToCircuit,
  circuitToQasm3,
  qasm3ToCircuit,
  type TargetSDK,
} from "@quantangle/quantum-ast";
import {
  Code2,
  Copy,
  Check,
  Download,
  AlertCircle,
  FileCode,
} from "lucide-react";

export const QuantumCodeEditor: React.FC = () => {
  const { getCircuitIR, loadCircuitFromIR, targetSDK, setTargetSDK } =
    useCircuitStore();

  const [activeTab, setActiveTab] = useState<TargetSDK>("qiskit");
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const isInternalUpdateRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync from Circuit IR -> Code
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const ir = getCircuitIR();
    try {
      let generated = "";
      if (activeTab === "qiskit") {
        generated = circuitToQiskit(ir);
      } else if (activeTab === "qasm3") {
        generated = circuitToQasm3(ir);
      } else if (activeTab === "cirq") {
        generated = `# Cirq Transpilation (Targeted for v2)\nimport cirq\n\n# Circuit representation\nq = cirq.LineQubit.range(${ir.qubits})\n`;
      } else if (activeTab === "pennylane") {
        generated = `# PennyLane Transpilation (Targeted for v2)\nimport pennylane as qml\n\ndev = qml.device('default.qubit', wires=${ir.qubits})\n`;
      }
      setCode(generated);
      setParseError(null);
    } catch (err) {
      console.error("Transpilation error:", err);
    }
  }, [getCircuitIR, activeTab]);

  // Handle user typing in Monaco Editor -> Sync to Circuit IR
  const handleEditorChange = (newCode: string | undefined) => {
    if (newCode === undefined) return;
    setCode(newCode);

    if (activeTab !== "qiskit" && activeTab !== "qasm3") return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        let parsedIR;
        if (activeTab === "qiskit") {
          parsedIR = qiskitToCircuit(newCode);
        } else if (activeTab === "qasm3") {
          parsedIR = qasm3ToCircuit(newCode);
        }

        if (parsedIR) {
          isInternalUpdateRef.current = true;
          loadCircuitFromIR(parsedIR);
          setParseError(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setParseError(`Parse error: ${message}`);
      }
    }, 400); // 400ms debounce
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === "qiskit" ? "py" : activeTab === "qasm3" ? "qasm" : "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quantum_circuit.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col border border-white/10 overflow-hidden h-full min-h-[380px]">
      {/* Editor Header & SDK Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white tracking-wide mr-2">
            Dual-Sync Code Editor
          </span>

          {/* Language Tabs */}
          <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => {
                setActiveTab("qiskit");
                setTargetSDK("qiskit");
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeTab === "qiskit"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Qiskit (Python)
            </button>
            <button
              onClick={() => {
                setActiveTab("qasm3");
                setTargetSDK("qasm3");
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeTab === "qasm3"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              OpenQASM 3.0
            </button>
            <button
              onClick={() => setActiveTab("cirq")}
              className="px-2 py-1 rounded text-[11px] font-mono text-slate-500 hover:text-slate-400 flex items-center gap-1"
            >
              Cirq
              <span className="text-[9px] px-1 py-0.2 bg-white/5 border border-white/10 rounded text-amber-400">
                v2
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pennylane")}
              className="px-2 py-1 rounded text-[11px] font-mono text-slate-500 hover:text-slate-400 flex items-center gap-1"
            >
              PennyLane
              <span className="text-[9px] px-1 py-0.2 bg-white/5 border border-white/10 rounded text-amber-400">
                v2
              </span>
            </button>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            title="Download code file"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parsing error notification */}
      {parseError && (
        <div className="px-3 py-1.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-mono truncate">{parseError}</span>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full relative min-h-[320px]">
        <Editor
          height="100%"
          language={activeTab === "qiskit" || activeTab === "cirq" || activeTab === "pennylane" ? "python" : "text"}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};
