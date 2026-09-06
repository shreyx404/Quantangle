# ACTIVE_CONTEXT.md — Quantangle Live Project State & Handover

> **Agent Memory & Session Continuity File**  
> *Last Updated:* 2026-09-06  
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
  - Initialize the project repository scaffolding per [TECH_STACK.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TECH_STACK.md) (Frontend Next.js app, Rust-WASM crate, and FastAPI backend skeleton).
  - Begin Phase 1 in [TASKS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TASKS.md).

---

## 3. Recent Changes Log
- **2026-09-06**:
  - Cleaned root workspace; archived pitch assets into `docs/pitch_archive/`.
  - Created `AGENTS.md` (Agent operating manifesto).
  - Created `CLAUDE.md` (CLI cheatsheet & commands).
  - Created `.cursorrules` (Vibe coding directives).
  - Created `ACTIVE_CONTEXT.md` (Short-term memory file).

---

## 4. Known Blockers & Open Decisions

| Item | Status | Notes |
|---|---|---|
| Monorepo vs Multi-repo structure | **Resolved: Turborepo Monorepo** | Single repository containing `/apps/web` (Next.js), `/packages/wasm-simulator` (Rust/Wasm), and `/apps/api` (FastAPI backend). |
| Qubit Endianness Convention | **Resolved: Little-Endian** | Little-endian ($q_0$ is LSB) strictly enforced across all modules to ensure seamless compatibility with Qiskit and standard literature. |
| Client vs Cloud Simulation Boundary | **Resolved: 16 Qubits** | $\le 16$ qubits run client-side in Rust WebAssembly (0ms latency, zero server cost). $>16$ qubits or noisy/VQE circuits offload to FastAPI backend. |
