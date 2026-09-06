# CLAUDE.md — Claude Code & Terminal Agent Cheatsheet

> Fast-reference commands, conventions, and architectural constraints for Claude Code and command-line vibe coding agents working on **Quantangle**.

---

## 1. Project Overview

Quantangle is an AI-based Interactive Quantum Algorithm Learning & Multi-Engine Simulation Platform.
- **Frontend**: Next.js 14 (App Router) + React 18 + Vanilla CSS / CSS Modules + Lucide Icons + Monaco Editor + Three.js / React Three Fiber.
- **Client Simulator**: Rust WebAssembly (`wasm-pack`, target `web`) running in a Web Worker.
- **Cloud Backend**: Python 3.11+ / FastAPI + Qiskit Aer + PennyLane + Google Cirq.
- **State Store**: Zustand for client-side circuit state, timeline history, and UI modes.
- **AI & RAG**: LangChain / LlamaIndex + FastAPI streaming + Quantum AST Unitary Verifier.

---

## 2. Common CLI Commands

### Frontend (`/frontend` or root)
```bash
# Install dependencies
npm install

# Start local dev server (default: http://localhost:3000)
npm run dev

# Run linter
npm run lint

# Run unit & component tests (Vitest)
npm run test

# Run e2e tests (Playwright)
npm run test:e2e

# Build production bundle
npm run build
```

### Rust WebAssembly Quantum Engine (`/wasm-engine`)
```bash
# Build WASM package for web target
wasm-pack build --target web --release

# Run Rust unit tests (complex linear algebra, Kronecker products, statevectors)
cargo test

# Benchmark statevector multiplication
cargo bench
```

### Python Backend & Simulation Hub (`/backend`)
```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows PowerShell

# Install requirements
pip install -r requirements.txt

# Run FastAPI dev server with auto-reload
uvicorn main:app --reload --port 8000

# Run backend test suite (Qiskit Aer, PennyLane, Unitary Grader)
pytest
```

---

## 3. Code Conventions & Standards

### TypeScript / JavaScript
- Use TypeScript with strict mode enabled (`noImplicitAny: true`, `strictNullChecks: true`).
- Prefer functional components with React hooks.
- For styling, use high-contrast dark theme variables and CSS modules or Tailwind.
- Keep complex linear algebra out of React components — call the WebAssembly Web Worker.

### Rust (`/wasm-engine`)
- Use `num-complex` for complex numbers (`Complex64`).
- Statevector is represented as `Vec<Complex64>` of length $2^n$.
- Qubit indices are `0`-indexed, Little-Endian ($q_0$ is LSB).
- Ensure memory allocations are pre-calculated for $2^n$ statevector operations.

### Python (`/backend`)
- Format code with `black` and `ruff`.
- Use Pydantic v2 models for request/response validation.
- All AI responses must pass through `verify_unitary(circuit_ast)` before returning to the client.

---

## 4. Key References
- Product Specs: [PRD.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/PRD.md)
- System Architecture: [ARCHITECTURE.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ARCHITECTURE.md)
- Quantum Physics Ground Truths: [SIMULATION_SPEC.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/SIMULATION_SPEC.md)
- Active Session State: [ACTIVE_CONTEXT.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/ACTIVE_CONTEXT.md)
- Engineering Roadmap: [TASKS.md](file:///c:/Users/shrey/Downloads/SIH%20Ideation/TASKS.md)
