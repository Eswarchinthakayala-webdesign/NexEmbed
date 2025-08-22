// ThreeBoard.jsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// --- Bot Component ---
function Bot({ running, pathPoints }) {
  const botRef = useRef();
  const [posIndex, setPosIndex] = useState(0);

  useFrame(() => {
    if (!running || !pathPoints.length) return;

    // Follow path step-by-step
    const target = pathPoints[posIndex];
    if (!target) return;

    // Smooth movement
    botRef.current.position.lerp(
      new THREE.Vector3(target[0], 0.2, target[1]),
      0.2
    );

    // Rotate towards next point
    if (posIndex < pathPoints.length - 1) {
      const next = pathPoints[posIndex + 1];
      const dir = new THREE.Vector3(
        next[0] - target[0],
        0,
        next[1] - target[1]
      );
      const angle = Math.atan2(dir.x, dir.z);
      botRef.current.rotation.y = angle;
    }

    // Advance index when close enough
    if (botRef.current.position.distanceTo(new THREE.Vector3(target[0], 0.2, target[1])) < 0.1) {
      setPosIndex((i) => (i + 1) % pathPoints.length);
    }
  });

  return (
    <group ref={botRef} position={[pathPoints[0][0], 0.2, pathPoints[0][1]]}>
      {/* Chassis */}
      <mesh>
        <boxGeometry args={[0.6, 0.2, 0.8]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Wheels */}
      <mesh position={[-0.35, -0.1, 0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.35, -0.1, 0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.35, -0.1, -0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.35, -0.1, -0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* IR Sensors */}
      <mesh position={[-0.15, -0.15, 0.45]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[0.15, -0.15, 0.45]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

// --- Board with Track ---
function Board() {
  return (
    <group>
      {/* Emerald Board */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#00ff3b" /> {/* Emerald theme */}
      </mesh>

      {/* Black Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.5, 3, 64]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Intersection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <boxGeometry args={[1, 1, 0.02]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

// --- Main 3D Board ---
export function ThreeBoard({ running }) {
  // Define track points (circle loop with intersection stop)
  const pathPoints = [];
  const radius = 2.7;
  for (let i = 0; i < 360; i += 5) {
    const rad = (i * Math.PI) / 180;
    pathPoints.push([Math.cos(rad) * radius, Math.sin(rad) * radius]);
  }

  // Add intersection stop point
  pathPoints.push([0, 0]);

  return (
    <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Board />
      <Bot running={running} pathPoints={pathPoints} />
      <OrbitControls />
    </Canvas>
  );
}
