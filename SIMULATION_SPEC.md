# SIMULATION_SPEC.md — Quantum Linear Algebra & Simulation Specification

> **Mathematical Ground Truths, Statevector Formulations, and Matrix Conventions for Quantangle.**

---

## 1. Hilbert Space & Qubit Indexing Convention

### 1.1 Statevector Representation
An $n$-qubit quantum system resides in a $2^n$-dimensional complex Hilbert space:
$$\mathcal{H} = (\mathbb{C}^2)^{\otimes n}$$

A pure state $|\psi\rangle$ is represented as a normalized column vector of $2^n$ complex amplitudes:
$$|\psi\rangle = \sum_{j=0}^{2^n - 1} \alpha_j |j\rangle, \quad \alpha_j \in \mathbb{C}, \quad \sum_{j=0}^{2^n - 1} |\alpha_j|^2 = 1.0$$

### 1.2 Little-Endian Qubit Ordering (Strict Qiskit Standard)
Quantangle strictly follows **Little-Endian ordering**:
$$|j\rangle = |q_{n-1} q_{n-2} \dots q_1 q_0\rangle$$
where:
- Qubit 0 ($q_0$) is the **Least Significant Bit (LSB)** with weight $2^0 = 1$.
- Qubit $n-1$ ($q_{n-1}$) is the **Most Significant Bit (MSB)** with weight $2^{n-1}$.

#### Example for $n=2$ qubits:
| Index $j$ | Binary Representation | Computational Basis State $|q_1 q_0\rangle$ |
|---|---|---|
| `0` | `00` | $|00\rangle$ ($q_1=0, q_0=0$) |
| `1` | `01` | $|01\rangle$ ($q_1=0, q_0=1$) |
| `2` | `10` | $|10\rangle$ ($q_1=1, q_0=0$) |
| `3` | `11` | $|11\rangle$ ($q_1=1, q_0=1$) |

---

## 2. Canonical Single-Qubit Unitary Matrices ($2 \times 2$)

All single-qubit gates are unitary matrices $U \in \text{U}(2)$ such that $U^\dagger U = U U^\dagger = I$.

### 2.1 Pauli Operators & Identity
$$I = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}, \quad X = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}, \quad Y = \begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}, \quad Z = \begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}$$

### 2.2 Hadamard & Phase Gates
- **Hadamard Gate ($H$)**:
  $$H = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}$$
- **$S$ Gate (Phase Gate, $\pi/2$ rotation)**:
  $$S = \begin{bmatrix} 1 & 0 \\ 0 & i \end{bmatrix}, \quad S^\dagger = \begin{bmatrix} 1 & 0 \\ 0 & -i \end{bmatrix}$$
- **$T$ Gate ($\pi/4$ rotation)**:
  $$T = \begin{bmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{bmatrix} = \begin{bmatrix} 1 & 0 \\ 0 & \frac{1+i}{\sqrt{2}} \end{bmatrix}, \quad T^\dagger = \begin{bmatrix} 1 & 0 \\ 0 & e^{-i\pi/4} \end{bmatrix}$$

### 2.3 Parametric Rotation Gates
For an angle parameter $\theta \in [0, 2\pi]$:
- **$R_x(\theta) = \exp(-i\frac{\theta}{2}X)$**:
  $$R_x(\theta) = \begin{bmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{bmatrix}$$
- **$R_y(\theta) = \exp(-i\frac{\theta}{2}Y)$**:
  $$R_y(\theta) = \begin{bmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{bmatrix}$$
- **$R_z(\theta) = \exp(-i\frac{\theta}{2}Z)$**:
  $$R_z(\theta) = \begin{bmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{bmatrix} \equiv \begin{bmatrix} 1 & 0 \\ 0 & e^{i\theta} \end{bmatrix} \quad (\text{up to global phase})$$
- **Universal Single-Qubit Gate $U_3(\theta, \phi, \lambda)$**:
  $$U_3(\theta, \phi, \lambda) = \begin{bmatrix} \cos(\theta/2) & -e^{i\lambda}\sin(\theta/2) \\ e^{i\phi}\sin(\theta/2) & e^{i(\phi+\lambda)}\cos(\theta/2) \end{bmatrix}$$

---

## 3. Canonical Multi-Qubit Unitary Matrices

### 3.1 Controlled-NOT Gate ($CX$)
In Little-Endian ordering ($|q_1 q_0\rangle$):
- **When Control = $q_0$, Target = $q_1$**:
  $$CX_{0 \to 1} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \end{bmatrix}$$
  *Action:* $|00\rangle \to |00\rangle, |01\rangle \to |11\rangle, |10\rangle \to |10\rangle, |11\rangle \to |01\rangle$.
- **When Control = $q_1$, Target = $q_0$**:
  $$CX_{1 \to 0} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$
  *Action:* $|00\rangle \to |00\rangle, |01\rangle \to |01\rangle, |10\rangle \to |11\rangle, |11\rangle \to |10\rangle$.

### 3.2 Controlled-$Z$ ($CZ$) and $SWAP$
$$CZ = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & -1 \end{bmatrix}, \quad SWAP = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

---

## 4. High-Performance In-Place Statevector Update Algorithm

Constructing the dense $2^n \times 2^n$ Kronecker matrix in memory is $O(4^n)$, which exhausts RAM at $n \ge 12$.  
Instead, the Quantangle Rust-WASM engine applies gates **directly to amplitude pairs in $O(2^n)$ time and $O(1)$ auxiliary space**:

### Algorithm: Single-Qubit Gate $U = \begin{bmatrix} u_{00} & u_{01} \\ u_{10} & u_{11} \end{bmatrix}$ on Qubit $k$
```rust
let step = 1 << k;           // 2^k
let double_step = step << 1;  // 2^(k+1)

for i in (0..total_amplitudes).step_by(double_step) {
    for j in 0..step {
        let idx0 = i + j;
        let idx1 = idx0 + step;

        let a = state[idx0];
        let b = state[idx1];

        state[idx0] = u00 * a + u01 * b;
        state[idx1] = u10 * a + u11 * b;
    }
}
```

### Algorithm: Two-Qubit $CX$ Gate (Control $c$, Target $t$)
Iterates through all states where bit $c$ is `1`, and swaps amplitudes based on bit $t$:
```rust
for i in 0..total_amplitudes {
    if ((i >> c) & 1) == 1 && ((i >> t) & 1) == 0 {
        let paired_idx = i | (1 << t);
        state.swap(i, paired_idx);
    }
}
```

---

## 5. Reduced Density Matrix & Bloch Sphere Coordinates

To visualize individual qubits on 3D Bloch spheres, we calculate the reduced density operator $\rho_k$ for each qubit $k$ by tracing out all other qubits $\bar{k}$:
$$\rho_k = \text{Tr}_{\bar{k}}(|\psi\rangle\langle\psi|) = \begin{bmatrix} \rho_{00} & \rho_{01} \\ \rho_{10} & \rho_{11} \end{bmatrix}$$

### 5.1 Computing the Bloch Vector $(x_k, y_k, z_k)$
Using the Pauli basis expansion $\rho_k = \frac{1}{2}(I + x_k X + y_k Y + z_k Z)$:
$$x_k = \text{Tr}(\rho_k X) = 2 \text{Re}(\rho_{01})$$
$$y_k = \text{Tr}(\rho_k Y) = -2 \text{Im}(\rho_{01})$$
$$z_k = \text{Tr}(\rho_k Z) = \rho_{00} - \rho_{11}$$

### 5.2 Purity and Entanglement Metric
The length of the Bloch vector $r_k = \sqrt{x_k^2 + y_k^2 + z_k^2} \in [0, 1]$ reveals entanglement:
- $r_k = 1.0$: Qubit $k$ is in a pure, separable state (lies on the surface of the Bloch sphere).
- $r_k < 1.0$: Qubit $k$ is entangled with other qubits (lies inside the sphere).
- $r_k = 0.0$: Maximally mixed state (e.g. either half of a Bell state $|\Phi^+\rangle$).

---

## 6. Quantum State Fidelity Calculation

For grading student circuits against target solutions:
$$F(|\psi_{\text{target}}\rangle, |\psi_{\text{student}}\rangle) = |\langle\psi_{\text{target}}|\psi_{\text{student}}\rangle|^2 = \left| \sum_{j=0}^{2^n-1} \alpha_j^* \beta_j \right|^2$$
where $\alpha_j$ is the target amplitude and $\beta_j$ is the student amplitude.

A solution is judged correct if and only if:
$$F \ge 0.9990$$
*(allowing for minor numerical floating-point inaccuracies).*
