
import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { create } from "zustand";

import { Canvas ,useFrame} from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Waves,
  Activity,
  Cpu,
  CircuitBoard,
  Shield,
  Lightbulb,
  CloudSun,
  HardDrive,
  AudioLines,
  PanelLeftClose,
  PanelLeftOpen,
  Cable,
  FileCode2,
  Layers,
  DoorOpen,
  SunMedium,
  Camera,
  Zap,
  Fan as FanIcon,
  Thermometer,
  MemoryStick,
  CheckCircle2,
  AlertCircle,
  Bug,
  Settings,
  Save,
  Trash2,
  BatteryFull,
  Bot,
  Bluetooth,
  Radar,
  Box as BoxIcon,
  Info,

} from "lucide-react";


const ICONS = {
  Play, Pause, RotateCcw, Gauge, Waves, Activity, Cpu, CircuitBoard, Shield, Lightbulb, CloudSun,
  HardDrive, AudioLines, PanelLeftClose, PanelLeftOpen, Cable, FileCode2, Layers, DoorOpen,
  SunMedium, Camera, Zap, Thermometer, MemoryStick, CheckCircle2, AlertCircle,
  Bug, Settings, Save, Trash2, BatteryFull, Bot, Bluetooth, Radar, BoxIcon, Info, FanIcon
};
// ---------- shadcn/ui imports (adjust to your project structure) ----------
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ThreeBoard } from "../components/ThreeBoard";
// ---------------- THEME & CONSTANTS ----------------
const SURFACE = "bg-emerald-950 text-emerald-50";
const PANEL = "bg-emerald-900/40 border border-emerald-800/60";
const SOFT = "bg-emerald-950/40";
const GRID_BG =
  "bg-[radial-gradient(rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:16px_16px]";

const WIRE_COLORS = ["#38bdf8", "#22d3ee", "#34d399", "#a78bfa", "#f59e0b", "#ef4444", "#f472b6"];

// Node card geometry
const CARD_W = 240;
const CARD_H = 150;
const PIN_ROW_START = 44;
const PIN_ROW_STEP = 22;
const PIN_GUTTER = 14;
const PIN_RADIUS = 6;

// ---------------- WEATHER COMPONENTS ----------------
const LINE_COMPONENTS = [
  {id: "uno",
    type: "Arduino Uno (MCU)",
    icon: "Cpu",
    x: 96,
    y: 120,
    pins: [
      "5V",
      "GND",
      "D2",
      "D3",
      "D9(PWM)",
      "D10(PWM)",
      "A0",
      "A1",
      "SDA(A4)",
      "SCL(A5)",
      "MISO(12)",
      "MOSI(11)",
      "SCK(13)",
      "CS(10)",
      "TX(D1)",
      "RX(D0)",
    ],
    meta: { role: "controller", uC: "ATmega328P" },
  },
  {
    id: "ir",
    type: "IR Sensor Array",
    icon: "Radar",
    x: 512,
    y: 72,
    pins: ["VCC", "GND", "OUT_L", "OUT_R"],
    meta: { role: "sensor", desc: "Dual IR reflectance sensors" },
  },
  {
    id: "l293d",
    type: "L293D Motor Driver",
    icon: "Bot",
    x: 512,
    y: 260,
    pins: ["VCC1", "VCC2", "GND", "IN1", "IN2", "IN3", "IN4", "OUT1", "OUT2", "OUT3", "OUT4", "EN1", "EN2"],
    meta: { role: "driver", channels: 2 },
  },
  {
    id: "motors",
    type: "Dual DC Motors",
    icon: "BoxIcon",
    x: 816,
    y: 260,
    pins: ["M1+", "M1-", "M2+", "M2-"],
    meta: { role: "actuator", mechanism: "differential" },
  },
  {
    id: "battery",
    type: "LiPo 7.4V Battery",
    icon: "BatteryFull",
    x: 96,
    y: 320,
    pins: ["+", "-"],
    meta: { role: "power", chem: "LiPo 2S" },
  },
  {
    id: "buck",
    type: "5V Buck Regulator",
    icon: "Settings",
    x: 320,
    y: 320,
    pins: ["VIN", "GND", "VOUT"],
    meta: { role: "power", conv: "DC-DC" },
  },
  {
    id: "switch",
    type: "Power Switch",
    icon: "Settings",
    x: 320,
    y: 120,
    pins: ["VIN", "VOUT"],
    meta: { role: "power", type: "soft" },
  },
  {
    id: "bt",
    type: "HC-05 Bluetooth",
    icon: "Bluetooth",
    x: 96,
    y: 72,
    pins: ["VCC", "GND", "TXD", "RXD", "STATE"],
    meta: { role: "comm", link: "UART" },
  },
  {
    id: "ultra",
    type: "Ultrasonic HC-SR04",
    icon: "Radar",
    x: 816,
    y: 72,
    pins: ["VCC", "TRIG", "ECHO", "GND"],
    meta: { role: "sensor", dist: "2–400 cm" },
  },
  {
    id: "buzzer",
    type: "Piezo Buzzer",
    icon: "AudioLines",
    x: 816,
    y: 400,
    pins: ["VCC", "SIG", "GND"],
    meta: { role: "actuator", sound: "GPIO" },
  },
  {
    id: "oled",
    type: "SSD1306 OLED (I²C)",
    icon: "MemoryStick",
    x: 96,
    y: 472,
    pins: ["VCC", "GND", "SCL", "SDA"],
    meta: { role: "display", bus: "I²C" },
  },
  {
    id: "sd",
    type: "MicroSD (SPI)",
    icon: "HardDrive",
    x: 512,
    y: 472,
    pins: ["VCC", "GND", "SCK", "MISO", "MOSI", "CS"],
    meta: { role: "storage", bus: "SPI" },
  },
  {
    id: "rgb",
    type: "WS2812 RGB LED",
    icon: "BoxIcon",
    x: 816,
    y: 472,
    pins: ["VCC", "DIN", "GND"],
    meta: { role: "indicator", bus: "1-wire" },
  },

];

// ---------------- ZUSTAND STORE ----------------
const useStationStore = create((set, get) => ({

  // Load persisted state if available
  nodes: (() => {
    try {
      const saved = localStorage.getItem("lfb_nodes");
      return saved ? JSON.parse(saved) : LINE_COMPONENTS.map((c) => ({ ...c }));
    } catch {
      return LINE_COMPONENTS.map((c) => ({ ...c }));
    }
  })(),
  wires: (() => {
    try {
      const saved = localStorage.getItem("lfb_wires");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  running: false,

  setNodes: (nodes) => {
    set({ nodes });
    localStorage.setItem("lfb_nodes", JSON.stringify(nodes));
  },
  updateNodePos: (id, x, y) =>
    set((state) => {
      const updated = state.nodes.map((n) =>
        n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n
      );
      localStorage.setItem("lfb_nodes", JSON.stringify(updated));
      return { nodes: updated };
    }),

  setWires: (wires) => {
    set({ wires });
    localStorage.setItem("lfb_wires", JSON.stringify(wires));
  },
  addWire: (wire) => {
    const newWires = [...get().wires, wire];
    set({ wires: newWires });
    localStorage.setItem("lfb_wires", JSON.stringify(newWires));
  },
  removeWire: (id) => {
    const newWires = get().wires.filter((w) => w.id !== id);
    set({ wires: newWires });
    localStorage.setItem("lfb_wires", JSON.stringify(newWires));
  },

  toggleRunning: () => set({ running: !get().running }),
  setRunning: (v) => set({ running: v }),

  reset: () => {
    const freshNodes = LINE_COMPONENTS.map((c) => ({ ...c }));
    set({
      nodes: freshNodes,
      wires: [],
      running: false,
    });
    localStorage.setItem("lfb_nodes", JSON.stringify(freshNodes));
    localStorage.setItem("lfb_wires", JSON.stringify([]));
  },

}));

// ---------------- REQUIRED CONNECTIONS (Instructions) ----------------
// These are the canonical "correct" connections. Completing them enables the simulation.
const REQUIRED_CONNECTIONS = [
  // Power rails (Battery -> Switch -> Buck -> 5V rail -> Uno/Peripherals)
  { id: "p1", fromNode: "battery", fromPin: "+", toNode: "switch", toPin: "VIN", label: "Battery + → Switch VIN" },
  { id: "p2", fromNode: "switch", fromPin: "VOUT", toNode: "buck", toPin: "VIN", label: "Switch VOUT → Buck VIN" },
  { id: "p3", fromNode: "battery", fromPin: "-", toNode: "buck", toPin: "GND", label: "Battery - → Buck GND" },
  { id: "p4", fromNode: "buck", fromPin: "VOUT", toNode: "uno", toPin: "5V", label: "Buck 5V → Uno 5V" },
  { id: "p5", fromNode: "buck", fromPin: "GND", toNode: "uno", toPin: "GND", label: "Buck GND → Uno GND" },

  // IR sensor to Uno
  { id: "s1", fromNode: "uno", fromPin: "D2", toNode: "ir", toPin: "OUT_L", label: "Uno D2 ← IR OUT_L" },
  { id: "s2", fromNode: "uno", fromPin: "D3", toNode: "ir", toPin: "OUT_R", label: "Uno D3 ← IR OUT_R" },
  { id: "s3", fromNode: "buck", fromPin: "VOUT", toNode: "ir", toPin: "VCC", label: "5V → IR VCC" },
  { id: "s4", fromNode: "buck", fromPin: "GND", toNode: "ir", toPin: "GND", label: "GND → IR GND" },

  // L293D to Uno + Motors + Power
  { id: "m1", fromNode: "uno", fromPin: "D9(PWM)", toNode: "l293d", toPin: "IN1", label: "Uno D9 → L293D IN1" },
  { id: "m2", fromNode: "uno", fromPin: "D10(PWM)", toNode: "l293d", toPin: "IN3", label: "Uno D10 → L293D IN3" },
  { id: "m3", fromNode: "l293d", fromPin: "OUT1", toNode: "motors", toPin: "M1+", label: "L293D OUT1 → M1+" },
  { id: "m4", fromNode: "l293d", fromPin: "OUT2", toNode: "motors", toPin: "M1-", label: "L293D OUT2 → M1-" },
  { id: "m5", fromNode: "l293d", fromPin: "OUT3", toNode: "motors", toPin: "M2+", label: "L293D OUT3 → M2+" },
  { id: "m6", fromNode: "l293d", fromPin: "OUT4", toNode: "motors", toPin: "M2-", label: "L293D OUT4 → M2-" },
  { id: "m7", fromNode: "buck", fromPin: "VOUT", toNode: "l293d", toPin: "VCC1", label: "5V → L293D VCC1" },
  { id: "m8", fromNode: "battery", fromPin: "+", toNode: "l293d", toPin: "VCC2", label: "Battery + → L293D VCC2 (motor)" },
  { id: "m9", fromNode: "buck", fromPin: "GND", toNode: "l293d", toPin: "GND", label: "GND → L293D GND" },

  // Buzzer
  { id: "b1", fromNode: "buck", fromPin: "VOUT", toNode: "buzzer", toPin: "VCC", label: "5V → Buzzer VCC" },
  { id: "b2", fromNode: "uno", fromPin: "A0", toNode: "buzzer", toPin: "SIG", label: "Uno A0 → Buzzer SIG" },
  { id: "b3", fromNode: "buck", fromPin: "GND", toNode: "buzzer", toPin: "GND", label: "GND → Buzzer GND" },

  // I²C OLED
  { id: "i1", fromNode: "uno", fromPin: "SCL(A5)", toNode: "oled", toPin: "SCL", label: "Uno SCL → OLED SCL" },
  { id: "i2", fromNode: "uno", fromPin: "SDA(A4)", toNode: "oled", toPin: "SDA", label: "Uno SDA → OLED SDA" },
  { id: "i3", fromNode: "buck", fromPin: "VOUT", toNode: "oled", toPin: "VCC", label: "5V → OLED VCC" },
  { id: "i4", fromNode: "buck", fromPin: "GND", toNode: "oled", toPin: "GND", label: "GND → OLED GND" },

  // SPI SD
  { id: "sp1", fromNode: "uno", fromPin: "SCK(13)", toNode: "sd", toPin: "SCK", label: "Uno SCK → SD SCK" },
  { id: "sp2", fromNode: "uno", fromPin: "MISO(12)", toNode: "sd", toPin: "MISO", label: "Uno MISO → SD MISO" },
  { id: "sp3", fromNode: "uno", fromPin: "MOSI(11)", toNode: "sd", toPin: "MOSI", label: "Uno MOSI → SD MOSI" },
  { id: "sp4", fromNode: "uno", fromPin: "CS(10)", toNode: "sd", toPin: "CS", label: "Uno CS → SD CS" },
  { id: "sp5", fromNode: "buck", fromPin: "VOUT", toNode: "sd", toPin: "VCC", label: "5V → SD VCC" },
  { id: "sp6", fromNode: "buck", fromPin: "GND", toNode: "sd", toPin: "GND", label: "GND → SD GND" },

  // Bluetooth UART
  { id: "u1", fromNode: "uno", fromPin: "TX(D1)", toNode: "bt", toPin: "RXD", label: "Uno TX → HC-05 RXD" },
  { id: "u2", fromNode: "uno", fromPin: "RX(D0)", toNode: "bt", toPin: "TXD", label: "Uno RX ← HC-05 TXD" },
  { id: "u3", fromNode: "buck", fromPin: "VOUT", toNode: "bt", toPin: "VCC", label: "5V → HC-05 VCC" },
  { id: "u4", fromNode: "buck", fromPin: "GND", toNode: "bt", toPin: "GND", label: "GND → HC-05 GND" },

  // Ultrasonic
  { id: "ul1", fromNode: "buck", fromPin: "VOUT", toNode: "ultra", toPin: "VCC", label: "5V → HC-SR04 VCC" },
  { id: "ul2", fromNode: "buck", fromPin: "GND", toNode: "ultra", toPin: "GND", label: "GND → HC-SR04 GND" },
  { id: "ul3", fromNode: "uno", fromPin: "A1", toNode: "ultra", toPin: "TRIG", label: "Uno A1 → Trig" },
  { id: "ul4", fromNode: "uno", fromPin: "A0", toNode: "ultra", toPin: "ECHO", label: "Uno A0 ← Echo" },

  // RGB LED
  { id: "r1", fromNode: "buck", fromPin: "VOUT", toNode: "rgb", toPin: "VCC", label: "5V → WS2812 VCC" },
  { id: "r2", fromNode: "uno", fromPin: "A0", toNode: "rgb", toPin: "DIN", label: "Uno A0 → WS2812 DIN" },
  { id: "r3", fromNode: "buck", fromPin: "GND", toNode: "rgb", toPin: "GND", label: "GND → WS2812 GND" },
];


// ---------------- HELPERS ----------------
function makeWireId(aNode, aIdx, bNode, bIdx) {
  return `${aNode}:${aIdx}=>${bNode}:${bIdx}`;
}
function pinSideFromIndex(idx) {
  return idx % 2 === 0 ? "left" : "right";
}
function getPinCoords(node, pinIndex) {
  if (!node) return null;
  const isLeft = pinIndex % 2 === 0;
  const row = Math.floor(pinIndex / 2);
  const y = Math.round(node.y + PIN_ROW_START + row * PIN_ROW_STEP);
  const x = isLeft ? Math.round(node.x - PIN_GUTTER) : Math.round(node.x + CARD_W + PIN_GUTTER);
  return { x, y };
}

// ---------------- GLOBAL STYLE (wire flow, scope/logic anim, pin pulse) ----------------
const GLOBAL_STYLE = `
@keyframes dashFlow { to { stroke-dashoffset: -40; } }
.animate-flow { stroke-dasharray: 12; stroke-dashoffset: 0; animation: dashFlow 900ms linear infinite; }
.pin-pulse { animation: pin 1.2s ease-in-out infinite; transform-origin: center; display:inline-block; }
@keyframes pin { 0%,100%{ transform:scale(1); opacity:.85 } 50%{ transform:scale(1.25); opacity:1 } }
.scope-anim { animation: scope 1.1s linear infinite; }
@keyframes scope { 0%{opacity:.3} 50%{opacity:1} 100%{opacity:.3} }
.logic-anim { animation: logic 1.2s steps(6) infinite; }
@keyframes logic { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
.pin-glow { filter: drop-shadow(0 0 6px rgba(90,200,255,0.85)); }
`;
if (typeof document !== "undefined" && !document.getElementById("wss-style")) {
  const s = document.createElement("style");
  s.id = "wss-style";
  s.innerHTML = GLOBAL_STYLE;
  document.head.appendChild(s);
}

// ---------------- MAIN PAGE ----------------
export default function LineFollowerBotSimulator() {
  const nodes = useStationStore((s) => s.nodes);
  const wires = useStationStore((s) => s.wires);
  const running = useStationStore((s) => s.running);
  const toggleRunning = useStationStore((s) => s.toggleRunning);
  const addWireToStore = useStationStore((s) => s.addWire);
  const removeWireFromStore = useStationStore((s) => s.removeWire);
  const resetStore = useStationStore((s) => s.reset);

  const [selectedId, setSelectedId] = useState("stm32");
  const [inspectorTab, setInspectorTab] = useState("props");
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

 const [completedMap, setCompletedMap] = useState(() => {
try {
const saved = localStorage.getItem("lfb_completed");
return saved
? JSON.parse(saved)
: Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
} catch {
return Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
}
});
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!wires || wires.length === 0) {
      setCompletedMap(Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false])));
    }
  }, [wires]);
  useEffect(() => {
localStorage.setItem("lfb_completed", JSON.stringify(completedMap));
}, [completedMap]);

  const allDone = useMemo(() => Object.values(completedMap).every(Boolean), [completedMap]);
  const selected = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId]);
  const gridCols = showSidebar ? "lg:grid-cols-[320px_1fr_360px]" : "lg:grid-cols-[1fr_360px]";

  function checkAndMarkInstruction(newWire) {
    const nodesById = Object.fromEntries(useStationStore.getState().nodes.map((n) => [n.id, n]));
    const fromNode = nodesById[newWire.from.node];
    const toNode = nodesById[newWire.to.node];
    if (!fromNode || !toNode) return null;

    const fromPinName = fromNode.pins[newWire.from.pinIndex];
    const toPinName = toNode.pins[newWire.to.pinIndex];

    for (const req of REQUIRED_CONNECTIONS) {
      if (completedMap[req.id]) continue;
      // forward
      if (
        req.fromNode === newWire.from.node &&
        req.toNode === newWire.to.node &&
        req.fromPin === fromPinName &&
        req.toPin === toPinName
      ) {
        setCompletedMap((m) => ({ ...m, [req.id]: true }));
        return req.id;
      }
      // reverse
      if (
        req.fromNode === newWire.to.node &&
        req.toNode === newWire.from.node &&
        req.fromPin === toPinName &&
        req.toPin === fromPinName
      ) {
        setCompletedMap((m) => ({ ...m, [req.id]: true }));
        return req.id;
      }
    }
    return null;
  }

  function addWireAction(aNodeId, aPinIndex, bNodeId, bPinIndex) {
    if (aNodeId === bNodeId) return null;
    const current = useStationStore.getState().wires;
    const exists = current.some(
      (w) =>
        (w.from.node === aNodeId && w.from.pinIndex === aPinIndex && w.to.node === bNodeId && w.to.pinIndex === bPinIndex) ||
        (w.from.node === bNodeId && w.from.pinIndex === bPinIndex && w.to.node === aNodeId && w.to.pinIndex === aPinIndex)
    );
    if (exists) return null;

    const color = WIRE_COLORS[current.length % WIRE_COLORS.length];
    const wire = {
      id: makeWireId(aNodeId, aPinIndex, bNodeId, bPinIndex),
      from: { node: aNodeId, pinIndex: aPinIndex, side: pinSideFromIndex(aPinIndex) },
      to: { node: bNodeId, pinIndex: bPinIndex, side: pinSideFromIndex(bPinIndex) },
      color,
    };
    addWireToStore(wire);
    checkAndMarkInstruction(wire);
    return wire;
  }

function handleResetAll() {
resetStore();
const fresh = Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
setCompletedMap(fresh);
localStorage.setItem("lfb_completed", JSON.stringify(fresh));
setPending(null);
setSelectedId("stm32");
}

  function handleStartToggle() {
      if (!allDone && !running) {
      toast.error("Please complete all wiring instructions before starting the simulation.", {
        description: "Connect all components as per the instructions before running.",
        duration: 2000,
      });
      return;
    }
    toggleRunning();
  }

  function removeWire(id) {
    removeWireFromStore(id);
    const remain = useStationStore.getState().wires;
    const map = Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
    for (const w of remain) {
      const nodesById = Object.fromEntries(useStationStore.getState().nodes.map((n) => [n.id, n]));
      const fNode = nodesById[w.from.node];
      const tNode = nodesById[w.to.node];
      if (!fNode || !tNode) continue;
      const fPin = fNode.pins[w.from.pinIndex];
      const tPin = tNode.pins[w.to.pinIndex];
      for (const req of REQUIRED_CONNECTIONS) {
        if (map[req.id]) continue;
        if (
          (req.fromNode === w.from.node && req.toNode === w.to.node && req.fromPin === fPin && req.toPin === tPin) ||
          (req.fromNode === w.to.node && req.toNode === w.from.node && req.fromPin === tPin && req.toPin === fPin)
        ) {
          map[req.id] = true;
        }
      }
    }
    setCompletedMap(map);
  }

  return (
    <div className={`min-h-[calc(100vh-120px)] pt-20 ${SURFACE} ${GRID_BG}`}>
      {/* Top bar */}
      <div className="mx-auto max-w-8xl px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 grid place-items-center shadow-md">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Line Follower Bot — Wiring Lab</h1>
            <p className="text-sm text-emerald-300/70">Snap-to-grid drag • neon wires • live sensors</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              className="border-emerald-700/60 text-emerald-200 cursor-pointer hover:bg-emerald-900 hover:text-emerald-300 hidden lg:flex"
              onClick={() => setShowSidebar((s) => !s)}
            >
              {showSidebar ? <PanelLeftClose className="mr-2 h-4 w-4" /> : <PanelLeftOpen className="mr-2 h-4 w-4" />}
              {showSidebar ? "Hide Instructions" : "Show Instructions"}
            </Button>

            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer" onClick={handleStartToggle}>
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? "Pause Simulation" : "Start Simulation"}
            </Button>

            <Button variant="outline" className="border-emerald-700/60 text-emerald-200 hover:bg-emerald-900 hover:text-emerald-300 cursor-pointer" onClick={handleResetAll}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className={`mx-auto max-w-8xl px-4 pb-10 grid grid-cols-1 ${gridCols} gap-4`}>
        {/* Left: Wiring instructions */}
        {showSidebar && (
          <Card className={`${PANEL} h-[calc(100vh-160px)] overflow-y-auto`}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-300">Wiring Instructions</CardTitle>
                <Button size="sm" variant="outline" className="border-emerald-700/60 cursor-pointer text-emerald-200" onClick={() => setShowSidebar(false)}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-emerald-300/80">
                Click pins to connect. {Object.values(completedMap).filter(Boolean).length}/{REQUIRED_CONNECTIONS.length} done
              </CardDescription>
            </CardHeader>

            <div className="px-3 pb-3">
              <div className="space-y-2">
                {REQUIRED_CONNECTIONS.map((req) => {
                  const done = completedMap[req.id];
                  return (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2 p-2 rounded-md ${
                        done ? "bg-emerald-800/40 border border-emerald-700/40" : "bg-emerald-900/20 border border-emerald-900/30"
                      }`}
                    >
                      <div className={`${done ? "text-emerald-100" : "text-emerald-200/90"} text-sm flex-1`}>{req.label}</div>
                      {done ? <Badge className="bg-emerald-700/60 border-emerald-700/60">Done</Badge> : <span className="text-xs text-emerald-200/80">⌛</span>}
                    </div>
                  );
                })}
              </div>

              <Separator className="my-3 bg-emerald-800/60" />

              <div className="text-xs text-emerald-300/80 mb-2">Tips</div>
                <ol className="list-decimal pl-5 text-gray-300 text-sm space-y-1">
                <li>IR OUT_L/OUT_R into Uno D2/D3; use PWM (D9/D10) into L293D inputs for motor speed.</li>
                <li>Motor power (VCC2) should come from battery; logic (VCC1) from 5V buck — common ground required.</li>
                <li>I²C devices (OLED) need SDA/SCL on A4/A5; SPI (SD) needs SCK/MISO/MOSI/CS.</li>
                <li>Click the glowing red pin, then another pin to route a neon wire. Drag cards to tidy the layout.</li>
                <li>All required steps must be complete to enable Run.</li>
              </ol>


              <div className="mt-4">
                <Button
                  onClick={() => {
                    useStationStore.getState().setWires([]);
                    setCompletedMap(Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false])));
                    setPending(null);
                  }}
                  className="w-full bg-emerald-700 cursor-pointer hover:bg-emerald-600"
                >
                  Clear Wires
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Center: Canvas */}
        <div>
          <Card className={`${PANEL}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-700/60 text-emerald-300/60 bg-emerald-600/50">Project Canvas</Badge>
                <span className="text-sm text-emerald-300/80">Drag components • connect pins • run</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CanvasArea
                pending={pending}
                setPending={setPending}
                onSelect={setSelectedId}
                selectedId={selectedId}
                addWireAction={addWireAction}
              />
            </CardContent>
          </Card>

          {/* Instruments */}
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <MeterCard title="Multimeter" subtitle="3V3 rail" icon={Gauge}>
              <Multimeter running={running} />
            </MeterCard>
            <MeterCard title="Oscilloscope" subtitle="Sensor signal" icon={Waves}>
              <Scope running={running} />
            </MeterCard>
            <MeterCard title="Logic Analyzer" subtitle="I²C/SPI mock" icon={Activity}>
              <Logic running={running} />
            </MeterCard>
          </div>

          {/* 3D preview */}
          <Card className={`${PANEL} overflow-hidden mt-4`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-700/60 text-emerald-300/50">3D Preview</Badge>
                <span className="text-sm text-emerald-300/80">LineFollowerBot Demo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0">
              <ThreeBoard running={running} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Inspector */}
        <div>
          <InspectorPanel
            selectedNode={selected}
            running={running}
            inspectorTab={inspectorTab}
            setInspectorTab={setInspectorTab}
          />
        </div>
      </div>

      {/* Sidebar FAB when collapsed */}
      {!showSidebar && (
        <button
          aria-label="Open wiring instructions"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-[60] cursor-pointer rounded-full border border-emerald-800/60 bg-emerald-900/70 p-2 hover:bg-emerald-800/60"
          onClick={() => setShowSidebar(true)}
        >
          <PanelLeftOpen className="h-5 w-5 text-emerald-200" />
        </button>
      )}

      <MobileOverlay show={isMobile} />
    </div>
  );
}

// ---------------- Canvas Area ----------------
function CanvasArea({ pending, setPending, onSelect, selectedId, addWireAction }) {
  const nodes = useStationStore((s) => s.nodes);
  const wires = useStationStore((s) => s.wires);
  const running = useStationStore((s) => s.running);

  return (
    <div className={`relative md:h-[640px] h-[560px] ${SOFT}`}>
      {/* Wires */}
      <svg className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        <defs>
          <linearGradient id="wireGradWS" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="neonGlowWS" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {wires.map((w) => {
          const fromNode = nodes.find((n) => n.id === w.from.node);
          const toNode = nodes.find((n) => n.id === w.to.node);
          if (!fromNode || !toNode) return null;
          const from = getPinCoords(fromNode, w.from.pinIndex);
          const to = getPinCoords(toNode, w.to.pinIndex);
          if (!from || !to) return null;

          const midX = Math.round((from.x + to.x) / 2);
          const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
          const animClass = running ? "animate-flow" : "";

          return (
            <g key={w.id}>
              <path d={d} stroke={w.color} strokeWidth="8" fill="none" opacity="0.12" filter="url(#neonGlowWS)" />
              <path d={d} stroke={`url(#wireGradWS)`} strokeWidth="4" fill="none" className={animClass} strokeLinecap="round" />
              <circle cx={from.x} cy={from.y} r="4" fill={w.color} opacity="0.95" />
              <circle cx={to.x} cy={to.y} r="4" fill={w.color} opacity="0.95" />
            </g>
          );
        })}
      </svg>

      {/* Pin anchors */}
      <svg className="absolute inset-0 z-30 pointer-events-auto overflow-visible">
        {nodes.map((n) =>
          n.pins.map((pinName, idx) => {
            const p = getPinCoords(n, idx);
            if (!p) return null;
            return (
              <circle
                key={`${n.id}-pin-${idx}`}
                cx={p.x}
                cy={p.y}
                r={PIN_RADIUS}
                fill="#ff4d6d"
                className="pin-glow"
                stroke="#1b0f14"
                strokeWidth="1"
                onClick={(e) => {
                  e.stopPropagation();
                  const ce = new CustomEvent("ws:pin", { detail: { nodeId: n.id, pinIndex: idx } });
                  window.dispatchEvent(ce);
                }}
                style={{ cursor: "pointer" }}
              />
            );
          })
        )}
      </svg>

      {/* Draggable nodes */}
      {nodes.map((n) => (
        <DraggableNode key={n.id} node={n} selected={selectedId === n.id} onSelect={onSelect} />
      ))}

      <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md bg-emerald-900/60 border text-gray-300 border-emerald-800/60">
        Canvas • click red pins to connect • drag components (snap 10px)
      </div>

      <PinClickManager pending={pending} setPending={setPending} addWireAction={addWireAction} />
    </div>
  );
}

// ---------------- Draggable node (mouse-based + snap-to-grid) ----------------
function DraggableNode({ node, selected, onSelect }) {
  const updateNodePos = useStationStore((s) => s.updateNodePos);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const snap = (val) => Math.round(val / 10) * 10;

  const onMouseDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    onSelect?.(node.id);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      const nx = snap(e.clientX - offset.x);
      const ny = snap(e.clientY - offset.y);
      updateNodePos(node.id, nx, ny);
    };
    const onMouseUp = () => {
      if (dragging) setDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, offset.x, offset.y, node.id, updateNodePos]);

  return (
    <div
      className={`absolute z-40 select-none ${selected ? "ring-2 ring-emerald-500/60 rounded-2xl" : ""} cursor-move`}
      style={{ left: node.x, top: node.y, width: CARD_W }}
      onMouseDown={onMouseDown}
      onClick={() => onSelect?.(node.id)}
    >
      <NodeCardTop node={node} selected={selected} />
    </div>
  );
}

// ---------------- Pin click manager ----------------
function PinClickManager({ pending, setPending, addWireAction }) {
  useEffect(() => {
    function handler(e) {
      const { nodeId, pinIndex } = e.detail;
      if (!pending) {
        setPending({ nodeId, pinIndex });
        return;
      }
      if (pending.nodeId === nodeId && pending.pinIndex === pinIndex) {
        setPending(null);
        return;
      }
      addWireAction(pending.nodeId, pending.pinIndex, nodeId, pinIndex);
      setPending(null);
    }
    window.addEventListener("ws:pin", handler);
    return () => window.removeEventListener("ws:pin", handler);
  }, [pending, setPending, addWireAction]);
  return null;
}

// ---------------- Node visuals ----------------
 function NodeCardTop({ node, selected }) {
  const Icon = ICONS[node.icon] || CircuitBoard;
  const running = useStationStore((s) => s.running);

  return (
    <div
      className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${PANEL} ${
        selected ? "ring-2 ring-emerald-500/60" : "ring-1 ring-emerald-800/50"
      }`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-xl bg-emerald-700/60 grid place-items-center">
          <Icon className="w-4 h-4 text-emerald-200" />
        </div>
        <div className="text-sm font-semibold truncate text-gray-300">{node.type}</div>
      </div>

      {/* Status dots */}
      <div className="flex gap-1 mb-2">
        {node.pins.slice(0, 6).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${running ? "pin-pulse" : ""}`}
            style={{ backgroundColor: WIRE_COLORS[i % WIRE_COLORS.length], opacity: 0.85 }}
          />
        ))}
      </div>

      {/* Pinout grid */}
      <div className="h-[70px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-200/90">
          {node.pins.map((p) => (
            <div
              key={p}
              className="rounded-md border border-emerald-800/60 px-2 py-0.5 flex items-center gap-1 truncate"
              title={p}
            >
              <Cable className="h-3 w-3 text-emerald-400/90 shrink-0" />
              <span className="truncate">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function useLiveReadings(running) {
  const [state, setState] = useState({
    lineL: false,
    lineR: true,
    speedL: 0.6,
    speedR: 0.6,
    dist: 25.0,
    vbat: 7.40,
  });
  useEffect(() => {
    if (!running) {
      setState((s) => ({ ...s, speedL: 0, speedR: 0 }));
      return;
    }
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setState((s) => ({
        lineL: Math.random() > 0.35,
        lineR: Math.random() > 0.35,
        speedL: 0.45 + 0.25 * Math.abs(Math.sin(t / 3)),
        speedR: 0.45 + 0.25 * Math.abs(Math.sin(t / 3 + 0.6)),
        dist: 20 + 10 * Math.abs(Math.sin(t / 6 + 0.3)),
        vbat: 7.4 - 0.02 * t + 0.02 * Math.sin(t / 8),
      }));
    }, 500);
    return () => clearInterval(id);
  }, [running]);
  return state;
}

// ---------------- Inspector Panel ----------------
function InspectorPanel({ selectedNode, running, inspectorTab, setInspectorTab, completedMap, wires }) {
  const live = useLiveReadings(running);

  return (
    <Card className={`${PANEL} h-[calc(100vh-160px)] overflow-y-auto`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge variant="outline" className="border-emerald-700/60 text-emerald-300 bg-emerald-500/50">Inspector</Badge>
          <span className="text-emerald-300/80">{selectedNode?.type ?? "Select a component"}</span>
        </CardTitle>
        <CardDescription className="text-emerald-300/70">Properties • Code • Diagnostics</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Tabs value={inspectorTab} onValueChange={(v) => setInspectorTab(v)}>
          <TabsList className="grid grid-cols-3 bg-emerald-900/40 border border-emerald-800/60">
            <TabsTrigger value="props" className="data-[state=active]:text-white cursor-pointer text-emerald-300 data-[state=active]:bg-emerald-800/60">Properties</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:text-white cursor-pointer text-emerald-300 data-[state=active]:bg-emerald-800/60">Code</TabsTrigger>
            <TabsTrigger value="diag" className="data-[state=active]:text-white cursor-pointer text-emerald-300 data-[state=active]:bg-emerald-800/60">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="props" className="mt-3">
            {selectedNode ? (
              <ScrollArea className="h-[300px] rounded-md border border-emerald-800/60 p-3">
                <div className="space-y-3 text-sm">
                  <KV label="Role" value={selectedNode.meta.role} />
                  {selectedNode.meta.uC && <KV label="MCU" value={selectedNode.meta.uC} />}
                  {selectedNode.meta.bus && <KV label="Bus" value={selectedNode.meta.bus} />}
                  {selectedNode.meta.desc && <KV label="Desc" value={selectedNode.meta.desc} />}
                  {selectedNode.meta.channels && <KV label="Channels" value={String(selectedNode.meta.channels)} />}
                  <KV label="Pins" value={`${selectedNode.pins.length} total`} />
                  <KV label="Position" value={`x: ${selectedNode.x}, y: ${selectedNode.y}`} />
                  <KV label="Running" value={running ? "Yes" : "No"} />
                  <Separator className="my-1 bg-emerald-800/60" />
                  <div>
                    <div className="text-xs text-emerald-300/60 mb-1">Pinout</div>
                    <div className="grid grid-cols-2 text-gray-300 gap-1">
                      {selectedNode.pins.map((p) => (
                        <div key={p} className="rounded-md border border-emerald-800/60 px-2 py-1 flex items-center gap-1 text-[12px]">
                          <Cable className="h-3 w-3 text-emerald-300/90" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-emerald-300/70">Click a component to inspect.</div>
            )}

            {/* Live mock readings */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <LiveChip label="Line (L)" value={live.lineL ? "BLACK" : "WHITE"} />
              <LiveChip label="Line (R)" value={live.lineR ? "BLACK" : "WHITE"} />
              <LiveChip label="Speed L" value={`${(live.speedL * 100).toFixed(0)}%`} />
              <LiveChip label="Speed R" value={`${(live.speedR * 100).toFixed(0)}%`} />
              <LiveChip label="Dist" value={`${live.dist.toFixed(1)} cm`} />
              <LiveChip label="Vbat" value={`${live.vbat.toFixed(2)} V`} />
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-3">
            <div className="text-xs mb-2 text-emerald-300/70">
              Example Arduino sketch (line following + ultrasonic brake + OLED log):
            </div>
            <Textarea
              readOnly
              className="h-[280px] text-xs font-mono text-gray-300 bg-emerald-950/50 border-emerald-800/60"
              value={`#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_SSD1306.h>

#define L_PIN 2
#define R_PIN 3
#define M1 9
#define M2 10
#define TRIG A1
#define ECHO A0
#define CS 10

Adafruit_SSD1306 oled(128,64,&Wire);

void setup(){
  pinMode(L_PIN, INPUT);
  pinMode(R_PIN, INPUT);
  pinMode(M1, OUTPUT);
  pinMode(M2, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Wire.begin();
  SPI.begin();
  SD.begin(CS);
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  oled.clearDisplay(); oled.setTextSize(1); oled.setTextColor(1);
}

long distanceCM(){
  digitalWrite(TRIG,0); delayMicroseconds(2);
  digitalWrite(TRIG,1); delayMicroseconds(10);
  digitalWrite(TRIG,0);
  long d=pulseIn(ECHO,1,24000);
  return d/58;
}

void loop(){
  int l=!digitalRead(L_PIN), r=!digitalRead(R_PIN);
  long d=distanceCM();
  int base=200;
  if(d<15){ base=0; } // stop if obstacle
  analogWrite(M1, l ? base : base*0.5);
  analogWrite(M2, r ? base : base*0.5);

  oled.clearDisplay(); oled.setCursor(0,0);
  oled.print("L:"); oled.print(l); oled.print(" R:"); oled.print(r);
  oled.setCursor(0,10); oled.print("D:"); oled.print(d); oled.print("cm");
  oled.display();
}`}
            />
          </TabsContent>

          <TabsContent value="diag" className="mt-3">
            <ScrollArea className="h-[280px] rounded-md border border-emerald-800/60 p-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">Common ground established (5V logic & battery motor power)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">I²C devices acknowledged (OLED)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">SPI bus active (SD logging)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-300">Motor supply ripple within limits (watch LiPo level)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Left sensor saturating intermittently — check height & surface</span>
                </div>
          <div className="mt-2 text-xs text-emerald-300/70">
  Required connections done: 
  {(completedMap && typeof completedMap === "object")
    ? Object.values(completedMap).filter(Boolean).length
    : 0}
  /
  {Array.isArray(REQUIRED_CONNECTIONS) ? REQUIRED_CONNECTIONS.length : 0}
</div>

<div className="text-xs text-emerald-300/70">
  Current wire count: {Array.isArray(wires) ? wires.length : 0}
</div>

              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ---------------- Small UI helpers ----------------
function KV({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-emerald-300/70 text-xs">{label}</div>
      <div className="text-emerald-100 text-xs">{value}</div>
    </div>
  );
}
function LiveChip({ label, value }) {
  return (
    <div className="rounded-md px-2 py-1 bg-emerald-900/50 border border-emerald-800/60 text-[12px] flex items-center justify-between">
      <span className="text-emerald-300/80">{label}</span>
      <span className="text-emerald-100">{value}</span>
    </div>
  );
}

// ---------------- Meter Cards ----------------
function MeterCard({ title, icon: Icon, children }) {
  return (
    <Card className="bg-emerald-900/50 border-emerald-700/60 rounded-xl">
      <CardHeader className="py-2 flex  flex-row text-gray-300 items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-300" />
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ---------------- Instruments ----------------
function Multimeter({ running }) {
  const [v, setV] = useState(0);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) {
      setV(0);
      setI(0);
      return;
    }
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      // simulate battery sag & current draw ripple
      const nv = 7.4 - 0.1 * Math.sin(t / 3) - 0.05 * Math.random();
      const ni = 0.25 + 0.15 * Math.abs(Math.sin(t / 2 + 0.5)) + 0.05 * Math.random();
      setV(Number(nv.toFixed(2)));
      setI(Number(ni.toFixed(2)));
    }, 400);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div className="text-sm font-mono text-emerald-200">
      V = {running ? `${v.toFixed(2)} V` : "---"} &nbsp;&nbsp; I = {running ? `${i.toFixed(2)} A` : "---"}
    </div>
  );
}
function Scope({ running }) {
  const pts = useMemo(() => {
    const arr = [];
    for (let x = 0; x <= 200; x += 10) {
      const y = 32 + 16 * Math.sin(x / 12);
      arr.push(`${x},${y.toFixed(1)}`);
    }
    return arr.join(" ");
  }, []);
  return (
    <svg viewBox="0 0 200 64" className="w-full h-16 text-emerald-300">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={running ? pts : "0,32 200,32"}
        className={running ? "scope-anim" : ""}
      />
    </svg>
  );
}
function Logic({ running }) {
  return (
    <svg viewBox="0 0 200 64" className="w-full h-16 text-emerald-300">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={
          running
            ? "0,48 30,48 30,16 70,16 70,48 110,48 110,16 150,16 150,48 190,48 190,16 200,16"
            : "0,48 200,48"
        }
        className={running ? "logic-anim" : ""}
      />
    </svg>
  );
}

// ---------------- Mobile Overlay ----------------
function MobileOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-emerald-950/95 z-[80] flex flex-col items-center justify-center p-6 text-center">
      <Shield className="h-12 w-12 text-emerald-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Desktop Recommended</h2>
      <p className="text-emerald-300/80 mb-4">
        The Weather Station Wiring Lab works best on larger screens.  
        Please use a desktop or laptop for full drag-and-wire features.
      </p>
    </div>
  );
}




