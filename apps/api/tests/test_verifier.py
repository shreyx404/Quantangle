import numpy as np
from services.verifier import compute_state_fidelity

def test_identical_states_pass():
    # |00>
    target = np.array([1.0, 0.0, 0.0, 0.0], dtype=complex)
    student = np.array([1.0, 0.0, 0.0, 0.0], dtype=complex)
    fidelity, passed, diag = compute_state_fidelity(target, student)
    assert passed
    assert abs(fidelity - 1.0) < 1e-6

def test_orthogonal_states_fail():
    # |00> vs |11>
    target = np.array([1.0, 0.0, 0.0, 0.0], dtype=complex)
    student = np.array([0.0, 0.0, 0.0, 1.0], dtype=complex)
    fidelity, passed, diag = compute_state_fidelity(target, student)
    assert not passed
    assert abs(fidelity - 0.0) < 1e-6

def test_bell_state_fidelity():
    # Bell state (|00> + |11>)/sqrt(2)
    bell = np.array([1.0 / np.sqrt(2), 0.0, 0.0, 1.0 / np.sqrt(2)], dtype=complex)
    fidelity, passed, diag = compute_state_fidelity(bell, bell)
    assert passed
    assert abs(fidelity - 1.0) < 1e-6

def test_phase_error_detection():
    # (|00> + |11>)/sqrt(2) vs (|00> - |11>)/sqrt(2)
    psi_plus = np.array([1.0 / np.sqrt(2), 0.0, 0.0, 1.0 / np.sqrt(2)], dtype=complex)
    psi_minus = np.array([1.0 / np.sqrt(2), 0.0, 0.0, -1.0 / np.sqrt(2)], dtype=complex)
    fidelity, passed, diag = compute_state_fidelity(psi_plus, psi_minus)
    assert not passed
    assert "Phase Error" in diag.get("diagnosis", "")
