import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import React, { Suspense } from "react";

export function ThreeBoard2({ running }) {
  return (
    <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
      <Suspense fallback={null}>
        <AccessControlDevice running={running} />
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}

function AccessControlDevice({ running }) {
  return (
    <group>
      {/* === Housing with bevel === */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.8, 0.35]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>

      {/* === Glass LCD Screen === */}
      <mesh position={[0, 1.1, 0.18]}>
        <boxGeometry args={[1.2, 0.4, 0.05]} />
        <meshPhysicalMaterial
          color="#000000"
          roughness={0.1}
          transmission={0.9} // glass effect
          thickness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* LCD Text */}
      <Text
        position={[0, 1.1, 0.21]}
        fontSize={0.15}
        color={running ? "#22c55e" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000"
      >
        {running ? "ACCESS GRANTED" : "ACCESS DENIED"}
      </Text>

      {/* === RFID Panel with glow === */}
      <mesh position={[0, 0.55, 0.18]}>
        <boxGeometry args={[1.0, 0.5, 0.05]} />
        <meshStandardMaterial
          color="#1e3a8a"
          emissive="#3b82f6"
          emissiveIntensity={running ? 1.2 : 0.2}
        />
      </mesh>
      {/* RFID glow wave (fake scanning animation) */}
      <mesh position={[0, 0.55, 0.19]}>
        <ringGeometry args={[0.2, 0.5, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={running ? 0.4 : 0}
        />
      </mesh>

      {/* === Keypad with frame === */}
      <mesh position={[0, -0.3, 0.17]}>
        <boxGeometry args={[1.3, 1.3, 0.05]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      <group position={[0, -0.3, 0.18]}>
        {[...Array(4)].map((_, row) =>
          [...Array(3)].map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[-0.45 + col * 0.45, 0.45 - row * 0.45, 0]}
            >
              <boxGeometry args={[0.35, 0.35, 0.05]} />
              <meshStandardMaterial
                color="#111827"
                emissive={
                  running && row === 0 && col === 0 ? "#22c55e" : "#0ea5e9"
                }
                emissiveIntensity={
                  running && row === 0 && col === 0 ? 1.5 : 0.3
                }
              />
            </mesh>
          ))
        )}
      </group>

      {/* === Status LEDs (embedded) === */}
      <mesh position={[0.5, 1.4, 0.19]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={running ? 1.5 : 0}
        />
      </mesh>
      <mesh position={[0.7, 1.4, 0.19]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={!running ? 1.5 : 0}
        />
      </mesh>

      {/* === Buzzer as grille === */}
      <group position={[-0.6, 1.3, 0.18]}>
        {[...Array(3)].map((_, row) =>
          [...Array(3)].map((_, col) => (
            <mesh
              key={`hole-${row}-${col}`}
              position={[col * 0.07, row * 0.07, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
              <meshStandardMaterial
                color="#000"
                emissive={running ? "#dc2626" : "#000"}
                emissiveIntensity={
                  running ? (Math.sin(Date.now() * 0.2) + 1.2) : 0
                }
              />
            </mesh>
          ))
        )}
      </group>

      {/* === Door Lock Bolt === */}
      <mesh position={[0, -1.2, running ? 0.2 : 0.18]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial
          color={running ? "#22c55e" : "#ef4444"}
          metalness={0.7}
          roughness={0.3}
          emissive={running ? "#22c55e" : "#ef4444"}
          emissiveIntensity={1.0}
        />
      </mesh>
    </group>
  );
}
