// =============================================================================
// @quantangle/quantum-ast — OpenQASM 3.0 Transpiler
// =============================================================================
// Bidirectional transpiler between QuantumCircuitIR and OpenQASM 3.0.
// Endianness: Little-Endian (q[0] is LSB).
// =============================================================================

import type { QuantumCircuitIR, CircuitStep, GateOperation, GateType } from "../types";

/**
 * Convert QuantumCircuitIR into standard OpenQASM 3.0 string.
 */
export function circuitToQasm3(ir: QuantumCircuitIR): string {
  const lines: string[] = [
    "OPENQASM 3.0;",
    'include "stdgates.inc";',
    "",
    `qubit[${ir.qubits}] q;`,
  ];

  if (ir.clbits > 0) {
    lines.push(`bit[${ir.clbits}] c;`);
  }
  lines.push("");

  for (const step of ir.steps) {
    for (const op of step.operations) {
      const q = op.qubits;
      const p = op.params || [];

      switch (op.gate) {
        case "H":
          lines.push(`h q[${q[0]}];`);
          break;
        case "X":
          lines.push(`x q[${q[0]}];`);
          break;
        case "Y":
          lines.push(`y q[${q[0]}];`);
          break;
        case "Z":
          lines.push(`z q[${q[0]}];`);
          break;
        case "S":
          lines.push(`s q[${q[0]}];`);
          break;
        case "T":
          lines.push(`t q[${q[0]}];`);
          break;
        case "CX":
          lines.push(`cx q[${q[0]}], q[${q[1]}];`);
          break;
        case "CZ":
          lines.push(`cz q[${q[0]}], q[${q[1]}];`);
          break;
        case "SWAP":
          lines.push(`swap q[${q[0]}], q[${q[1]}];`);
          break;
        case "RX": {
          const theta = p[0] ?? 0;
          lines.push(`rx(${theta.toFixed(4)}) q[${q[0]}];`);
          break;
        }
        case "RY": {
          const theta = p[0] ?? 0;
          lines.push(`ry(${theta.toFixed(4)}) q[${q[0]}];`);
          break;
        }
        case "RZ": {
          const theta = p[0] ?? 0;
          lines.push(`rz(${theta.toFixed(4)}) q[${q[0]}];`);
          break;
        }
        case "U3": {
          const theta = p[0] ?? 0;
          const phi = p[1] ?? 0;
          const lambda = p[2] ?? 0;
          lines.push(`U(${theta.toFixed(4)}, ${phi.toFixed(4)}, ${lambda.toFixed(4)}) q[${q[0]}];`);
          break;
        }
        case "M": {
          const clbit = op.clbit ?? q[0];
          lines.push(`c[${clbit}] = measure q[${q[0]}];`);
          break;
        }
      }
    }
  }

  return lines.join("\n");
}

/**
 * Parse OpenQASM 3.0 code into QuantumCircuitIR.
 */
export function qasm3ToCircuit(code: string): QuantumCircuitIR {
  let qubits = 2;
  let clbits = 0;
  const operations: GateOperation[] = [];

  // Match qubit declaration: qubit[2] q;
  const qubitMatch = code.match(/qubit\s*\[\s*(\d+)\s*\]\s*(\w+)/i);
  if (qubitMatch) {
    qubits = parseInt(qubitMatch[1], 10);
  }

  // Match bit declaration: bit[2] c;
  const bitMatch = code.match(/bit\s*\[\s*(\d+)\s*\]\s*(\w+)/i);
  if (bitMatch) {
    clbits = parseInt(bitMatch[1], 10);
  }

  let opId = 0;
  const lines = code.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("//") || line.startsWith("OPENQASM") || line.startsWith("include") || !line) {
      continue;
    }

    // Single qubit gates: h q[0];, x q[1];, etc.
    const singleMatch = line.match(/^(h|x|y|z|s|t)\s+\w+\[(\d+)\]\s*;/i);
    if (singleMatch) {
      const gateType = singleMatch[1].toUpperCase() as GateType;
      const q = parseInt(singleMatch[2], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [q],
      });
      continue;
    }

    // Two qubit gates: cx q[0], q[1];
    const twoMatch = line.match(/^(cx|cz|swap)\s+\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*;/i);
    if (twoMatch) {
      const gateType = twoMatch[1].toUpperCase() as GateType;
      const c = parseInt(twoMatch[2], 10);
      const t = parseInt(twoMatch[3], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [c, t],
      });
      continue;
    }

    // Rotations: rx(0.5) q[0];
    const rotMatch = line.match(/^(rx|ry|rz)\s*\(\s*([-\d.eE+*\/]+)\s*\)\s+\w+\[(\d+)\]\s*;/i);
    if (rotMatch) {
      const gateType = rotMatch[1].toUpperCase() as GateType;
      const angle = parseFloat(rotMatch[2]) || 0;
      const q = parseInt(rotMatch[3], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: gateType,
        qubits: [q],
        params: [angle],
      });
      continue;
    }

    // Universal: U(1.0, 2.0, 3.0) q[0];
    const uMatch = line.match(/^U\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)\s+\w+\[(\d+)\]\s*;/i);
    if (uMatch) {
      const theta = parseFloat(uMatch[1]) || 0;
      const phi = parseFloat(uMatch[2]) || 0;
      const lambda = parseFloat(uMatch[3]) || 0;
      const q = parseInt(uMatch[4], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: "U3",
        qubits: [q],
        params: [theta, phi, lambda],
      });
      continue;
    }

    // Measurement: c[0] = measure q[0];
    const measureMatch = line.match(/^\w+\[(\d+)\]\s*=\s*measure\s+\w+\[(\d+)\]\s*;/i);
    if (measureMatch) {
      const clbit = parseInt(measureMatch[1], 10);
      const qubit = parseInt(measureMatch[2], 10);
      operations.push({
        id: `gate_${++opId}`,
        gate: "M",
        qubits: [qubit],
        clbit,
      });
      continue;
    }
  }

  // Pack into steps
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
