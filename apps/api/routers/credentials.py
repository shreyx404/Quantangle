# =============================================================================
# Quantangle National Quantum Mission — Credentials Router
# =============================================================================
# Exposes:
# - POST /api/v1/credentials/issue: Issue & digitally sign micro-credential
# - POST /api/v1/credentials/verify: Cryptographically verify any credential payload + signature
# - GET /api/v1/credentials/{credential_id}: Lookup credential by ID
# - GET /api/v1/credentials/public-key: Fetch active Ed25519 public key (hex and PEM)
# - GET /api/v1/credentials/tracks: Fetch NQM tracks, requirements, and competencies
# =============================================================================

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List, Optional
from services.credentials import credential_service, NQM_TRACK_MAPPINGS

router = APIRouter(prefix="/credentials", tags=["Micro-Credentials"])

# ---------------------------------------------------------------------------
# Pydantic Request & Response Schemas
# ---------------------------------------------------------------------------
class IssueCredentialRequest(BaseModel):
    recipient_name: str = Field(..., description="Student legal or display name")
    recipient_id: str = Field("usr_sih26140_dev", description="Internal user ID")
    track_id: str = Field(..., description="Track identifier: foundations | entanglement | bughunt | mastery")
    fidelity_avg: Optional[float] = Field(0.9995, description="Average state fidelity achieved across track")
    xp_earned: Optional[int] = Field(450, description="Total XP earned across track")
    quests_completed: Optional[List[str]] = Field(default_factory=list, description="IDs of completed quests")


class VerifyCredentialRequest(BaseModel):
    payload: Dict[str, Any] = Field(..., description="Canonical certificate payload dictionary")
    signature: str = Field(..., description="64-byte Ed25519 signature encoded in hex")
    public_key: Optional[str] = Field(None, description="Optional 32-byte public key hex override")


class CredentialVerificationResponse(BaseModel):
    valid: bool
    message: str
    diagnostics: Dict[str, Any]
    credential_id: Optional[str] = None
    sha256_hash: Optional[str] = None
    public_key_fingerprint: str

    model_config = ConfigDict(populate_by_name=True)


class PublicKeyResponse(BaseModel):
    key_id: str
    algorithm: str
    public_key_hex: str
    public_key_pem: str
    authority: str


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@router.post(
    "/issue",
    summary="Issue & Digitally Sign a National Quantum Mission Micro-Credential",
)
async def issue_micro_credential(request: IssueCredentialRequest):
    """
    Issues an Ed25519 digitally signed credential conforming to
    National Quantum Mission competency requirements.
    """
    if request.fidelity_avg is not None and request.fidelity_avg < 0.999:
        raise HTTPException(
            status_code=400,
            detail="Fidelity requirement F >= 0.999 not satisfied for NQM certification.",
        )

    try:
        record = credential_service.issue_credential(
            recipient_name=request.recipient_name,
            recipient_id=request.recipient_id,
            track_id=request.track_id,
            fidelity_avg=request.fidelity_avg or 0.9995,
            xp_earned=request.xp_earned or 450,
            quests_completed=request.quests_completed,
        )
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to issue credential: {str(e)}")


@router.post(
    "/verify",
    response_model=CredentialVerificationResponse,
    summary="Cryptographically Verify Micro-Credential Signature & Payload",
)
async def verify_micro_credential(request: VerifyCredentialRequest):
    """
    Validates the Ed25519 signature against the payload.
    Detects tampering with recipient name, fidelity score, track, or timestamp.
    """
    is_valid, message, diag = credential_service.verify_credential(
        payload=request.payload,
        signature_hex=request.signature,
        public_key_hex=request.public_key,
    )

    return CredentialVerificationResponse(
        valid=is_valid,
        message=message,
        diagnostics=diag,
        credential_id=request.payload.get("credential_id"),
        sha256_hash=diag.get("sha256_hash"),
        public_key_fingerprint=credential_service.public_key_hex[:16] + "...",
    )


@router.get(
    "/public-key",
    response_model=PublicKeyResponse,
    summary="Fetch National Quantum Mission Master Public Key",
)
async def get_master_public_key():
    """
    Returns the active Ed25519 public key allowing independent verification
    by universities, employers, and hackathon judges.
    """
    return PublicKeyResponse(
        key_id="ed25519_nqm_sih26140_v1",
        algorithm="Ed25519 / RFC 8032",
        public_key_hex=credential_service.public_key_hex,
        public_key_pem=credential_service.public_key_pem,
        authority="Quantangle National Quantum Mission Academy (SIH26140)",
    )


@router.get(
    "/tracks",
    summary="List NQM Competency Tracks & Credential Criteria",
)
async def list_credential_tracks():
    """Returns available micro-credentials, standards codes, and descriptions."""
    tracks = []
    for track_id, info in NQM_TRACK_MAPPINGS.items():
        tracks.append({
            "track_id": track_id,
            "title": info["title"],
            "competency_code": info["competency_code"],
            "optimal_depth_standard": info["optimal_depth_standard"],
            "required_fidelity": 0.999,
        })
    return {"tracks": tracks}


@router.get(
    "/{credential_id}",
    summary="Lookup Issued Micro-Credential by Unique ID",
)
async def get_credential_by_id(
    credential_id: str = Path(..., description="Unique credential ID (e.g. NQM-QNTG-2026-FND-...)")
):
    """Retrieves an issued credential record from the verification registry."""
    record = credential_service.get_credential(credential_id)
    if not record:
        raise HTTPException(status_code=404, detail="Credential not found in verification registry.")
    return record
