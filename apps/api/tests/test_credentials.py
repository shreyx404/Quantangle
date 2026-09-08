# =============================================================================
# Quantangle Micro-Credentials & Ed25519 Verification Test Suite
# =============================================================================

import pytest
import copy
from fastapi.testclient import TestClient
from cryptography.hazmat.primitives.asymmetric import ed25519
from main import app
from services.credentials import credential_service

client = TestClient(app)

def test_public_key_endpoint():
    """Verify master public key endpoint returns valid Ed25519 key."""
    response = client.get("/api/v1/credentials/public-key")
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "Ed25519 / RFC 8032"
    assert "public_key_hex" in data
    assert len(data["public_key_hex"]) == 64  # 32 bytes = 64 hex characters
    assert "BEGIN PUBLIC KEY" in data["public_key_pem"]


def test_list_tracks():
    """Verify tracks endpoint lists NQM competencies."""
    response = client.get("/api/v1/credentials/tracks")
    assert response.status_code == 200
    data = response.json()
    assert "tracks" in data
    assert len(data["tracks"]) >= 3
    track_ids = [t["track_id"] for t in data["tracks"]]
    assert "foundations" in track_ids
    assert "entanglement" in track_ids
    assert "bughunt" in track_ids


def test_issue_credential_success():
    """Verify issuing a credential for completed Foundations track."""
    payload = {
        "recipient_name": "Shreyas Sharma",
        "recipient_id": "usr_sih26140_dev",
        "track_id": "foundations",
        "fidelity_avg": 0.9995,
        "xp_earned": 450,
        "quests_completed": ["foundations-superposition", "foundations-bit-phase-flips"],
    }
    response = client.post("/api/v1/credentials/issue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["credential_id"].startswith("NQM-QNTG-2026-FOU-")
    assert len(data["signature"]) == 128  # 64 bytes = 128 hex chars
    assert len(data["sha256_hash"]) == 64  # 32 bytes = 64 hex chars
    assert data["payload"]["recipient_name"] == "Shreyas Sharma"
    assert data["payload"]["nqm_competency_code"].startswith("NQM-QIT-L1")
    assert data["payload"]["fidelity_average"] >= 0.999


def test_issue_credential_rejects_sub_threshold_fidelity():
    """Verify certificate issuance rejects fidelity < 0.999."""
    payload = {
        "recipient_name": "Test Cadet",
        "recipient_id": "usr_test",
        "track_id": "foundations",
        "fidelity_avg": 0.985,  # Violates F >= 0.999
        "xp_earned": 100,
    }
    response = client.post("/api/v1/credentials/issue", json=payload)
    assert response.status_code == 400
    assert "Fidelity requirement F >= 0.999 not satisfied" in response.json()["detail"]


def test_verify_authentic_credential():
    """Verify that a genuine signed credential passes verification."""
    # Issue credential first
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Aarav Patel",
        "recipient_id": "usr_aarav",
        "track_id": "entanglement",
        "fidelity_avg": 0.9998,
        "xp_earned": 530,
        "quests_completed": ["entanglement-bell-phi-plus", "entanglement-bell-psi-plus"],
    })
    assert issue_res.status_code == 200
    issued = issue_res.json()

    # Verify through API
    verify_res = client.post("/api/v1/credentials/verify", json={
        "payload": issued["payload"],
        "signature": issued["signature"],
    })
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["valid"] is True
    assert "Authentic Credential" in vdata["message"]
    assert vdata["credential_id"] == issued["credential_id"]


def test_verify_detects_tampered_recipient():
    """Verify tampering with the recipient name invalidates the Ed25519 signature."""
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Original Student",
        "recipient_id": "usr_orig",
        "track_id": "foundations",
        "fidelity_avg": 0.9995,
        "xp_earned": 450,
    })
    issued = issue_res.json()

    # Tamper with recipient name
    tampered_payload = copy.deepcopy(issued["payload"])
    tampered_payload["recipient_name"] = "Eve Attacker (Forged Name)"

    verify_res = client.post("/api/v1/credentials/verify", json={
        "payload": tampered_payload,
        "signature": issued["signature"],
    })
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["valid"] is False
    assert "Tampering Detected" in vdata["message"]
    assert "recipient_name" in vdata["message"]


def test_verify_detects_tampered_fidelity():
    """Verify tampering with fidelity score invalidates the signature."""
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Student A",
        "recipient_id": "usr_a",
        "track_id": "bughunt",
        "fidelity_avg": 0.9991,
        "xp_earned": 380,
    })
    issued = issue_res.json()

    # Tamper with fidelity score
    tampered_payload = copy.deepcopy(issued["payload"])
    tampered_payload["fidelity_average"] = 1.0000

    verify_res = client.post("/api/v1/credentials/verify", json={
        "payload": tampered_payload,
        "signature": issued["signature"],
    })
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["valid"] is False
    assert "Tampering Detected" in vdata["message"]


def test_verify_detects_corrupted_signature():
    """Verify corrupting signature bits fails verification."""
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Student B",
        "recipient_id": "usr_b",
        "track_id": "foundations",
    })
    issued = issue_res.json()

    # Invert the last character of the signature
    corrupted_sig = issued["signature"][:-1] + ("0" if issued["signature"][-1] != "0" else "1")

    verify_res = client.post("/api/v1/credentials/verify", json={
        "payload": issued["payload"],
        "signature": corrupted_sig,
    })
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["valid"] is False
    assert "Tampering Detected" in vdata["message"]


def test_independent_cryptographic_verification():
    """Verify signature independently using standard cryptography library."""
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Direct Crypto Verifier",
        "recipient_id": "usr_direct",
        "track_id": "entanglement",
    })
    issued = issue_res.json()

    # Get public key from public-key endpoint
    pk_res = client.get("/api/v1/credentials/public-key")
    pk_hex = pk_res.json()["public_key_hex"]

    # Reconstruct canonical bytes
    canonical_bytes = credential_service.canonical_serialize(issued["payload"])
    sig_bytes = bytes.fromhex(issued["signature"])
    pk_bytes = bytes.fromhex(pk_hex)

    # Independent Ed25519 verification
    verifier = ed25519.Ed25519PublicKey.from_public_bytes(pk_bytes)
    # Should not raise
    verifier.verify(sig_bytes, canonical_bytes)


def test_get_credential_by_id():
    """Verify fetching stored credential by ID."""
    issue_res = client.post("/api/v1/credentials/issue", json={
        "recipient_name": "Lookup Student",
        "recipient_id": "usr_lookup",
        "track_id": "foundations",
    })
    cid = issue_res.json()["credential_id"]

    get_res = client.get(f"/api/v1/credentials/{cid}")
    assert get_res.status_code == 200
    assert get_res.json()["credential_id"] == cid

    # Invalid ID returns 404
    not_found = client.get("/api/v1/credentials/NQM-NONEXISTENT")
    assert not_found.status_code == 404
