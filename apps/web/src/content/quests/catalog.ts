// =============================================================================
// Quantangle Quest Labs Catalog — Tracks 1, 2 & Bug-Hunting Sandbox
// =============================================================================

import type { Quest } from "./types";

export const QUEST_CATALOG: Quest[] = [
  // ---------------------------------------------------------------------------
  // Track 1: Quantum Foundations
  // ---------------------------------------------------------------------------
  {
    id: "foundations-superposition",
    trackId: "foundations",
    trackTitle: "Track 1: Quantum Foundations",
    title: "Superposition Awakening",
    subtitle: "Prepare the fundamental equal superposition state |+⟩",
    difficulty: "Beginner",
    xpReward: 100,
    optimalDepth: 1,
    requiredFidelity: 0.999,
    numQubits: 1,
    numClbits: 1,
    description: `A quantum bit (qubit) can exist in a linear combination of basis states $|0\\rangle$ and $|1\\rangle$.

The **Hadamard ($H$) gate** creates an equal superposition:
$$H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$$

Upon measurement in the computational basis, both outcomes $|0\\rangle$ and $|1\\rangle$ have an exact $50\\%$ probability ($|\\frac{1}{\\sqrt{2}}|^2 = 0.5$).`,
    objective: "Apply a Hadamard gate to qubit q0 to transition from ground state |0⟩ to superposition |+⟩.",
    hint: "Drag the Hadamard (H) gate from the Pauli & Clifford palette onto qubit wire q0 at step t0.",
    tags: ["superposition", "hadamard", "single-qubit"],
    initialCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [
        { stepIndex: 0, operations: [{ id: "q1_t0", gate: "H", qubits: [0] }] },
      ],
    },
  },
  {
    id: "foundations-bit-phase-flips",
    trackId: "foundations",
    trackTitle: "Track 1: Quantum Foundations",
    title: "Bit & Phase Flips",
    subtitle: "Construct the orthogonal superposition state |-⟩",
    difficulty: "Beginner",
    xpReward: 120,
    optimalDepth: 2,
    requiredFidelity: 0.999,
    numQubits: 1,
    numClbits: 1,
    description: `The state $|-\\rangle$ is orthogonal to $|+\\rangle$ on the Bloch sphere equator:
$$|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$$

Notice the relative negative phase ($\\pi$ radians) on the $|1\\rangle$ amplitude. This can be synthesized either by flipping the bit with Pauli-X before Hadamard ($H X |0\\rangle = H|1\\rangle = |-\\rangle$) or applying a Pauli-Z phase flip after Hadamard ($Z |+\\rangle = |-\\rangle$).`,
    objective: "Synthesize the state |-⟩ on qubit q0 using Pauli and Hadamard transformations.",
    hint: "First flip q0 to state |1⟩ using an X gate, then apply a Hadamard (H) gate. Alternatively, apply H then Z.",
    tags: ["pauli-x", "pauli-z", "relative-phase"],
    initialCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [
        { stepIndex: 0, operations: [{ id: "q2_t0", gate: "X", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "q2_t1", gate: "H", qubits: [0] }] },
      ],
    },
  },
  {
    id: "foundations-phase-kickback",
    trackId: "foundations",
    trackTitle: "Track 1: Quantum Foundations",
    title: "Phase Kickback Mechanism",
    subtitle: "Harness eigenphase kickback from target to control qubit",
    difficulty: "Intermediate",
    xpReward: 160,
    optimalDepth: 3,
    requiredFidelity: 0.999,
    numQubits: 2,
    numClbits: 2,
    description: `**Phase Kickback** is the cornerstone of Shor's, Grover's, and Deutsch-Jozsa algorithms.

When a controlled unitary $U$ acts on an eigenstate $|\\psi\\rangle$ with eigenvalue $e^{i\\theta}$ ($U|\\psi\\rangle = e^{i\\theta}|\\psi\\rangle$), the phase is *kicked back* into the control qubit:
$$|x\\rangle \\otimes |-\\rangle \\xrightarrow{CX} (-1)^x |x\\rangle \\otimes |-\\rangle$$

If the control qubit is in $|+\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt{2}$, kickback rotates it into $|-\\rangle = (|0\\rangle - |1\\rangle)/\\sqrt{2}$ without perturbing the target qubit's state!`,
    objective: "Complete the phase kickback circuit so that control qubit q0 is transformed from |+⟩ to |-⟩.",
    hint: "The target qubit q1 is already prepared in |-⟩. Connect q0 as control and q1 as target using a CNOT (CX) gate at step t2.",
    tags: ["phase-kickback", "cnot", "eigenvalues"],
    initialCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        {
          stepIndex: 0,
          operations: [
            { id: "pk_init_1", gate: "H", qubits: [0] },
            { id: "pk_init_2", gate: "X", qubits: [1] },
          ],
        },
        {
          stepIndex: 1,
          operations: [{ id: "pk_init_3", gate: "H", qubits: [1] }],
        },
      ],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        {
          stepIndex: 0,
          operations: [
            { id: "pk_init_1", gate: "H", qubits: [0] },
            { id: "pk_init_2", gate: "X", qubits: [1] },
          ],
        },
        {
          stepIndex: 1,
          operations: [{ id: "pk_init_3", gate: "H", qubits: [1] }],
        },
        {
          stepIndex: 2,
          operations: [{ id: "pk_cx", gate: "CX", qubits: [0, 1] }],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Track 2: Quantum Entanglement & Protocols
  // ---------------------------------------------------------------------------
  {
    id: "entanglement-bell-phi-plus",
    trackId: "entanglement",
    trackTitle: "Track 2: Quantum Entanglement",
    title: "Bell State |Φ⁺⟩ Synthesis",
    subtitle: "Engineer the canonical EPR maximally entangled state",
    difficulty: "Beginner",
    xpReward: 150,
    optimalDepth: 2,
    requiredFidelity: 0.999,
    numQubits: 2,
    numClbits: 2,
    description: `The Einstein-Podolsky-Rosen (EPR) Bell state $|\\Phi^+\\rangle$ is the quintessential entangled state:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$

Neither qubit possesses an independent definite state. Measuring qubit $q_0$ instantly dictates the state of $q_1$ across any spatial separation with $100\\%$ correlation.`,
    objective: "Create the Bell state |Φ⁺⟩ starting from ground state |00⟩ in 2 steps.",
    hint: "Place a Hadamard gate on q0 at t0 to create superposition, then entangle q0 and q1 using a CNOT gate with control=q0, target=q1.",
    tags: ["bell-state", "entanglement", "epr-pair"],
    initialCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "b_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "b_cx", gate: "CX", qubits: [0, 1] }] },
      ],
    },
  },
  {
    id: "entanglement-bell-psi-plus",
    trackId: "entanglement",
    trackTitle: "Track 2: Quantum Entanglement",
    title: "Bell State |Ψ⁺⟩ Anti-Correlation",
    subtitle: "Prepare the cross-correlated Bell basis state (|01⟩ + |10⟩)/√2",
    difficulty: "Intermediate",
    xpReward: 180,
    optimalDepth: 3,
    requiredFidelity: 0.999,
    numQubits: 2,
    numClbits: 2,
    description: `The Bell state $|\\Psi^+\\rangle$ produces perfect anti-correlation in the computational basis:
$$|\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}$$

When $q_0$ is observed to be $0$, $q_1$ is guaranteed to be $1$, and vice versa. It can be synthesized from $|\\Phi^+\\rangle$ by applying a Pauli-X bit flip to $q_1$.`,
    objective: "Synthesize the Bell state |Ψ⁺⟩ on qubits q0 and q1.",
    hint: "First generate the standard Bell pair with H(q0) and CX(q0, q1), then invert the target qubit q1 with a Pauli-X gate.",
    tags: ["bell-state", "psi-plus", "anti-correlation"],
    initialCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "bp_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "bp_cx", gate: "CX", qubits: [0, 1] }] },
        { stepIndex: 2, operations: [{ id: "bp_x", gate: "X", qubits: [1] }] },
      ],
    },
  },
  {
    id: "entanglement-ghz-state",
    trackId: "entanglement",
    trackTitle: "Track 2: Quantum Entanglement",
    title: "3-Qubit GHZ State Entanglement",
    subtitle: "Expand entanglement across 3 qubits: (|000⟩ + |111⟩)/√2",
    difficulty: "Intermediate",
    xpReward: 200,
    optimalDepth: 3,
    requiredFidelity: 0.999,
    numQubits: 3,
    numClbits: 3,
    description: `The **Greenberger-Horne-Zeilinger (GHZ) state** is a tripartite entangled state:
$$|GHZ\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}$$

It exhibits non-local correlations that conflict with local realism even without statistical inequalities. It is constructed via a cascade of CNOT gates propagating the superposition across multiple qubits.`,
    objective: "Synthesize a 3-qubit GHZ state across q0, q1, and q2 in 3 steps.",
    hint: "Hadamard on q0, then CX from q0 to q1, followed by CX from q1 to q2.",
    tags: ["ghz-state", "tripartite", "quantum-networking"],
    initialCircuit: {
      version: "1.0",
      qubits: 3,
      clbits: 3,
      steps: [],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 3,
      clbits: 3,
      steps: [
        { stepIndex: 0, operations: [{ id: "ghz_1", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "ghz_2", gate: "CX", qubits: [0, 1] }] },
        { stepIndex: 2, operations: [{ id: "ghz_3", gate: "CX", qubits: [1, 2] }] },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Track 3: Quantum Bug-Hunting Sandbox
  // ---------------------------------------------------------------------------
  {
    id: "bughunt-inverted-cnot",
    trackId: "bughunt",
    trackTitle: "Track 3: Bug-Hunting Sandbox",
    title: "Bug #1: The Inverted CNOT Trap",
    subtitle: "Diagnose why this circuit fails to entangle qubits q0 and q1",
    difficulty: "Beginner",
    xpReward: 180,
    optimalDepth: 2,
    requiredFidelity: 0.999,
    numQubits: 2,
    numClbits: 2,
    isBugHunt: true,
    bugDiagnostic: "Telemetry shows P(|00⟩) = 50% and P(|01⟩) = 50%. The qubits are completely unentangled! Inspect control vs target wiring.",
    description: `**Student Bug Report**:
"I put qubit q0 into superposition with an H gate, and then attached a CNOT gate to entangle it with q1. But the Q-Sphere shows two independent bloch vectors with purity r = 1.0! Why aren't my qubits entangled?"

**Root Cause**: In CNOT operations, if the control qubit is in ground state $|0\\rangle$, the target qubit is never flipped. If control and target are reversed, the operation reduces to an identity on $q_0$!`,
    objective: "Fix the reversed CNOT gate to produce the true Bell pair (|00⟩ + |11⟩)/√2.",
    hint: "Look closely at step t1. The CNOT has control on q1 and target on q0. Since q1 is |0⟩, it never flips q0! Change the control to q0 and target to q1.",
    tags: ["bug-hunt", "cnot-direction", "debugging"],
    initialCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "bug1_h", gate: "H", qubits: [0] }] },
        // Bug: Control is q1, target is q0!
        { stepIndex: 1, operations: [{ id: "bug1_cx", gate: "CX", qubits: [1, 0] }] },
      ],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        { stepIndex: 0, operations: [{ id: "fix1_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "fix1_cx", gate: "CX", qubits: [0, 1] }] },
      ],
    },
  },
  {
    id: "bughunt-relative-phase",
    trackId: "bughunt",
    trackTitle: "Track 3: Bug-Hunting Sandbox",
    title: "Bug #2: Relative Phase Sign Drift",
    subtitle: "Correct the phase inversion drift on equatorial state |-i⟩",
    difficulty: "Intermediate",
    xpReward: 200,
    optimalDepth: 3,
    requiredFidelity: 0.999,
    numQubits: 1,
    numClbits: 1,
    isBugHunt: true,
    bugDiagnostic: "Probabilities P(|0⟩) = 50% and P(|1⟩) = 50% match, but State Fidelity F = 0.000! Relative phase is +i instead of -i.",
    description: `**Student Bug Report**:
"The goal was to prepare $|-i\\rangle = \\frac{|0\\rangle - i|1\\rangle}{\\sqrt{2}}$. The probability histogram looks right (50/50), but the verifier rejects my circuit with F = 0.000!"

**Root Cause**: The Phase gate $S$ has matrix $\\begin{pmatrix}1 & 0 \\\\ 0 & i\\end{pmatrix}$. Applying $S$ to $|+\\rangle$ yields $|+i\\rangle = \\frac{|0\\rangle + i|1\\rangle}{\\sqrt{2}}$, which is antipodal to $|-i\\rangle$ on the Bloch sphere y-axis!`,
    objective: "Patch the phase rotation so the resulting statevector reaches fidelity F ≥ 0.999 with |-i⟩.",
    hint: "To flip +i to -i, apply a Pauli-Z gate after the S gate (since Z|1⟩ = -|1⟩).",
    tags: ["bug-hunt", "phase-error", "bloch-y-axis"],
    initialCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [
        { stepIndex: 0, operations: [{ id: "bug2_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "bug2_s", gate: "S", qubits: [0] }] },
      ],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 1,
      clbits: 1,
      steps: [
        { stepIndex: 0, operations: [{ id: "fix2_h", gate: "H", qubits: [0] }] },
        { stepIndex: 1, operations: [{ id: "fix2_s", gate: "S", qubits: [0] }] },
        { stepIndex: 2, operations: [{ id: "fix2_z", gate: "Z", qubits: [0] }] },
      ],
    },
  },
  {
    id: "bughunt-grover-diffuser",
    trackId: "bughunt",
    trackTitle: "Track 3: Bug-Hunting Sandbox",
    title: "Bug #3: Broken Grover Diffuser",
    subtitle: "Restore the inversion-about-the-average in 2-qubit Grover search",
    difficulty: "Advanced",
    xpReward: 250,
    optimalDepth: 7,
    requiredFidelity: 0.999,
    numQubits: 2,
    numClbits: 2,
    isBugHunt: true,
    bugDiagnostic: "Search state |11⟩ only has 25% probability! The amplitude amplification diffuser is missing symmetric Pauli reflections.",
    description: `**Student Bug Report**:
"I am implementing Grover's search for marked state |11⟩. The oracle (CZ) marks |11⟩, but after the diffuser, the probability distribution does not peak at |11⟩!"

**Root Cause**: The Grover diffuser $2|s\\rangle\\langle s| - I$ requires sandwiching the controlled phase reflection between Hadamard and Pauli-X gates on *both* qubits ($H^{\\otimes 2} X^{\\otimes 2} CZ X^{\\otimes 2} H^{\\otimes 2}$). In this broken circuit, Pauli-X was accidentally omitted on qubit q0!`,
    objective: "Complete the diffuser by adding the missing Pauli-X gates on qubit q0.",
    hint: "Check steps t3 and t5 in the diffuser. Notice q1 has X gates, but q0 is missing its corresponding X gates before and after the CZ reflection!",
    tags: ["bug-hunt", "grover-search", "amplitude-amplification"],
    initialCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        // 1. Superposition
        {
          stepIndex: 0,
          operations: [
            { id: "g_h0", gate: "H", qubits: [0] },
            { id: "g_h1", gate: "H", qubits: [1] },
          ],
        },
        // 2. Oracle
        { stepIndex: 1, operations: [{ id: "g_cz", gate: "CZ", qubits: [0, 1] }] },
        // 3. Diffuser
        {
          stepIndex: 2,
          operations: [
            { id: "g_dh0", gate: "H", qubits: [0] },
            { id: "g_dh1", gate: "H", qubits: [1] },
          ],
        },
        // Bug: Missing X on q0! Only X on q1
        {
          stepIndex: 3,
          operations: [{ id: "g_dx1", gate: "X", qubits: [1] }],
        },
        { stepIndex: 4, operations: [{ id: "g_dcz", gate: "CZ", qubits: [0, 1] }] },
        // Bug: Missing X on q0! Only X on q1
        {
          stepIndex: 5,
          operations: [{ id: "g_dx1_after", gate: "X", qubits: [1] }],
        },
        {
          stepIndex: 6,
          operations: [
            { id: "g_dh0_fin", gate: "H", qubits: [0] },
            { id: "g_dh1_fin", gate: "H", qubits: [1] },
          ],
        },
      ],
    },
    targetCircuit: {
      version: "1.0",
      qubits: 2,
      clbits: 2,
      steps: [
        {
          stepIndex: 0,
          operations: [
            { id: "g_h0", gate: "H", qubits: [0] },
            { id: "g_h1", gate: "H", qubits: [1] },
          ],
        },
        { stepIndex: 1, operations: [{ id: "g_cz", gate: "CZ", qubits: [0, 1] }] },
        {
          stepIndex: 2,
          operations: [
            { id: "g_dh0", gate: "H", qubits: [0] },
            { id: "g_dh1", gate: "H", qubits: [1] },
          ],
        },
        {
          stepIndex: 3,
          operations: [
            { id: "g_dx0", gate: "X", qubits: [0] },
            { id: "g_dx1", gate: "X", qubits: [1] },
          ],
        },
        { stepIndex: 4, operations: [{ id: "g_dcz", gate: "CZ", qubits: [0, 1] }] },
        {
          stepIndex: 5,
          operations: [
            { id: "g_dx0_after", gate: "X", qubits: [0] },
            { id: "g_dx1_after", gate: "X", qubits: [1] },
          ],
        },
        {
          stepIndex: 6,
          operations: [
            { id: "g_dh0_fin", gate: "H", qubits: [0] },
            { id: "g_dh1_fin", gate: "H", qubits: [1] },
          ],
        },
      ],
    },
  },
];
