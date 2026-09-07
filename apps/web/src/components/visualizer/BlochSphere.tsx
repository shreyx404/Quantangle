"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { Globe2, Info } from "lucide-react";

export const BlochSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { numQubits } = useCircuitStore();
  const { stepStates, activeStep } = useSimulationStore();
  const [selectedQubit, setSelectedQubit] = useState(0);

  // Get current Bloch vector for the selected qubit
  const currentStepState = stepStates[activeStep];
  const blochVector = currentStepState?.blochVectors?.find(
    (b) => b.qubit === selectedQubit
  ) || { qubit: selectedQubit, x: 0, y: 0, z: 1, purity: 1 };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const width = mount.clientWidth || 300;
    const height = mount.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.4, 1.8, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 6;

    // Ambient & directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 1. Translucent Geodesic Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.35,
      wireframe: false,
      shininess: 90,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // 2. Wireframe overlay
    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireframe);

    // 3. Equator and Meridian Guide Rings
    const createRing = (rotation: [number, number, number], color: number) => {
      const ringGeo = new THREE.RingGeometry(0.995, 1.005, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(...rotation);
      return ring;
    };

    scene.add(createRing([Math.PI / 2, 0, 0], 0x00f2fe)); // XY Equator (cyan)
    scene.add(createRing([0, 0, 0], 0x475569)); // XZ Meridian
    scene.add(createRing([0, Math.PI / 2, 0], 0x475569)); // YZ Meridian

    // 4. Coordinate Axes (X: Red/Amber, Y: Emerald, Z: Cyan)
    // Note: Three.js coordinates: Y is up (Z-axis in quantum standard convention!)
    // We map Quantum (x, y, z) -> Three.js (x, z, -y) or (x, z, y):
    // Standard Quantum: |0⟩ is +Z (Up), |1⟩ is -Z (Down)
    // Three.js: +Y is Up, -Y is Down.
    // So Three.js Y = Quantum Z.
    // Three.js X = Quantum X.
    // Three.js Z = Quantum Y.
    const createAxis = (from: THREE.Vector3, to: THREE.Vector3, color: number) => {
      const points = [from, to];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      return new THREE.Line(geometry, material);
    };

    // Z-axis (Vertical: |0⟩ at top, |1⟩ at bottom)
    scene.add(createAxis(new THREE.Vector3(0, -1.3, 0), new THREE.Vector3(0, 1.3, 0), 0x38bdf8));
    // X-axis
    scene.add(createAxis(new THREE.Vector3(-1.3, 0, 0), new THREE.Vector3(1.3, 0, 0), 0xf59e0b));
    // Y-axis
    scene.add(createAxis(new THREE.Vector3(0, 0, -1.3), new THREE.Vector3(0, 0, 1.3), 0x10b981));

    // 5. State Vector Arrow
    // Dynamic ArrowHelper
    const dir = new THREE.Vector3(blochVector.x, blochVector.z, blochVector.y).normalize();
    const length = Math.max(0.01, blochVector.purity);
    const arrow = new THREE.ArrowHelper(
      dir,
      new THREE.Vector3(0, 0, 0),
      length,
      0x00f2fe,
      0.15,
      0.08
    );
    scene.add(arrow);

    // Tip sphere
    const tipGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(dir.clone().multiplyScalar(length));
    scene.add(tipMesh);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [blochVector, selectedQubit]);

  return (
    <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/[0.08] flex flex-col h-full min-h-[320px] shadow-sm">
      {/* Header with Qubit Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            3D Bloch Sphere
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            · Single-Qubit State
          </span>
        </div>

        {/* Qubit Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-mono">Qubit:</span>
          <select
            value={selectedQubit}
            onChange={(e) => setSelectedQubit(parseInt(e.target.value, 10))}
            className="bg-[#101726] border border-white/[0.08] rounded-md px-2.5 py-0.5 text-xs font-telemetry text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer active:translate-y-[1px]"
          >
            {Array.from({ length: numQubits }).map((_, i) => (
              <option key={i} value={i} className="bg-[#0b0f19] text-white">
                q[{i}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="flex-1 w-full min-h-[220px] relative cursor-grab active:cursor-grabbing"
      >
        {/* Cardinal State Pole Overlays */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-telemetry font-semibold text-sky-300 bg-[#070b14]/70 px-2 py-0.5 rounded border border-white/[0.05]">
          |0⟩ (+Z)
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-telemetry font-semibold text-sky-400 bg-[#070b14]/70 px-2 py-0.5 rounded border border-white/[0.05]">
          |1⟩ (-Z)
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-telemetry text-amber-300/90 bg-[#070b14]/70 px-1.5 py-0.5 rounded border border-white/[0.05]">
          |+⟩ (+X)
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-telemetry text-emerald-300/90 bg-[#070b14]/70 px-1.5 py-0.5 rounded border border-white/[0.05]">
          |+i⟩ (+Y)
        </div>
      </div>

      {/* Numerical Coordinate Readout */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-telemetry tabular-nums">
        <div className="flex items-center gap-3">
          <span className="text-amber-400">x: {blochVector.x.toFixed(3)}</span>
          <span className="text-emerald-400">y: {blochVector.y.toFixed(3)}</span>
          <span className="text-sky-400">z: {blochVector.z.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Purity r:</span>
          <span
            className={`font-semibold ${
              blochVector.purity < 0.99
                ? "text-violet-400 underline decoration-dotted"
                : "text-emerald-400"
            }`}
            title={
              blochVector.purity < 0.99
                ? "Purity < 1 indicates quantum entanglement with other qubits!"
                : "Pure state (r = 1.0)"
            }
          >
            {blochVector.purity.toFixed(3)}
            {blochVector.purity < 0.99 && " (Entangled)"}
          </span>
        </div>
      </div>
    </div>
  );
};
