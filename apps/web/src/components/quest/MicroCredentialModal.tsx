// =============================================================================
// MicroCredentialModal — National Quantum Mission Verifiable Credential Studio
// =============================================================================
// Features:
// - Ed25519 digitally signed certificate with high-precision laboratory styling
// - Real-time QR code generation pointing to /verify?id=...
// - Interactive live cryptographic verification against master public key
// - Live Tamper Demonstration Mode for SIH judges (proves mathematical tamper-resistance)
// - Export to PDF/Print, JSON credential download, and clipboard link copying
// Follows Superconducting Quantum Workstation anti-slop guidelines.
// =============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuestStore } from "../../stores/useQuestStore";
import {
  generateQRCodeDataUrl,
  verifyCredentialAPI,
} from "../../lib/credentialClient";
import type {
  SignedMicroCredential,
  CredentialVerificationResult,
  CredentialPayload,
} from "../../types/credentials";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Download,
  ExternalLink,
  X,
  Lock,
  KeyRound,
  FileCheck2,
  RefreshCw,
  QrCode,
  Sparkles,
} from "lucide-react";

export const MicroCredentialModal: React.FC = () => {
  const {
    isCredentialModalOpen,
    closeCredentialModal,
    selectedCredentialId,
    issuedCredentials,
    totalXP,
  } = useQuestStore();

  const [activeTab, setActiveTab] = useState<"certificate" | "crypto" | "tamper">("certificate");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<CredentialVerificationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Tamper demonstration state
  const [isTamperingActive, setIsTamperingActive] = useState<boolean>(false);
  const [tamperType, setTamperType] = useState<"name" | "fidelity" | "signature">("name");

  // Get active credential
  const credential: SignedMicroCredential | undefined =
    (selectedCredentialId ? issuedCredentials[selectedCredentialId] : undefined) ||
    Object.values(issuedCredentials)[0];

  // Re-generate QR code whenever credential changes
  useEffect(() => {
    if (!credential) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const verifyUrl = `${origin}${credential.verification_url}`;
    generateQRCodeDataUrl(verifyUrl).then(setQrCodeUrl);
    setVerificationResult(null);
    setIsTamperingActive(false);
  }, [credential]);

  if (!isCredentialModalOpen || !credential) {
    return null;
  }

  // Generate payload representation (tampered if toggle is active)
  const displayPayload: CredentialPayload = isTamperingActive
    ? {
        ...credential.payload,
        recipient_name:
          tamperType === "name"
            ? "Eve Attacker (Forged Identity)"
            : credential.payload.recipient_name,
        fidelity_average:
          tamperType === "fidelity" ? 1.0 : credential.payload.fidelity_average,
      }
    : credential.payload;

  const displaySignature =
    isTamperingActive && tamperType === "signature"
      ? credential.signature.slice(0, -4) + "0000"
      : credential.signature;

  // Live verification runner
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyCredentialAPI(displayPayload, displaySignature);
      setVerificationResult(result);
    } catch (e) {
      console.error("Verification failed:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}${credential.verification_url}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(credential, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${credential.credential_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090d18] border border-[#1e293b] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-[#0c1220] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="credential-modal-title" className="text-sm font-semibold text-white tracking-tight">
                  National Quantum Mission — Verifiable Micro-Credential
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Ed25519 Signed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AICTE & NQM Competency Standard · SIH26140 Certified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher tabs */}
            <div className="flex items-center bg-[#060911] p-0.5 rounded-lg border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab("certificate")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "certificate"
                    ? "bg-[#162035] text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Certificate
              </button>
              <button
                onClick={() => setActiveTab("crypto")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "crypto"
                    ? "bg-[#162035] text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Audit & Hashes
              </button>
              <button
                onClick={() => setActiveTab("tamper")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "tamper"
                    ? "bg-amber-500/20 text-amber-300 font-medium shadow-sm border border-amber-500/30"
                    : "text-amber-400/80 hover:text-amber-300"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Judge Tamper Demo</span>
              </button>
            </div>

            <button
              onClick={closeCredentialModal}
              aria-label="Close credential modal"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#070b14]">
          {activeTab === "certificate" && (
            <div className="space-y-6">
              {/* The Official Certificate Parchment Card */}
              <div
                id="printable-certificate"
                className="relative rounded-2xl bg-gradient-to-b from-[#0e1526] to-[#080d19] border-2 border-amber-500/30 p-8 shadow-2xl overflow-hidden text-slate-200"
              >
                {/* Decorative Titanium & Copper Circuit Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

                {/* Micro Quantum Circuit Background Watermark */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-amber-500/20 pb-6 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex-shrink-0">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono tracking-widest uppercase text-amber-400/90 font-semibold">
                        Government of India · National Quantum Mission
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                        Verifiable Quantum Micro-Credential
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Aligned with AICTE Quantum Competency Framework (SIH26140)
                      </p>
                    </div>
                  </div>

                  {/* NQM Standard Stamp */}
                  <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Competency Code</div>
                    <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                      {displayPayload.nqm_competency_code}
                    </div>
                  </div>
                </div>

                {/* Recipient & Achievement Section */}
                <div className="py-8 space-y-6 text-center sm:text-left">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                      This is cryptographically certified to
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                      {displayPayload.recipient_name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Student ID: {displayPayload.recipient_id}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                      For rigorous mastery and verified implementation of
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-cyan-300 mt-1">
                      {displayPayload.track_title}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Demonstrated mathematical accuracy in unitary gate construction, state preparation, and circuit optimization with zero tolerance for non-physical states.
                    </p>
                  </div>

                  {/* Metrics Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#090e1a] border border-white/[0.06]">
                      <div className="text-[10px] uppercase font-mono text-slate-400">State Fidelity</div>
                      <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        F = {(displayPayload.fidelity_average * 100).toFixed(2)}%
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Threshold: F ≥ 0.999</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090e1a] border border-white/[0.06]">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Curriculum Score</div>
                      <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                        {displayPayload.xp_earned} XP
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Full Track Cleared</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090e1a] border border-white/[0.06]">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Issued Date</div>
                      <div className="text-sm font-mono text-slate-200 mt-0.5">
                        {displayPayload.issued_at.split("T")[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">UTC Timestamp</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090e1a] border border-white/[0.06]">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Endian Standard</div>
                      <div className="text-sm font-mono text-slate-200 mt-0.5">Little-Endian</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">q0 = LSB (Qiskit standard)</div>
                    </div>
                  </div>
                </div>

                {/* Certificate Footer & Verification QR Code */}
                <div className="border-t border-amber-500/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Cryptographic Proof Strip */}
                  <div className="space-y-1.5 text-xs font-mono max-w-md">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ed25519 Digital Signature Hash:</span>
                    </div>
                    <div className="text-[10px] text-slate-400 break-all bg-black/40 p-2 rounded-lg border border-white/[0.05]">
                      {displaySignature.slice(0, 48)}...{displaySignature.slice(-16)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Certificate ID:{" "}
                      <span className="text-amber-300 font-bold">{displayPayload.credential_id}</span>
                    </div>
                  </div>

                  {/* QR Code and Authority Seal */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-semibold text-white">Scan to Verify</div>
                      <div className="text-[10px] text-slate-400">Instant Public Audit</div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-1">/verify?id={displayPayload.credential_id.slice(-8)}</div>
                    </div>

                    {qrCodeUrl ? (
                      <div className="p-1.5 bg-white rounded-xl shadow-lg">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code for Credential Verification"
                          className="w-20 h-20"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunVerification}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-medium text-xs flex items-center gap-2 transition-all active:translate-y-[1px]"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Verify Cryptographic Signature</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#1f293d] border border-white/[0.08] text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "Link Copied! ✓" : "Copy Link"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadJSON}
                    className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#1f293d] border border-white/[0.08] text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                    title="Download verifiable JSON credential document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-xs flex items-center gap-1.5 transition-colors active:translate-y-[1px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>

              {/* Real-time Verification Output Banner */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                    verificationResult.valid
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  }`}
                >
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-semibold text-xs flex items-center gap-2">
                      <span>
                        {verificationResult.valid
                          ? "AUTHENTIC & VERIFIED: Signature Matched Public Key"
                          : "TAMPERING DETECTED: Invalid Cryptographic Signature"}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/[0.08]">
                        Ed25519 64-byte check
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {verificationResult.message}
                    </p>
                    {verificationResult.sha256_hash && (
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Canonical SHA-256 Digest: {verificationResult.sha256_hash}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "crypto" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/[0.06] space-y-4">
                <div className="flex items-center gap-2 text-white text-xs font-semibold">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Ed25519 Asymmetric Cryptography Protocol</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every micro-credential is signed using an Edwards-curve Digital Signature Algorithm (Ed25519 / RFC 8032). The signature is mathematically bound to the canonical JSON serialization of the learner's achievement record. Altering even a single bit in the recipient name, track title, or fidelity score invalidates the 64-byte signature.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Master Authority Public Key (Hex 32-bytes):</span>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] text-cyan-300 break-all text-[11px] mt-1">
                      {credential.public_key}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Ed25519 Signature (Hex 64-bytes):</span>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] text-amber-300 break-all text-[11px] mt-1">
                      {credential.signature}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Payload SHA-256 Root Hash:</span>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.06] text-emerald-300 break-all text-[11px] mt-1">
                      {credential.sha256_hash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220] border border-white/[0.06] space-y-2">
                <div className="text-xs font-semibold text-white">Canonical Payload Structure</div>
                <pre className="p-3 rounded-lg bg-black/60 border border-white/[0.06] text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(credential.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "tamper" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Interactive Tampering Demonstration for SIH26140 Judges</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This interactive tool allows evaluators to simulate real-world credential tampering attempts. Choose a field below to forge, and watch the mathematical Ed25519 verification engine instantly detect the unauthorized alteration without relying on a centralized database.
                </p>

                {/* Tamper Mode Radio Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setIsTamperingActive(true);
                      setTamperType("name");
                      setVerificationResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isTamperingActive && tamperType === "name"
                        ? "bg-amber-500/20 border-amber-500 text-white font-medium shadow"
                        : "bg-[#0c1220] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">1. Forge Recipient Name</div>
                    <div className="text-[10px] text-slate-400 mt-1">Change to &quot;Eve Attacker&quot;</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsTamperingActive(true);
                      setTamperType("fidelity");
                      setVerificationResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isTamperingActive && tamperType === "fidelity"
                        ? "bg-amber-500/20 border-amber-500 text-white font-medium shadow"
                        : "bg-[#0c1220] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">2. Inflate Fidelity Score</div>
                    <div className="text-[10px] text-slate-400 mt-1">Force fidelity to 100.0%</div>
                  </button>

                  <button
                    onClick={() => {
                      setIsTamperingActive(true);
                      setTamperType("signature");
                      setVerificationResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isTamperingActive && tamperType === "signature"
                        ? "bg-amber-500/20 border-amber-500 text-white font-medium shadow"
                        : "bg-[#0c1220] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">3. Corrupt Signature</div>
                    <div className="text-[10px] text-slate-400 mt-1">Flip hex bits at end</div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs">
                    Current Status:{" "}
                    {isTamperingActive ? (
                      <span className="font-semibold text-amber-400 font-mono">
                        TAMPERED PAYLOAD ACTIVE ({tamperType.toUpperCase()})
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-400 font-mono">
                        GENUINE UNALTERED CREDENTIAL
                      </span>
                    )}
                  </div>

                  {isTamperingActive && (
                    <button
                      onClick={() => {
                        setIsTamperingActive(false);
                        setVerificationResult(null);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs transition-colors"
                    >
                      Reset to Genuine Data
                    </button>
                  )}
                </div>
              </div>

              {/* Action test button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunVerification}
                  disabled={isVerifying}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold text-xs flex items-center gap-2 transition-all active:translate-y-[1px]"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Test Cryptographic Verification on Current State</span>
                </button>
              </div>

              {/* Verification Feedback in Tamper View */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                    verificationResult.valid
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  }`}
                >
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-semibold text-xs">
                      {verificationResult.valid
                        ? "AUTHENTIC: Payload matched Ed25519 signature."
                        : "SECURITY ALERT: TAMPERING DETECTED!"}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
