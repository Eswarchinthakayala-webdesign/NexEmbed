// src/components/BackgroundAnimation.jsx
import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export default function BackgroundAnimation() {
  const points = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 5000; i++) {
      positions.push((Math.random() - 0.5) * 10); // x
      positions.push((Math.random() - 0.5) * 10); // y
      positions.push((Math.random() - 0.5) * 10); // z
    }
    return new Float32Array(positions);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 75 }}
      className="absolute inset-0 -z-10"
    >
      <ambientLight intensity={0.5} />
      <Points positions={points} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#22c55e" // Tailwind green-500
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </Canvas>
  );
}
