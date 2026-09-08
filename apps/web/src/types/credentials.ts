// =============================================================================
// Quantangle Micro-Credentials & NQM Certification — TypeScript Types
// =============================================================================

export interface CredentialPayload {
  credential_id: string;
  recipient_name: string;
  recipient_id: string;
  track_id: string;
  track_title: string;
  nqm_competency_code: string;
  fidelity_average: number;
  xp_earned: number;
  quests_completed: string[];
  issued_at: string;
  issuer: string;
  verification_authority: string;
  metadata?: Record<string, unknown>;
}

export interface SignedMicroCredential {
  credential_id: string;
  payload: CredentialPayload;
  signature: string; // 128 hex chars (64 bytes)
  public_key: string; // 64 hex chars (32 bytes)
  sha256_hash: string;
  verification_url: string;
  status: "active" | "revoked";
}

export interface CredentialVerificationResult {
  valid: boolean;
  message: string;
  diagnostics: {
    reason?: string;
    tamper_detected?: boolean;
    differences?: string[];
    credential_id?: string;
    sha256_hash?: string;
    recipient?: string;
    track?: string;
    fidelity?: number;
  };
  credential_id?: string;
  sha256_hash?: string;
  public_key_fingerprint: string;
}

export interface TrackCredentialInfo {
  trackId: "foundations" | "entanglement" | "bughunt" | "mastery";
  title: string;
  subtitle: string;
  nqmCode: string;
  totalQuests: number;
  requiredFidelity: number;
  description: string;
  badgeTitle: string;
}
