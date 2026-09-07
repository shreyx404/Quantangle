import { describe, it, expect } from "vitest";
import { circuitToQiskit, qiskitToCircuit } from "../transpiler/qiskit";
import { circuitToQasm3, qasm3ToCircuit } from "../transpiler/qasm3";
import type { QuantumCircuitIR } from "../types";

describe("Quantum AST Transpiler", () => {
  const bellCircuit: QuantumCircuitIR = {
    version: "1.0",
    qubits: 2,
    clbits: 2,
    steps: [
      {
        stepIndex: 0,
        operations: [{ id: "g1", gate: "H", qubits: [0] }],
      },
      {
        stepIndex: 1,
        operations: [{ id: "g2", gate: "CX", qubits: [0, 1] }],
      },
    ],
  };

  it("should transpile Bell state to Qiskit and parse back", () => {
    const qiskitCode = circuitToQiskit(bellCircuit);
    expect(qiskitCode).toContain("qc = QuantumCircuit(2, 2)");
    expect(qiskitCode).toContain("qc.h(0)");
    expect(qiskitCode).toContain("qc.cx(0, 1)");

    const parsed = qiskitToCircuit(qiskitCode);
    expect(parsed.qubits).toBe(2);
    expect(parsed.steps.length).toBe(2);
    expect(parsed.steps[0].operations[0].gate).toBe("H");
    expect(parsed.steps[1].operations[0].gate).toBe("CX");
  });

  it("should transpile Bell state to OpenQASM 3.0 and parse back", () => {
    const qasm = circuitToQasm3(bellCircuit);
    expect(qasm).toContain("OPENQASM 3.0;");
    expect(qasm).toContain("qubit[2] q;");
    expect(qasm).toContain("h q[0];");
    expect(qasm).toContain("cx q[0], q[1];");

    const parsed = qasm3ToCircuit(qasm);
    expect(parsed.qubits).toBe(2);
    expect(parsed.steps.length).toBe(2);
    expect(parsed.steps[0].operations[0].gate).toBe("H");
    expect(parsed.steps[1].operations[0].gate).toBe("CX");
  });

  it("should handle rotation gates with parameters", () => {
    const rotCircuit: QuantumCircuitIR = {
      version: "1.0",
      qubits: 1,
      clbits: 0,
      steps: [
        {
          stepIndex: 0,
          operations: [{ id: "g1", gate: "RX", qubits: [0], params: [1.5708] }],
        },
      ],
    };

    const qiskit = circuitToQiskit(rotCircuit);
    expect(qiskit).toContain("qc.rx(1.5708, 0)");

    const qasm = circuitToQasm3(rotCircuit);
    expect(qasm).toContain("rx(1.5708) q[0];");
  });
});
