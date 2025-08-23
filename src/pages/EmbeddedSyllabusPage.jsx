// EmbeddedSyllabusPage.jsx
// React (JavaScript) — NOT TypeScript / NOT Next.js
// Uses: framer-motion, three, react-markdown, remark-gfm, lucide-react, sonner, shadcn/ui
// Adjust shadcn/ui import paths if your folder structure differs.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronRight,
  Search,
  Star,
  Volume2,
  Pause,
  Download,
  Share2,
  Printer,
  Code2,
  Rocket,
  Layers,
  AlarmClock,
  BrainCircuit,
  ListTodo,
  ExternalLink,
  Trash2,
  Settings,
  Moon,
  Sun,
  BookmarkPlus,
  Bookmark,
  Play,
  Check,
} from "lucide-react";

/* ============================================================
   Emerald Dark Theme Helpers
   ============================================================ */
const emerald = {
  bg: "bg-emerald-950",
  bgSoft: "bg-emerald-900/70",
  panel: "bg-emerald-900/60 backdrop-blur",
  ring: "ring-emerald-500/40",
  border: "border border-emerald-800/60",
  text: "text-emerald-50",
  textSoft: "text-emerald-200/90",
  accent: "text-emerald-400",
  accentBg: "bg-emerald-600",
  accentSoft: "bg-emerald-600/20",
};

function cn(...cls) {
  return cls.filter(Boolean).join(" ");
}

/* ============================================================
   Course Content (Units + Markdown Notes)
   ============================================================ */
const UNITS = [
  {
    id: "unit1",
    title: "UNIT I — Embedded Computing",
    topics: [
      "Introduction",
      "Complex Systems and Microprocessor",
      "Embedded System Design Process",
      "Formalisms for System Design",
      "Design Examples",
    ],
    notes: `# UNIT I — Embedded Computing

## Introduction
Embedded computing applies dedicated hardware and software to solve real-world tasks under constraints such as time, power, memory, cost, and safety.

**Goals:** determinism, reliability, efficiency, safety, maintainability.

---

## Complex Systems and Microprocessor
- **Complex systems** combine sensing, actuation, computation, and networking.
- **Microprocessor vs. Microcontroller**
  - *Microprocessor*: CPU-centric, typically needs external RAM/Flash/peripherals.
  - *Microcontroller (MCU)*: SOC-like; CPU + RAM + Flash + peripherals on one chip.
- **Metrics:** latency, throughput, jitter, WCET, energy/task, code size, MTTF.

---

## Embedded System Design Process
1. Requirements (functional + non-functional)
2. Specification (interfaces, timing, diagrams)
3. Architecture (HW/SW partition, RTOS selection)
4. Implementation (drivers, HAL/BSP, middleware, app logic)
5. Verification (unit/integration/HIL, coverage, timing analysis)
6. Deployment (OTA updates, diagnostics, logging)

> **Tip:** Prototype early; validate timing on actual hardware.

---

## Formalisms for System Design
- FSMs & Statecharts
- Dataflow (SDF, KPN)
- Petri Nets
- UML/SysML: use-case, sequence, activity, component, deployment
- Temporal logic specs (LTL/CTL)

**Why use formal methods?** Predictability, analyzability, testability, and correctness-by-construction.

---

## Design Examples
- **Thermostat:** sensor → control (PID) → PWM heater, safety interlocks.
- **Wearable Pedometer:** IMU filter (FIR/IIR), peak detect, BLE sync, low-power modes.
- **Smart Irrigation:** soil sensors, duty-cycled LoRa, solar harvesting, weather-aware scheduling.
`,
  },
  {
    id: "unit2",
    title: "UNIT II — Embedded C Programming & Applications",
    topics: [
      "Features of Embedded Programming Languages",
      "C vs Embedded C",
      "Key Characteristics of Embedded C",
      "Standard Embedded C Data Types",
      "Block Diagram Explanation",
      "Basic Programming Steps",
      "Advanced Techniques",
    ],
    notes: `# UNIT II — Embedded C Programming & Applications

## Features of Embedded Languages
- Close to hardware, predictable memory model, tiny runtime.
- Bitwise ops, fixed-point arithmetic, direct register access.

## C vs. Embedded C
- **Hosted C** assumes OS + stdlib; **Embedded C** is freestanding (no OS), limited stdlib.
- Vendor headers expose memory-mapped registers (e.g., CMSIS on ARM).

## Key Characteristics
- Deterministic timing; minimize dynamic allocation; use \`volatile\` for I/O registers.
- ISRs: short, defer work to tasks.

## Standard Types
- \`stdint.h\` fixed widths: \`uint8_t\`, \`int16_t\`, etc. Portability & clarity.

## Toolchain Block Diagram
**Source** → Preprocess → Compile → Assemble → Link/Locate → **HEX/ELF** → Flash → **Run**

## Basic Steps
1. Clock & peripheral init.
2. Drivers (GPIO/UART/I2C/SPI).
3. Application FSM/statecharts.
4. On-target debug, unit tests.

## Advanced Techniques
- DMA pipelines, ring buffers, double buffering.
- Low-power (sleep modes, clock gating).
- MISRA-C, static analysis, coverage.
`,
  },
  {
    id: "unit3",
    title: "UNIT III — Introduction to RTOS",
    topics: [
      "Principles",
      "Semaphores and Queues",
      "Task and Task States",
      "Tasks/Data & Shared Data",
      "Message Queues, Mailboxes, Pipes",
      "Timer Functions, Events, Memory Management",
      "Interrupts in an RTOS",
      "Real-time Periodicity & Scheduling (RMS, EDF)",
      "Resource Sharing & Priority Inheritance",
    ],
    notes: `# UNIT III — Introduction to RTOS

## Principles
- Preemptive, priority-based scheduling.
- Bounded latency system calls; determinism.
- IPC primitives: queues, semaphores, events.

## Tasks & States
- States: Ready, Running, Blocked, Suspended.
- Context switches controlled by scheduler and events.

## Semaphores & Queues
- Binary/Counting semaphores for signaling & resource counts.
- Queues for message passing; avoid shared-memory races.

## Message Queues, Mailboxes, Pipes
- Mailboxes (single-slot), pipes (byte streams), queues (fixed-size items).

## Timer Functions, Events, Memory
- Tick/tickless kernels; event groups; fixed-block memory pools for O(1) alloc.

## Interrupts in RTOS
- Keep ISRs short; defer work to task context; avoid blocking in ISR.

## Scheduling (RMS, EDF)
- **RMS**: fixed priorities, shorter period → higher priority.
- Utilization bound U = n(2^(1/n) - 1) for n tasks (sufficient condition).
- **EDF**: earliest deadline first; optimal on uniprocessors.

## Resource Sharing & Priority Inheritance
- Protocols: PIP, PCP, SRP; avoid deadlocks via ordering/timeouts.
`,
  },
  {
    id: "unit4",
    title: "UNIT IV — Basic Hardware–Software Co-Design",
    topics: [
      "Saving Memory and Power",
      "Example RTOS: µC/OS",
      "Dev Tools: Host/Target, Linker/Locator",
      "HW–SW Co-simulation & Partitioning",
      "Optimization: ILP, Kernighan–Lin, GA, PSO",
      "Power-aware & Functional Partitioning",
    ],
    notes: `# UNIT IV — Hardware–Software Co-Design

## Saving Memory/Power
- Prefer compact types; compress assets; avoid recursion.
- DVFS, deep sleep, peripheral gating, batching I/O.

## Example RTOS: µC/OS
- Tiny footprint, preemptive priority scheduling, semaphores/mailboxes.

## Dev Tools
- Host (IDE/Compiler/Emulator) <-> Target (board, probe).
- Linker scripts/locators define memory regions & sections.

## Co-Sim & Partitioning
- Transaction-level models; accelerate hotspots in FPGA/ASIC; control on MCU.

## Optimization Methods
- **ILP** (exact), **Kernighan–Lin** (graph partition heuristic),
- **GA** (evolutionary search), **PSO** (swarm-based).

## Power-aware & Functional Partitioning
- Minimize toggling; maximize locality; schedule sleep windows.
`,
  },
  {
    id: "unit5",
    title: "UNIT V — Advanced Architectures",
    topics: [
      "ARM & ARM7 (LPC2148)",
      "Networked Systems: I2C, CAN, RS232, USB, IrDA, Bluetooth",
      "DSPs, FPGAs, ASICs",
      "SoC Architecture & On-Chip Interconnect",
      "SoC Case Study: Digital Camera",
    ],
    notes: `# UNIT V — Advanced Architectures

## ARM & ARM7 (LPC2148)
- ARM7TDMI, Thumb ISA, vector interrupts, PLL, timers, UART, I2C, SPI, ADC, PWM.

## Buses & Connectivity
- **I2C**: two-wire, addresses, 100 kHz–3.4 MHz.
- **CAN**: robust arbitration, CRC, automotive dominant.
- **RS232**: legacy serial ± voltage, point-to-point.
- **USB**: host-centric, endpoints, transfer types.
- **IrDA**: infrared, line-of-sight.
- **Bluetooth**: 2.4 GHz, Classic + BLE (GATT profiles).

## DSPs, FPGAs, ASICs
- DSPs: MAC units, circular buffers, saturation arithmetic.
- FPGAs: reconfigurable logic, IP cores, HLS.
- ASICs: fixed function, high perf/efficiency at volume.

## SoC & Interconnect
- AXI/AHB/APB, cache coherence, DMA, QoS, on-chip networks.

## Case Study: Digital Camera SoC
Sensor → ISP (demosaic/denoise) → JPEG/HEVC → Memory → Display/Storage.
Constraints: frame deadlines, power, heat, bandwidth.
`,
  },
];

/* ============================================================
   Local Storage Hook (JS version)
   ============================================================ */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

/* ============================================================
   Text-to-Speech Hook
   ============================================================ */
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(null);
  const utterRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
  }, []);

  const speak = (md) => {
    if (!synthRef.current) return;
    const text = (md || "").replace(/[#*_`>\-]/g, " ").replace(/\n+/g, ". ").trim();
    if (!text) return;
    if (utterRef.current) synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    synthRef.current.speak(utter);
  };

  const stop = () => {
    try {
      if (synthRef.current) synthRef.current.cancel();
      setSpeaking(false);
    } catch {}
  };

  return { speak, stop, speaking };
}

/* ============================================================
   Utilities
   ============================================================ */
function normalize(s) {
  return (s || "").toLowerCase().normalize("NFKD");
}
function filterUnits(query) {
  const q = normalize(query);
  if (!q) return UNITS;
  return UNITS
    .map((u) => ({
      ...u,
      topics: u.topics.filter((t) => normalize(t).includes(q)),
    }))
    .filter(
      (u) =>
        normalize(u.title).includes(q) ||
        u.topics.length > 0 ||
        normalize(u.notes).includes(q)
    );
}
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied"),
    () => toast.error("Copy failed")
  );
}

/* ============================================================
   NEW: Extract a subtopic's markdown slice from a unit
   ============================================================ */
function extractTopicNotes(unit, topic) {
  if (!unit || !topic) return "";
  const lines = unit.notes.split("\n");
  const target = topic.trim().toLowerCase();
  let buf = [];
  let started = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const l = line.trim().toLowerCase();

    // Treat headings "## <topic>" as anchors; also allow fuzzy include of topic text in a heading line
    const isHeading = l.startsWith("## ");
    const isTopicHeading = isHeading && (l === `## ${target}` || l.includes(target));

    if (!started && isTopicHeading) {
      started = true;
      // ensure heading remains
      buf.push(lines[i]);
      continue;
    }

    if (started) {
      // stop at the next "## " heading (but not the first line we already captured)
      if (isHeading) break;
      buf.push(lines[i]);
    }
  }

  if (!started) {
    // fallback: return a stub section if not found
    return `## ${topic}\n\n(Details coming soon…)`;
  }

  const joined = buf.join("\n").trim();
  return joined.length ? joined : `## ${topic}\n\n(Details coming soon…)`;
}

/* ============================================================
   Three.js Emerald 3D Background (JSX)
   ============================================================ */
function Scene3D({ intensity = 1 }) {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const count = Math.floor(600 * intensity);
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 50 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.6,
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    });
    const points = new THREE.Points(geom, mat);
    group.add(points);

    const tk = new THREE.TorusKnotGeometry(18, 0.6, 220, 32);
    const tkMat = new THREE.MeshBasicMaterial({
      color: 0x065f46,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const torus = new THREE.Mesh(tk, tkMat);
    group.add(torus);

    const light = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(light);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    const animate = () => {
      t += 0.003;
      group.rotation.y += 0.0008 * (1 + intensity);
      group.rotation.x = 0.1 * Math.sin(t);
      torus.rotation.y -= 0.0012;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      geom.dispose();
      tk.dispose();
      mat.dispose();
      tkMat.dispose();
      renderer.dispose();
    };
  }, [intensity]);

  return <div ref={mountRef} className="absolute inset-0 -z-10" aria-hidden />;
}

/* ============================================================
   Study Timer Component
   ============================================================ */
function StudyTimer() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <div className="text-center text-2xl font-mono tracking-widest text-emerald-100">
        {mm}:{ss}
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-emerald-700 hover:bg-emerald-600"
          onClick={() => setRunning((v) => !v)}
        >
          {running ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" className={emerald.border} onClick={() => setSecs(25 * 60)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   Key Ideas (extract "##" headings)
   ============================================================ */
function KeyIdeas({ unit }) {
  const ideas = useMemo(() => {
    if (!unit) return [];
    const lines = unit.notes.split("\n");
    return lines
      .filter((l) => l.startsWith("## "))
      .map((l) => l.replace(/^##\s+/, ""))
      .slice(0, 12);
  }, [unit]);

  if (!unit) return null;

  return (
    <ul className="space-y-2">
      {ideas.map((idea, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-emerald-400 mt-1" />
          <span className="text-emerald-100 text-sm">{idea}</span>
        </li>
      ))}
      {ideas.length === 0 && (
        <div className="text-emerald-300 text-sm">No headings detected in notes.</div>
      )}
    </ul>
  );
}

/* ============================================================
   Quiz (auto-generated per unit)
   ============================================================ */
function makeQuizFromUnit(unit) {
  if (!unit) return [];
  const id = unit.id;
  const q = [];
  q.push({
    id: `${id}-q1`,
    type: "mcq",
    prompt: `Which statement best describes the focus of ${unit.title}?`,
    opts: [
      "General-purpose computing",
      "Application-specific computing under constraints",
      "Blockchain mining at scale",
      "Desktop GUI frameworks",
    ],
    answer: 1,
  });
  q.push({
    id: `${id}-q2`,
    type: "mcq",
    prompt: "Which bus is known for robust arbitration and automotive use?",
    opts: ["I2C", "CAN", "RS232", "IrDA"],
    answer: 1,
  });
  q.push({
    id: `${id}-q3`,
    type: "tf",
    prompt: "EDF assigns priorities based on earliest deadlines.",
    answer: true,
  });
  q.push({
    id: `${id}-q4`,
    type: "tf",
    prompt: "In Embedded C, 'volatile' marks memory that can change unexpectedly.",
    answer: true,
  });
  q.push({
    id: `${id}-q5`,
    type: "short",
    prompt: "Name one optimization method for HW–SW partitioning.",
  });
  return q;
}

function Quiz({ unit }) {
  const [state, setState] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const questions = useMemo(() => makeQuizFromUnit(unit), [unit]);

  const score = useMemo(() => {
    let s = 0;
    for (const qu of questions) {
      if (qu.type === "mcq" && state[qu.id] === qu.answer) s++;
      if (qu.type === "tf" && state[qu.id] === (qu.answer ? "true" : "false")) s++;
    }
    return s;
  }, [questions, state]);

  if (!unit) return <div className="text-emerald-300">Open a unit to take a quick quiz.</div>;

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id} className={cn(emerald.panel, emerald.border)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-100 text-base">{q.prompt}</CardTitle>
            <CardDescription className="text-emerald-300">Question ID: {q.id}</CardDescription>
          </CardHeader>
          <CardContent>
            {q.type === "mcq" && (
              <div className="grid gap-2">
                {q.opts.map((o, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={state[q.id] === i}
                      onCheckedChange={() =>
                        setState((prev) => ({ ...prev, [q.id]: i }))
                      }
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "tf" && (
              <div className="flex gap-3">
                <Button
                  variant={state[q.id] === "true" ? "default" : "outline"}
                  className={cn(state[q.id] === "true" ? "bg-emerald-700" : "", emerald.border)}
                  onClick={() => setState((p) => ({ ...p, [q.id]: "true" }))}
                >
                  True
                </Button>
                <Button
                  variant={state[q.id] === "false" ? "default" : "outline"}
                  className={cn(state[q.id] === "false" ? "bg-emerald-700" : "", emerald.border)}
                  onClick={() => setState((p) => ({ ...p, [q.id]: "false" }))}
                >
                  False
                </Button>
              </div>
            )}
            {q.type === "short" && (
              <Input
                placeholder="Your answer…"
                value={state[q.id] ?? ""}
                onChange={(e) => setState((p) => ({ ...p, [q.id]: e.target.value }))}
                className={cn(emerald.border, "bg-emerald-950/60 text-emerald-50")}
              />
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center gap-3">
        <Button
          className="bg-emerald-700 hover:bg-emerald-600"
          onClick={() => {
            setSubmitted(true);
            toast.success("Quiz submitted!");
          }}
        >
          Submit
        </Button>
        {submitted && (
          <Badge className="bg-emerald-800/60">
            Score: {score} / {questions.filter((q) => q.type !== "short").length}
          </Badge>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Tasks (per-unit checklist)
   ============================================================ */
function TaskList({ unitId }) {
  const key = `tasks-${unitId}`;
  const [tasks, setTasks] = useLocalStorage(key, [
    { id: "t1", text: "Read all headings", done: false },
    { id: "t2", text: "Summarize key ideas", done: false },
    { id: "t3", text: "Attempt quiz", done: false },
    { id: "t4", text: "Create flashcards", done: false },
  ]);
  const [newText, setNewText] = useState("");

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-emerald-200 text-sm">
          Completed: {doneCount}/{tasks.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className={emerald.border}
            onClick={() => setTasks(tasks.map((t) => ({ ...t, done: true })))}
          >
            Mark all done
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={emerald.border}
            onClick={() => setTasks(tasks.map((t) => ({ ...t, done: false })))}
          >
            Reset
          </Button>
        </div>
      </div>
      <Separator className="bg-emerald-800/60" />
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <Checkbox
              checked={t.done}
              onCheckedChange={(v) =>
                setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !!v } : x)))
              }
            />
            <Input
              value={t.text}
              onChange={(e) =>
                setTasks(tasks.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)))
              }
              className={cn(emerald.border, "bg-emerald-950/60 text-emerald-50")}
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-emerald-300 hover:text-emerald-100"
              onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="New task…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className={cn(emerald.border, "bg-emerald-950/60 text-emerald-50")}
        />
        <Button
          onClick={() => {
            if (!newText.trim()) return;
            const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
            setTasks([...tasks, { id, text: newText.trim(), done: false }]);
            setNewText("");
          }}
          className="bg-emerald-700 hover:bg-emerald-600"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   Resources
   ============================================================ */
function Resources({ unit }) {
  if (!unit) return <div className="text-emerald-300">Open a unit to see suggested resources.</div>;
  const common = [
    {
      title: "ARM Architecture Reference (overview)",
      note: "Background for ARM-based embedded platforms.",
    },
    { title: "CMSIS (ARM Cortex Microcontroller SW Interface Standard)", note: "Register access & DSP libs." },
    { title: "FreeRTOS docs", note: "RTOS concepts & APIs." },
  ];
  const extra = {
    unit1: [
      { title: "UML Distilled", note: "Lightweight intro to design formalisms." },
      { title: "Real-Time Systems by Jane W. S.", note: "Foundations of time constraints." },
    ],
    unit2: [
      { title: "MISRA C Guidelines", note: "Safer embedded C coding." },
      { title: "Linker Scripts by Example", note: "Memory maps & placement." },
    ],
    unit3: [
      { title: "Scheduling Theory (Liu & Layland)", note: "Classic RMS bound." },
      { title: "Priority Inheritance Protocols", note: "Avoid priority inversion." },
    ],
    unit4: [
      { title: "SystemC TLM", note: "Co-simulation modeling." },
      { title: "ILP Primer", note: "Formulating embedded optimizations." },
    ],
    unit5: [
      { title: "AMBA AXI Spec (overview)", note: "On-chip interconnects." },
      { title: "SoC Imaging Pipelines", note: "From sensor to codec." },
    ],
  };
  const list = [...common, ...(extra[unit.id] || [])];

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {list.map((r, idx) => (
        <Card key={idx} className={cn(emerald.panel, emerald.border)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-100 text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {r.title}
            </CardTitle>
            <CardDescription className="text-emerald-300">{r.note}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="secondary"
              className="bg-emerald-800/60"
              onClick={() => toast.info("Open the official docs/site in a new tab (add URLs in code).")}
            >
              Open
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   Main App
   ============================================================ */
export default function EmbeddedSyllabusPage() {
  const [query, setQuery] = useState("");
  const [openUnit, setOpenUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage("voiceEnabled", true);
  const [bookmarks, setBookmarks] = useLocalStorage("bookmarks", []);
  const [progressMap, setProgressMap] = useLocalStorage("progressMap", {});
  const [density, setDensity] = useLocalStorage("density", 1);
  const [contrast, setContrast] = useLocalStorage("contrast", 1);
  const [zen, setZen] = useLocalStorage("zen", false);
  const [animIntensity, setAnimIntensity] = useLocalStorage("animIntensity", 1);
  const [markdownEditing, setMarkdownEditing] = useState(false);
  const [customNotes, setCustomNotes] = useLocalStorage("customNotes", {});
  const [theme, setTheme] = useLocalStorage("theme", "emerald-dark");
  const { speak, stop, speaking } = useSpeech();

  // NEW: editor toggle for subtopic view
  const [topicEditing, setTopicEditing] = useState(false);

  const filtered = useMemo(() => filterUnits(query), [query]);
  const activeUnit = useMemo(() => UNITS.find((u) => u.id === openUnit) || null, [openUnit]);
  const activeNotes = useMemo(() => {
    if (!activeUnit) return "";
    const override = customNotes[activeUnit.id];
    return override && override.trim().length > 0 ? override : activeUnit.notes;
  }, [activeUnit, customNotes]);

  // NEW: compute the notes for the selected subtopic from active unit
  const activeTopicNotes = useMemo(() => {
    if (!activeUnit || !selectedTopic) return "";
    const source = customNotes[activeUnit.id] && customNotes[activeUnit.id].trim().length
      ? customNotes[activeUnit.id]
      : activeUnit.notes;
    // Use a temporary unit object with selected source
    return extractTopicNotes({ ...activeUnit, notes: source }, selectedTopic);
  }, [activeUnit, selectedTopic, customNotes]);

  const progress = useMemo(() => {
    const total = UNITS.length;
    const done = Object.values(progressMap).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [progressMap]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("global-search");
        if (el) el.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        window.print();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (activeUnit) toggleBookmark(activeUnit.id);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (activeUnit) readActive();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeUnit, activeNotes, voiceEnabled]);

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash) setOpenUnit(fromHash);
  }, []);
  useEffect(() => {
    if (openUnit) window.location.hash = `#${openUnit}`;
  }, [openUnit]);

  const densityClass =
    density === 0 ? "text-sm leading-tight" : density === 2 ? "text-lg leading-8" : "text-base";
  const contrastClass = contrast > 1 ? "contrast-125" : contrast < 1 ? "contrast-75" : "contrast-100";

  function toggleBookmark(id) {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }
  function markComplete(id, val) {
    setProgressMap((prev) => ({ ...prev, [id]: val }));
  }
  function readActive() {
    if (!activeUnit) return;
    if (!voiceEnabled) {
      toast("Enable voice in settings to use read aloud");
      return;
    }
    if (speaking) stop();
    else speak(activeNotes);
  }
  function exportActive(fmt = "md") {
    if (!activeUnit) return;
    const title = activeUnit.title.replace(/\s+/g, "-");
    const text = activeNotes;
    if (fmt === "md") downloadText(`${title}.md`, text);
    if (fmt === "txt") downloadText(`${title}.txt`, text.replace(/[#*_`>\-]/g, ""));
    if (fmt === "json")
      downloadText(
        `${title}.json`,
        JSON.stringify({ id: activeUnit.id, title: activeUnit.title, notes: text }, null, 2)
      );
  }
  function shareLink() {
    const url = new URL(window.location.href);
    if (activeUnit) url.hash = `#${activeUnit.id}`;
    navigator.clipboard.writeText(url.toString()).then(() => toast.success("Link copied"));
  }

  return (
    <TooltipProvider>
      <div className={cn(emerald.bg, emerald.text, "min-h-screen pt-20 w-full relative overflow-hidden", contrastClass)}>
        {/* 3D Background */}
        <Scene3D intensity={animIntensity} />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-900/40 via-emerald-950 to-black" />

        {/* Header */}
    <motion.header
  className={cn("sticky top-0 z-20", emerald.panel, emerald.border)}
  initial={{ y: -40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 120, damping: 14 }}
>
  <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-3">
    {/* Logo + Title */}
    <div className="flex items-center gap-2 min-w-0">
      <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 shrink-0" />
      <h1 className="font-semibold tracking-tight text-emerald-200 text-sm sm:text-base truncate">
        Embedded Systems — <span className="hidden sm:inline">Interactive Notes</span>
      </h1>
      <Badge className="ml-1 sm:ml-2 bg-emerald-700/60 text-emerald-50 border border-emerald-600/40 text-xs sm:text-sm">
        Emerald Dark
      </Badge>
    </div>

    {/* Right-side controls */}
    <div className="ml-auto flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
      {/* Search */}
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-emerald-300" />
        <Input
          id="global-search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            emerald.border,
            "pl-8 bg-emerald-950/70 text-emerald-50 placeholder:text-emerald-300/60 w-full sm:w-72 text-sm sm:text-base"
          )}
        />
      </div>

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              emerald.border,
              "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
            )}
            size="sm"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            emerald.panel,
            emerald.border,
            "w-72 sm:w-80 text-emerald-50 p-2"
          )}
        >
          <DropdownMenuLabel>Display</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-4">
            {/* Density */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-emerald-100">Density</Label>
              <Slider
                value={[density]}
                min={0}
                max={2}
                step={1}
                onValueChange={(v) => setDensity(v[0])}
                className="w-full sm:w-40"
              />
            </div>

            {/* Contrast */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-emerald-100">Contrast</Label>
              <Slider
                value={[contrast]}
                min={0.75}
                max={1.25}
                step={0.25}
                onValueChange={(v) => setContrast(v[0])}
                className="w-full sm:w-40"
              />
            </div>

            {/* Animation Intensity */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-emerald-100">Animation intensity</Label>
              <Slider
                value={[animIntensity]}
                min={0}
                max={2}
                step={0.5}
                onValueChange={(v) => setAnimIntensity(v[0])}
                className="w-full sm:w-40"
              />
            </div>

            {/* Zen Mode */}
            <div className="flex items-center justify-between">
              <Label className="text-emerald-100">Zen mode</Label>
              <Switch checked={zen} onCheckedChange={setZen} />
            </div>

            {/* Voice Read-out */}
            <div className="flex items-center justify-between">
              <Label className="text-emerald-100">Voice read-out</Label>
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <Label className="text-emerald-100">Theme</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-emerald-800/60 text-xs sm:text-sm"
                  >
                    {theme}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(emerald.panel, emerald.border, "w-40")}
                >
                  <DropdownMenuItem onClick={() => setTheme("emerald-dark")}>
                    <Moon className="h-4 w-4 mr-2" /> Emerald Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("emerald-darker")}>
                    <Moon className="h-4 w-4 mr-2" /> Emerald Darker
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("emerald-neon")}>
                    <Sun className="h-4 w-4 mr-2" /> Emerald Neon
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              emerald.border,
              "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
            )}
            onClick={() => window.print()}
            size="sm"
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ctrl/Cmd + P</TooltipContent>
      </Tooltip>
    </div>
  </div>
</motion.header>

        {/* Layout */}
        <main
  className={cn(
    "mx-auto max-w-7xl px-4 py-6 grid gap-6",
    zen ? "grid-cols-1" : "lg:grid-cols-12"
  )}
>
  {/* Sidebar */}
  <section className={cn("space-y-4", zen ? "col-span-12" : "lg:col-span-4")}>
    {/* Progress Card */}
    <Card className={cn(emerald.panel, emerald.border)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-100">
          <Layers className="h-5 w-5" />
          Course Outline
        </CardTitle>
        <CardDescription className="text-emerald-300">
          Explore Units → Topics → Notes. Bookmark units and track completion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-emerald-200">Overall Progress</span>
          <span className="text-emerald-300 text-sm">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-emerald-950" />
      </CardContent>
      <CardFooter>
        <div className="text-xs text-emerald-300">
          Tip: Use{" "}
          <kbd className="px-1 py-0.5 rounded bg-emerald-800/40 border border-emerald-700">
            Ctrl/Cmd + K
          </kbd>{" "}
          to search fast.
        </div>
      </CardFooter>
    </Card>

    {/* Units Accordion */}
    <Card className={cn(emerald.panel, emerald.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-emerald-100 flex items-center gap-2">
          <ListTodo className="h-5 w-5" /> Units
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          value={openUnit || undefined}
          onValueChange={(val) => setOpenUnit(val || null)}
        >
          {filtered.map((u) => {
            const isBookmarked = bookmarks.includes(u.id);
            const done = !!progressMap[u.id];
            return (
              <AccordionItem
                key={u.id}
                value={u.id}
                className={cn(
                  emerald.border,
                  "rounded-xl mb-2 overflow-hidden"
                )}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 w-full">
                    <Badge className="bg-emerald-700/70 border-emerald-600/50">
                      {u.id.toUpperCase()}
                    </Badge>
                    <span className="text-left flex-1">{u.title}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 hover:text-emerald-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(u.id);
                          }}
                        >
                          {isBookmarked ? (
                            <Bookmark className="h-4 w-4" />
                          ) : (
                            <BookmarkPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isBookmarked ? "Remove bookmark" : "Bookmark"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 hover:text-emerald-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            markComplete(u.id, !done);
                          }}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              done ? "text-emerald-400" : ""
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {done ? "Mark incomplete" : "Mark complete"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-2 pb-3">
                    <ul className="space-y-1">
                      {u.topics.map((t, idx) => (
                        <li key={idx}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-emerald-200 hover:text-emerald-50"
                            onClick={() => {
                              setSelectedTopic((cur) =>
                                cur === t ? null : t
                              );
                              setTopicEditing(false);
                            }}
                          >
                            <ChevronRight className="h-4 w-4 mr-2" />
                            {t}
                          </Button>

                          {/* Inline responsive container */}
                          {selectedTopic === t && openUnit === u.id && (
                            <div className="mt-2 w-full rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="text-emerald-100 font-semibold">
                                  {t}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className={emerald.border}
                                        onClick={() => setTopicEditing(false)}
                                        aria-label="View (Preview)"
                                      >
                                        <BookOpen className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      View (Markdown Preview)
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className={emerald.border}
                                        onClick={() => setTopicEditing(true)}
                                        aria-label="Editor (Markdown)"
                                      >
                                        <Code2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Editor (Markdown)
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>

                              {!topicEditing ? (
                                <div className="prose prose-invert max-w-none text-sm mt-3 break-words whitespace-pre-wrap">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {activeTopicNotes}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="mt-3 space-y-2">
                                  <Label className="text-emerald-200">
                                    Edit Markdown (stored per unit in local
                                    storage)
                                  </Label>
                                  <Textarea
                                    className={cn(
                                      emerald.border,
                                      "w-full min-h-[220px] bg-emerald-950/70 text-emerald-50"
                                    )}
                                    value={
                                      customNotes[u.id]?.length
                                        ? customNotes[u.id]
                                        : u.notes
                                    }
                                    onChange={(e) =>
                                      setCustomNotes((prev) => ({
                                        ...prev,
                                        [u.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      className="bg-emerald-700 hover:bg-emerald-600"
                                      onClick={() => setTopicEditing(false)}
                                    >
                                      Done
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className={emerald.border}
                                      onClick={() =>
                                        setCustomNotes((prev) => ({
                                          ...prev,
                                          [u.id]: "",
                                        }))
                                      }
                                    >
                                      Reset to Default
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      onClick={() =>
                                        copyToClipboard(
                                          customNotes[u.id]?.length
                                            ? customNotes[u.id]
                                            : u.notes
                                        )
                                      }
                                      className="bg-emerald-800/60"
                                    >
                                      Copy
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>

    {/* Bookmarks */}
    <Card className={cn(emerald.panel, emerald.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-emerald-100 flex items-center gap-2">
          <Star className="h-5 w-5" /> Bookmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bookmarks.length === 0 && (
            <div className="text-emerald-300 text-sm">
              No bookmarks yet. Click the{" "}
              <BookmarkPlus className="inline h-4 w-4" /> icon on any unit.
            </div>
          )}
          {bookmarks.map((id) => {
            const u = UNITS.find((x) => x.id === id);
            if (!u) return null;
            return (
              <Button
                key={id}
                variant="secondary"
                className="w-full justify-start bg-emerald-800/50 hover:bg-emerald-700/60"
                onClick={() => setOpenUnit(u.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                {u.title}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </section>

  {/* Main content */}
  <section
    className={cn(
      zen ? "col-span-12" : "lg:col-span-8",
      "space-y-4"
    )}
  >
    <Card className={cn(emerald.panel, emerald.border)}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-emerald-100 flex items-center gap-2 truncate">
              <BookOpen className="h-5 w-5" />
              {activeUnit ? activeUnit.title : "Select a Unit"}
            </CardTitle>
            <CardDescription className="text-emerald-300">
              {selectedTopic
                ? `Topic: ${selectedTopic}`
                : activeUnit
                ? "Click a topic on the left to highlight a section."
                : "Use the Units panel to open a unit."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    emerald.border,
                    "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
                  )}
                  onClick={() => setMarkdownEditing((v) => !v)}
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Markdown</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    emerald.border,
                    "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
                  )}
                  onClick={readActive}
                  disabled={!activeUnit || !voiceEnabled}
                >
                  {speaking ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {voiceEnabled
                  ? speaking
                    ? "Pause"
                    : "Read out"
                  : "Enable voice in settings"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    emerald.border,
                    "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
                  )}
                  onClick={() => exportActive("md")}
                  disabled={!activeUnit}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Markdown</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    emerald.border,
                    "bg-emerald-950/60 text-emerald-100 hover:bg-emerald-900"
                  )}
                  onClick={shareLink}
                  disabled={!activeUnit}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Link</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!activeUnit && (
          <div className="text-emerald-300">
            Start by expanding a unit on the left. You can read, edit, export, or
            print notes.
          </div>
        )}
        {activeUnit && (
          <Tabs defaultValue="notes">
            <TabsList className="bg-emerald-900/60 flex flex-wrap">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* NOTES */}
            <TabsContent value="notes" className="pt-4">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-1 min-w-0 w-full">
                  {!markdownEditing ? (
                    <article
                      className={cn(
                        "prose prose-invert max-w-none break-words whitespace-pre-wrap",
                        densityClass
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeNotes}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-emerald-200">
                        Edit Markdown (stored locally)
                      </Label>
                      <Textarea
                        className={cn(
                          emerald.border,
                          "min-h-[320px] sm:min-h-[420px] bg-emerald-950/70 text-emerald-50 w-full"
                        )}
                        value={
                          customNotes[activeUnit.id] ?? activeUnit.notes
                        }
                        onChange={(e) =>
                          setCustomNotes((prev) => ({
                            ...prev,
                            [activeUnit.id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => setMarkdownEditing(false)}
                          className="bg-emerald-700 hover:bg-emerald-600"
                        >
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          className={emerald.border}
                          onClick={() =>
                            setCustomNotes((prev) => ({
                              ...prev,
                              [activeUnit.id]: "",
                            }))
                          }
                        >
                          Reset to Default
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            copyToClipboard(
                              customNotes[activeUnit.id] ??
                                activeUnit.notes
                            )
                          }
                          className="bg-emerald-800/60"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar widgets */}
                <aside className="w-full lg:w-64 shrink-0 space-y-3">
                  <Card className={cn(emerald.panel, emerald.border)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-100 flex items-center gap-2">
                        <AlarmClock className="h-4 w-4" /> Study Timer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StudyTimer />
                    </CardContent>
                  </Card>

                  <Card className={cn(emerald.panel, emerald.border)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-100 flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" /> Key Ideas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <KeyIdeas unit={activeUnit} />
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </TabsContent>

            {/* QUIZ */}
            <TabsContent value="quiz" className="pt-4">
              <Quiz unit={activeUnit} />
            </TabsContent>

            {/* TASKS */}
            <TabsContent value="tasks" className="pt-4">
              <TaskList unitId={activeUnit.id} />
            </TabsContent>

            {/* RESOURCES */}
            <TabsContent value="resources" className="pt-4">
              <Resources unit={activeUnit} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>

            {/* Footer */}
            <footer className="text-emerald-400/80 text-xs text-center py-6">
              Built with React, shadcn/ui, Framer Motion, and Three.js.
              Shortcuts: Ctrl/Cmd+K (Search), Ctrl/Cmd+P (Print), Ctrl/Cmd+B (Bookmark), Ctrl/Cmd+M (Read).
            </footer>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
