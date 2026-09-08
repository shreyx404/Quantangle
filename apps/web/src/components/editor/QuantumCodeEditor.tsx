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
  Eye,
  Edit3,
} from "lucide-react";

export interface QuantumCodeEditorProps {
  height?: string | number;
  compact?: boolean;
  showHeader?: boolean;
  className?: string;
  defaultSdk?: TargetSDK;
}

export const QuantumCodeEditor: React.FC<QuantumCodeEditorProps> = ({
  height,
  compact = false,
  showHeader = true,
  className = "",
  defaultSdk = "qiskit",
}) => {
  const {
    getCircuitIR,
    loadCircuitFromIR,
    targetSDK,
    setTargetSDK,
    steps,
    numQubits,
    numClbits,
  } = useCircuitStore();

  const [activeTab, setActiveTab] = useState<TargetSDK>(defaultSdk || targetSDK || "qiskit");
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"monaco" | "raw">("monaco");

  const isInternalUpdateRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // Sync Circuit IR -> Code
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
        generated = `# Google Cirq Transpilation (Targeted for v2)\nimport cirq\n\n# Circuit registers\nq = cirq.LineQubit.range(${ir.qubits})\n`;
      } else if (activeTab === "pennylane") {
        generated = `# Xanadu PennyLane Transpilation (Targeted for v2)\nimport pennylane as qml\n\ndev = qml.device('default.qubit', wires=${ir.qubits})\n`;
      }
      setCode(generated);
      setParseError(null);
    } catch (err) {
      console.error("Transpilation error:", err);
    }
  }, [getCircuitIR, activeTab, steps, numQubits, numClbits]);

  useEffect(() => {
    if (targetSDK && targetSDK !== activeTab) {
      setActiveTab(targetSDK);
    }
  }, [targetSDK, activeTab]);

  useEffect(() => {
    if (editorRef.current) {
      try {
        editorRef.current.layout();
      } catch (e) {
        console.warn("Monaco layout refresh error:", e);
      }
    }
  }, [activeTab, editorMode]);

  // Code -> Circuit IR sync
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
    }, 400);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setTimeout(() => {
      try {
        editor.layout();
      } catch (e) {
        console.warn("Initial Monaco layout error:", e);
      }
    }, 100);
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

  const effectiveHeight = height ? height : compact ? "280px" : "380px";

  return (
    <div
      className={`bg-[#0b0f1a] rounded-xl flex flex-col border border-white/[0.06] overflow-hidden shadow-sm ${className}`}
    >
      {/* Editor Header */}
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.05] bg-[#070b14]">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            {!compact ? (
              <span className="text-xs font-semibold text-white tracking-tight mr-1">
                Dual-Sync Code Studio
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold text-slate-300 mr-1 hidden sm:inline">
                Code
              </span>
            )}

            {/* Language Selector Tabs */}
            <div className="h-7 flex items-center bg-[#0e1424] rounded-lg p-0.5 border border-white/[0.06]">
              <button
                onClick={() => {
                  setActiveTab("qiskit");
                  setTargetSDK("qiskit");
                }}
                className={`h-6 px-2.5 rounded-md text-[11px] font-mono font-medium transition-colors ${
                  activeTab === "qiskit"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="IBM Qiskit (Python)"
              >
                {compact ? "Qiskit" : "Qiskit (Python)"}
              </button>
              <button
                onClick={() => {
                  setActiveTab("qasm3");
                  setTargetSDK("qasm3");
                }}
                className={`h-6 px-2.5 rounded-md text-[11px] font-mono font-medium transition-colors ${
                  activeTab === "qasm3"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="OpenQASM 3.0 Standard"
              >
                {compact ? "QASM" : "OpenQASM 3.0"}
              </button>
              <button
                onClick={() => setActiveTab("cirq")}
                className="h-6 px-2 rounded-md text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Google Cirq transpilation targeted for v2"
              >
                Cirq
                <span className="text-[8px] px-1 bg-white/[0.05] rounded text-amber-300 font-sans">
                  v2
                </span>
              </button>
              <button
                onClick={() => setActiveTab("pennylane")}
                className="h-6 px-2 rounded-md text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Xanadu PennyLane transpilation targeted for v2"
              >
                PennyLane
                <span className="text-[8px] px-1 bg-white/[0.05] rounded text-amber-300 font-sans">
                  v2
                </span>
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="h-7 flex items-center bg-[#0e1424] rounded-md p-0.5 border border-white/[0.06] text-[10px] font-mono">
              <button
                onClick={() => setEditorMode("monaco")}
                className={`h-6 px-2 rounded flex items-center gap-1 transition-colors ${
                  editorMode === "monaco"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Interactive Monaco IDE"
              >
                <Edit3 className="w-3 h-3" />
                <span>IDE</span>
              </button>
              <button
                onClick={() => setEditorMode("raw")}
                className={`h-6 px-2 rounded flex items-center gap-1 transition-colors ${
                  editorMode === "raw"
                    ? "bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Direct Syntax View"
              >
                <Eye className="w-3 h-3" />
                <span>Raw</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              aria-label="Copy code to clipboard"
              title="Copy code to clipboard"
              className="h-7 px-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs flex items-center gap-1 transition-colors active:translate-y-[1px]"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[10px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="font-mono text-[10px]">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              aria-label="Download circuit file"
              title="Download circuit file"
              className="h-7 w-7 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 transition-colors active:translate-y-[1px] flex items-center justify-center"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Parse Error Notification */}
      {parseError && (
        <div className="px-3 py-1.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-mono truncate text-[11px]">{parseError}</span>
        </div>
      )}

      {/* Code Display Area */}
      <div
        className="w-full relative"
        style={{ height: effectiveHeight, minHeight: effectiveHeight }}
      >
        {editorMode === "monaco" ? (
          <Editor
            height="100%"
            language={activeTab === "qiskit" || activeTab === "cirq" || activeTab === "pennylane" ? "python" : "text"}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              bracketPairColorization: { enabled: true },
              padding: { top: 6, bottom: 6 },
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#0a0e18] p-3 overflow-auto font-mono text-xs text-slate-200 select-text leading-relaxed">
            <pre className="text-cyan-300/90 whitespace-pre font-mono text-xs">
              {code.split("\n").map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell pr-4 text-right select-none text-slate-600 w-8 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="table-cell">
                    {line.startsWith("#") ? (
                      <span className="text-emerald-400/80 italic">{line}</span>
                    ) : line.startsWith("from") || line.startsWith("import") ? (
                      <span className="text-pink-400">{line}</span>
                    ) : line.includes("QuantumCircuit") ? (
                      <span className="text-amber-300">{line}</span>
                    ) : line.startsWith("qc.") ? (
                      <span className="text-cyan-300 font-semibold">{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
