"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { useSimulationStore } from "../../stores/useSimulationStore";
import { useCircuitStore } from "../../stores/useCircuitStore";
import { Orbit } from "lucide-react";

export const QSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { numQubits } = useCircuitStore();
  const { stepStates, activeStep } = useSimulationStore();

  const currentStep = stepStates[activeStep];
  const statevector = currentStep?.statevector || [1, 0];
  const probabilities = currentStep?.probabilities || [1];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 300;
    const height = mount.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.6, 1.8, 2.6);

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Translucent Reference Q-Sphere
    const sphereRadius = 1.0;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0a1020,
      transparent: true,
      opacity: 0.3,
      shininess: 80,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Latitude rings for Hamming weight levels
    for (let w = 0; w <= numQubits; w++) {
      const latAngle = Math.PI * (1 - w / numQubits); // 0 at north pole, PI at south pole
      const y = Math.cos(latAngle) * sphereRadius;
      const r = Math.sin(latAngle) * sphereRadius;
      if (r > 0.01) {
        const ringGeo = new THREE.RingGeometry(r - 0.003, r + 0.003, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x334155,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        scene.add(ring);
      }
    }

    // Basis State Nodes grouped by Hamming weight
    const totalStates = Math.min(Math.pow(2, numQubits), 64); // Render up to 6 qubits visually
    const statesByWeight: number[][] = Array.from({ length: numQubits + 1 }, () => []);

    for (let j = 0; j < totalStates; j++) {
      // Calculate Hamming weight (count 1 bits)
      let count = 0;
      let temp = j;
      while (temp > 0) {
        count += temp & 1;
        temp >>= 1;
      }
      statesByWeight[count].push(j);
    }

    // Place state nodes on spherical surface
    statesByWeight.forEach((states, weight) => {
      const latAngle = Math.PI * (1 - weight / Math.max(1, numQubits));
      const y = Math.cos(latAngle) * sphereRadius;
      const r = Math.sin(latAngle) * sphereRadius;

      states.forEach((stateIdx, i) => {
        const lonAngle = (2 * Math.PI * i) / states.length;
        const x = r * Math.cos(lonAngle);
        const z = r * Math.sin(lonAngle);

        const prob = probabilities[stateIdx] ?? (stateIdx === 0 ? 1 : 0);
        const amplitude = Math.sqrt(prob);

        // Color based on complex phase: phi = atan2(im, re)
        const re = statevector[stateIdx * 2] ?? (stateIdx === 0 ? 1 : 0);
        const im = statevector[stateIdx * 2 + 1] ?? 0;
        let phase = Math.atan2(im, re);
        if (phase < 0) phase += 2 * Math.PI;
        const hue = Math.round((phase / (2 * Math.PI)) * 360);

        // Node size proportional to amplitude
        const nodeRadius = Math.max(0.02, amplitude * 0.16);
        const nodeGeo = new THREE.SphereGeometry(nodeRadius, 16, 16);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${hue}, 90%, 55%)`),
          emissive: new THREE.Color(`hsl(${hue}, 90%, 40%)`),
          emissiveIntensity: amplitude > 0.1 ? 0.6 : 0.1,
          roughness: 0.2,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(x, y, z);
        scene.add(nodeMesh);

        // Radial ray from origin to node
        if (amplitude > 0.01) {
          const rayPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
          const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
          const rayMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(`hsl(${hue}, 90%, 55%)`),
            transparent: true,
            opacity: 0.6,
          });
          scene.add(new THREE.Line(rayGeo, rayMat));
        }
      });
    });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
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
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [statevector, probabilities, numQubits, activeStep]);

  return (
    <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/[0.08] flex flex-col h-full min-h-[320px] shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span className="type-heading font-mono text-white">
            Multi-Qubit 3D Q-Sphere
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            · Global State Vector
          </span>
        </div>
        <span className="type-telemetry text-cyan-300 bg-[#101726] px-2.5 py-1 rounded-md border border-white/[0.08] tabular-nums font-semibold shadow-sm">
          {Math.pow(2, numQubits)} Basis States
        </span>
      </div>

      <div
        ref={mountRef}
        className="flex-1 w-full min-h-[220px] relative cursor-grab active:cursor-grabbing"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none type-telemetry font-semibold text-slate-200 bg-[#070b14]/80 px-2.5 py-1 rounded-md border border-white/[0.08] shadow-sm">
          |00...0⟩ (Weight 0)
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none type-telemetry font-semibold text-slate-200 bg-[#070b14]/80 px-2.5 py-1 rounded-md border border-white/[0.08] shadow-sm">
          |11...1⟩ (Weight {numQubits})
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] text-xs font-telemetry text-slate-400 flex items-center justify-between tabular-nums">
        <span>Latitude = Hamming Weight</span>
        <span>Node Radius ∝ |α_j| · Phase Hue</span>
      </div>
    </div>
  );
};
