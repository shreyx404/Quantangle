// =============================================================================
// quantangle-wasm-engine — Complex Number Module
// =============================================================================
// Lightweight Complex64 wrapper for quantum amplitude arithmetic.
// Uses num_complex::Complex64 under the hood but exposes domain-specific helpers.
// =============================================================================

pub use num_complex::Complex64;

/// The zero complex number: 0 + 0i
pub const ZERO: Complex64 = Complex64::new(0.0, 0.0);

/// The unit real number: 1 + 0i
pub const ONE: Complex64 = Complex64::new(1.0, 0.0);

/// The imaginary unit: 0 + 1i
pub const I: Complex64 = Complex64::new(0.0, 1.0);

/// Negative imaginary unit: 0 - 1i
pub const NEG_I: Complex64 = Complex64::new(0.0, -1.0);

/// 1/√2 as a real complex number
pub const FRAC_1_SQRT2: Complex64 = Complex64::new(std::f64::consts::FRAC_1_SQRT_2, 0.0);

/// Create a complex number from polar form: r * e^(iθ)
#[inline]
pub fn from_polar(r: f64, theta: f64) -> Complex64 {
    Complex64::new(r * theta.cos(), r * theta.sin())
}

/// Squared magnitude |z|² = re² + im²
#[inline]
pub fn norm_sq(z: Complex64) -> f64 {
    z.re * z.re + z.im * z.im
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constants() {
        assert_eq!(ZERO, Complex64::new(0.0, 0.0));
        assert_eq!(ONE, Complex64::new(1.0, 0.0));
        assert_eq!(I, Complex64::new(0.0, 1.0));
    }

    #[test]
    fn test_from_polar() {
        let z = from_polar(1.0, std::f64::consts::FRAC_PI_2);
        assert!((z.re - 0.0).abs() < 1e-15);
        assert!((z.im - 1.0).abs() < 1e-15);
    }

    #[test]
    fn test_norm_sq() {
        let z = Complex64::new(3.0, 4.0);
        assert!((norm_sq(z) - 25.0).abs() < 1e-15);
    }

    #[test]
    fn test_frac_1_sqrt2() {
        let expected = 1.0 / (2.0_f64).sqrt();
        assert!((FRAC_1_SQRT2.re - expected).abs() < 1e-15);
        assert_eq!(FRAC_1_SQRT2.im, 0.0);
    }
}
