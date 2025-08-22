import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text } from "@react-three/drei";

// ====== PUBLIC API ======
export function ThreeBoard3({ running }) {
  // optional door animation (for fun)
  const doorOpenRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      doorOpenRef.current = !doorOpenRef.current;
    }, 3000);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <Canvas camera={{ position: [0, 0.6, 7], fov: 45 }} shadows>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} castShadow />
      <pointLight position={[-3, 3, 3]} intensity={0.4} />

      <OrbitControls enablePan={false} enableZoom={false} />

      <Float speed={running ? 1.8 : 0.8} rotationIntensity={running ? 0.9 : 0.3} floatIntensity={0.5}>
        {/* Main plinth base to “mount” devices */}
        <BasePanel />

        {/* THE HUB (wall-mounted device) */}
        <SmartHub running={running} />

        {/* Smart bulb device (breathing when running) */}
        <SmartBulb running={running} position={[2.4, -1.1, 0.45]} />

        {/* Siren/Alarm beacon (spins & pulses when running) */}
        <AlarmBeacon running={running} position={[2.5, 1.1, 0.45]} />

        {/* Vent/Fan (spins when running) */}
        <VentFan running={running} position={[-2.2, -1.1, 0.4]} />

        {/* Door block with bolt changing with “running” */}
        <DoorModule running={running} position={[0, -1.65, 0.45]} doorOpenRef={doorOpenRef} />
      </Float>
    </Canvas>
  );
}

// ====== PARTS ======

function BasePanel() {
  return (
    <mesh receiveShadow castShadow>
      <boxGeometry args={[6.8, 4.4, 0.15]} />
      <meshStandardMaterial color="#e5e7eb" metalness={0.2} roughness={0.85} />
    </mesh>
  );
}

function SmartHub({ running }) {
  // Refs for subtle animations
  const scanRingRef = useRef();
  const statusLEDRef = useRef();
  const lcdGlowRef = useRef();
  const wifiDotRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // RFID-like scan ring grow/shrink
    if (scanRingRef.current) {
      const s = 0.75 + Math.sin(t * 1.3) * 0.1;
      scanRingRef.current.scale.setScalar(running ? s : 0.75);
      scanRingRef.current.material.opacity = running ? 0.25 + (Math.sin(t * 2.1) + 1) * 0.2 : 0.08;
    }

    // Status LED pulse (green when running, red when offline)
    if (statusLEDRef.current && statusLEDRef.current.material) {
      const base = running ? 0.8 : 1.2;
      statusLEDRef.current.material.emissiveIntensity = base + Math.sin(t * (running ? 2.5 : 1.2)) * 0.5;
    }

    // LCD subtle glow
    if (lcdGlowRef.current && lcdGlowRef.current.material) {
      lcdGlowRef.current.material.emissiveIntensity = running ? 0.9 + Math.sin(t * 0.8) * 0.2 : 0.15;
    }

    // WiFi LED subtle blink when running
    if (wifiDotRef.current && wifiDotRef.current.material) {
      const blink = running ? (Math.sin(t * 5) > 0.6 ? 1.6 : 0.3) : 0.2;
      wifiDotRef.current.material.emissiveIntensity = blink;
    }
  });

  return (
    <group position={[0, 0.35, 0.42]}>
      {/* Enclosure */}
      <mesh castShadow>
        <boxGeometry args={[3.0, 2.0, 0.38]} />
        <meshStandardMaterial color="#0f172a" metalness={0.25} roughness={0.7} />
      </mesh>

      {/* Bezel / Faceplate */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[2.8, 1.8, 0.06]} />
        <meshStandardMaterial color="#111827" metalness={0.35} roughness={0.6} />
      </mesh>

      {/* Glass LCD */}
      <mesh position={[0, 0.55, 0.06]} ref={lcdGlowRef}>
        <boxGeometry args={[2.2, 0.55, 0.05]} />
        <meshPhysicalMaterial
          color="#000000"
          roughness={0.12}
          transmission={0.9}
          thickness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive={running ? "#22d3ee" : "#000000"}
          emissiveIntensity={running ? 0.9 : 0.15}
        />
      </mesh>

      {/* LCD Text */}
      <Text
        position={[0, 0.55, 0.09]}
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
        color={running ? "#22c55e" : "#ef4444"}
        outlineWidth={0.006}
        outlineColor="#000"
      >
        {running ? "SMART HUB ONLINE" : "HUB OFFLINE"}
      </Text>

      {/* Status LEDs (Embedded) */}
      <mesh position={[1.05, 0.85, 0.07]} ref={statusLEDRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={running ? "#22c55e" : "#ef4444"}
          emissive={running ? "#22c55e" : "#ef4444"}
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Tiny WiFi LED */}
      <mesh position={[-1.1, 0.85, 0.07]} ref={wifiDotRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
      </mesh>

      {/* RFID/NFC Panel */}
      <mesh position={[0, 0.1, 0.06]}>
        <boxGeometry args={[2.2, 0.5, 0.05]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#1e3a8a" emissiveIntensity={running ? 0.7 : 0.2} />
      </mesh>

      {/* Scan ring (animated) */}
      <mesh position={[0, 0.1, 0.08]} ref={scanRingRef}>
        <ringGeometry args={[0.2, 0.48, 48]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
      </mesh>

      {/* Soft keys area (capacitive) */}
      <mesh position={[0, -0.55, 0.06]}>
        <boxGeometry args={[2.2, 0.55, 0.05]} />
        <meshStandardMaterial color="#1f2937" roughness={0.85} />
      </mesh>
      <CapacitiveKeys running={running} />

      {/* Speaker Grille */}
      <SpeakerGrille position={[-1.1, -0.1, 0.07]} rows={3} cols={4} spacing={0.12} />

      {/* Side vents */}
      <Vents position={[1.55, 0, 0]} />
      <Vents position={[-1.55, 0, 0]} mirrored />

      {/* Branding */}
      <Text position={[0, -0.95, 0.07]} fontSize={0.11} color="#94a3b8" anchorX="center" anchorY="middle">
        SMART HOME HUB
      </Text>
    </group>
  );
}

function CapacitiveKeys({ running }) {
  // glow the left-most key when running
  return (
    <group position={[0, -0.55, 0.08]}>
      {[...Array(1)].map(() => null)}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[-0.8 + i * 0.8, 0, 0]}>
          <boxGeometry args={[0.55, 0.25, 0.04]} />
          <meshStandardMaterial
            color="#0b1220"
            emissive={running && i === 0 ? "#22c55e" : "#0ea5e9"}
            emissiveIntensity={running && i === 0 ? 1.4 : 0.25}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function SpeakerGrille({ position = [0, 0, 0], rows = 3, cols = 3, spacing = 0.1 }) {
  const holes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      holes.push(
        <mesh key={`h-${r}-${c}`} position={[position[0] + c * spacing, position[1] + r * spacing, position[2]]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      );
    }
  }
  return <group position={[0, 0, 0]}>{holes}</group>;
}

function Vents({ position = [0, 0, 0], mirrored = false }) {
  return (
    <group position={position} rotation={[0, mirrored ? Math.PI : 0, 0]}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0.03, -0.75 + i * 0.3, 0.02]}>
          <boxGeometry args={[0.06, 0.22, 0.02]} />
          <meshStandardMaterial color="#0b1220" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SmartBulb({ running, position = [0, 0, 0] }) {
  const bulbRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bulbRef.current && bulbRef.current.material) {
      bulbRef.current.material.emissiveIntensity = running ? 1.1 + Math.sin(t * 1.5) * 0.6 : 0.05;
      bulbRef.current.material.opacity = running ? 0.92 : 0.6;
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 0.42, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.7} />
      </mesh>
      {/* Glass bulb */}
      <mesh ref={bulbRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fde68a"
          transparent
          opacity={0.85}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function AlarmBeacon({ running, position = [0, 0, 0] }) {
  const topRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (topRef.current) topRef.current.rotation.y = running ? t * 2.2 : 0;
    if (glowRef.current && glowRef.current.material) {
      glowRef.current.material.emissiveIntensity = running ? 1.4 + Math.sin(t * 3.0) * 1.0 : 0.0;
      glowRef.current.material.opacity = running ? 0.9 : 0.35;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.28, 32]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh ref={topRef} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>
      <mesh position={[0, 0.3, 0]} ref={glowRef}>
        <cylinderGeometry args={[0.255, 0.255, 0.505, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          transparent
          opacity={0.85}
          metalness={0.05}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function VentFan({ running, position = [0, 0, 0] }) {
  const bladesRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bladesRef.current) {
      bladesRef.current.rotation.z = running ? t * 6.0 : t * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Ring/Base */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Blades */}
      <group ref={bladesRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <boxGeometry args={[0.12, 1.15, 0.06]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.45} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Center cap */}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
    </group>
  );
}

function DoorModule({ running, position = [0, 0, 0], doorOpenRef }) {
  const hingeRef = useRef();
  const boltRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Door swing outward
    if (hingeRef.current) {
      const openTarget = doorOpenRef?.current ? Math.PI / 2.5 : 0; // positive angle => outward
      hingeRef.current.rotation.y += (openTarget - hingeRef.current.rotation.y) * 0.1;
    }

    // Bolt indicator glow
    if (boltRef.current && boltRef.current.material) {
      const active = running ? "#22c55e" : "#ef4444";
      boltRef.current.material.color.set(active);
      boltRef.current.material.emissive = boltRef.current.material.emissive || new THREE.Color(active);
      boltRef.current.material.emissive.set(active);
      boltRef.current.material.emissiveIntensity = running ? 0.7 + Math.sin(t * 2.2) * 0.3 : 0.6;
    }
  });

  return (
    <group position={position}>
      {/* Door frame */}
      <mesh>
        <boxGeometry args={[1.6, 2.25, 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Door leaf hinged at left side, swings OUT */}
      <group ref={hingeRef} position={[0.8, 0, 0.06]}>
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[1.5, 2.05, 0.08]} />
          <meshStandardMaterial color="#8b5e34" metalness={0.2} roughness={0.65} />
        </mesh>
      </group>

      {/* Bolt indicator */}
      <mesh ref={boltRef} position={[0.0, -1.25, 0.09]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 24]} />
        <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

