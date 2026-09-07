// =============================================================================
// @quantangle/quantum-ast — Qiskit Python Transpiler
// =============================================================================
// Bidirectional transpiler between QuantumCircuitIR and Python Qiskit code.
// Endianness: Little-Endian (Qiskit standard, q_0 is LSB).
// =============================================================================

import type { QuantumCircuitIR, CircuitStep, GateOperation, GateType } from "../types";

/**
 * Convert QuantumCircuitIR into executable Python Qiskit code.
 */
export function circuitToQiskit(ir: QuantumCircuitIR): string {
  const lines: string[] = [
    "# Quantangle Generated Qiskit Circuit",
    "# Endianness: Little-Endian (q_0 is LSB)",
    "from qiskit import QuantumCircuit",
    "import numpy as np",
    "",
  ];

  if (ir.clbits > 0) {
    lines.push(`qc = QuantumCircuit(${ir.qubits}, ${ir.clbits})`);
  } else {
    lines.push(`qc = QuantumCircuit(${ir.qubits})`);
  }
  lines.push("");

  for (const step of ir.steps) {
    for (const op of step.operations) {
      const q = op.qubits;
      const p = op.params || [];

      switch (op.gate) {
        case "H":
          lines.push(`qc.h(${q[0]})`);
          break;
        case "X":
          lines.push(`qc.x(${q[0]})`);
          break;
        case "Y":
          lines.push(`qc.y(${q[0]})`);
          break;
        case "Z":
          lines.push(`qc.z(${q[0]})`);
          break;
        case "S":
          lines.push(`qc.s(${q[0]})`);
          break;
        case "T":
          lines.push(`qc.t(${q[0]})`);
          break;
        case "CX":
          lines.push(`qc.cx(${q[0]}, ${q[1]})`);
          break;
        case "CZ":
          lines.push(`qc.cz(${q[0]}, ${q[1]})`);
          break;
        case "SWAP":
          lines.push(`qc.swap(${q[0]}, ${q[1]})`);
          break;
        case "RX": {
          const theta = p[0] ?? 0;
          lines.push(`qc.rx(${theta.toFixed(4)}, ${q[0]})`);
          break;
        }
        case "RY": {
          const theta = p[0] ?? 0;
          lines.push(`qc.ry(${theta.toFixed(4)}, ${q[0]})`);
          break;
        }
        case "RZ": {
          const theta = p[0] ?? 0;
          lines.push(`qc.rz(${theta.toFixed(4)}, ${q[0]})`);
          break;
        }
        case "U3": {
          const theta = p[0] ?? 0;
          const phi = p[1] ?? 0;
          const lambda = p[2] ?? 0;
          lines.push(`qc.u(${theta.toFixed(4)}, ${phi.toFixed(4)}, ${lambda.toFixed(4)}, ${q[0]})`);
          break;
        }
        case "M": {
          const clbit = op.clbit ?? q[0];
          lines.push(`qc.measure(${q[0]}, ${clbit})`);
          break;
        }
      }
    }
  }

  lines.push("");
  lines.push("# View the circuit diagram");
  lines.push("print(qc.draw(output='text'))");
  return lines.join("\n");
}

/**
 * Parse Python Qiskit code into QuantumCircuitIR.
 * Robust against formatting, variable names, and comments.
 */
export function qiskitToCircuit(code: string): QuantumCircuitIR {
  let qubits = 2;
  let clbits = 0;
  const operations: GateOperation[] = [];

  // Match QuantumCircuit initialization
  const initMatch = code.match(/QuantumCircuit\s*\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/);
  if (initMatch) {
    qubits = parseInt(initMatch[1], 10);
    if (initMatch[2]) {
      clbits = parseInt(initMatch[2], 10);
    }
  }

  let opId = 0;
  const lines = code.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("#") || !line) continue;

    // Single-qubit gates without params: qc.h(0), qc.x(1), qc.y(0), qc.z(0), qc.s(0), qc.t(0)
    const singleGateMatch = line.match(/\.(h|x|y|z|s|t)\s*\(\s*(\d+)\s*\)/i);
    if (singleGateMatch) {
      const gateType = singleGateMatch[1].toUpperCase() as GateType;
      const targetQubit = parseInt(singleGateMatch[2], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [targetQubit],
      });
      continue;
    }

    // Two-qubit gates: qc.cx(0, 1), qc.cz(0, 1), qc.swap(0, 1)
    const twoQubitMatch = line.match(/\.(cx|cz|swap)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (twoQubitMatch) {
      const gateType = twoQubitMatch[1].toUpperCase() as GateType;
      const ctrl = parseInt(twoQubitMatch[2], 10);
      const tgt = parseInt(twoQubitMatch[3], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [ctrl, tgt],
      });
      continue;
    }

    // Rotation gates: qc.rx(angle, 0), qc.ry(angle, 0), qc.rz(angle, 0)
    const rotMatch = line.match(/\.(rx|ry|rz)\s*\(\s*([-\d.eE+*\/pi]+)\s*,\s*(\d+)\s*\)/i);
    if (rotMatch) {
      const gateType = rotMatch[1].toUpperCase() as GateType;
      const angleStr = rotMatch[2].replace(/np\.pi|pi/gi, String(Math.PI));
      let angle = 0;
      try {
        // Safe evaluation of simple math expressions like "3.14159 / 2"
        angle = Function(`"use strict"; return (${angleStr});`)();
      } catch {
        angle = parseFloat(angleStr) || 0;
      }
      const targetQubit = parseInt(rotMatch[3], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [targetQubit],
        params: [angle],
      });
      continue;
    }

    // Universal gate: qc.u(theta, phi, lambda, target)
    const uMatch = line.match(/\.u\s*\(\s*([-\d.eE+*\/pi]+)\s*,\s*([-\d.eE+*\/pi]+)\s*,\s*([-\d.eE+*\/pi]+)\s*,\s*(\d+)\s*\)/i);
    if (uMatch) {
      const theta = parseFloat(uMatch[1]) || 0;
      const phi = parseFloat(uMatch[2]) || 0;
      const lambda = parseFloat(uMatch[3]) || 0;
      const targetQubit = parseInt(uMatch[4], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: "U3",
        qubits: [targetQubit],
        params: [theta, phi, lambda],
      });
      continue;
    }

    // Measurement: qc.measure(0, 0) or qc.measure([0, 1], [0, 1])
    const measureMatch = line.match(/\.measure\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (measureMatch) {
      const qubit = parseInt(measureMatch[1], 10);
      const clbit = parseInt(measureMatch[2], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: "M",
        qubits: [qubit],
        clbit,
      });
      continue;
    }
  }

  // Pack operations into time steps (non-overlapping qubit gates in parallel)
  const steps: CircuitStep[] = [];
  for (const op of operations) {
    let placed = false;
    for (const step of steps) {
      const busyQubits = new Set(step.operations.flatMap((o) => o.qubits));
      const hasConflict = op.qubits.some((q) => busyQubits.has(q));
      if (!hasConflict) {
        step.operations.push(op);
        placed = true;
        break;
      }
    }
    if (!placed) {
      steps.push({
        stepIndex: steps.length,
        operations: [op],
      });
    }
  }

  return {
    version: "1.0",
    qubits,
    clbits,
    steps,
  };
}
