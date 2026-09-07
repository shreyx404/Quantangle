# API_SPEC.md — Quantangle REST & WebSocket API Specification

> Complete interface contract between Next.js Frontend, FastAPI Backend, and External Services.

---

## 1. Authentication & Common Headers

All authenticated endpoints expect a standard Bearer token:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Standard Error Response Format:
```json
{
  "error": {
    "code": "CIRCUIT_VALIDATION_ERROR",
    "message": "Target qubit index 4 exceeds allocated circuit width of 4 qubits (0-3).",
    "details": { "invalid_wire": 4, "max_wire": 3 }
  }
}
```

---

## 2. Cloud Simulation Endpoints (`/api/v1/sim`)

### 2.1 Heavy / Noisy Simulation
- **Endpoint**: `POST /api/v1/sim/cloud`
- **Description**: Executes circuits with $>16$ qubits or simulated physical noise models (thermal relaxation, depolarizing noise) using Qiskit Aer.
- **Request Body**:
```json
{
  "circuit_ir": {
    "version": "1.0",
    "qubits": 18,
    "clbits": 18,
    "steps": [
      {
        "stepIndex": 0,
        "operations": [{ "id": "g1", "gate": "H", "qubits": [0] }]
      }
    ]
  },
  "shots": 2048,
  "noise_model": {
    "type": "depolarizing",
    "error_rate": 0.001
  }
}
```
- **Response**:
```json
{
  "job_id": "job_98fa32b1",
  "status": "completed",
  "execution_time_ms": 142.6,
  "counts": {
    "000000000000000000": 1021,
    "000000000000000001": 1027
  },
  "statevector_summary": {
    "dim": 262144,
    "non_zero_amplitudes": 2
  }
}
```

### 2.2 Variational Algorithms (VQE & QAOA via PennyLane — v2 Target)
- **Endpoint**: `POST /api/v1/sim/vqe`
- **Description**: (v2 Target) Runs variational hybrid optimization loops on cloud workers with automatic differentiation.
- **Request Body**:
```json
{
  "hamiltonian": "H2_molecule",
  "ansatz": "uccsd",
  "initial_params": [0.0, 0.0, 0.0],
  "optimizer": "adam",
  "max_iterations": 50
}
```
- **Response**:
```json
{
  "converged": true,
  "ground_state_energy_hartree": -1.137270,
  "theoretical_exact_energy": -1.137283,
  "error": 0.000013,
  "iteration_history": [
    { "step": 1, "energy": -0.852 },
    { "step": 50, "energy": -1.137270 }
  ]
}
```

---

## 3. Qu-Copilot AI Endpoints (`/api/v1/copilot`)

### 3.1 Streaming AI Tutor Chat
- **Endpoint**: `POST /api/v1/copilot/chat`
- **Protocol**: Server-Sent Events (SSE) `text/event-stream`
- **Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How do I create an entangled GHZ state with 3 qubits?" }
  ],
  "current_circuit_ir": { "qubits": 3, "clbits": 3, "steps": [] },
  "selected_step": null
}
```
- **SSE Stream Chunks**:
```text
data: {"type": "content_delta", "delta": "To create a 3-qubit **GHZ state** $|GHZ\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}$, follow these steps:\n\n"}
data: {"type": "content_delta", "delta": "1. Put Qubit 0 into superposition with a Hadamard ($H$) gate.\n2. Entangle Qubit 0 with Qubit 1 using a $CX$ gate.\n3. Entangle Qubit 1 with Qubit 2 using another $CX$ gate.\n\n"}
data: {"type": "verified_circuit", "circuit_ir": { ... }, "fidelity": 1.0, "status": "verified"}
data: {"type": "done"}
```

### 3.2 Verified Circuit Generation & Unitary Verifier
- **Endpoint**: `POST /api/v1/copilot/verify`
- **Description**: Evaluates and mathematically validates candidate circuits before presenting them to students, checking unitary constraints ($U^\dagger U = I$) and state fidelity ($F \ge 0.999$).
- **Request Body**:
```json
{
  "candidate_ir": { ... },
  "target_state": "bell_state_phi_plus"
}
```
- **Response**:
```json
{
  "is_valid_unitary": true,
  "fidelity": 0.99998,
  "verified": true,
  "diagnostics": {
    "circuit_depth": 2,
    "gate_count": 2,
    "ancillas_uncomputed": true
  }
}
```

---

## 4. Quest Arena & Grading Endpoints (`/api/v1/quests`)

### 4.1 Automated Circuit Submission Grader
- **Endpoint**: `POST /api/v1/quests/{quest_id}/submit`
- **Request Body**:
```json
{
  "student_circuit_ir": { ... },
  "code_snippet": "from qiskit import QuantumCircuit...",
  "sdk": "qiskit"
}
```
- **Response**:
```json
{
  "passed": true,
  "fidelity": 1.0000,
  "required_fidelity": 0.9990,
  "score": {
    "base_xp": 100,
    "depth_bonus_xp": 25,
    "total_xp": 125
  },
  "circuit_stats": {
    "depth": 3,
    "two_qubit_gates": 2
  },
  "feedback": "Flawless implementation! Bell state |Phi+> prepared with optimal gate depth."
}
```

### 4.2 Leaderboard & Streaks
- **Endpoint**: `GET /api/v1/arena/leaderboard?type=national&limit=20`
- **Response**:
```json
{
  "leaderboard": [
    { "rank": 1, "username": "quantum_ninja", "college": "IIT Bombay", "xp": 4850, "streak": 28 },
    { "rank": 2, "username": "qubit_master", "college": "NIT Trichy", "xp": 4720, "streak": 24 }
  ],
  "user_standing": { "rank": 42, "xp": 1850, "streak": 7 }
}
```

---

## 5. WebSockets

- **Live Multiplayer Arena**: `wss://api.quantangle.io/ws/arena/live/{battle_id}`
  - Synchronizes real-time circuit depth comparisons during competitive hackathons.
