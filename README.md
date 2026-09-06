# Quantangle (SIH 2026 — SIH26140)

<p align="center">
  <strong>AI-Based Interactive Quantum Algorithm Learning & Multi-Engine Simulation Platform</strong><br>
  <em>Democratizing Quantum Education through Intelligent Multi-SDK Simulation, 3D Visual Computing, and Zero-Hallucination AI Tutoring</em>
</p>

---

## 🌌 System Documentation & Agent Navigation Hub

This repository is equipped with an enterprise-grade **AI Agent & Vibe Coding Operating Suite**. Whether you are a human engineer, an AI coding agent (Antigravity, Cursor, Windsurf, Claude Code), or a contributor, use the navigation matrix below:

| Document | Description | Target Audience |
|---|---|---|
| **[AGENTS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/AGENTS.md)** | Universal AI Agent Manifesto & rules of engagement | AI Coding Agents & LLMs |
| **[CLAUDE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/CLAUDE.md)** | Fast CLI commands, build scripts, and testing cheatsheet | Claude Code & Terminal Agents |
| **[.cursorrules](file:///c:/Users/shrey/Downloads/SIH%20Ideation/.cursorrules)** | Cursor / Windsurf IDE vibe coding directives | Cursor & IDE Vibe Coders |
| **[ACTIVE_CONTEXT.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ACTIVE_CONTEXT.md)** | Dynamic memory: current focus, recent changes, next action | Multi-session Handover & Memory |
| **[PRD.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/PRD.md)** | Product Requirements Document: Problem gaps, personas, 6 modules, NFRs | Product, Design & Architecture |
| **[ARCHITECTURE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ARCHITECTURE.md)** | System topology, data flows, AST synchronization, WASM worker | Senior Engineers & Architects |
| **[SYSTEM_PATTERNS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SYSTEM_PATTERNS.md)** | Zustand stores, Web Worker messaging, Three.js shaders, error handling | Frontend & Fullstack Engineers |
| **[TECH_STACK.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TECH_STACK.md)** | Verified dependencies, package configurations, versions | DevOps & Fullstack Engineers |
| **[SIMULATION_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SIMULATION_SPEC.md)** | Quantum linear algebra, statevectors, unitary gates, Little-Endian rule | Quantum Software Engineers |
| **[API_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/API_SPEC.md)** | REST & WebSocket interface contracts and Pydantic models | Backend & Integration Engineers |
| **[TESTING_GUIDE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TESTING_GUIDE.md)** | Self-verification test commands & quantum fidelity assertions ($F \ge 0.999$) | QA & Autonomous Agent Verification |
| **[TASKS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TASKS.md)** | Phased, checkbox-driven implementation roadmap (Phase 0 to Phase 7) | Project Management & Task Execution |

---

## 🚀 Key Innovations & Pillars

1. **Dual-Sync Quantum Circuit Designer**: Real-time bi-directional synchronization between graphical drag-and-drop circuit canvas and multi-framework code (Qiskit, PennyLane, Cirq, OpenQASM 3.0) via AST parsing.
2. **0-Latency Edge Simulator (Rust-WASM)**: Client-side statevector simulator running in a Web Worker executing $\le 16$ qubits with zero cloud latency and full offline capability.
3. **3D Quantum State Inspector**: Hardware-accelerated Three.js WebGL visualization of multi-qubit Bloch Spheres, Q-Spheres, and Density Matrices with gate-by-gate timeline scrubbing.
4. **Qu-Copilot (Zero-Hallucination AI Tutor)**: Domain-specific RAG assistant with automated **Unitary Verification Pipeline ($F \ge 0.999$)** to validate circuit math before presenting answers to students.
5. **Gamified Quest Labs & Challenge Arena**: Guided learning tracks, quantum bug-hunting sandboxes, daily streaks, and cryptographically verifiable micro-credentials aligned with India's National Quantum Mission.

---

## 🛠️ Quickstart Guide

### 1. Prerequisites
- **Node.js** `v20.x+` and **npm** `v10.x+`
- **Rust** `1.75+` and `wasm-pack`
- **Python** `3.11+`

### 2. Running Frontend
```bash
cd apps/web
npm install
npm run dev
# Opens at http://localhost:3000
```

### 3. Building Rust-WASM Engine
```bash
cd packages/wasm-engine
wasm-pack build --target web --release
cargo test
```

### 4. Running Backend Cloud Services
```bash
cd apps/api
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📁 Repository Structure

```
Quantangle Root
├── AGENTS.md                 # Universal Agent Manifesto & Rules of Engagement
├── CLAUDE.md                 # Claude Code / CLI agent instructions & cheatsheet
├── .cursorrules              # Cursor IDE agent directives & vibe coding prompts
├── ACTIVE_CONTEXT.md         # Dynamic memory: current focus, recent changes, next immediate step
├── PRD.md                    # Product specifications, acceptance criteria, boundary limits
├── ARCHITECTURE.md           # System mental model, module boundaries, data pipelines
├── SYSTEM_PATTERNS.md        # Code standards, state management, component conventions, error handling
├── TECH_STACK.md             # Stack versions, CLI commands, directory tree mapping
├── SIMULATION_SPEC.md        # Quantum linear algebra conventions, gate matrices, qubit endianness
├── API_SPEC.md               # Typed REST & WebSocket contracts, event schemas
├── TESTING_GUIDE.md          # Verification commands, state-fidelity assertions (F >= 0.999), smoke tests
├── TASKS.md                  # Atomic, checkable engineering roadmap (- [ ] to - [x])
├── README.md                 # This file
└── docs/
    └── pitch_archive/        # Preserved Smart India Hackathon ideation, PPTX, & presenter guides
```
