/* eslint-disable react/no-unescaped-entities */
// src/pages/LandingPage.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Icons (lucide)
import {
  Cpu,
  Zap,
  Code2,
  Share2,
  Gauge,
  Boxes,
  ShieldCheck,
  Rocket,
  Workflow,
  Wand2,
  TerminalSquare,
  Waves,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Github,
  Star,
  Lock,
  Layers,
  Globe,
  CloudUpload,
  MonitorSmartphone,
  Activity,
  Box,
  LineChart,
  BookOpen,
  Settings2,
  Grid,
  CheckCircle2,
  WandSparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ------------------------------ Theme tokens ------------------------------ */
const brand = {
  bg: "#0b1016", // base background (very dark blue/green)
  panel: "rgba(13, 18, 24, 0.85)",
  border: "rgba(16, 185, 129, 0.18)", // emerald/green 500 @ ~18%
  glow: "#10b981", // emerald-500
  glowSoft: "rgba(16, 185, 129, 0.35)",
  text: "#E5F2EC",
  subtext: "#9EB5AB",
  heading: "#CFFDE8",
  accent: "#34d399", // emerald-400
  accent2: "#22c55e", // emerald-500
};

/* -------------------------- Background (Three.js) ------------------------- */
function FloatingPoints({ count = 4500 }) {
  // Random point cloud
  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pts[i] = (Math.random() - 0.5) * 18; // spread
    }
    return pts;
  }, [count]);

  // Slow rotation for parallax feel
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
      groupRef.current.rotation.x += delta * 0.01;
    }
  });

   const mountRef = useRef(null);

  // Background Three.js Starfield
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
    <group ref={groupRef}>
      <Points positions={positions} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color={brand.accent2}
          size={0.035}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function GlowDiscs() {
  // Simple mesh quads with additive blend for soft glows
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(brand.glow),
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const geo = new THREE.CircleGeometry(4, 64);

  return (
    <group>
      <mesh position={[4, 1, -4]} material={mat} geometry={geo} />
      <mesh position={[-3, -2, -6]} material={mat} geometry={geo} />
      <mesh position={[0, 3, -5]} material={mat} geometry={geo} />
    </group>
  );
}

function Background3D() {
  return (
    <Canvas
      className="absolute inset-0 -z-10"
      camera={{ position: [0, 0, 9], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <FloatingPoints count={5200} />
      <GlowDiscs />
    </Canvas>
  );
}

/* ------------------------------ Utility UI ------------------------------- */
const Section = ({ id, className = "", children }) => (
  <section id={id} className={`relative ${className}`}>
    {children}
  </section>
);

const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-6 ${className}`}>{children}</div>
);

/* ------------------------------ Hero Section ----------------------------- */
function Hero() {
 const mountRef = useRef(null);

  // Background Three.js Starfield
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
    <Section id="hero" className=" pb-20 pt-30 md:pb-28">
         <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      <Container className="grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: Copy */}
        <div>
          <div className="mb-4">
            <Badge
              className="rounded-full border-0 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              variant="secondary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New: Templates & Tutorials
            </Badge>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: brand.heading }}
          >
            Design. Simulate. Ship.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500">
              Embedded systems in your browser.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-5 text-lg leading-relaxed"
            style={{ color: brand.subtext }}
          >
            NexEmbed is a modern, web-native lab for building IoT and embedded
            projects. Drag components, wire pins, write firmware, and visualize
            results with virtual instruments — no installs required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button
              className="h-11 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.2),0_8px_40px_rgba(16,185,129,0.25)]"
              asChild
            >
              <a href="/simulator">
                Launch Simulator
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-11 rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/50"
              asChild
            >
              <a href="#features">
                Explore Features
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          {/* Trust bar */}
          <div className="mt-10 flex items-center gap-6 text-xs sm:text-sm text-emerald-300/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Fast & Web-Native
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Developer-First
            </div>
          </div>
        </div>

        {/* Right: Visual Mock */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          {/* Glow layers */}
          <div className="absolute -inset-10 bg-[conic-gradient(at_top_left,_#10b98122,_transparent_30%,_#10b98111)] blur-3xl rounded-full " />
          <Card className="relative overflow-hidden border-green-600/50 rounded-2xl bg-[rgba(13,18,24,0.85)] border  shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-500/10">
              <CardTitle className="flex items-center gap-2 text-emerald-300">
                <Cpu className="h-5 w-5 text-emerald-400" />
                Live Canvas
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-300">
                Preview
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <HeroCanvasMock />
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Section>
  );
}

// Fake canvas mock UI (animated pins/wires)
function HeroCanvasMock() {
  return (
    <div className="relative h-[360px]">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.17]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* dummy elements */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 w-40 h-28 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
      >
        <div className="p-2 text-[10px] text-emerald-200/80">Arduino Uno</div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-emerald-400/70 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
              title={`D${i + 2}`}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="absolute right-6 top-14 w-28 h-20 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
      >
        <div className="p-2 text-[10px] text-emerald-200/80">HC-SR04</div>
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-300 px-2 py-0 h-5">
            TRIG
          </Badge>
          <Badge className="bg-emerald-500/10 text-emerald-300 px-2 py-0 h-5">
            ECHO
          </Badge>
        </div>
      </motion.div>

      {/* wires */}
      <AnimatedWire
        from={{ x: 170, y: 110 }}
        to={{ x: 460, y: 130 }}
        delay={0}
      />
      <AnimatedWire
        from={{ x: 165, y: 118 }}
        to={{ x: 458, y: 150 }}
        delay={250}
      />

      {/* LED */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-8 w-20 h-20 rounded-full border border-emerald-500/30 bg-emerald-500/5 grid place-items-center"
      >
        <div className="h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_20px_4px_rgba(16,185,129,0.6)]" />
        <div className="absolute -top-2 text-[10px] text-emerald-200/80">
          LED (D3)
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedWire({ from, to, delay = 0 }) {
  const path = `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${
    (from.x + to.x) / 2
  } ${to.y}, ${to.x} ${to.y}`;

  return (
    <svg className="absolute inset-0 overflow-visible">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.1)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.6)" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="url(#grad)"
        strokeWidth="2"
        strokeLinecap="round"
        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
      />
      {/* current pulse */}
      <motion.circle
        r="3"
        fill={brand.glow}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, delay: delay / 1000, repeat: Infinity }}
      >
        <animateMotion
          dur="2.4s"
          repeatCount="indefinite"
          keyPoints="0;1"
          keyTimes="0;1"
          path={path}
          begin={`${delay}ms`}
        />
      </motion.circle>
    </svg>
  );
}

/* --------------------------- Feature Highlights --------------------------- */
const featureList = [
  {
    icon: <WandSparkles className="h-5 w-5 text-emerald-300" />,
    title: "Drag & Drop Canvas",
    desc: "Snap-to-grid placement, intelligent wire routing, and smooth interactions.",
  },
  {
    icon: <TerminalSquare className="h-5 w-5 text-emerald-300" />,
    title: "In-Browser Firmware",
    desc: "Write and preview Arduino/ESP/STM32 style code with a mock runtime.",
  },
  {
    icon: <Waves className="h-5 w-5 text-emerald-300" />,
    title: "Virtual Instruments",
    desc: "Multimeter, Logic Analyzer, Oscilloscope, and Serial Monitor built-in.",
  },
  {
    icon: <Boxes className="h-5 w-5 text-emerald-300" />,
    title: "Rich Component Library",
    desc: "MCUs, sensors, displays, drivers, comm modules, and passives.",
  },
  {
    icon: <CloudUpload className="h-5 w-5 text-emerald-300" />,
    title: "Export & Share",
    desc: "Export PNG/SVG/JSON or generate a secure share link with snapshots.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />,
    title: "Privacy by Design",
    desc: "Local-first workflows with optional cloud sync — you’re in control.",
  },
];

function Features() {
  return (
    <Section id="features" className="py-20 md:py-28">
      <Container>
        <div className="text-center mb-12">
          <Badge className="bg-emerald-500/10 text-emerald-300 border-0">
            Why NexEmbed?
          </Badge>
          <h2
            className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: brand.heading }}
          >
            Developer-first. Education-friendly. Production-ready.
          </h2>
          <p className="mt-4 text-lg" style={{ color: brand.subtext }}>
            Everything you need to move from idea to prototype — right in the
            browser.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              viewport={{ once: true, margin: "-40px" }}
            >
              <Card className="h-full rounded-2xl border-green-500/50 bg-[rgba(13,18,34,0.85)] hover:border-emerald-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10">
                      {f.icon}
                    </div>
                    <CardTitle className="text-emerald-200">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-emerald-100/70">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Code Playground --------------------------- */
function CodePreview() {
    const navigate=useNavigate()
  const [active, setActive] = useState("arduino");

  const codeBlocks = {
    arduino: `// Blink LED on D3 using NexEmbed mock runtime
void setup() {
  pinMode(3, OUTPUT);
}

void loop() {
  digitalWrite(3, HIGH);
  delay(500);
  digitalWrite(3, LOW);
  delay(500);
}`,
    esp32: `// Read DHT22 sensor using NexEmbed mock runtime
#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  Serial.printf("T: %.1f°C  H: %.1f%%\\n", t, h);
  delay(2000);
}`,
    stm32: `// Servo control (PWM) on STM32 mock runtime
#include "servo.h"

void setup() {
  servoInit(PA8); // TIM1_CH1
}

void loop() {
  for (int a=0; a<=180; a+=10) { servoWrite(PA8, a); delay(150); }
  for (int a=180; a>=0; a-=10) { servoWrite(PA8, a); delay(150); }
}`,
  };

  return (
    <Section id="code" className="py-20 md:py-28">
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <Badge className="bg-emerald-500/10  text-emerald-300 border-0">
              Firmware Playground
            </Badge>
            <h3
              className="mt-3 text-2xl md:text-4xl font-extrabold"
              style={{ color: brand.heading }}
            >
              Write device code without leaving the browser.
            </h3>
            <p className="mt-3 text-emerald-100/70">
              Tabs for Arduino, ESP32, and STM32 show how fast you can iterate.
              Console output streams to a virtual terminal. Export your project
              when you’re done — or share a link.
            </p>

            <ul className="mt-6 space-y-2 text-emerald-100/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Syntax highlighting & templates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Mock timings & peripherals (PWM/I2C/SPI/UART)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Shareable, reproducible demos
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              <Button className="rounded-xl bg-emerald-500 text-black cursor-pointer hover:bg-emerald-400"
              onClick={()=>navigate("/projects")}
              >
                Open Templates
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-emerald-500/30 text-emerald-500 cursor-pointer hover:bg-emerald-500/10 hover:text-green-500/50"
                onClick={()=>navigate("/docs")}
              >
                Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-green-500/50 bg-[rgba(13,18,24,0.85)]">
            <CardHeader className="border-b border-emerald-500/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-200 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-emerald-400" />
                  Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-300">
                    Mock Runtime
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-300">
                    Serial Console
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs
                value={active}
                onValueChange={setActive}
                className="w-full"
              >
                <TabsList className="w-full justify-start gap-2 bg-emerald-500  border-b border-emerald-500/10 rounded">
                  <TabsTrigger
                    value="arduino"
                    className="data-[state=active]:bg-black cursor-pointer data-[state=active]:text-emerald-300"
                  >
                    Arduino
                  </TabsTrigger>
                  <TabsTrigger
                    value="esp32"
                    className="data-[state=active]:bg-black cursor-pointer data-[state=active]:text-emerald-300"
                  >
                    ESP32
                  </TabsTrigger>
                  <TabsTrigger
                    value="stm32"
                    className="data-[state=active]:bg-black cursor-pointer data-[state=active]:text-emerald-300"
                  >
                    STM32
                  </TabsTrigger>
                </TabsList>

                {Object.entries(codeBlocks).map(([k, code]) => (
                  <TabsContent key={k} value={k}>
                    <div className="grid md:grid-cols-[1fr_340px]">
                      <pre className="p-4 md:p-6 text-sm leading-relaxed text-emerald-100/90 overflow-x-auto bg-[#0d1218]">
                        <code>{code}</code>
                      </pre>
                      <div className="border-l border-emerald-500/10 bg-[#0b1117] p-4">
                        <div className="text-xs text-emerald-300/80 mb-2">
                          Serial Monitor
                        </div>
                        <div className="h-[180px] overflow-auto rounded-lg border border-emerald-500/50 bg-gray-900 p-3 font-mono text-xs text-emerald-300/90">
                          {k === "esp32" ? (
                            <>
                              <div>[115200] Booting...</div>
                              <div>Connecting DHT22...</div>
                              <div>T: 26.3°C  H: 55.7%</div>
                              <div>T: 26.4°C  H: 55.8%</div>
                            </>
                          ) : k === "arduino" ? (
                            <>
                              <div>[9600] Blink started on D3</div>
                              <div>HIGH</div>
                              <div>LOW</div>
                              <div>HIGH</div>
                            </>
                          ) : (
                            <>
                              <div>[115200] Servo init on PA8</div>
                              <div>Angle → 0° .. 180° .. 0°</div>
                              <div>Loop OK</div>
                            </>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button className="h-8 rounded-md bg-emerald-500 cursor-pointer text-black hover:bg-emerald-400">
                            Run
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 rounded-md border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 cursor-pointer"
                          >
                            Stop
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 rounded-md border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 cursor-pointer"
                          >
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------- Stats Bar -------------------------------- */
function Stats() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const Counter = ({ to }) => {
    const [n, setN] = useState(0);
    useEffect(() => {
      if (!mounted) return;
      const dur = 900;
      const start = performance.now();
      let raf;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        setN(Math.floor(p * to));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [to, mounted]);
    return <span>{n.toLocaleString()}</span>;
  };

  const items = [
    {
      icon: <Gauge className="h-4 w-4" />,
      label: "ms avg latency",
      value: 28,
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: "components simulated",
      value: 120,
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "template circuits",
      value: 45,
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "countries using NexEmbed",
      value: 32,
    },
  ];

  return (
    <Section className="py-10">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <Card
              key={i}
              className="rounded-xl bg-[rgba(13,18,34,0.7)] border-green-500/50"
            >
              <CardContent className="flex items-center gap-3 py-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300">
                  {it.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-200">
                    <Counter to={it.value} />
                  </div>
                  <div className="text-[12px] text-emerald-300/70">
                    {it.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------- Showcase -------------------------------- */
const showcase = [
  {
    title: "Smart Home Hub",
    desc: "ESP32 + DHT22 + Relay: automate fans by temperature.",
    icon: <MonitorSmartphone className="h-4 w-4 text-emerald-300" />,
    path:"/smart-home-hub"
  },
  {
    title: "Line Follower Bot",
    desc: "Arduino + IR array + L293D H-bridge driving dual motors.",
    icon: <Workflow className="h-4 w-4 text-emerald-300" />,
    path:"/line-follower-bot"
  },
  {
    title: "Weather Station",
    desc: "Pico + BME280 + OLED with live graphs and storage.",
    icon: <LineChart className="h-4 w-4 text-emerald-300" />,
    path:"/weather-station"
  },
  {
    title: "Access Control",
    desc: "STM32 + RFID + Relay: secured door system prototype.",
    icon: <Lock className="h-4 w-4 text-emerald-300" />,
    path:"/access-control",
  },
];

function Showcase() {
  const navigate=useNavigate()
  return (
    <Section id="templates" className="py-20 md:py-28">
      <Container>
        <div className="text-center mb-10">
          <Badge className="bg-emerald-500/50 text-emerald-300 border-0">
            Templates & Tutorials
          </Badge>
          <h3
            className="mt-3 text-3xl md:text-4xl font-extrabold"
            style={{ color: brand.heading }}
          >
            Start faster with curated templates.
          </h3>
          <p className="mt-3 text-emerald-100/70">
            Import a circuit and learn by tweaking. Every template includes
            wiring diagrams, code, and mock inputs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {showcase.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-2xl bg-[rgba(13,18,34,0.85)] border-emerald-500/50 hover:border-emerald-500/30 transition">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10">
                      {s.icon}
                    </div>
                    <CardTitle>{s.title}</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-300">
                    Example
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-emerald-100/70">{s.desc}</p>
                  <div className="mt-4">
                    <Button className="rounded-xl cursor-pointer bg-emerald-500 text-black hover:bg-emerald-400
                     
                    "
                    onClick={()=>navigate(s.path)}
                    >
                      Open in Simulator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------- FAQ ----------------------------------- */
function FAQ() {
  const items = [
    {
      q: "Does NexEmbed run in the browser only?",
      a: "Yes — it's fully web-native. Nothing to install. Your projects autosave locally, and Pro adds cloud sync.",
    },
    {
      q: "Can I export my circuits?",
      a: "Absolutely. Export as PNG, SVG, or full Project JSON. Share links preserve state and snapshots.",
    },
    {
      q: "Is there a real microcontroller runtime?",
      a: "NexEmbed uses a mock runtime for fast iteration. Hardware integration and device flashing are on the roadmap.",
    },
    {
      q: "Do you support classrooms?",
      a: "Yes — EDU plans include class templates, student rosters, and SSO. Reach out for details.",
    },
  ];

  return (
    <Section id="faq" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="text-center mb-8">
          <Badge className="bg-emerald-500/50 text-emerald-300 border-0">
            FAQ
          </Badge>
          <h3
            className="mt-3 text-3xl md:text-4xl font-extrabold"
            style={{ color: brand.heading }}
          >
            Answers to common questions.
          </h3>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-emerald-200">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-emerald-100/80">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}

/* ------------------------------- CTA Final -------------------------------- */
function FinalCTA() {

    const navigate=useNavigate()
  return (
    <Section className="py-16">
      <Container>
        <Card className="relative overflow-hidden rounded-2xl border-emerald-500/50 bg-[rgba(13,18,34,0.95)]">
          <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_10%_10%,rgba(16,185,129,0.08),transparent),radial-gradient(400px_200px_at_90%_90%,rgba(16,185,129,0.08),transparent)]" />
          <CardContent className="relative p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h4
                className="text-2xl md:text-3xl font-extrabold"
                style={{ color: brand.heading }}
              >
                Ready to surprise your students, clients, or teammates?
              </h4>
              <p className="mt-2 text-emerald-100/80">
                Launch the simulator, pick a template, and ship your first
                prototype today — all in the browser.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="rounded-xl cursor-pointer bg-emerald-500 text-black hover:bg-emerald-400"
              
              onClick={()=>navigate("/simulator")}>
                Launch Simulator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 cursor-pointer"
                onClick={()=>navigate("/docs")}
              >
                View Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

/* ------------------------------- Main Page -------------------------------- */
export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: brand.bg, color: brand.text }}
    >
     

      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #12b9811a 1px, transparent 1px), linear-gradient(to bottom, #12b9811a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Sections */}
      <Hero />
      <Stats />
      <Features />
      <CodePreview />
      <Showcase />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
