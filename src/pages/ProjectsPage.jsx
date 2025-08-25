import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Cpu, Waves, Lock, ThermometerSun } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls } from "@react-three/drei";
import Sidebar from "../components/Sidebar";

/**
 * Emerald dark hero background using Three.js
 */
function EmeraldParticles() {
  const ref = React.useRef();
  const [positions] = React.useState(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const r = 2.2 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      p[i * 3 + 0] = r * Math.cos(theta);
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      p[i * 3 + 2] = r * Math.sin(theta);
    }
    return p;
  });
  return (
    <Canvas
      className="absolute inset-0 -z-10"
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <ambientLight intensity={0.4} />
      <Points ref={ref} positions={positions}>
        <PointMaterial size={0.02} sizeAttenuation depthWrite={false} />
      </Points>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6}/>
    </Canvas>
  );
}

const projects = [
  {
    slug: "smart-home-hub",
    title: "Smart Home Hub",
    desc: "ESP32 + DHT22 + Relay: automate fans by temperature.",
    icon: Cpu,
    to: "/smart-home-hub",
    tags: ["ESP32", "Sensors", "Relay"],
  },
  {
    slug: "line-follower-bot",
    title: "Line Follower Bot",
    desc: "Arduino + IR Array + L293D H-bridge driving dual motors.",
    icon: Waves,
    to: "/line-follower-bot",
    tags: ["Arduino", "Motors", "IR"],
  },
  {
    slug: "weather-station",
    title: "Weather Station",
    desc: "Pico + BME280 + OLED with live graphs and storage.",
    icon: ThermometerSun,
    to: "/weather-station",
    tags: ["Raspberry Pi Pico", "BME280", "OLED"],
  },
  {
    slug: "access-control",
    title: "Access Control",
    desc: "STM32 + RFID + Relay: secured door system prototype.",
    icon: Lock,
    to: "/access-control",
    tags: ["STM32", "RFID", "Relay"],
  },
];

export default function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-emerald-50 ">
      <Sidebar/>
      <EmeraldParticles />

      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 mt-[-50px]  pb-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-700 hover:bg-emerald-700">Sample Projects</Badge>
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Start faster with curated Projects.
        </h1>
        <p className="mt-2 text-emerald-300/80 max-w-2xl">
          Import a circuit and learn by tweaking. Every template includes wiring diagrams,
          code, and mock inputs. Built with shadcn/ui, Framer Motion, and Three.js.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.05 }}
                viewport={{ once: true, amount: 0.4 }}
              >
                <Card className="border-emerald-700/50 bg-emerald-900/30 backdrop-blur-md rounded-2xl">
                  <CardHeader className="flex-row items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-700/60 grid place-items-center">
                      <Icon className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-emerald-100">{p.title}</CardTitle>
                      <div className="text-sm text-emerald-300/80">{p.desc}</div>
                    </div>
                    <Badge className="bg-emerald-800 hover:bg-emerald-800">Example</Badge>
                  </CardHeader>
                 <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Tags */}
  <div className="flex flex-wrap gap-2 justify-start sm:justify-start">
    {p.tags.map((t) => (
      <Badge
        key={t}
        variant="outline"
        className="border-emerald-700 text-emerald-300"
      >
        {t}
      </Badge>
    ))}
  </div>

  {/* Button */}
  <div className="flex justify-start sm:justify-end w-full sm:w-auto">
    <Button
      onClick={() => navigate(p.to)}
      className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-white rounded-xl px-4 py-2"
    >
      <span className="mr-2">Open in Simulator</span>
      <ArrowRight className="w-4 h-4" />
    </Button>
  </div>
</CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tiny footer link to all simulators */}
        <div className="mt-6 text-sm text-emerald-300/70">
          Or open directly:
          <span className="ml-2 space-x-3">
            {projects.map((p) => (
              <Link key={p.slug} to={p.to} className="underline hover:text-emerald-200">
                {p.title}
              </Link>
            ))}
          </span>
        </div>
      </section>
    </div>
  );
}
