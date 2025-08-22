// ThreeBoard4.jsx
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, Text } from "@react-three/drei";

export default function ThreeBoard4({ running = false }) {
  const [windAngle, setWindAngle] = useState(0);
  const [vaneAngle, setVaneAngle] = useState(0);
  const windRef = useRef();

  // Animate wind cups (anemometer) rotation angle state (drives vane direction too)
  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => setWindAngle((a) => (a + 8) % 360), 100);
    } else {
      // when idle slowly drift
      id = setInterval(() => setWindAngle((a) => (a + 0.6) % 360), 250);
    }
    return () => clearInterval(id);
  }, [running]);

  // Simulate a changing wind direction (vane) when running; idle it rests
  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => setVaneAngle((a) => (a + (Math.random() * 30 - 15)) % 360), 1200);
    } else {
      id = setInterval(() => setVaneAngle((a) => (a + 0.2) % 360), 2000);
    }
    return () => clearInterval(id);
  }, [running]);

  return (
    <Canvas shadows camera={{ position: [0, 3.5, 9], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} castShadow />
      <pointLight position={[-4, 5, 6]} intensity={0.25} />

      <OrbitControls enablePan={false} enableZoom={true} />

      <Float speed={running ? 1.6 : 0.6} rotationIntensity={0.3} floatIntensity={0.25}>
        {/* Mounting pole */}
        <Pole />

        {/* Stevenson-style vented housing */}
        <group position={[0, 0.2, 1.2]}>
          <StevensonScreen running={running} />
        </group>

        {/* Anemometer on top */}
        <group position={[0, 3.5, 1.4]}>
          <Anemometer running={running} windAngle={windAngle} />
          <WindVane vaneAngle={vaneAngle} />
        </group>

        {/* Rain gauge and funnel */}
        <group position={[-3.0, 0.0, 0.75]}>
          <RainGauge running={running} />
        </group>

        {/* Solar radiation dome */}
        <group position={[2.5, 1.2, 1.55]}>
          <SolarDome running={running} />
        </group>

        {/* LCD / Display (glass) */}
        <group position={[0, -1.35, 1.0]}>
          <LCDPanel running={running} />
          {/* HTML fallback overlay for crisp text readability */}
         

        </group>

        {/* status LED */}
        <group position={[2.6, -1.6, 1.0]}>
          <StatusLED running={running} />
        </group>
      </Float>
    </Canvas>
  );
}

/* ---------------------------
   Components: Pole, Housing,
   Anemometer, Vane, Gauge, Dome,
   LCD, Status LED
   --------------------------- */

function Pole() {
  return (
    <mesh position={[0, -1.7, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 8.0, 32]} />
      <meshStandardMaterial color="#6b7280" metalness={0.85} roughness={0.35} />
    </mesh>
  );
}

function StevensonScreen({ running }) {
  // Outer box (white vented housing)
  return (
    <group>
      {/* outer shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.4, 2.2, 1.8]} />
        <meshStandardMaterial color="#f9fafb" roughness={0.85} />
      </mesh>

      {/* louver vents front */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, -0.9 + i * 0.36, 0.95]}>
          <boxGeometry args={[3.0, 0.18, 0.08]} />
          <meshStandardMaterial color="#e6e9ee" />
        </mesh>
      ))}

      {/* small mounted PCB/hardware peek (left) */}
      <mesh position={[-1.05, 0.55, 0.6]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* little vent hole rows right */}
      {[...Array(3)].map((_, r) =>
        [...Array(6)].map((_, c) => (
          <mesh key={`vh-${r}-${c}`} position={[1.05 + c * 0.12 - 0.35, 0.5 - r * 0.18, 0.63]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 12]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Anemometer({ running, windAngle }) {
  const axisRef = useRef();
  useFrame(() => {
    if (!axisRef.current) return;
    // rotate the whole axis smoothly based on windAngle (provided by state)
    axisRef.current.rotation.y = (windAngle * Math.PI) / 180;
  });

  return (
    <group ref={axisRef}>
      {/* central pole */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.65, 16]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 3-cup arms */}
      <group position={[0, 0.36, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, (i * (2 * Math.PI)) / 3, 0]}>
            <mesh position={[0.9, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.45} roughness={0.25} />
            </mesh>
            {/* cup support arm */}
            <mesh rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.02, 0.9, 0.02]} />
              <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* spinner that rotates faster when running (blades simulated by group rotation) */}
      <FastSpinner running={running} />
    </group>
  );
}

// small inner spinner for visual speed (driven by useFrame)
function FastSpinner({ running }) {
  const spinRef = useRef();
  useFrame(({ clock }) => {
    if (!spinRef.current) return;
    const t = clock.getElapsedTime();
    spinRef.current.rotation.z = running ? t * 10 : t * 0.6;
  });
  return (
    <group ref={spinRef}>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function WindVane({ vaneAngle = 0 }) {
  const vaneRef = useRef();
  useFrame(() => {
    if (!vaneRef.current) return;
    // ease toward target angle
    const target = (vaneAngle * Math.PI) / 180;
    vaneRef.current.rotation.y += (target - vaneRef.current.rotation.y) * 0.08;
  });

  return (
    <group ref={vaneRef} position={[0.0, 0.95, -0.05]}>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.18, 0.9, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.25]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  );
}

function RainGauge({ running }) {
  // optional animated drop fill (not fully physically accurate)
  const waterRef = useRef();
  const [level, setLevel] = useState(0.12);

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => setLevel((l) => Math.min(0.75, l + Math.random() * 0.02)), 700);
    } else {
      id = setInterval(() => setLevel((l) => Math.max(0.12, l - 0.004)), 1000);
    }
    return () => clearInterval(id);
  }, [running]);

  useFrame(() => {
    if (waterRef.current) {
      waterRef.current.scale.y = level;
      waterRef.current.position.y = -0.5 + (level * 0.6) / 2;
    }
  });

  return (
    <group>
      {/* outer transparent cylinder */}
      <mesh>
        <cylinderGeometry args={[0.65, 0.85, 2.0, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.28} />
      </mesh>

      {/* funnel top */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[1.2, 0.5, 32]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.35} />
      </mesh>

      {/* inner water body */}
      <mesh ref={waterRef} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.45, 0.6, 1.0, 28]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function SolarDome({ running }) {
  const domeRef = useRef();
  useFrame(({ clock }) => {
    if (!domeRef.current) return;
    const t = clock.getElapsedTime();
    domeRef.current.material.emissiveIntensity = running ? 0.9 + Math.sin(t * 1.4) * 0.25 : 0.0;
  });

  return (
    <mesh ref={domeRef}>
      <sphereGeometry args={[0.48, 32, 32]} />
      <meshStandardMaterial color="#fff1cc" emissive={running ? "#fde68a" : "#000000"} transparent opacity={0.85} />
    </mesh>
  );
}

function LCDPanel({ running }) {
  return (
    <group>
      {/* Glass LCD background */}
      <mesh>
        <boxGeometry args={[2.8, -2.6, 0.10]} />
        <meshPhysicalMaterial
          color="#050708"
          roughness={0.15}
          metalness={0.3}
          transmission={0.85}
          thickness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={running ? "#0ea5e9" : "#000000"}
          emissiveIntensity={running ? 0.5 : 0.05}
        />
      </mesh>

      {/* Top status line */}
      <Text
        position={[0, 0.45, 0.05]}
        fontSize={0.18}
        color={running ? "#22d3ee" : "#64748b"} // cyan when running, slate gray when idle
        anchorX="center"
        anchorY="middle"
      >
        {running ? "ACCESS: GRANTED" : "SYSTEM: IDLE"}
      </Text>

      {/* Temperature + Humidity */}
      <Text
        position={[0, 0.1, 0.05]}
        fontSize={0.15}
        color="#a3e635" // lime green
        anchorX="center"
        anchorY="middle"
      >
        { !running?"TEMP: 00.0°C  HUM: 00%":"TEMP: 25.4°C   HUM: 62%"}
      </Text>

      {/* Wind + Pressure */}
      <Text
        position={[0, -0.25, 0.05]}
        fontSize={0.15}
        color="#fbbf24" // amber yellow
        anchorX="center"
        anchorY="middle"
      >
        { !running?"WIND: 00 km/h  PRESS: 0 hpa":"WIND: 12 km/h   PRESS: 1013 hPa"}
      </Text>

      {/* Alarm / Warning status */}
      <Text
        position={[0, -0.55, 0.05]}
        fontSize={0.14}
        color={running ? "#000" : "#ef4444"} // green ok, red warning
        anchorX="center"
        anchorY="middle"
      >
        {running ? "ALL SYSTEMS NOMINAL" : "WAITING FOR DATA..."}
      </Text>
    </group>
  );
}


function StatusLED({ running }) {
  const ledRef = useRef();
  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const t = clock.getElapsedTime();
    ledRef.current.material.emissiveIntensity = running ? 1.2 + Math.sin(t * 4) * 0.7 : 0.25;
  });

  return (
    <mesh ref={ledRef}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial color={running ? "#22c55e" : "#ef4444"} emissive={running ? "#22c55e" : "#ef4444"} />
    </mesh>
  );
}
