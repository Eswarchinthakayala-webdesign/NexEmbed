
import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { create } from "zustand";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Waves,
  Activity,
  Cpu,
  Shield,
  KeySquare,
  KeyRound,
  DoorOpen,
  LockKeyhole,
  CircuitBoard,
  Cable,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const ICONS={
   Play,
  Pause,
  RotateCcw,
  Gauge,
  Waves,
  Activity,
  Cpu,
  Shield,
  KeySquare,
  KeyRound,
  DoorOpen,
  LockKeyhole,
  CircuitBoard,
  Cable,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
}

// ---------- shadcn/ui imports (adjust paths for your project) ----------
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ThreeBoard2 } from "../components/ThreeBoard2";

// ---------------- THEME & CONSTANTS ----------------
const SURFACE = "bg-emerald-950 text-emerald-50";
const PANEL = "bg-emerald-900/40 border border-emerald-800/60";
const SOFT = "bg-emerald-950/40";
const GRID_BG =
  "bg-[radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] [background-size:16px_16px]";

const WIRE_COLORS = ["#14b8a6", "#34d399", "#22d3ee", "#f59e0b", "#ef4444", "#a78bfa"];

// Node card geometry (must stay in sync with visuals)
const CARD_W = 220;
const CARD_H = 140;
const PIN_ROW_START = 42; // px from card top
const PIN_ROW_STEP = 22; // vertical spacing per row
const PIN_GUTTER = 14; // outside the card edge
const PIN_RADIUS = 6; // visible pin radius

// ---------------- BASE COMPONENTS ----------------
const BASE_COMPONENTS = [
  {
    id: "stm32",
    type: "STM32 (F103)",
    icon: CircuitBoard,
    x: 80,
    y: 120,
    pins: [
      "3V3",
      "GND",
      "PA0",
      "PA1",
      "PA2",
      "PA9(TX)",
      "PA10(RX)",
      "PB6(SCL)",
      "PB7(SDA)",
      "PB0",
      "PB1",
    ],
    meta: { role: "controller" },
  },
  {
    id: "rc522",
    type: "RFID RC522",
    icon: Shield,
    x: 520,
    y: 120,
    pins: ["3V3", "GND", "SDA", "SCK", "MOSI", "MISO", "RST", "IRQ"],
    meta: { role: "sensor" },
  },
  {
    id: "relay",
    type: "Relay (5V)",
    icon: LockKeyhole,
    x: 520,
    y: 300,
    pins: ["VCC", "GND", "IN", "COM", "NO", "NC"],
    meta: { role: "actuator" },
  },
  {
    id: "buzzer",
    type: "Buzzer",
    icon: KeyRound,
    x: 300,
    y: 340,
    pins: ["VCC", "GND", "SIG"],
    meta: { role: "actuator" },
  },
  {
    id: "oled",
    type: "OLED 128x64 (I²C)",
    icon: KeySquare,
    x: 300,
    y: 40,
    pins: ["VCC", "GND", "SCL", "SDA"],
    meta: { role: "display" },
  },
  {
    id: "solenoid",
    type: "Door Solenoid",
    icon: DoorOpen,
    x: 760,
    y: 300,
    pins: ["COM", "ACT"],
    meta: { role: "actuator" },
  },
];

// ---------------- ZUSTAND STORE ----------------
const useCircuitStore = create((set, get) => ({

  // Load persisted state if available
  nodes: (() => {
    try {
      const saved = localStorage.getItem("ac_nodes");
      return saved ? JSON.parse(saved) : BASE_COMPONENTS.map((c) => ({ ...c }));
    } catch {
      return BASE_COMPONENTS.map((c) => ({ ...c }));
    }
  })(),
  wires: (() => {
    try {
      const saved = localStorage.getItem("ac_wires");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  running: false,

  setNodes: (nodes) => {
    set({ nodes });
    localStorage.setItem("ac_nodes", JSON.stringify(nodes));
  },
  updateNodePos: (id, x, y) =>
    set((state) => {
      const updated = state.nodes.map((n) =>
        n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n
      );
      localStorage.setItem("ac_nodes", JSON.stringify(updated));
      return { nodes: updated };
    }),

  setWires: (wires) => {
    set({ wires });
    localStorage.setItem("ac_wires", JSON.stringify(wires));
  },
  addWire: (wire) => {
    const newWires = [...get().wires, wire];
    set({ wires: newWires });
    localStorage.setItem("ac_wires", JSON.stringify(newWires));
  },
  removeWire: (id) => {
    const newWires = get().wires.filter((w) => w.id !== id);
    set({ wires: newWires });
    localStorage.setItem("ac_wires", JSON.stringify(newWires));
  },

  toggleRunning: () => set({ running: !get().running }),
  setRunning: (v) => set({ running: v }),

  reset: () => {
    const freshNodes = BASE_COMPONENTS.map((c) => ({ ...c }));
    set({
      nodes: freshNodes,
      wires: [],
      running: false,
    });
    localStorage.setItem("ac_nodes", JSON.stringify(freshNodes));
    localStorage.setItem("ac_wires", JSON.stringify([]));
  },

}));

// ---------------- REQUIRED CONNECTIONS (instruction list) ----------------
const REQUIRED_CONNECTIONS = [
  { id: "r1", fromNode: "stm32", fromPin: "3V3", toNode: "oled", toPin: "VCC", label: "STM32 3V3 → OLED VCC" },
  { id: "r2", fromNode: "stm32", fromPin: "GND", toNode: "oled", toPin: "GND", label: "STM32 GND → OLED GND" },
  { id: "r3", fromNode: "stm32", fromPin: "PB6(SCL)", toNode: "oled", toPin: "SCL", label: "STM32 PB6(SCL) → OLED SCL" },
  { id: "r4", fromNode: "stm32", fromPin: "PB7(SDA)", toNode: "oled", toPin: "SDA", label: "STM32 PB7(SDA) → OLED SDA" },

  { id: "r5", fromNode: "stm32", fromPin: "3V3", toNode: "rc522", toPin: "3V3", label: "STM32 3V3 → RC522 3V3" },
  { id: "r6", fromNode: "stm32", fromPin: "GND", toNode: "rc522", toPin: "GND", label: "STM32 GND → RC522 GND" },
  { id: "r7", fromNode: "stm32", fromPin: "PA1", toNode: "rc522", toPin: "SDA", label: "STM32 PA1 → RC522 SDA" },
  { id: "r8", fromNode: "stm32", fromPin: "PA2", toNode: "rc522", toPin: "SCK", label: "STM32 PA2 → RC522 SCK" },
  { id: "r9", fromNode: "stm32", fromPin: "PB0", toNode: "rc522", toPin: "MOSI", label: "STM32 PB0 → RC522 MOSI" },
  { id: "r10", fromNode: "stm32", fromPin: "PB1", toNode: "rc522", toPin: "MISO", label: "STM32 PB1 → RC522 MISO" },
  { id: "r11", fromNode: "stm32", fromPin: "PA0", toNode: "rc522", toPin: "RST", label: "STM32 PA0 → RC522 RST" },

  { id: "r12", fromNode: "stm32", fromPin: "PA9(TX)", toNode: "relay", toPin: "IN", label: "STM32 PA9(TX) → Relay IN" },
  { id: "r13", fromNode: "stm32", fromPin: "3V3", toNode: "relay", toPin: "VCC", label: "STM32 3V3 → Relay VCC" },
  { id: "r14", fromNode: "stm32", fromPin: "GND", toNode: "relay", toPin: "GND", label: "STM32 GND → Relay GND" },
  { id: "r15", fromNode: "relay", fromPin: "COM", toNode: "solenoid", toPin: "COM", label: "Relay COM → Solenoid COM" },
  { id: "r16", fromNode: "relay", fromPin: "NO", toNode: "solenoid", toPin: "ACT", label: "Relay NO → Solenoid ACT" },

  { id: "r17", fromNode: "stm32", fromPin: "PA10(RX)", toNode: "buzzer", toPin: "SIG", label: "STM32 PA10(RX) → Buzzer SIG" },
  { id: "r18", fromNode: "stm32", fromPin: "3V3", toNode: "buzzer", toPin: "VCC", label: "STM32 3V3 → Buzzer VCC" },
  { id: "r19", fromNode: "stm32", fromPin: "GND", toNode: "buzzer", toPin: "GND", label: "STM32 GND → Buzzer GND" },
];

// ---------------- HELPERS ----------------
function makeWireId(aNode, aIdx, bNode, bIdx) {
  return `${aNode}:${aIdx}=>${bNode}:${bIdx}`;
}
function pinSideFromIndex(idx) {
  return idx % 2 === 0 ? "left" : "right";
}
// Stable pin coordinates derived from node position + pin index
function getPinCoords(node, pinIndex) {
  if (!node) return null;
  const isLeft = pinIndex % 2 === 0;
  const row = Math.floor(pinIndex / 2);
  const y = Math.round(node.y + PIN_ROW_START + row * PIN_ROW_STEP);
  const x = isLeft ? Math.round(node.x - PIN_GUTTER) : Math.round(node.x + CARD_W + PIN_GUTTER);
  return { x, y };
}

// ---------------- GLOBAL CSS FOR ANIMATIONS ----------------
const GLOBAL_STYLE = `
@keyframes dashFlow { to { stroke-dashoffset: -40; } }
.animate-flow { stroke-dasharray: 12; stroke-dashoffset: 0; animation: dashFlow 900ms linear infinite; }
.pin-pulse { animation: pin 1.2s ease-in-out infinite; transform-origin: center; display:inline-block; }
@keyframes pin { 0%,100%{ transform:scale(1); opacity:.85 } 50%{ transform:scale(1.25); opacity:1 } }
.scope-anim { animation: scope 1.2s linear infinite; }
@keyframes scope { 0%{opacity:.3} 50%{opacity:1} 100%{opacity:.3} }
.logic-anim { animation: logic 1.2s steps(6) infinite; }
@keyframes logic { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
.pin-glow { filter: drop-shadow(0 0 6px rgba(255,80,120,0.8)); }
`;
if (typeof document !== "undefined" && !document.getElementById("acs-style")) {
  const s = document.createElement("style");
  s.id = "acs-style";
  s.innerHTML = GLOBAL_STYLE;
  document.head.appendChild(s);
}

// ---------------- MAIN PAGE ----------------
export default function AccessControlSimulator() {
  const nodes = useCircuitStore((s) => s.nodes);
  const wires = useCircuitStore((s) => s.wires);
  const running = useCircuitStore((s) => s.running);
  const toggleRunning = useCircuitStore((s) => s.toggleRunning);
  const addWireToStore = useCircuitStore((s) => s.addWire);
  const removeWireFromStore = useCircuitStore((s) => s.removeWire);
  const resetStore = useCircuitStore((s) => s.reset);

  const [selectedId, setSelectedId] = useState("stm32");
  const [inspectorTab, setInspectorTab] = useState("props");
  const [isMobile, setIsMobile] = useState(false);

  // LEFT PANEL: fully collapsible column
  const [showSidebar, setShowSidebar] = useState(true);

  // instruction completion map
   const [completedMap, setCompletedMap] = useState(() => {
  try {
  const saved = localStorage.getItem("ac_completed");
  return saved
  ? JSON.parse(saved)
  : Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
  } catch {
  return Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
  }
  });

  // pending pin while creating a wire: { nodeId, pinIndex }
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // reset instructions when wires cleared externally
  useEffect(() => {
    if (!wires || wires.length === 0) {
      setCompletedMap(Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false])));
    }
  }, [wires]);
    useEffect(() => {
  localStorage.setItem("ac_completed", JSON.stringify(completedMap));
  }, [completedMap]);

  const allDone = useMemo(() => Object.values(completedMap).every(Boolean), [completedMap]);

  function checkAndMarkInstruction(newWire) {
    const nodesById = Object.fromEntries(useCircuitStore.getState().nodes.map((n) => [n.id, n]));
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
    const current = useCircuitStore.getState().wires;
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
    setCompletedMap(Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false])));
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
    // recompute completion map from remaining wires
    const remain = useCircuitStore.getState().wires;
    const map = Object.fromEntries(REQUIRED_CONNECTIONS.map((r) => [r.id, false]));
    for (const w of remain) {
      const nodesById = Object.fromEntries(useCircuitStore.getState().nodes.map((n) => [n.id, n]));
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

  const selected = useMemo(() => nodes.find((n) => n.id === selectedId) || null, [nodes, selectedId]);

  const gridCols = showSidebar ? "lg:grid-cols-[320px_1fr_360px]" : "lg:grid-cols-[1fr_360px]";

  return (
    <div className={`min-h-[calc(100vh-120px)] pt-20 bg-black ${SURFACE} ${GRID_BG}`}>
      {/* Top bar */}
      <div className="mx-auto max-w-8xl px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 grid place-items-center shadow-md">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Access Control — Wiring Lab</h1>
            <p className="text-sm text-emerald-300/70">Pins stick to components • neon wires • live drag</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              className="border-emerald-700/60 text-emerald-300 cursor-pointer hover:text-emerald-400 hover:bg-emerald-900/40 hidden lg:flex"
              onClick={() => setShowSidebar((s) => !s)}
            >
              {showSidebar ? <PanelLeftClose className="mr-2 h-4 w-4" /> : <PanelLeftOpen className="mr-2 h-4 w-4" />}
              {showSidebar ? "Hide Instructions" : "Show Instructions"}
            </Button>

            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer" onClick={handleStartToggle}>
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? "Pause Simulation" : "Start Simulation"}
            </Button>

            <Button variant="outline" className="border-emerald-700/60 text-emerald-300 cursor-pointer hover:text-emerald-400 hover:bg-emerald-900/40" onClick={handleResetAll}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Layout: left (fully collapsible) • center canvas • right inspector */}
      <div className={`mx-auto max-w-8xl px-4 pb-10 grid grid-cols-1 ${gridCols} gap-4`}>
        {/* Left: Wiring instructions (entire column collapses) */}
        {showSidebar && (
          <Card className={`${PANEL} h-[calc(100vh-160px)] overflow-y-auto`}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-300">Wiring Instructions</CardTitle>
                <Button size="sm" variant="outline" className="border-emerald-700/60 cursor-pointer text-emerald-300" onClick={() => setShowSidebar(false)}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-emerald-300/70">
                Click the red pins to connect. {Object.values(completedMap).filter(Boolean).length}/{REQUIRED_CONNECTIONS.length} done
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
                      <div className={`${done ? "text-emerald-200" : "text-emerald-300/80"} text-sm flex-1`}>{req.label}</div>
                      {done ? (
                        <Badge className="bg-emerald-700/60 border-emerald-700/60">Done</Badge>
                      ) : (
                        <span className="text-xs text-emerald-300/80">⌛</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator className="my-3 bg-emerald-800/60" />

              <div className="text-xs text-emerald-300/70 mb-2">How to connect</div>
              <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-300">
                <li>Click one red pin to start a wire.</li>
                <li>Click a second pin to complete it.</li>
                <li>Matched instructions are marked <strong>Done</strong>.</li>
                <li>Press <strong>Start Simulation</strong> to animate current flow.</li>
              </ol>

              <div className="mt-4">
                <Button
                  onClick={() => {
                    useCircuitStore.getState().setWires([]);
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
                <Badge variant="outline" className="border-emerald-700 text-emerald-400/60">Project Canvas</Badge>
                <span className="text-sm text-emerald-300/70">Pins stick • neon curved wires • flow animation</span>
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
            <MeterCard title="Voltmeter" subtitle="V" icon={Gauge}>
              <Voltmeter running={running} />
            </MeterCard>
            <MeterCard title="Oscilloscope" subtitle="CH1 simulated" icon={Waves}>
              <Oscilloscope running={running} />
            </MeterCard>
            <MeterCard title="Logic Analyzer" subtitle="SPI" icon={Activity}>
              <LogicAnalyzer running={running} />
            </MeterCard>
          </div>

          {/* 3D preview */}
          <Card className={`${PANEL} overflow-hidden mt-4`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-700/60 text-emerald-300/60">3D Preview</Badge>
                <span className="text-sm text-emerald-300/70">Access Control Demo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0">
              <ThreeBoard2 running={running} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Inspector */}
        <div>
          <InspectorPanel selectedNode={selected} running={running} inspectorTab={inspectorTab} setInspectorTab={setInspectorTab} />
        </div>
      </div>

      {/* Sidebar re-open FAB when collapsed */}
      {!showSidebar && (
        <button
          aria-label="Open wiring instructions"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-[60] cursor-pointer rounded-full border border-emerald-800/60 bg-emerald-900/70 p-2 hover:bg-emerald-800/60"
          onClick={() => setShowSidebar(true)}
        >
          <PanelLeftOpen className="h-5 w-5 text-emerald-200" />
        </button>
      )}

      {/* Mobile overlay */}
      <MobileOverlay show={isMobile} />
    </div>
  );
}

// ---------------- CanvasArea: wires + pins + draggable nodes ----------------
function CanvasArea({ pending, setPending, onSelect, selectedId, addWireAction }) {
  const nodes = useCircuitStore((s) => s.nodes);
  const wires = useCircuitStore((s) => s.wires);
  const running = useCircuitStore((s) => s.running);

  return (
    <div className={`relative h[640px] md:h-[640px] h-[560px] ${SOFT}`}> {/* soft grid panel */}
      {/* SVG wires layer (under pins, over background) */}
      <svg className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        <defs>
          <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#32f0c8" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
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
              <path d={d} stroke={w.color} strokeWidth="8" fill="none" opacity="0.12" filter="url(#neonGlow)" />
              <path d={d} stroke={`url(#wireGrad)`} strokeWidth="4" fill="none" className={animClass} strokeLinecap="round" />
              <circle cx={from.x} cy={from.y} r="4" fill={w.color} opacity="0.95" />
              <circle cx={to.x} cy={to.y} r="4" fill={w.color} opacity="0.95" />
            </g>
          );
        })}
      </svg>

      {/* Pin anchors (interactive) */}
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
                fill="#ff3d6d"
                className="pin-glow"
                stroke="#2b0c0f"
                strokeWidth="1"
                onClick={(e) => {
                  e.stopPropagation();
                  const ce = new CustomEvent("pin:click", { detail: { nodeId: n.id, pinIndex: idx } });
                  window.dispatchEvent(ce);
                }}
                style={{ cursor: "pointer" }}
              />
            );
          })
        )}
      </svg>

      {/* Draggable node cards (top layer) */}
      {nodes.map((n) => (
        <DraggableNode key={n.id} node={n} selected={selectedId === n.id} onSelect={onSelect} />
      ))}

      <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md bg-emerald-900/60 border border-emerald-800/60 text-gray-400">
        Canvas • click pins (red) to connect • drag components
      </div>

      <PinClickManager pending={pending} setPending={setPending} addWireAction={addWireAction} />
    </div>
  );
}

// ---------------- Draggable node (mouse drag + snap-to-grid like SimulatorPage.jsx) ----------------
function DraggableNode({ node, selected, onSelect }) {
  const updateNodePos = useCircuitStore((s) => s.updateNodePos);

  // local transient drag state
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 10px grid snapping (same idea as in SimulatorPage)
  const snap = (val) => Math.round(val / 10) * 10;

  const onMouseDown = (e) => {
    e.stopPropagation();
    // start dragging; capture offset between cursor and top-left of the card
    setDragging(true);
    setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    onSelect?.(node.id);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      const nx = snap(e.clientX - offset.x);
      const ny = snap(e.clientY - offset.y);
      // Update store position (store signature is updateNodePos(id, x, y))
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

// ---------------- PinClickManager: centralizes click behavior for pins ----------------
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
    window.addEventListener("pin:click", handler);
    return () => window.removeEventListener("pin:click", handler);
  }, [pending, setPending, addWireAction]);
  return null;
}

// ---------------- Node card visuals ----------------
function NodeCardTop({ node, selected }) {
  const Icon = ICONS[node.icon] || CircuitBoard;
  const running = useCircuitStore((s) => s.running);

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
        <div className="text-sm  text-white font-semibold truncate">{node.type}</div>
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
              title={p} // tooltip on hover for full pin name
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


// ---------------- Inspector Panel ----------------
function InspectorPanel({ selectedNode, running, inspectorTab, setInspectorTab }) {
  return (
    <Card className={`${PANEL}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge variant="outline" className="border-emerald-700/60 text-emerald-400/60">Inspector</Badge>
          <span className="text-emerald-300/80">{selectedNode?.type ?? "Select a component"}</span>
        </CardTitle>
        <CardDescription className="text-emerald-300/70 ">Properties • Code • Diagnostics</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={inspectorTab} onValueChange={(v) => setInspectorTab(v)}>
          <TabsList className="grid grid-cols-3 bg-emerald-900/40 border text-white border-emerald-800/60">
            <TabsTrigger value="props" className= "text-gray-300 data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Properties</TabsTrigger>
            <TabsTrigger value="code" className="text-gray-300 data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Code</TabsTrigger>
            <TabsTrigger value="diag" className="text-gray-300 data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="props" className="mt-3">
            {selectedNode ? (
              <ScrollArea className="h-[280px] rounded-md border border-emerald-800/60 p-3">
                <div className="space-y-3 text-sm text-white">
                  <KV label="Role" value={selectedNode.meta.role} />
                  <KV label="Pins" value={`${selectedNode.pins.length} total`} />
                  <KV label="Position" value={`x: ${selectedNode.x}, y: ${selectedNode.y}`} />
                  <KV label="Running" value={running ? "Yes" : "No"} />
                  <Separator className="my-1 bg-emerald-800/60" />
                  <div>
                    <div className="text-xs text-emerald-300/60 mb-1">Pinout</div>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedNode.pins.map((p) => (
                        <div key={p} className="rounded-md border border-emerald-800/60 px-2 py-1 flex items-center gap-1 text-[12px]">
                          <Cable className="h-3 w-3 text-emerald-400/90" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-emerald-300/70">Click a component to inspect its pins and config.</div>
            )}
          </TabsContent>

          <TabsContent value="code" className="mt-3">
            <div className="text-xs mb-2 text-emerald-300/70 flex items-center gap-1">
              <FileCode2 className="h-3.5 w-3.5" /> Demo firmware (pseudo)
            </div>
            <Textarea className="h-64 bg-emerald-950/60 border-emerald-800/60 text-white" defaultValue={`// Example pseudo sketch
void setup(){
  // init
}
void loop(){
  // logic
}`} />
            <div className="mt-2 flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-500">
                Build (mock)
              </Button>
              <Button variant="outline" className="border-emerald-800/60 text-emerald-300">Upload (mock)</Button>
            </div>
          </TabsContent>

          <TabsContent value="diag" className="mt-3">
            <div className="space-y-2 text-sm">
              <DiagItem sev="danger" text="Check relay driver if driving high current." />
              <DiagItem sev="warn" text="Keep SPI wires short for RC522 reliability." />
              <DiagItem sev="info" text="I2C typically requires pull-ups on SDA/SCL." />
            </div>
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
      <span className="text-emerald-300/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function DiagItem({ sev, text }) {
  const tone =
    sev === "danger"
      ? "border-red-500/40 bg-red-400/10 text-red-300"
      : sev === "warn"
      ? "border-amber-500/40 bg-amber-400/10 text-amber-200"
      : "border-cyan-500/40 bg-cyan-400/10 text-cyan-200";
  return <div className={`rounded-md border px-2 py-1 ${tone}`}>{text}</div>;
}

// ---------------- Meters & Animations ----------------
function MeterCard({ title, subtitle, icon: Icon, children }) {
  return (
    <Card className={`${PANEL}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex text-gray-300 items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-300" />
          {title}
          <span className="ml-auto text-[11px] text-emerald-300/70">{subtitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Voltmeter({ running }) {
  const [v, setV] = useState(3.3);
  useEffect(() => {
    let t;
    if (running) {
      t = setInterval(() => {
        setV(() => Math.round((3.25 + Math.random() * 0.12) * 100) / 100);
      }, 600);
    } else {
      setV(3.3);
    }
    return () => clearInterval(t);
  }, [running]);
  return (
    <div className="text-center ">
      <div className="text-2xl font-semibold">{v.toFixed(2)} V</div>
      <div className="text-xs text-emerald-300/70 mt-1">Measured between 3V3 and GND (mock)</div>
    </div>
  );
}

function Oscilloscope({ running }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf;
    function step() {
      setPhase((p) => p + (running ? 0.6 : 0.08));
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const points = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 220; x += 6) {
      const freq = 0.06;
      const amp = running ? 22 + 6 * Math.sin(phase * 0.02) : 10;
      const y = 32 + Math.sin(x * freq + phase * 0.01) * amp;
      pts.push(`${x},${Math.round(y)}`);
    }
    return pts.join(" ");
  }, [phase, running]);

  return (
    <svg viewBox="0 0 220 64" className="w-full h-16">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} className={running ? "scope-anim text-emerald-300" : "text-emerald-500/70"} />
    </svg>
  );
}

function LogicAnalyzer({ running }) {
  return (
    <svg viewBox="0 0 220 64" className="w-full h-16">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={running ? "logic-anim text-emerald-300" : "text-emerald-500/70"}
        points="0,48 20,48 20,16 60,16 60,48 100,48 100,16 140,16 140,48 180,48 180,16 220,16"
      />
    </svg>
  );
}


// ---------------- MOBILE OVERLAY ----------------
function MobileOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-emerald-950/95 backdrop-blur-sm grid place-items-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-emerald-700/60 bg-emerald-900/50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 grid place-items-center">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold">Desktop Simulator</div>
            <div className="text-emerald-300/75 text-sm">Best experience on a larger screen</div>
          </div>
        </div>
        <p className="text-sm text-emerald-100/90">
          For the best experience, open this simulator on a desktop. Instruments and wiring interactions are optimized for larger viewports.
        </p>
        <div className="mt-4 flex justify-end">
          <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => window.scrollTo({ top: 0 })}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
