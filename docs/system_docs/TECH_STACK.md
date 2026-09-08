# TECH_STACK.md — Quantangle Technology Stack & Tooling

> Complete specification of programming languages, frameworks, libraries, versions, and build tooling for **Quantangle**.

---

## 1. System Architecture Overview & Tech Matrix

| Domain | Selected Technology | Version | Justification |
|---|---|---|---|
| **Frontend Framework** | **Next.js (App Router)** | `^14.2.x` | Hybrid SSR/SSG for educational content + fast client-side navigation for the interactive IDE. |
| **UI Library** | **React** | `^18.3.x` | Industry standard; rich ecosystem for 3D canvases and node graphs. |
| **Language (Frontend)** | **TypeScript** | `^5.4.x` | Strict type safety across complex quantum AST representations and worker buffers. |
| **Styling System** | **TailwindCSS + CSS Modules** | `^3.4.x` | High-performance CSS custom properties for sleek, responsive dark mode themes. |
| **Icons & Micro-animations** | **Lucide React + Framer Motion** | `^0.370.x` / `^11.0.x` | Crisp vector iconography and fluid timeline scrubbing animations. |
| **Circuit Canvas** | **Custom SVG / React Flow** | `^11.11.x` | Drag-and-drop nodes, smooth connection lines, and responsive wire grids. |
| **Code Editor** | **Monaco Editor** | `@monaco-editor/react ^4.6.x` | VS Code-grade code editing, multi-language support (Python, OpenQASM 3.0), diffing, and error squiggles. |
| **3D Quantum Visualizer** | **Three.js + React Three Fiber** | `three ^0.163.x`, `@react-three/fiber ^8.16.x` | Hardware-accelerated WebGL rendering for Bloch Spheres and Q-Spheres with custom shaders. |
| **State Management** | **Zustand** | `^4.5.x` | Ultra-lightweight, boilerplate-free state stores with native outside-React access for Web Workers. |
| **Edge Quantum Simulator** | **Rust + WebAssembly** | `Rust 1.75+`, `wasm-bindgen ^0.2.92` | True zero-latency ($\le 16$ qubits) client-side linear algebra simulation with zero server cost. |
| **Rust Math Crates** | **num-complex, ndarray** | `num-complex 0.4`, `ndarray 0.15` | Fast complex number arithmetic and matrix operations. |
| **Backend Framework** | **Python / FastAPI** | `Python 3.11+`, `FastAPI ^0.110.x` | Asynchronous high-throughput API with native support for scientific Python packages. |
| **Quantum Cloud Engines** | **Qiskit (MVP), PennyLane & Cirq (v2 Targets)** | `qiskit ^1.0.x` (MVP); `pennylane ^0.35.x`, `cirq ^1.3.x` (v2) | Cloud execution: Qiskit Aer for deep/noisy circuits in MVP; PennyLane & Cirq for VQE/QML in v2. |
| **AI Tutor & RAG Engine** | **LangChain / LlamaIndex** | `^0.1.x` | Verified Circuit Generation: RAG retrieval with quantum literature vector index + mathematical Unitary verification loop ($F \ge 0.999$). |
| **Primary Database** | **PostgreSQL** | `16.x` | Relational storage for users, labs, completed quests, and verifiable credentials. |
| **Cache & Real-Time Queue** | **Redis** | `7.2.x` | Sorted Sets for national/college leaderboards and pub/sub message brokering. |
| **Frontend Testing** | **Vitest + Playwright** | `Vitest ^1.4.x`, `Playwright ^1.42.x` | Fast unit testing for AST transpilers and end-to-end browser verification. |
| **Backend Testing** | **Pytest + Cargo Test** | `pytest ^8.1.x` | Rigorous mathematical testing for unitary gates and quantum state fidelities. |

---

## 2. Monorepo Organization (Turborepo)

Quantangle is structured as a clean, unified monorepo:

```
quantangle/
├── package.json               # Monorepo scripts & workspaces
├── turbo.json                 # Turborepo pipeline configuration
├── apps/
│   ├── web/                   # Next.js 14 frontend application
│   └── api/                   # Python FastAPI backend & cloud simulation hub
└── packages/
    ├── wasm-engine/           # Rust WebAssembly quantum simulator crate
    ├── quantum-ast/           # Shared TypeScript AST schemas & transpiler logic
    └── ui-tokens/             # Shared color tokens, CSS styles, and UI primitives
```

---

## 3. Key Dependencies & Versions

### `apps/web/package.json`
```json
{
  "name": "@quantangle/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@react-three/drei": "^9.105.0",
    "@react-three/fiber": "^8.16.0",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.28",
    "lucide-react": "^0.372.0",
    "next": "^14.2.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.2.2",
    "three": "^0.163.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/react": "^18.2.79",
    "@types/three": "^0.163.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vitest": "^1.5.0"
  }
}
```

### `packages/wasm-engine/Cargo.toml`
```toml
[package]
name = "quantangle-wasm-engine"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2.92"
num-complex = "0.4.4"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6.5"
js-sys = "0.3.69"
web-sys = { version = "0.3.69", features = ["console"] }

[dev-dependencies]
wasm-bindgen-test = "0.3.42"

[profile.release]
opt-level = 3
lto = true
```

### `apps/api/requirements.txt`
```text
fastapi==0.110.1
uvicorn[standard]==0.29.0
pydantic==2.7.0
qiskit==1.0.2
qiskit-aer==0.14.0.1
pennylane==0.35.1
cirq==1.3.0
numpy==1.26.4
scipy==1.13.0
redis==5.0.3
sqlalchemy==2.0.29
asyncpg==0.29.0
pytest==8.1.1
httpx==0.27.0
```
