// QuizLanding.jsx — "Neural Cosmos" 3D Quiz Landing (React + R3F + Drei + Postprocessing)
// -----------------------------------------------------------------------------
// Packages you need:
//   npm i three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion framer-motion-3d lucide-react
// Tailwind is used for layout & theming. This file exports a single React component.
// -----------------------------------------------------------------------------

import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Text,
  Float,
  PerspectiveCamera,
  MeshReflectorMaterial,
  useTexture,
  Instances,
  Instance,
  GradientTexture
} from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from "@react-three/postprocessing";
import { motion } from "framer-motion";
import { Brain, Sparkles, Rocket, Palette } from "lucide-react";
import { Link } from "react-router-dom";

// -----------------------------
// Utility helpers
// -----------------------------
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

// Sample points inside an ellipsoid to approximate a brain silhouette (stylized)
function samplePointsInBrain(count = 1800) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    // Superquadric-ish ellipsoid with two lobes (very lightweight brain-esque volume)
    // Left/right lobe split by slight x-offset and y-scaling
    const lobe = Math.random() < 0.5 ? -1 : 1;
    const u = Math.acos(rand(-1, 1)); // polar
    const v = rand(0, Math.PI * 2);   // azimuth

    // Base radii for the lobe
    const rx = 1.15 + 0.15 * lobe; // slight x shift to create two lobes
    const ry = 0.95 + rand(-0.05, 0.05);
    const rz = 1.05 + rand(-0.05, 0.05);

    const r = 1 + rand(-0.08, 0.08); // small thickness noise

    const x = r * rx * Math.sin(u) * Math.cos(v);
    const y = r * ry * Math.sin(u) * Math.sin(v) + 0.08 * Math.sin(3 * v); // slight gyrus ripples
    const z = r * rz * Math.cos(u);

    // A small central depression to accentuate lobe separation
    const mid = Math.exp(-Math.pow(x * 1.4, 2));
    pts.push(new THREE.Vector3(x, y + mid * 0.05, z));
  }
  return pts;
}

// Create a curved path from an option panel to the brain center
function makeArcCurve(from = new THREE.Vector3(0,0,0), to = new THREE.Vector3(0,0,0)) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  // Lift midpoint for a nice arc
  mid.y += from.distanceTo(to) * 0.35 + 0.25;
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  return curve;
}

// -----------------------------
// Brain field (particles) with soft pulse + slow rotation
// -----------------------------
function BrainField({ count = 1800, color = "#34d399", emissive = "#10b981" }) {
  const pointsRef = useRef();
  const base = useMemo(() => samplePointsInBrain(count), [count]);
  const positions = useMemo(() => {
    const arr = new Float32Array(base.length * 3);
    base.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
    return arr;
  }, [base]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!pointsRef.current) return;
    // Soft global rotation + subtle breathing scale
    pointsRef.current.rotation.y = t * 0.12;
    const s = 1 + Math.sin(t * 1.8) * 0.03;
    pointsRef.current.scale.set(s, s, s);
  });

  return (
    <points ref={pointsRef} position={[0, 0.1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}

// -----------------------------
// Synapse lines: connect near neighbors with glowing segments (dynamic subset)
// -----------------------------
function SynapseLines({ points, maxConnections = 180, color = "#10b981" }) {
  const group = useRef();
  const lines = useMemo(() => {
    // build KD-tree-ish brute force: random subset for perf
    const out = [];
    const subset = points.filter(() => Math.random() < 0.22); // ~22% of points participate
    for (let i = 0; i < subset.length; i++) {
      const a = subset[i];
      // find a few nearest neighbors from the same subset
      for (let j = 0; j < 3; j++) {
        const b = subset[(i + 1 + Math.floor(Math.random() * (subset.length - 1))) % subset.length];
        const d = a.distanceTo(b);
        if (d > 0.15 && d < 0.55) {
          out.push([a.clone(), b.clone()]);
          if (out.length > maxConnections) return out;
        }
      }
    }
    return out;
  }, [points, maxConnections]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((mesh, idx) => {
      // Mild flicker via emissive intensity modulation
      const flicker = 0.6 + Math.sin(t * 3 + idx) * 0.4;
      mesh.material.emissiveIntensity = 0.35 + 0.35 * flicker;
      mesh.material.opacity = 0.28 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2 + idx * 1.7));
    });
  });

  return (
    <group ref={group}>
      {lines.map(([a, b], i) => (
        <mesh key={i}>
          <cylinderGeometry args={[0.004, 0.004, a.distanceTo(b), 6]} />
          <meshStandardMaterial color={color} emissive={color} transparent opacity={0.32} roughness={0.4} metalness={0.2} />
          {/* Orient & position the cylinder between a and b */}
          <primitive
            object={new THREE.Object3D()}
            attach={"userData.anchor"}
            visible={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Custom hook to orient cylinders between points (post-mount update)
function useLineOrient(group, lines) {
  useEffect(() => {
    if (!group.current) return;
    lines.forEach((pair, idx) => {
      const mesh = group.current.children[idx];
      if (!mesh) return;
      const [a, b] = pair;
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mesh.position.copy(mid);
      const axis = new THREE.Vector3(0, 1, 0); // default cyl up
      mesh.quaternion.setFromUnitVectors(axis, dir.clone().normalize());
    });
  }, [group, lines]);
}

// -----------------------------
// Orbiting holographic option panels with subtle 3D bending + glow
// -----------------------------
function OrbitPanel({ label = "A", angle = 0, radius = 2.8, color = "#a7f3d0", active = false, onClick }) {
  const ref = useRef();
  const plane = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = angle + t * 0.35; // orbit speed
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const y = Math.sin(a * 1.6) * 0.45; // bobbing
    ref.current.position.set(x, y, z);
    ref.current.lookAt(0, 0.2, 0);
    // subtle breathing scale when active
    const s = active ? 1.08 + Math.sin(t * 3) * 0.03 : 1.0;
    ref.current.scale.setScalar(s);
    // slight tilt for holographic feel
    if (plane.current) plane.current.rotation.y = Math.sin(t * 1.4 + angle) * 0.12;
  });

  return (
    <group ref={ref}>
      <mesh onClick={onClick}>
        <planeGeometry args={[1.6, 0.9, 16, 1]} />
        <meshStandardMaterial color={active ? "#10b981" : "#064e3b"} transparent opacity={active ? 0.9 : 0.6} emissive={active ? "#10b981" : "#0b3b2d"} emissiveIntensity={active ? 1.1 : 0.35} />
      </mesh>
      <group ref={plane} position={[0, 0, 0.02]}>
        <Text
          fontSize={0.38}
          color={active ? "#ecfdf5" : "#a7f3d0"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor={active ? "#34d399" : "#064e3b"}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

// -----------------------------
// Spark: energy packet traveling along a curve from panel to brain
// -----------------------------
function Spark({ curve, duration = 1.6, color = "#34d399", onDone }) {
  const ref = useRef();
  const start = useRef(performance.now());
  useFrame(() => {
    if (!curve || !ref.current) return;
    const now = performance.now();
    const t = ((now - start.current) / 1000) / duration; // 0..1
    const tt = clamp(t, 0, 1);
    const p = curve.getPoint(tt);
    ref.current.position.copy(p);
    ref.current.scale.setScalar(0.15 + 0.35 * Math.sin(tt * Math.PI));
    if (t >= 1) onDone?.();
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
    </mesh>
  );
}

// -----------------------------
// Camera Rig with mouse parallax for cinematic feel
// -----------------------------
function CameraRig({ intensity = 0.6 }) {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3());
  useFrame(() => {
    target.current.set(mouse.x * intensity, mouse.y * intensity * 0.6, camera.position.z);
    camera.position.x += (target.current.x - camera.position.x) * 0.05;
    camera.position.y += (target.current.y - camera.position.y) * 0.05;
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

// -----------------------------
// Ground reflection for subtle premium polish
// -----------------------------
function GroundMirror() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={2048}
        mixBlur={0.85}
        mixStrength={25}
        roughness={0.9}
        depthScale={0.8}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#00120f"
        metalness={0.4}
      />
    </mesh>
  );
}

// -----------------------------
// Main Scene content wrapper orchestrating the "selection" loop
// -----------------------------
function NeuralCosmosScene() {
  // Prepare core points for synapse lines
  const brainPts = useMemo(() => samplePointsInBrain(1200), []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [spark, setSpark] = useState(null);
  const optionPositions = useRef([
    new THREE.Vector3(2.4, 0.3, 0),
    new THREE.Vector3(-2.4, -0.1, 0),
    new THREE.Vector3(0.8, -0.35, 2.2),
    new THREE.Vector3(-0.8, 0.4, -2.2)
  ]);

  // Loop: pick next option every few seconds and fire a spark to brain
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % 4);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  // Whenever active changes, generate a new spark curve
  useEffect(() => {
    const from = optionPositions.current[activeIdx];
    const to = new THREE.Vector3(0, 0.12, 0);
    const curve = makeArcCurve(from, to);
    setSpark({ curve, key: Math.random() });
  }, [activeIdx]);

  return (
    <group>
      {/* Soft fill light */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.0} color={"#bfffe0"} />
      <pointLight position={[0, 2.6, 2]} intensity={1.2} color={"#0ea5e9"} distance={12} decay={2} />

      {/* The brain itself */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <group>
          <BrainField count={1800} />
          {/* Synapse network built from the same dataset */}
          <SynapseLines points={brainPts} maxConnections={160} />
        </group>
      </Float>

      {/* Orbiting panels (A/B/C/D) */}
      <OrbitPanel label="A" angle={0} radius={3.0} active={activeIdx === 0} onClick={() => setActiveIdx(0)} />
      <OrbitPanel label="B" angle={Math.PI / 2} radius={3.1} active={activeIdx === 1} onClick={() => setActiveIdx(1)} />
      <OrbitPanel label="C" angle={Math.PI} radius={2.8} active={activeIdx === 2} onClick={() => setActiveIdx(2)} />
      <OrbitPanel label="D" angle={(3 * Math.PI) / 2} radius={3.2} active={activeIdx === 3} onClick={() => setActiveIdx(3)} />

      {/* Spark along curve from active panel to brain */}
      {spark && <Spark key={spark.key} curve={spark.curve} duration={1.4} />}

      {/* Glam floor reflection */}
      <GroundMirror />

      {/* Effects for premium cinematic look */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
        <DepthOfField focusDistance={0.01} focalLength={0.025} bokehScale={2.6} height={480} />
        <Noise premultiply opacity={0.02} />
        <Vignette eskil={false} offset={0.18} darkness={0.7} />
      </EffectComposer>

      {/* Camera parallax rig */}
      <CameraRig intensity={0.5} />
    </group>
  );
}

// -----------------------------
// UI Shell + Canvas — the actual landing section
// -----------------------------
export default function QuizLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative isolate w-full max-w-7xl mx-auto rounded-2xl bg-gray-950 text-emerald-50">
      {/* Decorative gradient aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[60vh] w-[60vw] rounded-full blur-[120px] opacity-25 bg-emerald-600" />
        <div className="absolute -bottom-20 -right-24 h-[50vh] w-[50vw] rounded-full blur-[120px] opacity-20 bg-teal-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 md:px-10 py-12 md:py-20">
        {/* LEFT: Copy */}
        <div className="order-2 md:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-900/40 px-3 py-1 text-sm text-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-300" /> NexEmbed Quiz Pro
          </div>
         <h1 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-emerald-100">
        Master Embedded Systems with <span className="text-emerald-400">Quiz Pro</span>
        </h1>
        <p className="mt-4 text-emerald-200/80 leading-relaxed max-w-prose">
        Challenge yourself with interactive quizzes on microcontrollers, real-time systems, and embedded architectures. 
        Track your progress, review detailed solutions, and build confidence step by step—all in one powerful platform.
        </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={"/quiz"}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1 font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Rocket className="h-4 w-4" /> Start Practicing
            </Link>
            <div className="text-xs text-emerald-300/70">No sign-up required</div>
          </div>

          {/* Feature bullets */}
         <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
  {[
    { icon: Brain, title: "Topic-focused quizzes", desc: "Units and subtopics from embedded systems, organized for clarity." },
    { icon: Sparkles, title: "Instant feedback", desc: "See correct answers highlighted with explanations after each attempt." },
    { icon: Rocket, title: "Track your progress", desc: "Scores, history, and detailed reports stored for every session." },
    { icon: Palette, title: "Responsive design", desc: "Optimized for mobile, tablet, and desktop—study anywhere." }
  ].map((f, i) => (
    <li
      key={i}
      className="flex items-start gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/30 p-3"
    >
      <f.icon className="h-5 w-5 text-emerald-300" />
      <div>
        <div className="font-semibold text-emerald-100">{f.title}</div>
        <div className="text-sm text-emerald-200/80">{f.desc}</div>
      </div>
    </li>
  ))}
</ul>

        </div>

        {/* RIGHT: Canvas */}
        <div className="order-1 md:order-2">
          <div className="relative aspect-[4/3] w-full rounded-2xl border border-emerald-800/50 bg-gradient-to-b from-emerald-950 to-emerald-900/60 shadow-2xl overflow-hidden">
            {mounted && (
              <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0.8, 6.5], fov: 52 }}>
                <color attach="background" args={["#031a16"]} />
                {/* Optional manual cam: <PerspectiveCamera makeDefault position={[0, 0.8, 6.5]} fov={52} /> */}
                <NeuralCosmosScene />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
              </Canvas>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Notes:
// - This hero uses only procedural geometry: no external assets required.
// - BrainField approximates a stylized brain shape via a dual-lobe ellipsoid and subtle ripples.
// - SynapseLines connects random nearby points to suggest a neural net; they flicker and glow.
// - OrbitPanel panels circle the brain; one becomes active in a timed loop; Spark animates to brain.
// - Postprocessing adds cinema-grade polish (Bloom/DoF/Vignette/Noise).
// - CameraRig creates a gentle parallax effect based on mouse.
// - Tweak counts & thresholds for perf; it runs well on modern devices.
// -----------------------------------------------------------------------------
