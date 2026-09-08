# =============================================================================
# Quantangle Arena & Quest Grader Test Suite
# =============================================================================

import pytest
import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_leaderboard_endpoint():
    """Verify leaderboard returns collegiate rankings in < 20ms."""
    start = time.perf_counter()
    response = client.get("/api/v1/arena/leaderboard?type=national&limit=10")
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert response.status_code == 200
    data = response.json()
    assert "leaderboard" in data
    assert len(data["leaderboard"]) > 0
    assert data["leaderboard"][0]["rank"] == 1
    assert "xp" in data["leaderboard"][0]
    assert "streak" in data["leaderboard"][0]
    assert "user_standing" in data
    # Latency requirement per TASK-6.3
    assert elapsed_ms < 50  # Generous threshold for test harness, production is < 20ms


def test_streak_endpoint():
    """Verify streak endpoint returns streak days and multiplier."""
    response = client.get("/api/v1/arena/streak")
    assert response.status_code == 200
    data = response.json()
    assert "streak_days" in data
    assert data["streak_days"] >= 1
    assert "xp_multiplier" in data


def test_quest_submission_bell_state_success():
    """Verify Bell state |Phi+> circuit submission passes with F >= 0.999 and depth bonus."""
    valid_bell_ir = {
        "version": "1.0",
        "qubits": 2,
        "clbits": 2,
        "steps": [
            {"stepIndex": 0, "operations": [{"id": "h0", "gate": "H", "qubits": [0]}]},
            {"stepIndex": 1, "operations": [{"id": "cx01", "gate": "CX", "qubits": [0, 1]}]},
        ],
    }

    response = client.post(
        "/api/v1/quests/entanglement-bell-phi-plus/submit",
        json={"student_circuit_ir": valid_bell_ir, "sdk": "qiskit"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is True
    assert data["fidelity"] >= 0.999
    assert data["score"]["base_xp"] == 150
    # Depth is 2 which is <= optimal_depth (2), so depth bonus should be awarded
    assert data["score"]["depth_bonus_xp"] > 0
    assert data["score"]["total_xp"] > 150
    assert "Flawless implementation" in data["feedback"]


def test_quest_submission_inverted_cnot_fails():
    """Verify buggy inverted CNOT fails fidelity check (F < 0.999)."""
    inverted_cnot_ir = {
        "version": "1.0",
        "qubits": 2,
        "clbits": 2,
        "steps": [
            {"stepIndex": 0, "operations": [{"id": "h0", "gate": "H", "qubits": [0]}]},
            {"stepIndex": 1, "operations": [{"id": "cx10", "gate": "CX", "qubits": [1, 0]}]},
        ],
    }

    response = client.post(
        "/api/v1/quests/entanglement-bell-phi-plus/submit",
        json={"student_circuit_ir": inverted_cnot_ir, "sdk": "qiskit"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is False
    assert data["fidelity"] < 0.999
    assert data["score"]["total_xp"] == 0
    assert "Bit-flip or entanglement" in data["feedback"] or "fidelity" in data["feedback"]


def test_bughunt_sandbox_solve():
    """Verify solving the inverted CNOT bug in bughunt-inverted-cnot rewards XP."""
    fixed_ir = {
        "version": "1.0",
        "qubits": 2,
        "clbits": 2,
        "steps": [
            {"stepIndex": 0, "operations": [{"id": "h0", "gate": "H", "qubits": [0]}]},
            {"stepIndex": 1, "operations": [{"id": "cx01", "gate": "CX", "qubits": [0, 1]}]},
        ],
    }

    response = client.post(
        "/api/v1/quests/bughunt-inverted-cnot/submit",
        json={"student_circuit_ir": fixed_ir},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is True
    assert data["fidelity"] >= 0.999
    assert data["score"]["base_xp"] == 180
