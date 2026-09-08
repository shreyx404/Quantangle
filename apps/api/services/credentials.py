# =============================================================================
# Quantangle National Quantum Mission — Ed25519 Credential Service
# =============================================================================
# Implements:
# - Cryptographically signed micro-credentials co-aligned with NQM & AICTE standards
# - RFC 8032 Ed25519 asymmetric digital signatures (64-byte signature, 32-byte public key)
# - Canonical JSON serialization (RFC 8785 JSON Canonicalization Scheme principles)
# - Tamper-evident verification & diagnosis
# =============================================================================

import hashlib
import json
import time
import secrets
from typing import Dict, Any, Tuple, Optional
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

# Known NQM Competency Codes aligned with National Quantum Mission India
NQM_TRACK_MAPPINGS: Dict[str, Dict[str, str]] = {
    "foundations": {
        "title": "Quantum Foundations & Unitary Operations",
        "competency_code": "NQM-QIT-L1 (Superposition & Single-Qubit Dynamics)",
        "optimal_depth_standard": "Depth <= 2",
    },
    "entanglement": {
        "title": "Entanglement & Multi-Qubit Systems",
        "competency_code": "NQM-QIT-L2 (Bell States & GHZ Multipartite Entanglement)",
        "optimal_depth_standard": "Depth <= 3",
    },
    "bughunt": {
        "title": "Quantum Circuit Diagnostics & Bug-Hunting",
        "competency_code": "NQM-QIT-L3 (Unitary Error Analysis & Phase Correction)",
        "optimal_depth_standard": "Optimal Fidelity F >= 0.999",
    },
    "mastery": {
        "title": "Comprehensive Quantum Computing Practitioner",
        "competency_code": "NQM-QIT-MASTER (Full Platform Competency AICTE-QCOMP-2026)",
        "optimal_depth_standard": "Exemplary Circuit Optimization",
    },
}

class CredentialService:
    def __init__(self, private_seed: Optional[bytes] = None):
        """
        Initializes the service with a persistent or reproducible Ed25519 key.
        Uses a deterministic 32-byte seed for stable demonstration across restarts.
        """
        if private_seed is None:
            # Deterministic demo seed co-aligned with SIH26140 project identity
            private_seed = hashlib.sha256(b"Quantangle_SIH26140_NQM_Master_Key_2026").digest()
        
        self.private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_seed)
        self.public_key = self.private_key.public_key()
        
        self.public_key_raw_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        self.public_key_hex = self.public_key_raw_bytes.hex()
        
        self.public_key_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")
        
        # In-memory registry of issued credentials
        self.issued_store: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def canonical_serialize(data: Dict[str, Any]) -> bytes:
        """
        Deterministically serializes a dictionary to UTF-8 JSON bytes
        with alphabetically sorted keys and no extraneous whitespace.
        Ensures identical byte outputs for identical payloads across platforms.
        """
        return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")

    def issue_credential(
        self,
        recipient_name: str,
        recipient_id: str,
        track_id: str,
        fidelity_avg: float = 0.9995,
        xp_earned: int = 450,
        quests_completed: Optional[list] = None,
        custom_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates and signs a tamper-proof National Quantum Mission micro-credential.
        """
        track_info = NQM_TRACK_MAPPINGS.get(track_id, {
            "title": f"Quantum Track: {track_id.title()}",
            "competency_code": "NQM-QIT-GENERIC",
            "optimal_depth_standard": "Standard",
        })

        nonce = secrets.token_hex(3).upper()
        track_short = track_id[:3].upper()
        credential_id = f"NQM-QNTG-2026-{track_short}-{nonce}"
        issued_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        payload = {
            "credential_id": credential_id,
            "recipient_name": recipient_name,
            "recipient_id": recipient_id,
            "track_id": track_id,
            "track_title": track_info["title"],
            "nqm_competency_code": track_info["competency_code"],
            "fidelity_average": round(fidelity_avg, 5),
            "xp_earned": xp_earned,
            "quests_completed": quests_completed or [],
            "issued_at": issued_at,
            "issuer": "Quantangle National Quantum Mission Academy (SIH26140)",
            "verification_authority": "Smart India Hackathon 2026 / AICTE Standards",
        }

        if custom_metadata:
            payload["metadata"] = custom_metadata

        # Compute canonical byte representation and cryptographic signatures
        canonical_bytes = self.canonical_serialize(payload)
        sha256_hash = hashlib.sha256(canonical_bytes).hexdigest()
        
        signature_bytes = self.private_key.sign(canonical_bytes)
        signature_hex = signature_bytes.hex()

        record = {
            "credential_id": credential_id,
            "payload": payload,
            "signature": signature_hex,
            "public_key": self.public_key_hex,
            "sha256_hash": sha256_hash,
            "verification_url": f"/verify?id={credential_id}",
            "status": "active",
        }

        # Store for fast lookup
        self.issued_store[credential_id] = record
        return record

    def verify_credential(
        self,
        payload: Dict[str, Any],
        signature_hex: str,
        public_key_hex: Optional[str] = None,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Verifies the authenticity and cryptographic integrity of a credential.
        Returns (is_valid, message, diagnostics).
        """
        try:
            # 1. Parse signature
            try:
                sig_bytes = bytes.fromhex(signature_hex)
            except ValueError:
                return False, "Invalid signature format (must be 64-byte hex string)", {"reason": "HEX_DECODE_ERROR"}

            if len(sig_bytes) != 64:
                return False, f"Invalid Ed25519 signature length: {len(sig_bytes)} bytes (expected 64 bytes)", {"reason": "SIGNATURE_LENGTH_MISMATCH"}

            # 2. Determine public key
            if public_key_hex:
                try:
                    pk_bytes = bytes.fromhex(public_key_hex)
                    if len(pk_bytes) != 32:
                        return False, "Public key must be 32 bytes (64 hex characters)", {"reason": "PUBLIC_KEY_LENGTH_MISMATCH"}
                    verifier_key = ed25519.Ed25519PublicKey.from_public_bytes(pk_bytes)
                except Exception as e:
                    return False, f"Failed to parse public key: {str(e)}", {"reason": "PUBLIC_KEY_PARSE_ERROR"}
            else:
                verifier_key = self.public_key

            # 3. Serialize payload canonically
            canonical_bytes = self.canonical_serialize(payload)
            sha256_hash = hashlib.sha256(canonical_bytes).hexdigest()

            # 4. Cryptographic verification
            verifier_key.verify(sig_bytes, canonical_bytes)
            
            return True, "Authentic Credential: Cryptographically signed by Quantangle National Quantum Mission root key.", {
                "credential_id": payload.get("credential_id"),
                "sha256_hash": sha256_hash,
                "recipient": payload.get("recipient_name"),
                "track": payload.get("track_title"),
                "fidelity": payload.get("fidelity_average"),
            }

        except InvalidSignature:
            # Detect what might have been tampered with if known in store
            stored = self.issued_store.get(payload.get("credential_id", ""))
            tamper_diff = []
            if stored:
                orig_payload = stored.get("payload", {})
                for k, v in payload.items():
                    if k in orig_payload and orig_payload[k] != v:
                        tamper_diff.append(f"Field '{k}' was modified (original: '{orig_payload[k]}', tampered: '{v}')")

            msg = "Tampering Detected! Cryptographic signature does not match payload."
            if tamper_diff:
                msg += " " + "; ".join(tamper_diff)

            return False, msg, {
                "reason": "INVALID_SIGNATURE",
                "tamper_detected": True,
                "differences": tamper_diff,
            }
        except Exception as e:
            return False, f"Verification failed with unexpected error: {str(e)}", {"reason": "ERROR", "error": str(e)}

    def get_credential(self, credential_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves stored credential by unique ID."""
        return self.issued_store.get(credential_id)


# Global singleton instance
credential_service = CredentialService()
