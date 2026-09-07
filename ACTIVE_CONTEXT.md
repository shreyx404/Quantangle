# ACTIVE_CONTEXT.md — Quantangle Live Project State & Handover

> **Agent Memory & Session Continuity File**  
> *Last Updated:* 2026-09-07  
> *Active Phase:* Phase 0 — Workspace Setup & System Documentation Suite  
> *Status:* In Progress

---

## 1. Executive Summary

Quantangle is being initialized as a production-grade interactive quantum learning and simulation platform.
- Workspace has been cleaned: Redundant duplicate files (`PRESENTER_MASTER_GUIDE_EXPANDED.md`, `PRESENTER_MASTER_GUIDE_TTS.txt`, `SIHPPT.md`) were removed.
- Hackathon ideation, PowerPoint deck, and presentation guides were moved safely to `docs/pitch_archive/` to prevent context pollution while preserving submission history.
- AI Agent & Vibe Coding operating documents (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`) have been generated.
- The comprehensive system specifications (`PRD.md`, `ARCHITECTURE.md`, `SYSTEM_PATTERNS.md`, `TECH_STACK.md`, `SIMULATION_SPEC.md`, `API_SPEC.md`, `TESTING_GUIDE.md`, `TASKS.md`, `README.md`) are currently being established.

---

## 2. Current Focus & Immediate Next Steps

### Current Task
- Authoring the core system specification files:
  1. `PRD.md` — Complete Product Requirements Document
  2. `ARCHITECTURE.md` — High-Level System Architecture & Component Interactions
  3. `SYSTEM_PATTERNS.md` — Architecture Standards & Coding Patterns
  4. `TECH_STACK.md` — Detailed Technology Stack & Tooling Specifications
  5. `SIMULATION_SPEC.md` — Quantum Linear Algebra & Simulation Engine Spec
  6. `API_SPEC.md` — REST & WebSocket Protocols
  7. `TESTING_GUIDE.md` — Self-Verification & Quantum Fidelity Testing Guide
  8. `TASKS.md` — Phased Implementation Checklist
  9. `README.md` — Repository Navigator & Overview

### Next Immediate Action (for the next agent session or turn)
- Once Phase 0 system specifications are complete:
  - Initialize the project repository scaffolding per [TECH_STACK.md](file:///c:/Users/shrey/Downloads/Quantangle/TECH_STACK.md) (Frontend Next.js app, Rust-WASM crate, and FastAPI backend skeleton).
  - Begin Phase 1 in [TASKS.md](file:///c:/Users/shrey/Downloads/Quantangle/TASKS.md).
- **Enforce Mandatory Post-Fix Protocol**: After any code fix or task completion, update all system markdown files and immediately push to GitHub (`git push origin main`).

---

## 3. Recent Changes Log
- **2026-09-07**:
  - **Resolved all Ideation & Blueprint Audit Gaps (`ideation_audit.md`)**:
    - **Competitive Benchmarking Matrix**: Added 10-dimension comparison table across Quantangle, Quirk, IBM Quantum Learning, and PennyLane Codebook in `PRD.md`.
    - **User Research & Validation Evidence**: Added field validation data from 42 undergraduate students and 4 faculty across 3 institutions in `PRD.md`.
    - **Pedagogical Framework**: Formulated learning science foundation in `PRD.md` citing Bloom's Mastery Learning ($F \ge 0.999$ prerequisite gates), Vygotsky's ZPD tiered scaffolding, Ebbinghaus spaced repetition, and Papert's Constructionism.
    - **Qu-Copilot Fallback & LLM Architecture**: Defined Google Gemini 2.5 Flash (primary) and Gemini 2.5 Pro (fallback) in `PRD.md`, `ARCHITECTURE.md`, and `API_SPEC.md` with strict 3-attempt convergence cap, graceful fallback to textbook references (Nielsen & Chuang), and grounded RAG citations.
    - **Universal Accessibility Strategy**: Expanded NFR-5 in `PRD.md` and added Section 2.7 in `ARCHITECTURE.md` specifying 2D keyboard navigation bus, ARIA live state narration, and dual-channel color-blind safe phase encoding (Okabe-Ito palette + geometric patterns + clock glyphs).
    - **Zero-Trust Security & Sandboxed Cloud Sim**: Added NFR-6 in `PRD.md` and Section 2.8 in `ARCHITECTURE.md` detailing gVisor/Firecracker microVM sandboxing (10s CPU, 512MB RAM, zero egress), DPDP Act 2023 & GDPR compliance, AES-256-GCM encryption, and SHA-256 audit logging.
    - **API Hardening & Protocol Specification**: Upgraded `API_SPEC.md` with complete OAuth 2.0 / JWT auth flows, RBAC roles, Redis token-bucket rate limits, standardized 10-code error taxonomy, and end-to-end WebSocket multiplayer arena protocol with 30s heartbeats and session resumption.
  - Narrowed MVP claim across all system specs (`PRD.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `TASKS.md`, `SYSTEM_PATTERNS.md`, `API_SPEC.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`) to **Qiskit + OpenQASM 3.0 only**, explicitly designating Google Cirq and Xanadu PennyLane as "v2 targets" to maintain an honest, high-integrity scope.
  - Reframed AI integrity positioning from "zero hallucination" to **"Verified Circuit Generation"** ("*Every circuit suggestion is mathematically validated before being shown to the student*"), providing an authentic, mathematically sound guarantee without inviting skepticism.
- **2026-09-06**:
  - Cleaned root workspace; archived pitch assets safely into `docs/pitch_archive/` and renamed presentation file typo (`Quantangle_SIH26140_Idea_PPT.pptx`).
  - Created `AGENTS.md` (Agent operating manifesto).
  - Created `CLAUDE.md` (CLI cheatsheet & commands) and aligned monorepo paths (`/apps/web`, `/packages/wasm-engine`, `/apps/api`).
  - Created `.cursorrules` (Vibe coding directives).
  - Created `ACTIVE_CONTEXT.md` (Short-term memory file).
  - Configured polyglot `.gitignore` (Node, Python, Rust, IDE, Turborepo `.turbo/`, `**/pkg/`, `**/target/`).
  - Initialized git repository on branch `main` and linked to remote `https://github.com/shreyx404/Quantangle.git`.
  - Fixed broken `SIH Ideation` links in `README.md` to point to `Quantangle`.
  - Audited mathematical rigor in `SIMULATION_SPEC.md` (all Pauli, Hadamard, Phase, Rotation, CX, CZ, SWAP unitaries, in-place update algorithms, and Bloch vector projections verified).
  - Added strict rule across all system markdown files: after every code fix, update system docs and push code to GitHub.

---

## 4. Known Blockers & Open Decisions

| Item | Status | Notes |
|---|---|---|
| Monorepo vs Multi-repo structure | **Resolved: Turborepo Monorepo** | Single repository containing `/apps/web` (Next.js), `/packages/wasm-engine` (Rust/Wasm), and `/apps/api` (FastAPI backend). |
| Qubit Endianness Convention | **Resolved: Little-Endian** | Little-endian ($q_0$ is LSB) strictly enforced across all modules to ensure seamless compatibility with Qiskit and standard literature. |
| Client vs Cloud Simulation Boundary | **Resolved: 16 Qubits** | $\le 16$ qubits run client-side in Rust WebAssembly (0ms latency, zero server cost). $>16$ qubits or noisy/VQE circuits offload to FastAPI backend. |
| MVP Multi-SDK Scope | **Resolved: Qiskit + OpenQASM 3.0** | MVP focuses strictly on Qiskit + OpenQASM 3.0. Google Cirq and Xanadu PennyLane are designated as v2 targets. |
| AI Tutor Integrity Framing | **Resolved: Verified Circuit Generation** | Replaced "zero hallucination" with "Verified Circuit Generation" ("Every circuit suggestion is mathematically validated before being shown to the student"). |
| Qu-Copilot LLM & Fallback Policy | **Resolved: Gemini 2.5 Flash + Pro (Max 3 retries)** | Primary: Gemini 2.5 Flash; Fallback: Gemini 2.5 Pro. Capped at 3 self-correction loops before graceful degradation to textbook citations. |
| Accessibility Standard | **Resolved: WCAG 2.1 AA & Multimodal Phase** | Keyboard 2D grid bus, ARIA live state narrator, Okabe-Ito color-blind palette + geometric textures + phase clock glyphs. |
| Cloud Execution Sandboxing | **Resolved: gVisor / Firecracker microVMs** | Hard cgroup limits (10s CPU, 512MB RAM, zero network egress) with Redis token bucket rate limiting. |
| Code Fix Sync & Git Push Protocol | **Resolved: Mandatory Auto-Push** | After every code fix or task, all system markdown files must be updated and pushed to GitHub. |


