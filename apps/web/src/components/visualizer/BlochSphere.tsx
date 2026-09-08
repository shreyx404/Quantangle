"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { Globe2 } from "lucide-react";

export const BlochSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { numQubits } = useCircuitStore();
  const { stepStates, activeStep } = useSimulationStore();
  const [selectedQubit, setSelectedQubit] = useState(0);

  const currentStepState = stepStates[activeStep];
  const blochVector = currentStepState?.blochVectors?.find(
    (b) => b.qubit === selectedQubit
  ) || { qubit: selectedQubit, x: 0, y: 0, z: 1, purity: 1 };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 1. Geodesic Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0a1120,
      transparent: true,
      opacity: 0.35,
      shininess: 90,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // 2. Wireframe overlay
    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireframe);

    // 3. Equator and Meridian Rings
    const createRing = (rotation: [number, number, number], color: number) => {
      const ringGeo = new THREE.RingGeometry(0.995, 1.005, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(...rotation);
      return ring;
    };

    scene.add(createRing([Math.PI / 2, 0, 0], 0x00f0ff)); // XY Equator (cyan)
    scene.add(createRing([0, 0, 0], 0x334155)); // XZ Meridian
    scene.add(createRing([0, Math.PI / 2, 0], 0x334155)); // YZ Meridian

    // 4. Coordinate Axes (Quantum Z = Three.js Y)
    const createAxis = (from: THREE.Vector3, to: THREE.Vector3, color: number) => {
      const points = [from, to];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color });
      return new THREE.Line(geometry, material);
    };

    // Z-axis (Up/Down in Three.js)
    scene.add(createAxis(new THREE.Vector3(0, -1.3, 0), new THREE.Vector3(0, 1.3, 0), 0x38bdf8));
    // X-axis
    scene.add(createAxis(new THREE.Vector3(-1.3, 0, 0), new THREE.Vector3(1.3, 0, 0), 0xf59e0b));
    // Y-axis
    scene.add(createAxis(new THREE.Vector3(0, 0, -1.3), new THREE.Vector3(0, 0, 1.3), 0x10b981));

    // 5. State Vector Arrow
    const dir = new THREE.Vector3(blochVector.x, blochVector.z, blochVector.y).normalize();
    const length = Math.max(0.01, blochVector.purity);
    const arrow = new THREE.ArrowHelper(
      dir,
      new THREE.Vector3(0, 0, 0),
      length,
      0x00f0ff,
      0.15,
      0.08
    );
    scene.add(arrow);

    const tipGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(dir.clone().multiplyScalar(length));
    scene.add(tipMesh);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

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
    <div className="bg-[#0b0f1a] rounded-xl p-3.5 border border-white/[0.06] flex flex-col h-full min-h-[310px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold font-mono text-white">
            3D Bloch Sphere
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            · Reduced State Density
          </span>
        </div>

        {/* Qubit Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono">Qubit:</span>
          <select
            value={selectedQubit}
            aria-label="Select qubit to inspect on Bloch Sphere"
            onChange={(e) => setSelectedQubit(parseInt(e.target.value, 10))}
            className="h-7 bg-[#070b14] border border-white/[0.06] rounded px-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer tabular-nums"
          >
            {Array.from({ length: numQubits }).map((_, i) => (
              <option key={i} value={i} className="bg-[#0b0f1a] text-white">
                q[{i}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="flex-1 w-full min-h-[210px] relative cursor-grab active:cursor-grabbing"
      >
        {/* Cardinal Poles HUD */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] font-mono font-semibold text-sky-300 bg-[#070b14]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/[0.06]">
          |0⟩ (+Z)
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] font-mono font-semibold text-sky-400 bg-[#070b14]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/[0.06]">
          |1⟩ (-Z)
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono font-semibold text-amber-300 bg-[#070b14]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/[0.06]">
          |+⟩ (+X)
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono font-semibold text-emerald-300 bg-[#070b14]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/[0.06]">
          |+i⟩ (+Y)
        </div>
      </div>

      {/* Coordinate & Purity Readout */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono tabular-nums">
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="text-amber-400">x: {blochVector.x.toFixed(3)}</span>
          <span className="text-emerald-400">y: {blochVector.y.toFixed(3)}</span>
          <span className="text-sky-400">z: {blochVector.z.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-400">Purity:</span>
          <span
            className={`font-semibold ${
              blochVector.purity < 0.99
                ? "text-violet-400 font-bold"
                : "text-emerald-400"
            }`}
          >
            r = {blochVector.purity.toFixed(3)}
            {blochVector.purity < 0.99 && " (Entangled)"}
          </span>
        </div>
      </div>
    </div>
  );
};
