// =============================================================================
// quantangle-wasm-engine — Quantum Gate Module
// =============================================================================
// Implements all 13 quantum gates specified in SIMULATION_SPEC.md:
//   Single-qubit: H, X, Y, Z, S, T, RX, RY, RZ, U3
//   Two-qubit:    CX (CNOT), CZ, SWAP
//
// Uses the high-performance in-place statevector update algorithm from
// SIMULATION_SPEC.md §4 — O(2^n) time, O(1) auxiliary space.
//
// Endianness: Little-Endian (Qiskit standard). q_0 is LSB.
// =============================================================================

use crate::complex::{Complex64, ZERO, ONE, I, NEG_I, FRAC_1_SQRT2, from_polar};
use crate::statevector::Statevector;
use std::f64::consts::FRAC_PI_4;

/// A 2×2 unitary matrix represented as [[a, b], [c, d]].
pub type UnitaryMatrix2x2 = [[Complex64; 2]; 2];

// ===========================================================================
// Gate Matrix Constructors
// ===========================================================================

/// Hadamard gate: H = (1/√2) [[1, 1], [1, -1]]
pub fn gate_h() -> UnitaryMatrix2x2 {
    [
        [FRAC_1_SQRT2, FRAC_1_SQRT2],
        [FRAC_1_SQRT2, Complex64::new(-std::f64::consts::FRAC_1_SQRT_2, 0.0)],
    ]
}

/// Pauli-X gate (NOT): X = [[0, 1], [1, 0]]
pub fn gate_x() -> UnitaryMatrix2x2 {
    [
        [ZERO, ONE],
        [ONE, ZERO],
    ]
}

/// Pauli-Y gate: Y = [[0, -i], [i, 0]]
pub fn gate_y() -> UnitaryMatrix2x2 {
    [
        [ZERO, NEG_I],
        [I, ZERO],
    ]
}

/// Pauli-Z gate: Z = [[1, 0], [0, -1]]
pub fn gate_z() -> UnitaryMatrix2x2 {
    [
        [ONE, ZERO],
        [ZERO, Complex64::new(-1.0, 0.0)],
    ]
}

/// S gate (Phase gate, π/2 rotation): S = [[1, 0], [0, i]]
pub fn gate_s() -> UnitaryMatrix2x2 {
    [
        [ONE, ZERO],
        [ZERO, I],
    ]
}

/// T gate (π/4 rotation): T = [[1, 0], [0, e^{iπ/4}]]
pub fn gate_t() -> UnitaryMatrix2x2 {
    let t_phase = from_polar(1.0, FRAC_PI_4);
    [
        [ONE, ZERO],
        [ZERO, t_phase],
    ]
}

/// RX(θ) = exp(-iθX/2) = [[cos(θ/2), -i·sin(θ/2)], [-i·sin(θ/2), cos(θ/2)]]
pub fn gate_rx(theta: f64) -> UnitaryMatrix2x2 {
    let cos_half = (theta / 2.0).cos();
    let sin_half = (theta / 2.0).sin();
    [
        [Complex64::new(cos_half, 0.0), Complex64::new(0.0, -sin_half)],
        [Complex64::new(0.0, -sin_half), Complex64::new(cos_half, 0.0)],
    ]
}

/// RY(θ) = exp(-iθY/2) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
pub fn gate_ry(theta: f64) -> UnitaryMatrix2x2 {
    let cos_half = (theta / 2.0).cos();
    let sin_half = (theta / 2.0).sin();
    [
        [Complex64::new(cos_half, 0.0), Complex64::new(-sin_half, 0.0)],
        [Complex64::new(sin_half, 0.0), Complex64::new(cos_half, 0.0)],
    ]
}

/// RZ(θ) = exp(-iθZ/2) = [[e^{-iθ/2}, 0], [0, e^{iθ/2}]]
pub fn gate_rz(theta: f64) -> UnitaryMatrix2x2 {
    [
        [from_polar(1.0, -theta / 2.0), ZERO],
        [ZERO, from_polar(1.0, theta / 2.0)],
    ]
}

/// Universal single-qubit gate U3(θ, φ, λ):
/// U3 = [[cos(θ/2),           -e^{iλ}·sin(θ/2)      ],
///        [e^{iφ}·sin(θ/2),    e^{i(φ+λ)}·cos(θ/2)  ]]
pub fn gate_u3(theta: f64, phi: f64, lambda: f64) -> UnitaryMatrix2x2 {
    let cos_half = (theta / 2.0).cos();
    let sin_half = (theta / 2.0).sin();
    [
        [
            Complex64::new(cos_half, 0.0),
            -from_polar(1.0, lambda) * sin_half,
        ],
        [
            from_polar(1.0, phi) * sin_half,
            from_polar(1.0, phi + lambda) * cos_half,
        ],
    ]
}

// ===========================================================================
// In-Place Statevector Gate Application
// ===========================================================================

/// Apply a single-qubit unitary gate to the statevector in-place.
///
/// Uses the O(2^n) in-place amplitude pair update algorithm from
/// SIMULATION_SPEC.md §4. No Kronecker products are constructed.
///
/// # Arguments
/// * `sv` - The statevector to modify
/// * `target` - Target qubit index (0-indexed, little-endian)
/// * `matrix` - 2×2 unitary gate matrix [[u00, u01], [u10, u11]]
///
/// # Panics
/// Panics if target >= sv.num_qubits().
pub fn apply_single_gate(sv: &mut Statevector, target: usize, matrix: &UnitaryMatrix2x2) {
    assert!(
        target < sv.num_qubits(),
        "Target qubit {target} out of range for {}-qubit system",
        sv.num_qubits()
    );

    let u00 = matrix[0][0];
    let u01 = matrix[0][1];
    let u10 = matrix[1][0];
    let u11 = matrix[1][1];

    let step = 1usize << target;          // 2^target
    let double_step = step << 1;           // 2^(target+1)
    let total = sv.num_amplitudes();

    let mut i = 0;
    while i < total {
        for j in 0..step {
            let idx0 = i + j;
            let idx1 = idx0 + step;

            let a = sv.amplitudes[idx0];
            let b = sv.amplitudes[idx1];

            sv.amplitudes[idx0] = u00 * a + u01 * b;
            sv.amplitudes[idx1] = u10 * a + u11 * b;
        }
        i += double_step;
    }
}

/// Apply a Controlled-NOT (CX/CNOT) gate in-place.
///
/// For each basis state where the control bit is 1 and the target bit is 0,
/// swap amplitudes with the paired state where the target bit is 1.
///
/// Follows SIMULATION_SPEC.md §4 CX algorithm with Little-Endian ordering.
///
/// # Arguments
/// * `sv` - The statevector to modify
/// * `control` - Control qubit index
/// * `target` - Target qubit index
pub fn apply_cx(sv: &mut Statevector, control: usize, target: usize) {
    assert!(
        control < sv.num_qubits() && target < sv.num_qubits(),
        "Qubit indices out of range: control={control}, target={target}, qubits={}",
        sv.num_qubits()
    );
    assert_ne!(control, target, "Control and target qubits must be different");

    let total = sv.num_amplitudes();

    for i in 0..total {
        // Only process states where control bit is 1 AND target bit is 0
        if ((i >> control) & 1) == 1 && ((i >> target) & 1) == 0 {
            let paired_idx = i | (1 << target);
            sv.amplitudes.swap(i, paired_idx);
        }
    }
}

/// Apply a Controlled-Z (CZ) gate in-place.
///
/// Negates the phase of basis states where both control and target qubits are |1⟩.
/// CZ is symmetric: CZ(a,b) = CZ(b,a).
///
/// # Arguments
/// * `sv` - The statevector to modify
/// * `qubit_a` - First qubit index
/// * `qubit_b` - Second qubit index
pub fn apply_cz(sv: &mut Statevector, qubit_a: usize, qubit_b: usize) {
    assert!(
        qubit_a < sv.num_qubits() && qubit_b < sv.num_qubits(),
        "Qubit indices out of range: a={qubit_a}, b={qubit_b}, qubits={}",
        sv.num_qubits()
    );
    assert_ne!(qubit_a, qubit_b, "Qubit indices must be different");

    let total = sv.num_amplitudes();

    for i in 0..total {
        // Negate phase when both qubits are |1⟩
        if ((i >> qubit_a) & 1) == 1 && ((i >> qubit_b) & 1) == 1 {
            sv.amplitudes[i] = -sv.amplitudes[i];
        }
    }
}

/// Apply a SWAP gate in-place.
///
/// Swaps the amplitudes of basis states that differ only in qubits a and b.
///
/// # Arguments
/// * `sv` - The statevector to modify
/// * `qubit_a` - First qubit index
/// * `qubit_b` - Second qubit index
pub fn apply_swap(sv: &mut Statevector, qubit_a: usize, qubit_b: usize) {
    assert!(
        qubit_a < sv.num_qubits() && qubit_b < sv.num_qubits(),
        "Qubit indices out of range: a={qubit_a}, b={qubit_b}, qubits={}",
        sv.num_qubits()
    );
    assert_ne!(qubit_a, qubit_b, "Qubit indices must be different");

    let total = sv.num_amplitudes();

    for i in 0..total {
        let bit_a = (i >> qubit_a) & 1;
        let bit_b = (i >> qubit_b) & 1;

        // Only swap when the two bits differ (one is 0, other is 1)
        if bit_a != bit_b {
            // Compute the paired index by flipping both bits
            let paired = i ^ (1 << qubit_a) ^ (1 << qubit_b);
            if i < paired {
                sv.amplitudes.swap(i, paired);
            }
        }
    }
}

/// Dispatch a named gate operation to the appropriate gate application function.
///
/// This is the primary entry point used by the WASM bindings and simulation loop.
///
/// # Arguments
/// * `sv` - The statevector to modify
/// * `gate_name` - Gate identifier (e.g., "H", "CX", "RX")
/// * `qubits` - Target qubit indices
/// * `params` - Gate parameters (angles for rotation gates)
pub fn apply_gate(
    sv: &mut Statevector,
    gate_name: &str,
    qubits: &[usize],
    params: &[f64],
) {
    match gate_name {
        // Single-qubit gates
        "H" => apply_single_gate(sv, qubits[0], &gate_h()),
        "X" => apply_single_gate(sv, qubits[0], &gate_x()),
        "Y" => apply_single_gate(sv, qubits[0], &gate_y()),
        "Z" => apply_single_gate(sv, qubits[0], &gate_z()),
        "S" => apply_single_gate(sv, qubits[0], &gate_s()),
        "T" => apply_single_gate(sv, qubits[0], &gate_t()),
        "RX" => apply_single_gate(sv, qubits[0], &gate_rx(params[0])),
        "RY" => apply_single_gate(sv, qubits[0], &gate_ry(params[0])),
        "RZ" => apply_single_gate(sv, qubits[0], &gate_rz(params[0])),
        "U3" => apply_single_gate(sv, qubits[0], &gate_u3(params[0], params[1], params[2])),

        // Two-qubit gates
        "CX" => apply_cx(sv, qubits[0], qubits[1]),
        "CZ" => apply_cz(sv, qubits[0], qubits[1]),
        "SWAP" => apply_swap(sv, qubits[0], qubits[1]),

        // Measurement is handled at a higher level (not a unitary gate)
        "M" => {} // No-op in statevector simulation

        _ => panic!("Unknown gate: {gate_name}"),
    }
}

// ===========================================================================
// Unit Tests — Quantum Math Verification
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::complex::norm_sq;
    use crate::statevector::EPSILON;

    /// Helper: assert two complex numbers are approximately equal
    fn assert_complex_approx(actual: Complex64, expected: Complex64, msg: &str) {
        assert!(
            (actual.re - expected.re).abs() < 1e-12
                && (actual.im - expected.im).abs() < 1e-12,
            "{msg}: expected ({}, {}i), got ({}, {}i)",
            expected.re,
            expected.im,
            actual.re,
            actual.im,
        );
    }

    // -----------------------------------------------------------------------
    // Single-Qubit Gate Tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_hadamard_on_zero() {
        // H|0⟩ = (1/√2)(|0⟩ + |1⟩)
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h());

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "H|0⟩ → |0⟩ coeff");
        assert_complex_approx(sv.amplitude(1), Complex64::new(inv_sqrt2, 0.0), "H|0⟩ → |1⟩ coeff");
        assert!(sv.is_valid());
    }

    #[test]
    fn test_hadamard_on_one() {
        // H|1⟩ = (1/√2)(|0⟩ - |1⟩)
        let mut sv = Statevector::new(1);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[1] = ONE;
        apply_single_gate(&mut sv, 0, &gate_h());

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "H|1⟩ → |0⟩ coeff");
        assert_complex_approx(sv.amplitude(1), Complex64::new(-inv_sqrt2, 0.0), "H|1⟩ → |1⟩ coeff");
        assert!(sv.is_valid());
    }

    #[test]
    fn test_hadamard_involution() {
        // H·H = I: applying H twice returns to |0⟩
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h());
        apply_single_gate(&mut sv, 0, &gate_h());
        assert_complex_approx(sv.amplitude(0), ONE, "HH|0⟩ → |0⟩");
        assert_complex_approx(sv.amplitude(1), ZERO, "HH|0⟩ → |1⟩ should be 0");
    }

    #[test]
    fn test_pauli_x_bit_flip() {
        // X|0⟩ = |1⟩
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_x());
        assert_complex_approx(sv.amplitude(0), ZERO, "X|0⟩: coeff of |0⟩");
        assert_complex_approx(sv.amplitude(1), ONE, "X|0⟩: coeff of |1⟩");
    }

    #[test]
    fn test_pauli_y() {
        // Y|0⟩ = i|1⟩
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_y());
        assert_complex_approx(sv.amplitude(0), ZERO, "Y|0⟩: coeff of |0⟩");
        assert_complex_approx(sv.amplitude(1), I, "Y|0⟩: coeff of |1⟩");
    }

    #[test]
    fn test_pauli_z() {
        // Z|+⟩ = |−⟩ (first put in |+⟩ with H)
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h()); // |+⟩
        apply_single_gate(&mut sv, 0, &gate_z()); // |−⟩

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "Z|+⟩ → |−⟩: |0⟩ coeff");
        assert_complex_approx(sv.amplitude(1), Complex64::new(-inv_sqrt2, 0.0), "Z|+⟩ → |−⟩: |1⟩ coeff");
    }

    #[test]
    fn test_s_gate() {
        // S|1⟩ = i|1⟩
        let mut sv = Statevector::new(1);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[1] = ONE;
        apply_single_gate(&mut sv, 0, &gate_s());
        assert_complex_approx(sv.amplitude(0), ZERO, "S|1⟩: coeff of |0⟩");
        assert_complex_approx(sv.amplitude(1), I, "S|1⟩: coeff of |1⟩");
    }

    #[test]
    fn test_t_gate() {
        // T|1⟩ = e^{iπ/4}|1⟩
        let mut sv = Statevector::new(1);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[1] = ONE;
        apply_single_gate(&mut sv, 0, &gate_t());
        let expected = from_polar(1.0, FRAC_PI_4);
        assert_complex_approx(sv.amplitude(0), ZERO, "T|1⟩: coeff of |0⟩");
        assert_complex_approx(sv.amplitude(1), expected, "T|1⟩: coeff of |1⟩");
    }

    #[test]
    fn test_rx_pi() {
        // RX(π)|0⟩ = -i|1⟩
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_rx(PI));
        assert!((norm_sq(sv.amplitude(0))).abs() < 1e-12, "RX(π)|0⟩: |0⟩ prob should be 0");
        assert!((norm_sq(sv.amplitude(1)) - 1.0).abs() < 1e-12, "RX(π)|0⟩: |1⟩ prob should be 1");
    }

    #[test]
    fn test_ry_pi() {
        // RY(π)|0⟩ = |1⟩
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_ry(PI));
        assert!((norm_sq(sv.amplitude(0))).abs() < 1e-12, "RY(π)|0⟩: |0⟩ prob should be 0");
        assert!((norm_sq(sv.amplitude(1)) - 1.0).abs() < 1e-12, "RY(π)|0⟩: |1⟩ prob should be 1");
    }

    #[test]
    fn test_rz_pi() {
        // RZ(π)|+⟩ should rotate phase
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h()); // |+⟩
        apply_single_gate(&mut sv, 0, &gate_rz(PI));
        assert!(sv.is_valid());
    }

    // -----------------------------------------------------------------------
    // Two-Qubit Gate Tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_cx_bell_state() {
        // Create Bell state: CX(H⊗I)|00⟩ = (1/√2)(|00⟩ + |11⟩)
        let mut sv = Statevector::new(2);
        apply_single_gate(&mut sv, 0, &gate_h()); // H on qubit 0
        apply_cx(&mut sv, 0, 1);                   // CX: control=0, target=1

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "Bell |00⟩");
        assert_complex_approx(sv.amplitude(1), ZERO, "Bell |01⟩");
        assert_complex_approx(sv.amplitude(2), ZERO, "Bell |10⟩");
        assert_complex_approx(sv.amplitude(3), Complex64::new(inv_sqrt2, 0.0), "Bell |11⟩");
        assert!(sv.is_valid());
    }

    #[test]
    fn test_cx_endianness_control0_target1() {
        // Little-endian: CX with control=0, target=1
        // |01⟩ (index 1) → |11⟩ (index 3)
        let mut sv = Statevector::new(2);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[1] = ONE; // |01⟩: q0=1, q1=0
        apply_cx(&mut sv, 0, 1);
        // Control (q0) is 1, so target (q1) flips: |01⟩ → |11⟩
        assert_complex_approx(sv.amplitude(1), ZERO, "CX|01⟩: |01⟩ should be 0");
        assert_complex_approx(sv.amplitude(3), ONE, "CX|01⟩: |11⟩ should be 1");
    }

    #[test]
    fn test_cx_endianness_control1_target0() {
        // CX with control=1, target=0
        // |10⟩ (index 2) → |11⟩ (index 3)
        let mut sv = Statevector::new(2);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[2] = ONE; // |10⟩: q0=0, q1=1
        apply_cx(&mut sv, 1, 0);
        // Control (q1) is 1, so target (q0) flips: |10⟩ → |11⟩
        assert_complex_approx(sv.amplitude(2), ZERO, "CX_{1→0}|10⟩: |10⟩ should be 0");
        assert_complex_approx(sv.amplitude(3), ONE, "CX_{1→0}|10⟩: |11⟩ should be 1");
    }

    #[test]
    fn test_cx_no_flip_when_control_zero() {
        // CX should not flip when control is 0
        let mut sv = Statevector::new(2);
        // |00⟩ — control qubit 0 is 0, so no flip
        apply_cx(&mut sv, 0, 1);
        assert_complex_approx(sv.amplitude(0), ONE, "CX|00⟩: should remain |00⟩");
    }

    #[test]
    fn test_cz_gate() {
        // CZ|11⟩ = -|11⟩
        let mut sv = Statevector::new(2);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[3] = ONE; // |11⟩
        apply_cz(&mut sv, 0, 1);
        assert_complex_approx(sv.amplitude(3), Complex64::new(-1.0, 0.0), "CZ|11⟩ = -|11⟩");
    }

    #[test]
    fn test_cz_no_flip_other_states() {
        // CZ should not affect |00⟩, |01⟩, |10⟩
        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        let mut sv = Statevector::new(2);
        // Create |+0⟩ = (1/√2)(|00⟩ + |01⟩)
        apply_single_gate(&mut sv, 0, &gate_h());
        let amp_before_00 = sv.amplitude(0);
        let amp_before_01 = sv.amplitude(1);
        apply_cz(&mut sv, 0, 1);
        // |00⟩ and |01⟩ should be unchanged (control or target is 0 in at least one)
        // Wait: CZ only negates when BOTH are 1. |01⟩ has q0=1, q1=0 — not both 1.
        assert_complex_approx(sv.amplitude(0), amp_before_00, "CZ doesn't affect |00⟩");
        assert_complex_approx(sv.amplitude(1), amp_before_01, "CZ doesn't affect |01⟩");
    }

    #[test]
    fn test_swap_gate() {
        // SWAP|01⟩ = |10⟩ (swaps qubit 0 and qubit 1)
        let mut sv = Statevector::new(2);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[1] = ONE; // |01⟩: q0=1, q1=0
        apply_swap(&mut sv, 0, 1);
        assert_complex_approx(sv.amplitude(1), ZERO, "SWAP|01⟩: |01⟩ should be 0");
        assert_complex_approx(sv.amplitude(2), ONE, "SWAP|01⟩: |10⟩ should be 1");
    }

    #[test]
    fn test_swap_symmetric() {
        // SWAP(a,b) = SWAP(b,a)
        let mut sv1 = Statevector::new(2);
        sv1.amplitudes[0] = ZERO;
        sv1.amplitudes[1] = ONE;
        apply_swap(&mut sv1, 0, 1);

        let mut sv2 = Statevector::new(2);
        sv2.amplitudes[0] = ZERO;
        sv2.amplitudes[1] = ONE;
        apply_swap(&mut sv2, 1, 0);

        for i in 0..4 {
            assert_complex_approx(sv1.amplitude(i), sv2.amplitude(i), &format!("SWAP symmetry at index {i}"));
        }
    }

    // -----------------------------------------------------------------------
    // Multi-qubit integration tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_ghz_3_qubit() {
        // GHZ state: (1/√2)(|000⟩ + |111⟩)
        // Circuit: H(q0), CX(0,1), CX(0,2)
        let mut sv = Statevector::new(3);
        apply_single_gate(&mut sv, 0, &gate_h());
        apply_cx(&mut sv, 0, 1);
        apply_cx(&mut sv, 0, 2);

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        // |000⟩ = index 0, |111⟩ = index 7
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "GHZ |000⟩");
        assert_complex_approx(sv.amplitude(7), Complex64::new(inv_sqrt2, 0.0), "GHZ |111⟩");
        // All other amplitudes should be 0
        for i in 1..7 {
            assert_complex_approx(sv.amplitude(i), ZERO, &format!("GHZ index {i} should be 0"));
        }
        assert!(sv.is_valid());
    }

    #[test]
    fn test_apply_gate_dispatch() {
        // Test the dispatch function
        let mut sv = Statevector::new(2);
        apply_gate(&mut sv, "H", &[0], &[]);
        apply_gate(&mut sv, "CX", &[0, 1], &[]);

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "Dispatch Bell |00⟩");
        assert_complex_approx(sv.amplitude(3), Complex64::new(inv_sqrt2, 0.0), "Dispatch Bell |11⟩");
    }

    #[test]
    fn test_normalization_after_many_gates() {
        // Apply many gates and verify normalization is preserved
        let mut sv = Statevector::new(4);
        for _ in 0..20 {
            apply_single_gate(&mut sv, 0, &gate_h());
            apply_cx(&mut sv, 0, 1);
            apply_single_gate(&mut sv, 2, &gate_t());
            apply_swap(&mut sv, 1, 3);
            apply_single_gate(&mut sv, 3, &gate_ry(1.23));
            apply_cz(&mut sv, 2, 3);
        }
        assert!(
            sv.is_valid(),
            "Normalization drift after 20 rounds: Σ|α|² = {}",
            sv.norm_squared()
        );
    }

    #[test]
    fn test_hadamard_on_qubit1_of_2qubit_system() {
        // H on qubit 1 of |00⟩ → (1/√2)(|00⟩ + |10⟩)
        let mut sv = Statevector::new(2);
        apply_single_gate(&mut sv, 1, &gate_h());

        let inv_sqrt2 = std::f64::consts::FRAC_1_SQRT_2;
        // |00⟩ = index 0, |10⟩ = index 2
        assert_complex_approx(sv.amplitude(0), Complex64::new(inv_sqrt2, 0.0), "H(q1)|00⟩: |00⟩");
        assert_complex_approx(sv.amplitude(1), ZERO, "H(q1)|00⟩: |01⟩");
        assert_complex_approx(sv.amplitude(2), Complex64::new(inv_sqrt2, 0.0), "H(q1)|00⟩: |10⟩");
        assert_complex_approx(sv.amplitude(3), ZERO, "H(q1)|00⟩: |11⟩");
    }
}
