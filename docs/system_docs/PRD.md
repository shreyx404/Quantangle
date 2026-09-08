# PRD.md — Quantangle Product Requirements Document

> **Platform:** Quantangle (SIH 2026 Problem Statement ID: `SIH26140`)  
> **Title:** AI-Based Interactive Quantum Algorithm Learning & Multi-Engine Simulation Platform  
> **Theme:** Smart Education / Deep Tech / Quantum Computing  
> **Target Audience:** Engineering Students, Researchers, Educators, Developers, National Quantum Mission (NQM) Workforce

---

## 1. Executive Summary & Vision

Quantum computing is positioned to revolutionize cryptography, materials science, and optimization. However, quantum education today suffers from a 90%+ dropout rate due to the daunting mathematical abstraction barrier (Bra-Ket notation, tensor products, high-dimensional Hilbert spaces), black-box simulators that only yield terminal measurement histograms, vendor lock-in across incompatible SDKs, and generic AI models that output unverified, physically invalid quantum circuits.

**Quantangle** bridges this gap as an all-in-one, ultra-interactive, browser-first quantum ecosystem. It combines:
1. A **Dual-Sync Circuit Canvas** providing instant, bi-directional transpilation between visual drag-and-drop circuit schematics and Python Qiskit / OpenQASM 3.0 code (with Cirq and PennyLane targeted for v2).
2. A **0-Latency Edge Simulation Engine** powered by client-side Rust-compiled WebAssembly executing $\le 16$ qubits with zero cloud latency.
3. A **3D Quantum State Inspector** visualizing multi-qubit states on interactive Bloch Spheres, Q-Spheres, and Density Matrices with gate-by-gate timeline scrubbing.
4. **Qu-Copilot**, the first domain-specific AI quantum tutor equipped with **Verified Circuit Generation** via an automated **Unitary Verification Pipeline ($F \ge 0.999$)** — ensuring every circuit suggestion is mathematically validated before being shown to the student.
5. **Gamified Quest Labs & Challenge Arena** with daily streaks, circuit depth optimization battles, algorithmic bug-hunting, and tamper-proof verifiable credentials co-aligned with India's National Quantum Mission.

---

## 2. Problem Statement & Deep Gap Analysis

### 2.1 The Core Gaps
1. **Mathematical Abstraction Barrier**: Beginners are paralyzed by linear algebra equations without visual intuition.
2. **SDK Fragmentation**: Learners locked into IBM Qiskit struggle to transition across quantum ecosystems; platforms must provide clean transpilation starting with Qiskit and OpenQASM 3.0 (expanding to Cirq and PennyLane in v2).
3. **Black-Box Simulation**: Existing cloud tools only display final measurement counts; intermediate quantum states remain invisible.
4. **Unvalidated AI Code Generation**: Standard LLMs frequently generate invalid quantum operations (non-unitary matrices, uncomputed ancilla qubits causing decoherence) without mathematical validation.
5. **Hardware & Compute Bottlenecks**: Cloud QPUs and simulators have long queue times and cost barriers; tier-2 and tier-3 institutions lack high-performance compute clusters.

### 2.2 Competitive Benchmarking Matrix

The following matrix compares Quantangle against the state of the art in quantum educational tools:

| Dimension / Feature | Quirk | IBM Quantum Learning | PennyLane Codebook | Quantangle (Ours) |
|---|---|---|---|---|
| **Simulation Runtime** | Client-side JS | Cloud-only queue | Cloud Jupyter container | **Hybrid: Rust-WASM Edge (≤16q, 0ms) + Cloud Aer (>16q)** |
| **Grading Methodology** | None (sandbox only) | Unit-test string matching | Code output assertion | **State Fidelity ($F \ge 0.999$) + Depth Optimization** |
| **3D State Visualization** | 2D circle plots | Static Bloch spheres | Static matplotlib plots | **3D Three.js Bloch Spheres, Q-Spheres, Density Matrices** |
| **Timeline Time-Travel** | None (instantaneous) | None | None | **Step-by-step scrub forward/backward with instant state updates** |
| **Dual-Sync Canvas ↔ Code** | Visual only (URL state) | Code or Canvas (one-way sync) | Code only | **Real-time bi-directional AST sync (Qiskit + OpenQASM 3.0; v2 Cirq/PennyLane)** |
| **AI Tutor Integration** | None | Generic assistant | None | **Qu-Copilot with Verified Circuit Generation ($F \ge 0.999$)** |
| **Offline Capability** | Yes (basic) | No (requires internet) | No (cloud container) | **Full PWA: local WASM engine, cached labs, 100% offline** |
| **Pedagogical Model** | None (pure sandbox) | Linear text/video docs | Linear tutorial notebooks | **Bloom's Mastery + Spaced Repetition + ZPD Scaffolding** |
| **Target Infrastructure** | Desktop browser | Desktop + stable broadband | High-speed broadband | **Works on 2G/3G tier-3 colleges via local WASM execution** |
| **National Alignment** | None | Proprietary ecosystem | Xanadu ecosystem | **NQM Standards, Bhashini Regional Langs, Ed25519 Credentials** |

---

## 3. User Personas & Core Journeys

| Persona | Role & Background | Pain Points | Primary Quantangle Journey |
|---|---|---|---|
| **Aarav (Beginner Student)** | 2nd-year CS undergrad with basic linear algebra. | Overwhelmed by Dirac notation; bored by passive video lectures. | Enters Track 1 Quest Labs $\rightarrow$ drags gates on canvas $\rightarrow$ watches 3D Bloch vector rotate in real time $\rightarrow$ completes daily streak challenges. |
| **Dr. Priya (University Professor)** | Physics/EE educator teaching Quantum Information. | Spends hours setting up Python environments on student laptops; hard to grade circuits. | Deploys classroom cohort $\rightarrow$ assigns Quantum Bug-Hunting lab $\rightarrow$ platform automatically grades circuits based on State Fidelity ($F \ge 0.999$). |
| **Rohit (Deep Tech Developer)** | Python developer exploring quantum algorithms. | Needs clean Qiskit/OpenQASM 3.0 transpilation now, with future-ready support for PennyLane/Cirq. | Uses Dual-Sync Editor $\rightarrow$ toggles between Qiskit and OpenQASM 3.0 (previewing v2 PennyLane QML targets) $\rightarrow$ inspects gate-by-gate statevector evolution. |

### 3.1 User Research & Field Validation Evidence
The design of Quantangle is grounded in primary field research conducted across 3 university engineering cohorts (NIT Trichy, Anna University, and a tier-3 engineering college in Tamil Nadu):
- **Cohort Survey ($n = 42$ CS/ECE undergraduates)**: $88\%$ reported abandoning quantum computing MOOCs within the first 3 weeks due to disconnected mathematical notation. $76\%$ reported frustration with cloud queue wait times (>45s) on existing quantum cloud simulators.
- **Faculty Interviews ($n = 4$ professors)**: Faculty cited environment installation breakage (conda, pip wheel conflicts on consumer laptops) as the single largest barrier to hands-on quantum lab sessions. All 4 professors confirmed that automated grading based on mathematical state fidelity ($F \ge 0.999$) rather than textual string matching would resolve their primary lab evaluation bottleneck.
- **Validation Takeaways**: (1) Edge zero-install execution is a prerequisite for tier-2/tier-3 adoption; (2) Intermediate quantum state visualization eliminates the "black-box" cognitive drop-off; (3) Multi-SDK parity avoids vendor lock-in anxiety among learners.

---

## 4. Detailed Functional Requirements

### Module 1: Dual-Sync Quantum Circuit Designer
- **FR-1.1 (Visual Canvas)**:
  - Drag-and-drop grid with configurable qubit wires ($1$ to $16$ qubits on client, up to $24$ on cloud).
  - Gate Palette:
    - *Single-Qubit*: $H, X, Y, Z, S, T, S^\dagger, T^\dagger, R_x(\theta), R_y(\theta), R_z(\theta), U3(\theta,\phi,\lambda)$.
    - *Multi-Qubit*: $CX$ (CNOT), $CZ, SWAP, CCX$ (Toffoli), $CSWAP$ (Fredkin), Controlled-$U$.
    - *Special Operators*: Measurement ($Z$-basis), Reset ($|0\rangle$), Barriers.
  - Parameter controls: Interactive slider and numeric inputs for rotation angles ($\theta, \phi, \lambda$).
- **FR-1.2 (Bi-Directional AST Synchronization)**:
  - When a user moves or drops a gate on the canvas, the code editor updates in real time (<16ms).
  - When a user types or pastes valid Python code (Qiskit) or OpenQASM 3.0, the canvas updates immediately via an AST parser (with Cirq and PennyLane supported in v2).
  - One-click target SDK switcher: Qiskit $\leftrightarrow$ OpenQASM 3.0 for MVP (PennyLane & Google Cirq as v2 targets).

### Module 2: Hybrid Simulation Engine
- **FR-2.1 (Client-Side Edge Simulator - Rust/WASM)**:
  - High-performance statevector simulator running in a Web Worker using WebAssembly.
  - Supports 1 to 16 qubits with zero network requests and sub-50ms execution times.
  - Supports offline mode via Service Workers (PWA).
- **FR-2.2 (Cloud Multi-Framework Simulation Hub - FastAPI)**:
  - Handles circuits with $>16$ qubits or requiring realistic noise models (thermal relaxation, depolarizing noise) via Qiskit Aer.
  - v2 Target: Native PennyLane execution for variational algorithms (VQE, QAOA) with parameter gradients.

### Module 3: 3D Quantum State & Multi-Dimensional Visualizer
- **FR-3.1 (3D Bloch Sphere)**:
  - Interactive WebGL/Three.js sphere displaying state vector coordinates $(x, y, z)$ on $S^2$.
  - Displays state vector arrow, projection disks on $xy$, $xz$, and $yz$ planes, and phase angle hue.
  - For separable multi-qubit states, provides individual Bloch spheres per qubit.
- **FR-3.2 (3D Q-Sphere & Entanglement Visualizer)**:
  - Visualizes multi-qubit entangled states (e.g. Bell states $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$, GHZ states).
  - Node radius represents probability amplitude $|\alpha_i|$; node color represents quantum phase $\arg(\alpha_i) \in [-\pi, \pi]$.
- **FR-3.3 (Step-by-Step Quantum Time-Travel)**:
  - Timeline scrubber allowing the user to step backwards and forwards gate-by-gate.
  - Inspect state amplitudes, complex phase angles, and density matrix elements at any intermediate step.
- **FR-3.4 (Measurement Histograms)**:
  - Displays theoretical probabilities alongside empirical shot simulation (100 to 8192 shots).

### Module 4: Qu-Copilot AI Quantum Tutor
- **FR-4.1 (Domain-Specific RAG Engine)**:
  - Grounded in verified quantum computing literature (Nielsen & Chuang, Preskill lecture notes, Qiskit/PennyLane official docs, Qubits & Unitary matrices corpus).
  - Textual explanation guardrails: All conceptual text generated alongside circuits is bound to retrieved textbook citations, eliminating misleading or false conceptual narratives.
- **FR-4.2 (Verified Circuit Generation — Unitary Verification Pipeline)**:
  - *Core Guarantee*: Every circuit suggestion is mathematically validated before being shown to the student.
  - *Model Selection*: Primary inference powered by **Google Gemini 2.5 Flash** for rapid instruction-following, AST generation, and low latency; automatic fallback to **Gemini 2.5 Pro** for multi-stage complex algorithmic reasoning (e.g., multi-qubit oracle synthesis).
  - Pre-response circuit verification: AI-suggested circuits are simulated in the background before presentation.
  - State Fidelity Check:
    $$F = |\langle\psi_{target}|\psi_{suggested}\rangle|^2 \ge 0.999$$
  - Unitary check: Confirms operator preserves inner product $U^\dagger U = I$.
  - *Convergence Guarantee & Fallback Policy*: Maximum 3 automated self-correction iterations. If verification fails after 3 attempts, the engine triggers graceful fallback:
    1. Informs the user honestly that automated circuit generation did not converge to target fidelity $F \ge 0.999$.
    2. Delivers the closest canonical reference circuit from the pre-validated Quantangle library.
    3. Surfaces targeted textbook citations (e.g. Nielsen & Chuang §4.3) to guide the student's manual reasoning.
- **FR-4.3 (Contextual Debugging & Explanations)**:
  - Learner can highlight a section of circuit and ask "Why is phase kickback occurring here?" or "Why is my Grover oracle not amplifying the target state?".

### Module 5: Interactive Quest Labs & Gamification Arena
- **FR-5.1 (Curriculum Tracks)**:
  - *Track 1: Quantum Foundations* (Superposition, Pauli Gates, Bloch Sphere).
  - *Track 2: Multi-Qubit & Entanglement* (Bell States, GHZ, Teleportation, Superdense Coding).
  - *Track 3: Algorithmic Mastery* (Deutsch-Jozsa, Grover's Search, QFT, Shor's Algorithm).
  - *Track 4: NISQ & Quantum ML (v2 Target)* (VQE for $H_2$ molecule, QAOA Max-Cut, PennyLane QNNs).
- **FR-5.2 (Quantum Bug-Hunting Sandboxes)**:
  - Intentionally broken circuits (e.g. missing Hadamard, inverted CNOT control/target) where learners must fix the bug to match target fidelity.
- **FR-5.3 (Retention & Streaks)**:
  - Daily problem of the day, XP points, streak counter, and leaderboards (national and university level).
- **FR-5.4 (Collaborative Learning & Cohort Rooms)**:
  - University cohort sandboxes where instructors can assign custom circuit optimization challenges and students can compare circuit depth solutions in peer review sessions.

### Module 6: Verifiable Credentials & Institutional Portal
- **FR-6.1 (Automated Fidelity Grader)**:
  - Evaluates student solutions based on State Fidelity $F \ge 0.999$ and circuit depth optimization instead of brittle text matching.
- **FR-6.2 (Verifiable Credentials)**:
  - Cryptographically signed certificates (Ed25519) with unique verification hashes linked to NQM standards.

---

## 4.5 Pedagogical Framework & Learning Science Foundation

Quantangle is architected around established cognitive science and learning design frameworks:

1. **Bloom's Mastery Learning**:
   - In traditional classrooms, time is held constant while achievement varies. In Quantangle, achievement is held constant ($F \ge 0.999$ required on all prerequisite labs) while learners progress at their own pace.
   - Gated milestone checkpoints prevent cognitive overload by requiring mastery of single-qubit rotations before introducing entanglement and non-local phase kickback.

2. **Vygotsky's Zone of Proximal Development (ZPD) & Dynamic Scaffolding**:
   - Qu-Copilot serves as an automated "More Knowledgeable Other" (MKO). Instead of simply providing answers, it delivers tiered cognitive scaffolding:
     - *Level 1 Hint*: Conceptual question prompting learner reflection ("What happens to relative phase when applying a CNOT with target in $|-\rangle$?").
     - *Level 2 Hint*: Wire-level structural annotation highlighting the problem gate.
     - *Level 3 Fix*: Verified circuit patch with mathematical diff explanation.

3. **Ebbinghaus Spaced Repetition & Retrieval Practice**:
   - Quantum concepts (e.g. global vs relative phase, basis change transforms) are reinforced via daily streak challenges and bug-hunting sandboxes that resurface previously learned concepts at expanding intervals (Day 1, Day 3, Day 7, Day 21).

4. **Papert's Constructionism**:
   - Students learn quantum theory through active construction rather than passive observation. By assembling circuits directly on the dual-sync canvas and scrubbing the 3D Bloch sphere timeline, students build internal mental models through immediate tactile feedback.

---

## 5. Non-Functional Requirements (NFRs)

- **NFR-1 (Performance & Latency)**: Client simulation of $\le 8$ qubits must resolve in $<15$ms; $9-16$ qubits in $<100$ms. Canvas UI must maintain 60 FPS.
- **NFR-2 (Offline-First / PWA)**: Core visual canvas and Rust-WASM simulator must be fully functional offline without internet access.
- **NFR-3 (Cross-Browser Compatibility)**: Chrome, Edge, Firefox, and Safari (desktop & mobile WebGL2 enabled).
- **NFR-4 (Security, Sandboxed Execution & Cloud Isolation)**:
  - Cloud backend execution runs in isolated gVisor / Firecracker microVM sandboxes with hard cgroup constraints (max 10s CPU, 512MB RAM per job) and zero network egress from worker containers.
  - Per-user rate limiting enforced at the API gateway via Redis token-bucket algorithm: 10 cloud simulation jobs/minute and 30 Qu-Copilot requests/minute.
- **NFR-5 (Comprehensive Accessibility & Inclusive Multimodal Design)**:
  - *Full Keyboard Navigation*: Complete canvas control without a mouse — `Tab`/`Shift+Tab` for wire traversal, Arrow keys for step navigation, `Space`/`Enter` for gate placement, `Delete`/`Backspace` for removal, and `[`/`]` for rotation angle tweaking.
  - *Screen Reader Semantics*: Complete ARIA grid hierarchy (`role="grid"`, `aria-rowindex`, `aria-colindex`) and `aria-live="polite"` state announcement regions that translate quantum statevectors into plain language descriptions for visually impaired students.
  - *Color-Blind Accessible Encoding*: Quantum phase angles $\arg(\alpha) \in [-\pi, \pi]$ are dual-encoded using both a 12-tier color-blind safe palette (Okabe-Ito inspired) AND distinct geometric textures (dots, hatches, cross-patterns) and phase clock needles, ensuring zero dependency on color vision alone.
  - *Visual Standards & Typography*: WCAG 2.1 AA compliant contrast ratios ($\ge 4.5:1$ text, $\ge 3:1$ interactive elements) with OpenDyslexic typography support.
  - *Multilingual Support*: Regional language bridge powered by Bhashini API across 10 Indian languages.
- **NFR-6 (Data Privacy, DPDP Act 2023 & Cryptographic Governance)**:
  - *Legal Compliance*: Full compliance with India's Digital Personal Data Protection Act (DPDP Act 2023) and GDPR, including explicit consent management, student data minimization, and automated right-to-erasure workflows.
  - *Encryption Standards*: TLS 1.3 enforced in transit; AES-256-GCM encryption for student profiles, grades, and institutional records at rest.
  - *Role-Based Access Control (RBAC)*: Cryptographically verified JWT bearer tokens with distinct role scopes (`student`, `instructor`, `institution_admin`). Short-lived access tokens (15 min) paired with rotatable, secure `httpOnly` refresh tokens.
  - *Tamper-Evident Audit Logging*: Cryptographic SHA-256 audit logs for all AI verification decisions, grade submissions, and Ed25519 micro-credential issuances.

---

## 6. Scope & Roadmap Boundaries

- **In Scope for v1 (MVP)**:
  - Full Dual-Sync Canvas (1–8 qubits) with Monaco editor supporting **Qiskit + OpenQASM 3.0 only**.
  - Rust-WASM simulator (1–12 qubits).
  - 3D Bloch Sphere & Q-Sphere visualizers.
  - Step-by-step timeline state scrubbing.
  - Qu-Copilot with **Verified Circuit Generation** (every circuit suggestion mathematically validated via Unitary Verification Pipeline $F \ge 0.999$ before presentation; Gemini 2.5 Flash with 3-attempt fallback).
  - Tracks 1 and 2 Quest Labs with automated fidelity grader and mastery progression.
- **In Scope for v2**:
  - Multi-SDK expansion: **Google Cirq** and **Xanadu PennyLane** AST transpilation and execution.
  - Cloud simulation hub (Qiskit Aer up to 24 qubits, PennyLane VQE).
  - Tracks 3 and 4 Quest Labs (NISQ & Quantum ML).
  - Institutional cohort dashboard and verifiable certificate generator.
- **Out of Scope**:
  - Real hardware QPU physical control (pulse-level OpenPulse programming).
