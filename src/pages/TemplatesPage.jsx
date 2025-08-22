import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import * as THREE from "three";
const TemplatesPage = () => {
    const navigate=useNavigate()
     const mountRef = useRef(null);
      useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = [];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = -Math.random() * 200;
      starPositions.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0x00ff99,
      size: 0.5,
      transparent: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (    
  <div className='bg-black text-emerald-500 min-h-screen  flex flex-col gap-10 items-center justify-center'>
          <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

          
          
          <p>TemplatesPage currently unavailable. coming soon.......</p>
          <Button className="bg-emerald-500 text-black cursor-pointer hover:bg-emerald-600" onClick={()=>navigate("/")}>Go Back</Button>
          </div>
   
  )
}

export default TemplatesPage