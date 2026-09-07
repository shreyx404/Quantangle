// =============================================================================
// quantangle-wasm-engine — Statevector Module
// =============================================================================
// Core quantum state representation: a normalized vector of 2^n complex
// amplitudes following Little-Endian (Qiskit standard) qubit ordering.
//
// Convention: |q_{n-1} ... q_1 q_0⟩ where q_0 is LSB (weight 2^0).
// Index 0 = |00...0⟩, Index 1 = |00...1⟩ (qubit 0 is 1), etc.
// =============================================================================

use crate::complex::{Complex64, ZERO, ONE};

/// Maximum number of qubits supported by the client-side WASM engine.
/// 16 qubits = 65,536 amplitudes × 16 bytes = ~1 MB RAM.
pub const MAX_QUBITS: usize = 16;

/// Numerical tolerance for floating-point comparisons in quantum state operations.
pub const EPSILON: f64 = 1e-10;

/// A quantum statevector of n qubits: a normalized vector of 2^n complex amplitudes.
///
/// Follows Little-Endian ordering (Qiskit standard):
/// - Index j corresponds to |q_{n-1} ... q_1 q_0⟩ where bit k of j gives the value of qubit k.
/// - Qubit 0 is the Least Significant Bit (LSB).
#[derive(Debug, Clone)]
pub struct Statevector {
    /// Number of qubits in this quantum register
    n_qubits: usize,
    /// Complex amplitudes: length = 2^n_qubits
    pub amplitudes: Vec<Complex64>,
}

impl Statevector {
    /// Create a new statevector initialized to |00...0⟩.
    ///
    /// # Arguments
    /// * `n_qubits` - Number of qubits (1..=MAX_QUBITS)
    ///
    /// # Panics
    /// Panics if n_qubits is 0 or exceeds MAX_QUBITS.
    pub fn new(n_qubits: usize) -> Self {
        assert!(
            n_qubits > 0 && n_qubits <= MAX_QUBITS,
            "Number of qubits must be between 1 and {MAX_QUBITS}, got {n_qubits}"
        );

        let num_amplitudes = 1 << n_qubits; // 2^n
        let mut amplitudes = vec![ZERO; num_amplitudes];
        amplitudes[0] = ONE; // |00...0⟩

        Self {
            n_qubits,
            amplitudes,
        }
    }

    /// Create a statevector from a pre-existing amplitude vector.
    ///
    /// # Panics
    /// Panics if the length is not a power of 2, or if the state is not normalized.
    pub fn from_amplitudes(amplitudes: Vec<Complex64>) -> Self {
        let len = amplitudes.len();
        assert!(len.is_power_of_two(), "Amplitude vector length must be a power of 2, got {len}");

        let n_qubits = len.trailing_zeros() as usize;
        assert!(
            n_qubits > 0 && n_qubits <= MAX_QUBITS,
            "Implied qubit count must be between 1 and {MAX_QUBITS}, got {n_qubits}"
        );

        let sv = Self { n_qubits, amplitudes };

        assert!(
            sv.is_valid(),
            "Statevector is not normalized: sum of |α|² = {}, expected 1.0",
            sv.norm_squared()
        );

        sv
    }

    /// Number of qubits in this quantum register.
    #[inline]
    pub fn num_qubits(&self) -> usize {
        self.n_qubits
    }

    /// Number of amplitudes (2^n_qubits).
    #[inline]
    pub fn num_amplitudes(&self) -> usize {
        self.amplitudes.len()
    }

    /// Compute the squared norm: Σ|α_j|².
    /// Should be 1.0 for a valid quantum state.
    pub fn norm_squared(&self) -> f64 {
        self.amplitudes
            .iter()
            .map(|a| a.re * a.re + a.im * a.im)
            .sum()
    }

    /// Check if the statevector is properly normalized (Σ|α_j|² ≈ 1.0).
    pub fn is_valid(&self) -> bool {
        (self.norm_squared() - 1.0).abs() < EPSILON
    }

    /// Re-normalize the statevector to unit length.
    /// Corrects accumulated floating-point drift after many gate applications.
    pub fn normalize(&mut self) {
        let norm = self.norm_squared().sqrt();
        if (norm - 1.0).abs() > EPSILON && norm > EPSILON {
            let inv_norm = 1.0 / norm;
            for a in &mut self.amplitudes {
                *a *= inv_norm;
            }
        }
    }

    /// Compute probability distribution: P(j) = |α_j|² for each basis state |j⟩.
    pub fn probabilities(&self) -> Vec<f64> {
        self.amplitudes
            .iter()
            .map(|a| a.re * a.re + a.im * a.im)
            .collect()
    }

    /// Get the amplitude of a specific basis state by index.
    ///
    /// # Panics
    /// Panics if index >= 2^n_qubits.
    #[inline]
    pub fn amplitude(&self, index: usize) -> Complex64 {
        self.amplitudes[index]
    }

    /// Set the amplitude of a specific basis state by index.
    ///
    /// # Warning
    /// The caller is responsible for maintaining normalization after calling this.
    #[inline]
    pub fn set_amplitude(&mut self, index: usize, value: Complex64) {
        self.amplitudes[index] = value;
    }

    /// Compute the inner product ⟨self|other⟩.
    ///
    /// # Panics
    /// Panics if the two statevectors have different dimensions.
    pub fn inner_product(&self, other: &Statevector) -> Complex64 {
        assert_eq!(
            self.num_amplitudes(),
            other.num_amplitudes(),
            "Cannot compute inner product of statevectors with different dimensions"
        );

        self.amplitudes
            .iter()
            .zip(other.amplitudes.iter())
            .map(|(a, b)| a.conj() * b)
            .sum()
    }

    /// Reset the statevector back to |00...0⟩.
    pub fn reset(&mut self) {
        for a in &mut self.amplitudes {
            *a = ZERO;
        }
        self.amplitudes[0] = ONE;
    }

    /// Return the statevector as an interleaved [re, im, re, im, ...] f64 array.
    /// This format is efficient for transferring via Web Worker postMessage.
    pub fn to_interleaved(&self) -> Vec<f64> {
        let mut result = Vec::with_capacity(self.amplitudes.len() * 2);
        for a in &self.amplitudes {
            result.push(a.re);
            result.push(a.im);
        }
        result
    }
}

// ===========================================================================
// Unit Tests
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_single_qubit() {
        let sv = Statevector::new(1);
        assert_eq!(sv.num_qubits(), 1);
        assert_eq!(sv.num_amplitudes(), 2);
        assert_eq!(sv.amplitude(0), ONE);  // |0⟩
        assert_eq!(sv.amplitude(1), ZERO); // |1⟩
        assert!(sv.is_valid());
    }

    #[test]
    fn test_new_two_qubits() {
        let sv = Statevector::new(2);
        assert_eq!(sv.num_qubits(), 2);
        assert_eq!(sv.num_amplitudes(), 4);
        assert_eq!(sv.amplitude(0), ONE);  // |00⟩
        assert_eq!(sv.amplitude(1), ZERO); // |01⟩
        assert_eq!(sv.amplitude(2), ZERO); // |10⟩
        assert_eq!(sv.amplitude(3), ZERO); // |11⟩
        assert!(sv.is_valid());
    }

    #[test]
    fn test_probabilities_ground_state() {
        let sv = Statevector::new(2);
        let probs = sv.probabilities();
        assert!((probs[0] - 1.0).abs() < EPSILON);
        assert!(probs[1].abs() < EPSILON);
        assert!(probs[2].abs() < EPSILON);
        assert!(probs[3].abs() < EPSILON);
    }

    #[test]
    fn test_normalization() {
        let sv = Statevector::new(3);
        assert!(sv.is_valid());
        assert!((sv.norm_squared() - 1.0).abs() < EPSILON);
    }

    #[test]
    fn test_from_amplitudes_bell_state() {
        let inv_sqrt2 = 1.0 / 2.0_f64.sqrt();
        let amps = vec![
            Complex64::new(inv_sqrt2, 0.0), // |00⟩
            ZERO,                            // |01⟩
            ZERO,                            // |10⟩
            Complex64::new(inv_sqrt2, 0.0), // |11⟩
        ];
        let sv = Statevector::from_amplitudes(amps);
        assert_eq!(sv.num_qubits(), 2);
        assert!(sv.is_valid());
    }

    #[test]
    fn test_inner_product_orthogonal() {
        let sv0 = Statevector::new(1); // |0⟩

        let mut sv1 = Statevector::new(1);
        sv1.amplitudes[0] = ZERO;
        sv1.amplitudes[1] = ONE; // |1⟩

        let ip = sv0.inner_product(&sv1);
        assert!(ip.re.abs() < EPSILON);
        assert!(ip.im.abs() < EPSILON);
    }

    #[test]
    fn test_inner_product_same_state() {
        let sv = Statevector::new(2); // |00⟩
        let ip = sv.inner_product(&sv);
        assert!((ip.re - 1.0).abs() < EPSILON);
        assert!(ip.im.abs() < EPSILON);
    }

    #[test]
    fn test_reset() {
        let mut sv = Statevector::new(2);
        sv.amplitudes[0] = ZERO;
        sv.amplitudes[3] = ONE;
        sv.reset();
        assert_eq!(sv.amplitude(0), ONE);
        assert_eq!(sv.amplitude(3), ZERO);
    }

    #[test]
    fn test_to_interleaved() {
        let sv = Statevector::new(1);
        let interleaved = sv.to_interleaved();
        assert_eq!(interleaved.len(), 4); // 2 amplitudes × 2 (re, im)
        assert!((interleaved[0] - 1.0).abs() < EPSILON); // re of |0⟩
        assert!(interleaved[1].abs() < EPSILON);           // im of |0⟩
        assert!(interleaved[2].abs() < EPSILON);           // re of |1⟩
        assert!(interleaved[3].abs() < EPSILON);           // im of |1⟩
    }

    #[test]
    fn test_max_qubits() {
        let sv = Statevector::new(MAX_QUBITS);
        assert_eq!(sv.num_qubits(), MAX_QUBITS);
        assert_eq!(sv.num_amplitudes(), 1 << MAX_QUBITS);
        assert!(sv.is_valid());
    }

    #[test]
    #[should_panic(expected = "Number of qubits must be between 1 and")]
    fn test_zero_qubits_panics() {
        Statevector::new(0);
    }

    #[test]
    #[should_panic(expected = "Number of qubits must be between 1 and")]
    fn test_too_many_qubits_panics() {
        Statevector::new(MAX_QUBITS + 1);
    }
}
