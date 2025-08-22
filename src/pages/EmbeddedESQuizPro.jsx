import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Github,
  Brain,
  Settings,
  ChevronRight,
  BookOpen,
  Rocket,
  CheckCircle2,
  ListChecks,
  Eye,
  Moon,
  Sun,
  Wand2,
  Sparkles,
  Info,
  TimerReset,
  Recycle,
  ShieldCheck,
  Shield,
  KeyRound,
  Layers,
  Library,
  Star,
  TerminalSquare,
  BarChart3,
  Beaker,
  Cpu,
  MemoryStick,
  Network,
  Cable,
  Axis3D,
  Zap,
  Code2,
  Loader2,
  History,
  Download,
  Trash2,
  Trophy,
  Clock,
  X,
  BadgePlus,
  ChevronLeft,
} from "lucide-react";

/**
 * Embedded Quiz Pro (ENV-based, Fully Responsive) — Single-file React component (~1000 lines)
 * -----------------------------------------------------------------------------------------
 * - Uses Vite env key: VITE_GEMINI_API_KEY (no UI for pasting/storing)
 * - Dependencies: react, tailwindcss, framer-motion, @react-three/fiber, @react-three/drei, shadcn/ui, lucide-react
 * - Theme: Emerald Dark (Tailwind emerald palette, dark-first)
 * - Behavior: Generates MCQs with Gemini 1.5 Flash, quiz flow, results & review
 * - Responsive: Optimized for mobile, tablets, and desktops (no overflow on long options)
 * - New: Session storage (score, time, unit/topic, questions & answers) + History viewer
 * - New: Clear color difference for user's pick vs actual answer in review + per-option highlighting
 */

// ---------------------------------
// Utilities & Constants
// ---------------------------------
const EMERALD_GRADIENT = "from-emerald-500/20 via-emerald-400/10 to-emerald-700/20";

const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function sanitizeCount(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 10;
  return Math.max(1, Math.min(50, Math.floor(x)));
}

// Attempt to pull a JSON array from a model response that may contain markdown fences.
function extractJSONArray(text) {
  if (!text) return null;
  try {
    const direct = JSON.parse(text);
    if (Array.isArray(direct)) return direct;
  } catch {}
  const fence = text.match(/```(?:json)?([\s\S]*?)```/i);
  if (fence && fence[1]) {
    try {
      const arr = JSON.parse(fence[1]);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  const bracket = text.match(/\[[\s\S]*\]/);
  if (bracket) {
    try {
      const arr = JSON.parse(bracket[0]);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  return null;
}

function humanTime(msOrSec) {
  const s = msOrSec < 1e6 ? Math.max(0, msOrSec) : Math.floor(msOrSec / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

// ---------------------------------
// Three.js Background (subtle particles + floating rings)
// ---------------------------------
function Starfield() {
  const ref = useRef();
  const [positions] = useState(() => {
    const N = 1700;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 34; // x
      arr[i + 1] = (Math.random() - 0.5) * 22; // y
      arr[i + 2] = (Math.random() - 0.5) * 34; // z
    }
    return arr;
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial size={0.02} transparent opacity={0.55} depthWrite={false} />
    </Points>
  );
}

function EmeraldFrame() {
  const geo = useMemo(() => new THREE.RingGeometry(4.6, 5.3, 64), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#10b981"), transparent: true, opacity: 0.18 }),
    []
  );
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={1.1}>
      <mesh geometry={geo} material={mat} rotation={[Math.PI / 4, 0, 0]} />
    </Float>
  );
}

function Background3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.35} />
        <Starfield />
        <EmeraldFrame />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
      </Canvas>
    </div>
  );
}

// ---------------------------------
// Academic Content — Units & Subtopics (Expanded)
// ---------------------------------
const UNITS = [
  {
    id: "u1",
    title: "UNIT-I: Embedded Computing Fundamentals",
    subtopics: [
      { id: "u1s1", name: "Intro to Embedded Systems", description: "Definition, characteristics, reactive behavior, closed vs. open loop, examples across domains (automotive, medical, consumer)." },
      { id: "u1s2", name: "µP vs. µC", description: "Architectural contrasts, memory+peripheral integration, cost/power trade-offs, typical selection criteria for products." },
      { id: "u1s3", name: "Complexity & Constraints", description: "Timing, concurrency, resource bounds, WCET, stack/heap budgeting, and failure modes in resource-limited designs." },
      { id: "u1s4", name: "Design Process", description: "Requirements, functional spec, HW/SW partitioning, modeling, prototyping, verification, and iterative refinement." },
      { id: "u1s5", name: "Modeling Formalisms", description: "FSMs, synchronous reactive models, dataflow, Petri nets; when to use which; composability & determinism." },
      { id: "u1s6", name: "Memory Hierarchy", description: "Harvard vs. von Neumann, caches, TCM, scratchpads, MMU/MPU basics, and deterministic memory access." },
      { id: "u1s7", name: "Power & Thermal", description: "Power modes, DVFS, clock gating, thermal throttling, battery chemistry basics, and energy profiling." },
      { id: "u1s8", name: "Reliability & Safety", description: "Watchdogs, brown-out, ECC, redundancy, diagnostic coverage, SIL levels, and fail-safe strategies." },
      { id: "u1s9", name: "Toolchains & Debug", description: "Cross-compilers, linkers/locators, flashing, SWD/JTAG, on-target profiling, and logic analyzers." },
      { id: "u1s10", name: "Case Studies", description: "Digital camera pipeline, fitness tracker, smart thermostat—end-to-end architectural snapshots." },
    ],
  },
  {
    id: "u2",
    title: "UNIT-II: Embedded C Programming & Practices",
    subtopics: [
      { id: "u2s1", name: "Language Essentials", description: "Fixed-size ints, bitwise ops, volatile/const, restrict, packed/align, memory-mapped I/O and registers." },
      { id: "u2s2", name: "Start-up & Linker", description: "Reset vector, CRT0, .bss/.data init, vector tables, scatter files, and linker scripts for locators." },
      { id: "u2s3", name: "Drivers & ISRs", description: "Bare-metal drivers, interrupt latency, nesting, priorities, debouncing, and ISR best practices." },
      { id: "u2s4", name: "Concurrency Patterns", description: "Producer–consumer, circular buffers, lock-free queues, DMA-driven I/O, and double buffering." },
      { id: "u2s5", name: "Testing & CI on Target", description: "Unity/CMock, fakes vs. stubs, HW-in-loop, coverage under constraints, golden logs." },
      { id: "u2s6", name: "Low-Power Coding", description: "Tickless idle, event-driven loops, sleep-aware APIs, reducing wake-ups, and power benchmarks." },
      { id: "u2s7", name: "Defensive C", description: "MISRA-C themes, bounds checks, integer promotions, overflow guards, and robust state machines." },
      { id: "u2s8", name: "Memory & Peripherals", description: "SRAM/Flash endurance, EEPROM wear leveling, peripheral access latency, and cache effects." },
      { id: "u2s9", name: "Build & Release", description: "Reproducible builds, versioning, SBOM basics, artifact signing, and release notes discipline." },
    ],
  },
  {
    id: "u3",
    title: "UNIT-III: Real-Time Operating Systems (RTOS)",
    subtopics: [
      { id: "u3s1", name: "RTOS Core Concepts", description: "Tasks/threads, determinism, scheduling points, context switching cost, and kernel configuration." },
      { id: "u3s2", name: "Scheduling Theory", description: "Fixed vs. dynamic priority, RMS/DM, EDF, hyperperiod, response-time analysis, and jitter control." },
      { id: "u3s3", name: "IPC & Sync", description: "Semaphores, mutexes, priority inheritance/ceiling, queues, mailboxes, event groups, and flags." },
      { id: "u3s4", name: "Timers & Clocks", description: "Tick vs. tickless, software timers, RTC integration, drift and calibration, timestamping." },
      { id: "u3s5", name: "Memory & Resources", description: "Heaps, pools, region allocators, fragmentation avoidance, and stack watermarking." },
      { id: "u3s6", name: "Interrupts in RTOS", description: "ISR vs. task context, deferred ISR handling, zero-copy paths, and latency budgeting." },
      { id: "u3s7", name: "RTOS Case Studies", description: "FreeRTOS, Zephyr, µC/OS—APIs, configuration, ecosystem, and when to choose which." },
      { id: "u3s8", name: "Tracing & Debugging", description: "Trace tools, timeline views, critical section audits, and priority inversion detection." },
    ],
  },
  {
    id: "u4",
    title: "UNIT-IV: HW–SW Co-Design & Optimization",
    subtopics: [
      { id: "u4s1", name: "Partitioning", description: "SW/HW co-sim, identifying accelerators, ILP, heuristic partitioning (KL, GA, PSO), cost models." },
      { id: "u4s2", name: "Performance Tuning", description: "Cache-aware data layout, DMA pipelines, memory coalescing, and profiling for hotspots." },
      { id: "u4s3", name: "Power Optimization", description: "Duty cycling, DVFS strategies, wake source engineering, and system-level energy modeling." },
      { id: "u4s4", name: "Security-by-Design", description: "Secure boot, root-of-trust, key storage, anti-rollback, side-channel basics, and OTA hardening." },
      { id: "u4s5", name: "Toolchains & Flows", description: "Host/target tooling, emulators, QEMU, FPGA-in-loop, and continuous integration with hardware." },
      { id: "u4s6", name: "Quality & Safety", description: "Design reviews, FMEA, FTA, hazard analysis, certification mindsets (IEC 61508, ISO 26262)." },
      { id: "u4s7", name: "Case: Power Camera", description: "Power-aware imaging pipeline partitioned across CPU/DSP/ISP; latency/quality trade-offs." },
    ],
  },
  {
    id: "u5",
    title: "UNIT-V: Advanced Architectures & Interfaces",
    subtopics: [
      { id: "u5s1", name: "ARM & LPC2148", description: "ARM7TDMI pipeline, register model, memory map, PLL/VPB, GPIO/UART/SPI/I2C, dev toolchains." },
      { id: "u5s2", name: "Buses & Protocols", description: "I²C, SPI, CAN, LIN, RS-232/485, USB FS/HS, IrDA, BLE—signaling, arbitration, throughput budgeting." },
      { id: "u5s3", name: "SoC Fabrics", description: "AMBA (AHB/APB/AXI), crossbars, NoCs, QoS, coherency, and DMA engines in modern SoCs." },
      { id: "u5s4", name: "DSPs & FPGAs", description: "SIMD/MAC units, fixed-point optimization, FPGA LUT/BRAM/DSP blocks, soft cores, HLS overview." },
      { id: "u5s5", name: "Sensors & Actuators", description: "Signal conditioning, ADC/DAC, sampling theory, anti-aliasing, PWM motor control, and drivers." },
      { id: "u5s6", name: "Edge AI Basics", description: "Quantization, sparsity, NN accelerators, model pipelines, memory/layout constraints on MCUs." },
      { id: "u5s7", name: "Case: Connected Node", description: "BLE/LoRa node with ultra-low-power design, secure provisioning, and cloud telemetry patterns." },
    ],
  },
];

// ---------------------------------
// Gemini API Hook (ENV-based)
// ---------------------------------
function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuiz = async ({ topic, count }) => {
    setLoading(true);
    setError("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const system =
        `You are an expert embedded systems examiner. Generate strictly valid JSON array. ` +
        `Each item has {"question": string, "options": ["A) ...","B) ...","C) ...","D) ..."], "answer": "A|B|C|D"}. ` +
        `Difficulty: professional college-level. Avoid trivialities. Avoid code unless necessary.`;

      const user = `Create ${count} MCQs on the subtopic: "${topic}" within embedded systems. ` +
        `Focus on concepts from the provided unit outlines (RTOS, ARM/LPC2148, buses, co-design, scheduling, etc.).`;

      const body = {
        contents: [
          { role: "user", parts: [{ text: system + "\n\n" + user }] },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini error: ${res.status} ${t}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let arr = extractJSONArray(text);
      if (!arr) throw new Error("Unable to parse model output as JSON array.");

      // Normalize options + answers
      arr = arr.map((q, i) => {
        let options = q.options || q.choices || [];
        options = options.map((o) => (typeof o === "string" ? o : String(o)));
        const labeled = options.map((o, idx) => {
          const prefix = ["A)", "B)", "C)", "D)"][idx] || `${idx + 1})`;
          return /^(A|B|C|D)\)/i.test(o) ? o : `${prefix} ${o}`;
        });
        const ans = String(q.answer || "A").trim().toUpperCase()[0];
        return {
          id: `q_${i}`,
          question: q.question || `Question ${i + 1}`,
          options: labeled.slice(0, 4),
          answer: ["A", "B", "C", "D"].includes(ans) ? ans : "A",
        };
      });

      return arr;
    } catch (e) {
      console.error(e);
      setError(e.message || "Unknown error");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { generateQuiz, loading, error };
}

// ---------------------------------
// Session Storage (History)
// ---------------------------------
const SESSIONS_KEY = "eqp-sessions";

function loadSessions() {
  return storage.get(SESSIONS_KEY, []);
}

function saveSession(session) {
  const prev = loadSessions();
  const withId = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...session };
  const next = [withId, ...prev].slice(0, 30); // keep last 30
  storage.set(SESSIONS_KEY, next);
  return withId;
}

function clearSessions() {
  storage.set(SESSIONS_KEY, []);
}

// ---------------------------------
// UI — Atoms
// ---------------------------------
function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/30 grid place-items-center">
        <Rocket className="h-4.5 w-4.5 text-emerald-400" />
      </div>
      <div>
        <p className="text-emerald-300 font-semibold leading-none">NexEmbed Quiz Pro</p>
        <p className="text-[11px] text-emerald-200/70">Master embedded systems</p>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const initial = storage.get("theme-dark", true);
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    storage.set("theme-dark", next);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-2xl" onClick={toggle} aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-emerald-900/80 border-emerald-700/30 text-emerald-100">Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EnvKeyPill() {
  const ok = !!import.meta.env.VITE_GEMINI_API_KEY;
  return (
    <div
      className={
        cx(
          "px-3 py-1 rounded-full text-xs border flex items-center gap-1",
          ok ? "bg-emerald-900/40 border-emerald-700/40 text-emerald-200" : "bg-amber-900/40 border-amber-700/40 text-amber-200"
        )
      }
    >
      {ok ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
      {ok ? "ENV key loaded" : "ENV key missing"}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/30 flex items-center gap-3 w-full">
      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 grid place-items-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-emerald-300" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-emerald-300/80 truncate">{label}</p>
        <p className="text-emerald-100 font-semibold break-words">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------
// UI — Cards & Items
// ---------------------------------
function UnitCard({ unit, onOpen }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="bg-emerald-900 border-emerald-700/30 hover:border-emerald-500/40 transition rounded-2xl shadow-xl h-full">
        <CardHeader>
          <CardTitle className="text-emerald-200 text-base sm:text-lg flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="break-words">{unit.title}</span>
          </CardTitle>
          <CardDescription className="text-emerald-200/70">{unit.subtopics.length} subtopics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <Button
            onClick={() => onOpen(unit)}
            variant="secondary"
            className="rounded bg-emerald-700 cursor-pointer hover:bg-emerald-600 w-full sm:w-auto"
          >
            Explore <ChevronRight className="mb-[-3px] h-4 w-4" />
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubtopicItem({ topic, onQuiz }) {
  return (
    <div className="p-4 rounded-xl bg-emerald-900 border border-emerald-700/30 h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-emerald-200 flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="break-words">{topic.name}</span>
          </p>
          <p className="text-sm text-emerald-200/70 mt-1 break-words leading-relaxed">{topic.description}</p>
        </div>
        <Button size="sm" className="rounded-xl cursor-pointer bg-emerald-700/60 hover:bg-emerald-600/60 shrink-0" onClick={() => onQuiz(topic)}>
          Quiz <ListChecks className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function OptionToggle({ label, text, active, correctness, onSelect }) {
  /**
   * correctness: "neutral" | "correct" | "user" | "wrong"
   */
  const palette = {
    neutral: "border-emerald-700/30 data-[state=on]:bg-emerald-900/40 hover:bg-emerald-800/40",
    correct: "border-emerald-500/70 data-[state=on]:bg-emerald-800/40 ring-1 ring-emerald-400/30",
    user: "border-emerald-500/60 data-[state=on]:bg-emerald-800 cursor-pointer text-black",
    wrong: "border-red-500/60 data-[state=on]:bg-red-900/30",
  };

  return (
    <Toggle
      pressed={active}
      onPressedChange={onSelect}
      className={cx(
        "justify-start  rounded-xl border h-full text-left w-full aria-pressed:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 transition",
        palette[correctness]
      )}
    >
      <div className="flex cursor-pointer items-start gap-2 w-full">
        <span className="font-semibold text-emerald-200/90 shrink-0">{label})</span>
        <span className="text-emerald-100/90 break-words whitespace-normal leading-relaxed text-sm sm:text-[15px] flex-1">
          {text}
        </span>
      </div>
    </Toggle>
  );
}


function QuestionCard({ q, index, value, onChange, reveal = false }) {
  // When reveal=true (after submit), we color options: correct=green, user's wrong=red, others neutral
  const idxFromLetter = { A: 0, B: 1, C: 2, D: 3 };
  return (
    <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/30">
      <p className="font-medium text-emerald-100 mb-3 flex items-start gap-2">
        <TerminalSquare className="h-4 w-4 text-emerald-400 mt-0.5" />
        <span className="break-words">{index + 1}. {q.question}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const letter = (opt.match(/^(A|B|C|D)/i)?.[0] || ["A", "B", "C", "D"][i]).toUpperCase();
          const text = opt.replace(/^(A|B|C|D)\)\s*/i, "");
          const active = value === letter;
          let correctness = "neutral";
          if (reveal) {
            if (letter === q.answer) correctness = "correct";
            if (active && letter !== q.answer) correctness = "wrong";
            if (active && letter === q.answer) correctness = "correct"; // user's pick is the correct one
          } else if (active) {
            correctness = "user"; // during quiz, show active state
          }
          return (
            <OptionToggle
              key={i}
              label={letter}
              text={text}
              active={active}
              correctness={correctness}
              onSelect={() => onChange(letter)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ScoreBanner({ score, total, onReview }) {
  const pct = Math.round((score / Math.max(1, total)) * 100);
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/40 via-emerald-500/30 to-emerald-700/40 border border-emerald-600/30 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xl font-semibold text-emerald-100">Score: {score} / {total}</p>
        <p className="text-emerald-200/80 text-sm">Accuracy: {pct}%</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-emerald-800/60 border border-emerald-600/30 text-emerald-100">Professional</Badge>
        <Button className="rounded-xl cursor-pointer bg-green-700/60 hover:bg-green-600/60" onClick={onReview}><Eye className="h-4 w-4 mr-2" /> Check Answers</Button>
      </div>
    </div>
  );
}

function HistoryItem({ session, onOpen, onDelete }) {
  return (
    <div className="p-3 m-2 rounded-xl bg-black border border-emerald-700/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-emerald-100 font-medium break-words">
            {session.unit} • {session.topic}
          </p>
          <p className="text-xs pt-2 text-emerald-200/70 mt-0.5 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> {humanTime(session.elapsed)}
            <span className="mx-1">•</span>
            <Trophy className="h-3.5 w-3.5" /> {session.score}/{session.total}
            <span className="mx-1">•</span>
            <span>{new Date(session.timestamp).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" className="rounded-xl bg-emerald-400 cursor-pointer hover:bg-emerald-300 " onClick={() => onOpen(session)}>
            View
          </Button>
          <Button size="icon"  className="bg-red-500 text-black hover:bg-red-600 cursor-pointer" onClick={() => onDelete(session.id)} aria-label="Delete session">
            <Trash2 className="h-4 w-4 " />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------
// Main App Component
// ---------------------------------
export default function EmbeddedQuizPro() {
  const [view, setView] = useState("home"); // home | unit | quiz | result
  const [currentUnit, setCurrentUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { qid: "A" }
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(null); // saved session object

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [sessions, setSessions] = useState(loadSessions());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null); // a session

  const { generateQuiz, loading, error } = useGemini();

  // Timer: starts when questions appear, clears when leaving quiz
  useEffect(() => {
    if (view === "quiz" && questions.length > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, questions.length]);

  // Responsive: lock body padding on bottom when Sheet open on mobile
  useEffect(() => {
    document.body.classList.toggle("overflow-y-auto", !historyOpen);
  }, [historyOpen]);

  const startQuizFor = async (topic) => {
    setSelectedTopic(topic);
    setView("quiz");
    setAnswers({});
    setScore(0);
    setShowReview(false);
    setSessionSaved(null);
    setElapsed(0);

    const count = sanitizeCount(questionCount);
    const title = currentUnit?.title || "Embedded Systems";
    const qs = await generateQuiz({ topic: `${title} → ${topic.name}`, count });
    setQuestions(qs);
  };

  const submitQuiz = () => {
    let s = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if ((answers[q.id] || "") === q.answer) s++;
    }
    setScore(s);
    setView("result");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save session automatically
    const session = {
      timestamp: Date.now(),
      unit: currentUnit?.title || "N/A",
      topic: selectedTopic?.name || "N/A",
      score: s,
      total: questions.length,
      elapsed,
      questions,
      answers,
    };
    const saved = saveSession(session);
    setSessions(loadSessions());
    setSessionSaved(saved);
  };

  const resetHome = () => {
    setView("home");
    setCurrentUnit(null);
    setSelectedTopic(null);
    setQuestions([]);
    setAnswers({});
    setScore(0);
    setShowReview(false);
    setElapsed(0);
    setSessionSaved(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  const openSessionDetail = (s) => {
    setHistoryDetail(s);
    setHistoryOpen(true);
  };

  const deleteSession = (id) => {
    const next = sessions.filter((s) => s.id !== id);
    storage.set(SESSIONS_KEY, next);
    setSessions(next);
    if (historyDetail?.id === id) setHistoryDetail(null);
  };

  const clearAllSessions = () => {
    clearSessions();
    setSessions([]);
    setHistoryDetail(null);
  };

  return (
    <div className="relative min-h-screen pt-25 overflow-hidden bg-emerald-950/50">
      <Background3D />

      {/* Gradient veil */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(16,185,129,0.12),rgba(0,0,0,0))]" />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-emerald-950/30 border-b border-emerald-700/20">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Brand />
            <div className="hidden xs:flex items-center gap-2 min-w-0">
              <Badge className="bg-emerald-800/60 border border-emerald-600/30 text-emerald-100 shrink-0">v2 Pro UI</Badge>
              <EnvKeyPill />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button  className="rounded border border-emerald-400/50 text-white bg-emerald-600/50 cursor-pointer hover:bg-emerald-400/50 flex items-center gap-2" aria-label="Open history">
                  <History className="h-4 w-4" />
                  <span className="sm:inline">History</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className=" w-[480px] bg-emerald-700/95 border-emerald-700/30">
                <SheetHeader>
                  <SheetTitle className="text-emerald-100 flex items-center gap-2"><History className="h-4 w-4 text-emerald-400" /> Quiz History</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 overflow-y-auto h-[80vh] pr-2">
                  <div className="flex items-center justify-between">
                    <p className="text-emerald-200/80 text-sm pl-2">Stored sessions: {sessions.length}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" className="rounded-xl bg-emerald-400/50 cursor-pointer hover:bg-emerald-400 " onClick={clearAllSessions}>Clear All</Button>
                    </div>
                  </div>
                  {sessions.length === 0 && (
                    <Card className="bg-emerald-950/60 m-2 border-emerald-700">
                      <CardContent className="py-6 text-emerald-200/80 text-sm">
                        No sessions yet. Finish a quiz to see details here.
                      </CardContent>
                    </Card>
                  )}
                  {sessions.map((s) => (
                    <HistoryItem key={s.id} session={s} onOpen={openSessionDetail} onDelete={deleteSession} />
                  ))}
                  {historyDetail && (
                    <div className="mt-2 p-3 m-3 rounded-xl bg-emerald-900 border border-emerald-700/30">
                      <p className="text-emerald-100 font-semibold">Session Detail</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {historyDetail.unit} • {historyDetail.topic} • {new Date(historyDetail.timestamp).toLocaleString()}
                      </p>
                      <div className="mt-3 space-y-3">
                        {historyDetail.questions.map((q, idx) => {
                          const picked = historyDetail.answers[q.id] || "—";
                          const correct = q.answer;
                          const map = { A: 0, B: 1, C: 2, D: 3 };
                          return (
                            <div key={q.id} className="p-3  rounded-lg bg-black border border-emerald-700/30">
                              <p className="text-sm text-emerald-100 mb-2 break-words">{idx + 1}. {q.question}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((o, i) => {
                                  const letter = (o.match(/^(A|B|C|D)/i)?.[0] || ["A", "B", "C", "D"][i]).toUpperCase();
                                  const text = o.replace(/^(A|B|C|D)\)\s*/i, "");
                                  const isCorrect = letter === correct;
                                  const isPicked = letter === picked;
                                  return (
                                    <div
                                      key={i}
                                      className={cx(
                                        "p-2 rounded-lg border text-sm leading-relaxed",
                                        isCorrect
                                          ? "bg-emerald-300/50 border-emerald-300/80"
                                          : isPicked
                                          ? "bg-red-400/50 border-red-600/40"
                                          : "bg-emerald-950/40 border-emerald-700/30"
                                      )}
                                    >
                                      <span className="font-semibold text-emerald-200/90">{letter})</span>{" "}
                                      <span className="text-emerald-100/90 break-words">{text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="relative z-10 mx-auto max-w-7xl px-3 sm:px-4 pt-4 sm:pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Metric icon={Library} label="Units" value={UNITS.length} />
          <Metric icon={BookOpen} label="Subtopics" value={UNITS.reduce((a, u) => a + u.subtopics.length, 0)} />
          <Metric icon={BarChart3} label="Max Questions" value="50 per quiz" />
          <Metric icon={Beaker} label="Subject" value="Embedded Systems" />
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
        {view === "home" && (
          <div className="space-y-8 sm:space-y-10">
            <section className="flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="max-w-2xl">
                <h1 className="text-xl sm:text-3xl font-bold text-emerald-100 flex items-center gap-2 sm:gap-3">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" /> Embedded Systems — Quiz Hub
                </h1>
                <p className="text-emerald-200/80 mt-2 text-sm sm:text-base leading-relaxed">
                 Test your knowledge, sharpen your skills, and master Embedded Systems through fun and interactive quizzes — all in one hub!
                </p>
                {!import.meta.env.VITE_GEMINI_API_KEY && (
                  <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-amber-900/30 border border-amber-700/40 text-amber-100 flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4" /> Add <code className="px-1">VITE_GEMINI_API_KEY</code> to your <code className="px-1">.env</code> and restart dev server.
                  </div>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-emerald-700/60 cursor-pointer hover:bg-emerald-600/60 w-full md:w-auto"><Wand2 className="h-4 w-4 mr-2" /> Quick Start</Button>
                </DialogTrigger>
                <DialogContent className="bg-emerald-700/80 border-emerald-700/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">How it works</DialogTitle>
                    <DialogDescription className="text-emerald-200/80 space-y-2 text-sm sm:text-base leading-relaxed">
                    
                      <p>1) Pick a Unit → Subtopic.</p>
                      <p>2) Choose question count (1–50) and Generate.</p>
                      <p>3) Submit and review results. Session is saved automatically with all Q/A.</p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </section>

            <Tabs defaultValue="units" className="w-full ">
              <TabsList className="bg-emerald-400 border max-7xl mx-auto w-full sm:w-xl border-emerald-700/30 rounded-xl">
                <TabsTrigger value="units" className="flex-1  data-[state=active]:bg-black/50 data-[state=active]:text-white cursor-pointer">Units</TabsTrigger>
                <TabsTrigger value="about" className="flex-1 data-[state=active]:bg-black/50 data-[state=active]:text-white cursor-pointer">About</TabsTrigger>
              </TabsList>
              <TabsContent value="units" className="mt-4 sm:mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {UNITS.map((u) => (
                    <UnitCard key={u.id} unit={u} onOpen={(unit) => { setCurrentUnit(unit); setView("unit"); }} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="about" className="mt-4 sm:mt-6">
                <Card className="bg-emerald-900 border-emerald-700/30 rounded-2xl">
  <CardHeader>
    <CardTitle className="text-emerald-200 flex items-center gap-2">
      <Info className="h-4 w-4 text-emerald-400" /> 
      Embedded Systems — Quiz Hub
    </CardTitle>
    <CardDescription className="text-emerald-200/80">
     Crafted for learners with a clean dark theme, smooth animations, and responsive interactivity for an immersive quiz experience.
    </CardDescription>
  </CardHeader>
  <CardContent className="text-emerald-100/90 space-y-4 text-sm sm:text-base leading-relaxed">
    <p>
      Explore quizzes across <span className="font-semibold text-emerald-300">Fundamentals, Embedded C, RTOS, Hardware–Software Co-Design, and Advanced Architectures</span>. 
      Topics are structured to align with both <span className="italic">industry practices</span> and <span className="italic">academic exam requirements</span>.
    </p>
   <p>
  Each quiz is <span className="font-semibold text-emerald-300">created in real-time</span>, ensuring a fresh experience every attempt. 
  Your data is never uploaded — everything runs locally and securely. 
  Results, including <span className="italic">questions, responses, scores, and timing</span>, are stored on your device for future access.
</p>

  </CardContent>
</Card>

              </TabsContent>
            </Tabs>
          </div>
        )}

        {view === "unit" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
              
                <h2 className="text-xl sm:text-2xl font-semibold text-emerald-100 mt-2 flex items-center gap-2">
                  <Library className="h-5 w-5 text-emerald-400" /> {currentUnit?.title}
                </h2>
              </div>
              <div className="w-full max-w-md">
                <Label className="text-emerald-300">Questions to generate</Label>
                <div className="flex items-center gap-3 mt-2">
                 <Slider
  min={1}
  max={50}
  step={1}
  value={[questionCount]}
  onValueChange={(v) => setQuestionCount(v[0])}
  className="
    w-full
    [&_[role=slider]]:bg-red-400
    [&_[role=slider]]:border-red-600
    [&_[data-orientation=horizontal]]:bg-emerald-400
    [&_[data-orientation=horizontal]>div:first-child]:bg-red-500
  "
/>

                  <Badge className="bg-emerald-800/60 border border-emerald-600/30 text-emerald-100 w-16 justify-center">{questionCount}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUnit?.subtopics.map((t) => (
                <SubtopicItem key={t.id} topic={t} onQuiz={startQuizFor} />
              ))}
            </div>
            <div className="max-w-7xl mx-auto w-full flex justify-end">
              <Button onClick={() => setView("home")} className="text-black cursor-pointer bg-white hover:bg-gray-300 text-sm">← Back</Button>
         </div>
          </div>
        )}

        {view === "quiz" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[20px] sm:text-2xl font-semibold text-emerald-100 mt-2 flex items-center gap-2">
                  <Cpu className="h-5 w-5  text-emerald-400" /> {currentUnit?.title} • {selectedTopic?.name}
                </h2>
                <p className="text-emerald-200/80 text-xs sm:text-sm">Generate up to 50 MCQs.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-emerald-200/80 text-sm">
                  <TimerReset className="h-4 w-4" /> {Math.floor(elapsed/60)}m {elapsed%60}s
                </div>
                <Badge className="bg-emerald-800/60 border border-emerald-600/30 text-emerald-100">{questionCount} Qs</Badge>
                <Button disabled={loading} onClick={() => startQuizFor(selectedTopic)} className="rounded bg-orange-400 cursor-pointer hover:bg-orange-500">
                  {loading ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Generating…</span>) : "Regenerate"}
                </Button>
              </div>
            </div>

            {!import.meta.env.VITE_GEMINI_API_KEY && (
              <Card className="bg-amber-950/50 border-amber-800/50">
                <CardContent className="py-4 text-amber-100 flex items-center gap-3 text-sm">
                  <KeyRound className="h-4 w-4" />
                  Missing environment key. Add <code className="px-1">VITE_GEMINI_API_KEY</code> to <code className="px-1">.env</code> and restart.
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="bg-red-950/50 border-red-800/50">
                <CardContent className="py-4 text-red-100 text-sm">{error}</CardContent>
              </Card>
            )}

            {questions.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-900/40 border border-emerald-700/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-emerald-200/80 flex items-center gap-2"><Sparkles className="h-4 w-4"/> Answer progress</div>
                    <div className="text-xs text-emerald-200/70">{Object.keys(answers).length} / {questions.length}</div>
                  </div>
                  <div className="mt-2">
                    <Progress value={progress} className="h-2 bg-red-600" />
                  </div>
                </div>

                {questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    index={idx}
                    value={answers[q.id] || ""}
                    onChange={(choice) => setAnswers((prev) => ({ ...prev, [q.id]: choice }))}
                    reveal={false}
                  />
                ))}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="secondary" className="rounded text-white hover:bg-emerald-400 cursor-pointer bg-emerald-800/50 border border-emerald-700/30" onClick={() => { setAnswers({}); }}>Clear</Button>
                  <Button className="rounded bg-emerald-700/60 hover:bg-emerald-600/60 cursor-pointer" onClick={submitQuiz}>
                    Submit <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="max-w-7xl mx-auto w-full flex  justify-end">
             <Button onClick={() => setView("unit")} className=" bg-white text-black cursor-pointer hover:bg-gray-300 text-sm"> <ChevronLeft className="mb-[-3px]" size={20}/>Back</Button>
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
               
                <h2 className="text-xl sm:text-2xl font-semibold text-emerald-100 mt-2 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400"/> Results — {currentUnit?.title} • {selectedTopic?.name}
                </h2>
                <p className="text-emerald-200/80 text-xs">Time taken: {Math.floor(elapsed/60)}m {elapsed%60}s</p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="rounded bg-emerald-700/60 hover:bg-emerald-600/60 cursor-pointer" onClick={resetHome}> <BadgePlus size={20}/> New Quiz</Button>
                {sessionSaved && (
                  <Badge className="bg-emerald-800/60 border border-emerald-600/30 text-emerald-100 flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5"/> Saved
                  </Badge>
                )}
              </div>
            </div>

            <ScoreBanner score={score} total={questions.length} onReview={() => setShowReview((s) => !s)} />

            {/* Session quick actions */}
            <div className="p-3 rounded-xl bg-emerald-600/50 border border-emerald-700/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-emerald-200/80">
                <span className="font-medium text-emerald-100">Session:</span> {currentUnit?.title} • {selectedTopic?.name} • {questions.length} Qs • {humanTime(elapsed)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="rounded cursor-pointer border border-emerald-400/50 bg-emerald-800 text-white hover:bg-emerald-400"
                  onClick={() => setHistoryOpen(true)}
                >
                  <History className="h-4 w-4 mr-2"/> View in History
                </Button>
                <Button
                 
                  className="rounded bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white"
                  onClick={() => {
                    const data = {
                      unit: currentUnit?.title,
                      topic: selectedTopic?.name,
                      score,
                      total: questions.length,
                      elapsed,
                      questions,
                      answers,
                      savedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `embedded-quiz-session-${Date.now()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2"/> Export JSON
                </Button>
              </div>
              
            </div>
            <div className="max-w-7xl mx-auto w-full flex  justify-end">
             <Button onClick={() => setView("unit")} className="text-black cursor-pointer bg-white hover:bg-gray-300  text-sm"> <ChevronLeft className="mb-[-3px]" size={20}/>Back</Button>
            </div>
            <AnimatePresence>
              {showReview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {questions.map((q, idx) => {
                    const picked = answers[q.id] || "—";
                    const correct = q.answer;
                    const map = { A:0,B:1,C:2,D:3 };
                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/30">
                        <p className="font-medium text-emerald-100 mb-2 flex items-start gap-2 break-words"><Info className="h-4 w-4 text-emerald-400 mt-0.5"/>{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((o, i) => {
                            const letter = (o.match(/^(A|B|C|D)/i)?.[0] || ["A","B","C","D"][i]).toUpperCase();
                            const text = o.replace(/^(A|B|C|D)\)\s*/i, "");
                            const isCorrect = letter === correct;
                            const isPicked = letter === picked;
                            return (
                              <div
                                key={i}
                                className={cx(
                                  "p-3 rounded-lg border text-sm leading-relaxed break-words",
                                  isCorrect
                                    ? "bg-emerald-900/50 border-emerald-600/60"
                                    : isPicked
                                    ? "bg-red-900/30 border-red-600/50"
                                    : "bg-emerald-950/40 border-emerald-700/30"
                                )}
                              >
                                <span className="font-semibold text-emerald-200/90">{letter})</span>{" "}
                                <span className="text-emerald-100/90">{text}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-700/30">
                            <span className="text-emerald-300 font-semibold">Correct:</span>{" "}
                            <span className="text-emerald-100 ml-1">{correct}) {q.options[map[correct]]?.replace(/^(A|B|C|D)\)\s*/i, "")}</span>
                          </div>
                          <div className={cx(
                            "p-2 rounded-lg border",
                            picked === correct ? "bg-emerald-950/40 border-emerald-700/30" : "bg-emerald-950/30 border-emerald-700/20"
                          )}>
                            <span className="text-emerald-300 font-semibold">Your pick:</span>{" "}
                            <span className={cx("ml-1", picked === correct ? "text-emerald-100" : "text-emerald-200")}>
                              {picked !== "—" ? `${picked}) ${q.options[map[picked]]?.replace(/^(A|B|C|D)\)\s*/i, "")}` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

