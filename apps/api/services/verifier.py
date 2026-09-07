"""
Quantangle — Unitary Verification Pipeline
Evaluates quantum state fidelity F = |<psi_target | psi_student>|^2
Enforces the Prime Directive: Verified Circuit Generation (F >= 0.999)
"""

import numpy as np
from typing import Dict, Any, Tuple


def compute_state_fidelity(
    target_statevector: np.ndarray,
    student_statevector: np.ndarray,
    threshold: float = 0.999,
) -> Tuple[float, bool, Dict[str, Any]]:
    """
    Compute state fidelity F = |<psi_target | psi_student>|^2.
    
    Returns:
        (fidelity, passed, diagnostic_info)
    """
    psi_t = np.asarray(target_statevector, dtype=complex)
    psi_s = np.asarray(student_statevector, dtype=complex)

    if psi_t.shape != psi_s.shape:
        raise ValueError(
            f"Dimension mismatch: target shape {psi_t.shape} vs student shape {psi_s.shape}"
        )

    # Normalize vectors
    norm_t = np.linalg.norm(psi_t)
    norm_s = np.linalg.norm(psi_s)

    if norm_t > 0:
        psi_t = psi_t / norm_t
    if norm_s > 0:
        psi_s = psi_s / norm_s

    # Inner product <psi_t | psi_s>
    inner_prod = np.vdot(psi_t, psi_s)
    fidelity = float(np.abs(inner_prod) ** 2)

    passed = fidelity >= threshold

    diagnostic: Dict[str, Any] = {
        "fidelity": round(fidelity, 6),
        "threshold": threshold,
        "passed": passed,
        "inner_product_real": float(np.real(inner_prod)),
        "inner_product_imag": float(np.imag(inner_prod)),
        "phase_difference_rad": float(np.angle(inner_prod)),
    }

    if not passed:
        # Determine likely failure mode
        prob_t = np.abs(psi_t) ** 2
        prob_s = np.abs(psi_s) ** 2
        prob_diff = np.max(np.abs(prob_t - prob_s))

        if prob_diff < 0.05:
            diagnostic["diagnosis"] = (
                "Basis probabilities match, but relative phase is incorrect (Phase Error). "
                "Check Z, S, or T gates."
            )
        else:
            diagnostic["diagnosis"] = (
                f"Basis probability divergence max = {prob_diff:.3f}. "
                "Bit-flip or entanglement structure does not match target state."
            )

    return fidelity, passed, diagnostic
