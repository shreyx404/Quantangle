// =============================================================================
// quantangle-wasm-engine — Bloch Sphere & Partial Trace Module
// =============================================================================
// Implements reduced density matrices, Bloch vector projections, purity, and
// quantum state fidelity calculations from SIMULATION_SPEC.md §5-6.
//
// For each qubit k, the reduced density matrix ρ_k is obtained by tracing out
// all other qubits. The Bloch vector (x, y, z) is then:
//   x = Tr(ρ_k X) = 2·Re(ρ₀₁)
//   y = Tr(ρ_k Y) = -2·Im(ρ₀₁)
//   z = Tr(ρ_k Z) = ρ₀₀ - ρ₁₁
// =============================================================================

use crate::complex::{Complex64, ZERO, norm_sq};
use crate::statevector::Statevector;

/// Bloch vector coordinates for a single qubit.
#[derive(Debug, Clone, Copy)]
pub struct BlochCoordinates {
    /// X-component: Tr(ρ_k · σ_x) = 2·Re(ρ₀₁)
    pub x: f64,
    /// Y-component: Tr(ρ_k · σ_y) = -2·Im(ρ₀₁)
    pub y: f64,
    /// Z-component: Tr(ρ_k · σ_z) = ρ₀₀ - ρ₁₁
    pub z: f64,
    /// Purity r = √(x² + y² + z²) ∈ [0, 1]
    /// r = 1: pure separable state (on surface)
    /// r < 1: entangled with other qubits (inside sphere)
    /// r = 0: maximally mixed (center)
    pub purity: f64,
}

/// Compute the 2×2 reduced density matrix for qubit k by tracing out all other qubits.
///
/// Given |ψ⟩ with n qubits, the reduced density matrix is:
/// ρ_k = Tr_{k̄}(|ψ⟩⟨ψ|)
///
/// Returns [[ρ₀₀, ρ₀₁], [ρ₁₀, ρ₁₁]] where each element is Complex64.
///
/// # Arguments
/// * `sv` - The full statevector
/// * `qubit` - Index of the qubit to compute the reduced density matrix for
pub fn reduced_density_matrix(sv: &Statevector, qubit: usize) -> [[Complex64; 2]; 2] {
    assert!(
        qubit < sv.num_qubits(),
        "Qubit index {qubit} out of range for {}-qubit system",
        sv.num_qubits()
    );

    let total = sv.num_amplitudes();
    let mut rho = [[ZERO; 2]; 2];

    // For each pair of basis states, accumulate contributions to ρ_k
    // ρ_{ab} = Σ_{j: bit_k(j)=a} conj(α_j) · α_{j'}
    // where j' is j with bit k flipped to b
    for i in 0..total {
        let bit_k = (i >> qubit) & 1;
        let alpha_i = sv.amplitudes[i];

        // ρ_{bit_k, bit_k} += |α_i|²
        rho[bit_k][bit_k] += Complex64::new(norm_sq(alpha_i), 0.0);

        // ρ_{bit_k, 1-bit_k} += conj(α_i) · α_{i with bit k flipped}
        if bit_k == 0 {
            let paired = i | (1 << qubit);
            let alpha_paired = sv.amplitudes[paired];
            rho[0][1] += alpha_i.conj() * alpha_paired;
            rho[1][0] += alpha_paired.conj() * alpha_i;
        }
    }

    rho
}

/// Compute the Bloch vector (x, y, z) for a specific qubit.
///
/// Uses the Pauli basis expansion: ρ_k = (I + x·σ_x + y·σ_y + z·σ_z) / 2
///   x = Tr(ρ_k · σ_x) = 2·Re(ρ₀₁)
///   y = Tr(ρ_k · σ_y) = -2·Im(ρ₀₁)
///   z = Tr(ρ_k · σ_z) = ρ₀₀ - ρ₁₁
///
/// # Arguments
/// * `sv` - The full statevector
/// * `qubit` - Qubit index to compute Bloch vector for
pub fn bloch_vector(sv: &Statevector, qubit: usize) -> BlochCoordinates {
    let rho = reduced_density_matrix(sv, qubit);

    let x = 2.0 * rho[0][1].re;
    let y = -2.0 * rho[0][1].im;
    let z = rho[0][0].re - rho[1][1].re;
    let purity = (x * x + y * y + z * z).sqrt();

    BlochCoordinates { x, y, z, purity }
}

/// Compute Bloch vectors for all qubits in the statevector.
pub fn all_bloch_vectors(sv: &Statevector) -> Vec<BlochCoordinates> {
    (0..sv.num_qubits())
        .map(|q| bloch_vector(sv, q))
        .collect()
}

/// Compute quantum state fidelity: F = |⟨ψ_a|ψ_b⟩|²
///
/// From SIMULATION_SPEC.md §6:
/// F(|ψ_target⟩, |ψ_student⟩) = |Σ α*_j β_j|²
///
/// A solution passes if F ≥ 0.999.
///
/// # Arguments
/// * `sv_a` - First statevector (e.g., target)
/// * `sv_b` - Second statevector (e.g., student)
pub fn fidelity(sv_a: &Statevector, sv_b: &Statevector) -> f64 {
    let inner = sv_a.inner_product(sv_b);
    norm_sq(inner)
}

// ===========================================================================
// Unit Tests
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::complex::{ONE, I, FRAC_1_SQRT2};
    use crate::gates::*;
    use crate::statevector::EPSILON;

    fn assert_approx(actual: f64, expected: f64, msg: &str) {
        assert!(
            (actual - expected).abs() < 1e-10,
            "{msg}: expected {expected}, got {actual}"
        );
    }

    // -----------------------------------------------------------------------
    // Bloch Vector Tests for Cardinal Pure States
    // -----------------------------------------------------------------------

    #[test]
    fn test_bloch_zero_state() {
        // |0⟩ → Bloch vector (0, 0, 1) — North Pole
        let sv = Statevector::new(1);
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, 0.0, "|0⟩ x");
        assert_approx(b.y, 0.0, "|0⟩ y");
        assert_approx(b.z, 1.0, "|0⟩ z");
        assert_approx(b.purity, 1.0, "|0⟩ purity");
    }

    #[test]
    fn test_bloch_one_state() {
        // |1⟩ → Bloch vector (0, 0, -1) — South Pole
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_x());
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, 0.0, "|1⟩ x");
        assert_approx(b.y, 0.0, "|1⟩ y");
        assert_approx(b.z, -1.0, "|1⟩ z");
        assert_approx(b.purity, 1.0, "|1⟩ purity");
    }

    #[test]
    fn test_bloch_plus_state() {
        // |+⟩ = H|0⟩ → Bloch vector (1, 0, 0) — Positive X-axis
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h());
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, 1.0, "|+⟩ x");
        assert_approx(b.y, 0.0, "|+⟩ y");
        assert_approx(b.z, 0.0, "|+⟩ z");
        assert_approx(b.purity, 1.0, "|+⟩ purity");
    }

    #[test]
    fn test_bloch_minus_state() {
        // |−⟩ = HX|0⟩ = H|1⟩ → Bloch vector (-1, 0, 0) — Negative X-axis
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_x());
        apply_single_gate(&mut sv, 0, &gate_h());
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, -1.0, "|−⟩ x");
        assert_approx(b.y, 0.0, "|−⟩ y");
        assert_approx(b.z, 0.0, "|−⟩ z");
        assert_approx(b.purity, 1.0, "|−⟩ purity");
    }

    #[test]
    fn test_bloch_plus_i_state() {
        // |+i⟩ = S·H|0⟩ → Bloch vector (0, 1, 0) — Positive Y-axis
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h());
        apply_single_gate(&mut sv, 0, &gate_s());
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, 0.0, "|+i⟩ x");
        assert_approx(b.y, 1.0, "|+i⟩ y");
        assert_approx(b.z, 0.0, "|+i⟩ z");
        assert_approx(b.purity, 1.0, "|+i⟩ purity");
    }

    #[test]
    fn test_bloch_minus_i_state() {
        // |−i⟩ = S†·H|0⟩ → Bloch vector (0, -1, 0) — Negative Y-axis
        // S† = [[1,0],[0,-i]], which is Z·S = [[1,0],[0,-i]]
        let mut sv = Statevector::new(1);
        apply_single_gate(&mut sv, 0, &gate_h());
        // Apply S† = Z·S: first S then Z gives [[1,0],[0,i]]·[[1,0],[0,-1]] = [[1,0],[0,-i]]
        // Actually: S† matrix is [[1,0],[0,-i]]. Let's use RZ(-π/2) which is equivalent up to global phase.
        // Or simply: apply S three times (S^3 = S†)
        apply_single_gate(&mut sv, 0, &gate_s());
        apply_single_gate(&mut sv, 0, &gate_s());
        apply_single_gate(&mut sv, 0, &gate_s());
        let b = bloch_vector(&sv, 0);
        assert_approx(b.x, 0.0, "|−i⟩ x");
        assert_approx(b.y, -1.0, "|−i⟩ y");
        assert_approx(b.z, 0.0, "|−i⟩ z");
        assert_approx(b.purity, 1.0, "|−i⟩ purity");
    }

    // -----------------------------------------------------------------------
    // Entanglement Detection Tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_bloch_bell_state_maximally_mixed() {
        // Bell state: (1/√2)(|00⟩ + |11⟩) — each qubit is maximally mixed
        let mut sv = Statevector::new(2);
        apply_single_gate(&mut sv, 0, &gate_h());
        apply_cx(&mut sv, 0, 1);

        let b0 = bloch_vector(&sv, 0);
        let b1 = bloch_vector(&sv, 1);

        // Both qubits should be at the center of the Bloch sphere (purity ≈ 0)
        assert_approx(b0.purity, 0.0, "Bell q0 purity");
        assert_approx(b1.purity, 0.0, "Bell q1 purity");
        assert_approx(b0.x, 0.0, "Bell q0 x");
        assert_approx(b0.y, 0.0, "Bell q0 y");
        assert_approx(b0.z, 0.0, "Bell q0 z");
    }

    #[test]
    fn test_bloch_separable_2qubit() {
        // |+⟩ ⊗ |0⟩ — each qubit has purity 1 (no entanglement)
        let mut sv = Statevector::new(2);
        apply_single_gate(&mut sv, 0, &gate_h()); // q0 = |+⟩, q1 = |0⟩

        let b0 = bloch_vector(&sv, 0);
        let b1 = bloch_vector(&sv, 1);

        assert_approx(b0.purity, 1.0, "Separable q0 purity");
        assert_approx(b0.x, 1.0, "Separable q0 x (|+⟩)");

        assert_approx(b1.purity, 1.0, "Separable q1 purity");
        assert_approx(b1.z, 1.0, "Separable q1 z (|0⟩)");
    }

    // -----------------------------------------------------------------------
    // Fidelity Tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_fidelity_same_state() {
        let sv = Statevector::new(2);
        let f = fidelity(&sv, &sv);
        assert_approx(f, 1.0, "F(|00⟩, |00⟩)");
    }

    #[test]
    fn test_fidelity_orthogonal_states() {
        let sv0 = Statevector::new(1); // |0⟩
        let mut sv1 = Statevector::new(1);
        sv1.amplitudes[0] = ZERO;
        sv1.amplitudes[1] = ONE; // |1⟩
        let f = fidelity(&sv0, &sv1);
        assert_approx(f, 0.0, "F(|0⟩, |1⟩)");
    }

    #[test]
    fn test_fidelity_bell_vs_ground() {
        let sv_ground = Statevector::new(2); // |00⟩
        let mut sv_bell = Statevector::new(2);
        apply_single_gate(&mut sv_bell, 0, &gate_h());
        apply_cx(&mut sv_bell, 0, 1);

        let f = fidelity(&sv_ground, &sv_bell);
        // |⟨00|Φ+⟩|² = |1/√2|² = 0.5
        assert_approx(f, 0.5, "F(|00⟩, Bell)");
    }

    #[test]
    fn test_fidelity_threshold() {
        // Same circuit should always pass the 0.999 threshold
        let mut sv_a = Statevector::new(3);
        apply_single_gate(&mut sv_a, 0, &gate_h());
        apply_cx(&mut sv_a, 0, 1);
        apply_cx(&mut sv_a, 0, 2);

        let mut sv_b = Statevector::new(3);
        apply_single_gate(&mut sv_b, 0, &gate_h());
        apply_cx(&mut sv_b, 0, 1);
        apply_cx(&mut sv_b, 0, 2);

        let f = fidelity(&sv_a, &sv_b);
        assert!(f >= 0.999, "Identical circuits should have F ≥ 0.999, got {f}");
    }

    // -----------------------------------------------------------------------
    // All Bloch vectors test
    // -----------------------------------------------------------------------

    #[test]
    fn test_all_bloch_vectors() {
        let mut sv = Statevector::new(3);
        apply_single_gate(&mut sv, 0, &gate_h());
        apply_single_gate(&mut sv, 1, &gate_x());

        let bvecs = all_bloch_vectors(&sv);
        assert_eq!(bvecs.len(), 3);

        // q0 = |+⟩: (1, 0, 0)
        assert_approx(bvecs[0].x, 1.0, "q0 x");
        assert_approx(bvecs[0].y, 0.0, "q0 y");
        assert_approx(bvecs[0].z, 0.0, "q0 z");

        // q1 = |1⟩: (0, 0, -1)
        assert_approx(bvecs[1].x, 0.0, "q1 x");
        assert_approx(bvecs[1].y, 0.0, "q1 y");
        assert_approx(bvecs[1].z, -1.0, "q1 z");

        // q2 = |0⟩: (0, 0, 1)
        assert_approx(bvecs[2].x, 0.0, "q2 x");
        assert_approx(bvecs[2].y, 0.0, "q2 y");
        assert_approx(bvecs[2].z, 1.0, "q2 z");
    }
}
