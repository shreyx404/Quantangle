# API_SPEC.md — Quantangle REST & WebSocket API Specification

> Complete interface contract between Next.js Frontend, FastAPI Backend, and External Services.

---

## 1. Authentication, Authorization & Security

### 1.1 Authentication Architecture
Quantangle enforces OAuth 2.0 with OpenID Connect (Google, GitHub, and Institutional SAML) alongside email/magic-link credentials.

- **Access Tokens**: Short-lived JWTs (15-minute expiration) signed with RS256 asymmetric keys.
- **Refresh Tokens**: Long-lived (7 days), stored in `httpOnly`, `SameSite=Strict`, `Secure` cookies with automatic token rotation and reuse detection.
- **JWT Payload Claims**:
```json
{
  "sub": "usr_94b8e21a",
  "email": "student@iitb.ac.in",
  "role": "student",
  "institution_id": "inst_iitb",
  "permissions": ["sim:edge", "sim:cloud", "copilot:chat", "arena:compete"],
  "iat": 1772960000,
  "exp": 1772960900
}
```

### 1.2 Auth Endpoints (`/api/v1/auth`)

#### Token Refresh
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Headers**: Cookie containing `refresh_token`
- **Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

#### User Session Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
```json
{
  "user_id": "usr_94b8e21a",
  "name": "Aarav Sharma",
  "email": "student@iitb.ac.in",
  "role": "student",
  "institution": "IIT Bombay",
  "streak_days": 14,
  "total_xp": 2450
}
```

---

## 2. Rate Limiting & Abuse Prevention

All API routes are protected by a Redis-backed **Token Bucket** rate-limiting filter enforcing per-user and per-IP throttles:

| Endpoint Group | Rate Limit | Scope | Penalty on Breach |
|---|---|---|---|
| **Cloud Simulation** (`/sim/cloud`, `/sim/vqe`) | 10 requests / min | Per Authenticated User | HTTP 429 with 60s cooldown |
| **Qu-Copilot Chat** (`/copilot/chat`) | 30 requests / min | Per Authenticated User | HTTP 429 with 30s cooldown |
| **Circuit Verifier** (`/copilot/verify`) | 60 requests / min | Per Authenticated User | HTTP 429 with 15s cooldown |
| **Public Endpoints** (`/quests`, `/arena/leaderboard`) | 120 requests / min | Per IP Address | HTTP 429 with 60s cooldown |

### Rate Limit Headers & Error Response
Every API response returns standard rate-limiting headers:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1772961060
Retry-After: 42
```

Breaching limits returns an HTTP 429 payload:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Cloud simulation rate limit reached (10 requests/minute). Please wait before submitting more jobs.",
    "retry_after_seconds": 42,
    "timestamp": "2026-09-07T11:15:00Z"
  }
}
```

---

## 3. Standardized Error Taxonomy

All API errors return a uniform schema with unique request tracing IDs:

```json
{
  "error": {
    "code": "CIRCUIT_VALIDATION_ERROR",
    "message": "Target qubit index 4 exceeds allocated circuit width of 4 qubits (0-3).",
    "request_id": "req_88f910ab",
    "timestamp": "2026-09-07T11:15:00Z",
    "details": { "invalid_wire": 4, "max_wire": 3 }
  }
}
```

### Complete Error Catalog

| Error Code | HTTP Status | Trigger Scenario | Actionable Remediation |
|---|---|---|---|
| `AUTH_UNAUTHORIZED` | 401 | Missing or malformed Bearer token | Re-authenticate via `/api/v1/auth/login`. |
| `AUTH_TOKEN_EXPIRED` | 401 | Access JWT expired | Call `/api/v1/auth/refresh` using cookie. |
| `AUTH_FORBIDDEN` | 403 | Role lacks privilege (e.g. student calling instructor cohorts) | Request elevated role from institution admin. |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded burst or sustained request budget | Respect `Retry-After` header before retrying. |
| `CIRCUIT_VALIDATION_ERROR` | 422 | Gate references non-existent wire or invalid parameter range | Correct circuit AST wire indices and angle bounds. |
| `QUBIT_LIMIT_EXCEEDED` | 400 | Circuit requests $>24$ qubits on cloud engine | Trim circuit width to supported bounds ($\le 24$ qubits). |
| `NON_UNITARY_OPERATOR` | 422 | Synthesized operation matrix does not satisfy $U^\dagger U = I$ | Check gate definitions for non-unitary transformations. |
| `SIMULATION_TIMEOUT` | 504 | Cloud simulation exceeded hard cgroup limit (10s CPU) | Reduce circuit depth or shots count. |
| `SANDBOX_EXECUTION_ERROR`| 500 | Isolated microVM failed during Qiskit Aer compilation | Report error trace to Quantangle systems team. |
| `COPILOT_CONVERGENCE_FAIL`| 422 | AI reflection loop exhausted 3 retries without reaching $F \ge 0.999$ | System gracefully degraded to textbook reference circuit. |

---

## 4. Cloud Simulation Endpoints (`/api/v1/sim`)

### 4.1 Heavy / Noisy Simulation
- **Endpoint**: `POST /api/v1/sim/cloud`
- **Description**: Executes circuits with $>16$ qubits or simulated physical noise models (thermal relaxation, depolarizing noise) using Qiskit Aer in an isolated gVisor sandbox.
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

### 4.2 Variational Algorithms (VQE & QAOA via PennyLane — v2 Target)
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

## 5. Qu-Copilot AI Endpoints (`/api/v1/copilot`)

### 5.1 Streaming AI Tutor Chat
- **Endpoint**: `POST /api/v1/copilot/chat`
- **Protocol**: Server-Sent Events (SSE) `text/event-stream`
- **Engine**: Google Gemini 2.5 Flash (Primary) / Gemini 2.5 Pro (Fallback)
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

### 5.2 Verified Circuit Generation & Unitary Verifier
- **Endpoint**: `POST /api/v1/copilot/verify`
- **Description**: Evaluates candidate circuits against unitary constraints ($U^\dagger U = I$) and target state fidelity ($F \ge 0.999$). Capped at 3 internal self-correction iterations with graceful degradation.
- **Request Body**:
```json
{
  "candidate_ir": { "qubits": 2, "clbits": 2, "steps": [...] },
  "target_state": "bell_state_phi_plus",
  "max_depth_target": 4
}
```
- **Response (Success)**:
```json
{
  "verified": true,
  "is_valid_unitary": true,
  "fidelity": 0.99998,
  "iterations_used": 1,
  "diagnostics": {
    "circuit_depth": 2,
    "gate_count": 2,
    "ancillas_uncomputed": true
  }
}
```
- **Response (Graceful Fallback after 3 Retries)**:
```json
{
  "verified": false,
  "is_valid_unitary": true,
  "fidelity": 0.7071,
  "iterations_used": 3,
  "status": "CONVERGENCE_LIMIT_EXCEEDED",
  "fallback_reference_circuit": { "qubits": 2, "clbits": 2, "steps": [...] },
  "literature_citation": {
    "source": "Nielsen & Chuang, Quantum Computation and Quantum Information",
    "section": "Section 4.3 — Controlled Operations",
    "page": 178
  },
  "message": "Automated verification did not reach F >= 0.999 within 3 reflection cycles. Providing canonical textbook reference circuit."
}
```

---

## 6. Quest Arena & Grading Endpoints (`/api/v1/quests`)

### 6.1 Automated Circuit Submission Grader
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

### 6.2 Leaderboard & Streaks
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

## 7. Real-Time Multiplayer Arena Protocol (WebSocket)

- **WebSocket URI**: `wss://api.quantangle.io/ws/arena/live/{battle_id}`
- **Authentication**: Client must provide a single-use ticket via query parameter `?ticket=<ws_ticket>` (generated via `POST /api/v1/arena/ws-ticket`) or pass the JWT via subprotocol header `Sec-WebSocket-Protocol: Bearer, <jwt>`.

### 7.1 Lifecycle & Connection State Machine

```
[ Disconnected ]
       │
       ▼ (WS Handshake + Ticket/JWT Validation)
[ Connected: Authenticated ]
       │
       ▼ (JOIN_BATTLE message)
[ In Battle: Synchronizing Circuit AST & Metrics ]
       │
       ├─────────────────────────────────────────┐
       ▼ (Heartbeat 30s: PING / PONG)           ▼ (Battle Target Reached / Timer Expired)
[ Active Liveness Maintained ]              [ BATTLE_CONCLUDED Event ]
                                                 │
                                                 ▼
                                            [ Teardown & Disconnect ]
```

### 7.2 Message Protocols (JSON Payloads)

#### Client $\to$ Server: Join Battle Room
```json
{
  "type": "JOIN_BATTLE",
  "battle_id": "btl_77af01",
  "user_id": "usr_94b8e21a"
}
```

#### Client $\to$ Server: Circuit Delta Update (Debounced at 150ms)
```json
{
  "type": "CIRCUIT_DELTA",
  "battle_id": "btl_77af01",
  "timestamp": 1772960120,
  "circuit_depth": 4,
  "two_qubit_count": 2,
  "current_fidelity": 0.8540
}
```

#### Server $\to$ Client: Opponent Metrics Broadcast
```json
{
  "type": "OPPONENT_CIRCUIT_DELTA",
  "opponent_id": "usr_11cc84b",
  "opponent_username": "qubit_master",
  "opponent_depth": 5,
  "opponent_two_qubit_count": 3,
  "opponent_fidelity": 0.7071
}
```

#### Server $\to$ Client: Battle Time Tick (Every 5 seconds)
```json
{
  "type": "TIME_TICK",
  "seconds_remaining": 145,
  "status": "IN_PROGRESS"
}
```

#### Server $\to$ Client: Battle Concluded Event
```json
{
  "type": "BATTLE_CONCLUDED",
  "winner_id": "usr_94b8e21a",
  "reason": "TARGET_FIDELITY_REACHED_FIRST",
  "final_metrics": {
    "usr_94b8e21a": { "fidelity": 0.9999, "depth": 3, "xp_earned": 250 },
    "usr_11cc84b": { "fidelity": 0.7071, "depth": 5, "xp_earned": 50 }
  }
}
```

### 7.3 Heartbeat, Timeout & Resumption Guarantees
- **Ping / Pong Heartbeat**: Client transmits `{"type": "PING", "timestamp": 1772960000}` every 30 seconds. Server responds with `{"type": "PONG", "timestamp": 1772960000}`.
- **Dead Connection Teardown**: If the server receives no messages from a client for 90 seconds, the socket is severed with code `1001 Going Away` and an opponent forfeit is triggered after a 30-second disconnect buffer.
- **Reconnection & Resumption Flow**:
  - Reconnection employs exponential backoff: `1s, 2s, 4s, 8s, up to 30s max` with $\pm 20\%$ jitter.
  - Clients can resume state by providing `?last_event_id=evt_88301` upon reconnecting. Redis Streams buffer events for 120 seconds, replaying missed room state seamlessly.
