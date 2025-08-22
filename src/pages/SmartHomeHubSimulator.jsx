
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
} from "lucide-react";

// ---------- shadcn/ui imports (adjust to your project structure) ----------
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ThreeBoard3 } from "../components/ThreeBoard3";
import { useNavigate } from "react-router-dom";
// ---------------- THEME & CONSTANTS ----------------
const ICONS={
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
  FanIcon,
  Thermometer,
  MemoryStick,
  CheckCircle2,
  AlertCircle,
  Bug,
}

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
const HUB_COMPONENTS = [
  {
    id: "esp32",
    type: "ESP32 DevKit",
    icon: CircuitBoard,
    x: 80,
    y: 120,
    pins: [
      "3V3",
      "GND",
      "GPIO4",
      "GPIO5",
      "GPIO12",
      "GPIO13",
      "GPIO18(LED)",
      "GPIO21(SDA)",
      "GPIO22(SCL)",
      "GPIO23(BUZZ)",
      "MOSI(23)",
      "MISO(19)",
      "SCK(18)",
      "CS(5)",
      "GPIO34(ADC)",
      
    ],
    meta: { role: "controller", radios: "Wi-Fi/BLE" },
  },
  {
    id: "dht22",
    type: "DHT22 (Temp/Humidity)",
    icon: Thermometer,
    x: 520,
    y: 40,
    pins: ["VCC", "DATA", "GND"],
    meta: { role: "sensor", desc: "Digital single-wire humidity & temperature" },
  },
  {
    id: "pir",
    type: "PIR Motion",
    icon: Camera,
    x: 760,
    y: 40,
    pins: ["VCC", "OUT", "GND"],
    meta: { role: "sensor", sig: "digital" },
  },
  {
    id: "relay",
    type: "Relay Module",
    icon: Zap,
    x: 520,
    y: 210,
    pins: ["VCC", "IN", "GND", "NO", "COM", "NC"],
    meta: { role: "actuator", load: "AC" },
  },
  {
    id: "fan",
    type: "Fan (Load)",
    icon: FanIcon,
    x: 800,
    y: 220,
    pins: ["+", "-"],
    meta: { role: "load" },
  },
  {
    id: "ws2812",
    type: "WS2812 LED Strip",
    icon: Lightbulb,
    x: 300,
    y: 40,
    pins: ["VCC", "DIN", "GND"],
    meta: { role: "actuator", sig: "1-wire" },
  },
  {
    id: "buzzer",
    type: "Buzzer / Siren",
    icon: AudioLines,
    x: 300,
    y: 210,
    pins: ["VCC", "SIG", "GND"],
    meta: { role: "actuator" },
  },
  {
    id: "oled",
    type: "OLED 128x64 (I²C)",
    icon: CloudSun,
    x: 300,
    y: 360,
    pins: ["VCC", "GND", "SCL", "SDA"],
    meta: { role: "display", bus: "I²C" },
  },
  {
    id: "sd",
    type: "MicroSD Module (SPI)",
    icon: HardDrive,
    x: 520,
    y: 360,
    pins: ["VCC", "GND", "SCK", "MISO", "MOSI", "CS"],
    meta: { role: "storage", bus: "SPI" },
  },
  {
    id: "ldr",
    type: "LDR Light Sensor",
    icon: SunMedium,
    x: 760,
    y: 340,
    pins: ["VCC", "OUT", "GND"],
    meta: { role: "sensor", sig: "analog" },
  },
  {
    id: "reed",
    type: "Door / Reed Switch",
    icon: DoorOpen,
    x: 80,
    y: 340,
    pins: ["VCC", "OUT", "GND"],
    meta: { role: "sensor", sig: "digital" },
  },
  {
    id: "rtc",
    type: "RTC (I²C)",
    icon: Layers,
    x: 80,
    y: 40,
    pins: ["VCC", "GND", "SCL", "SDA", "SQW"],
    meta: { role: "timebase", bus: "I²C" },
  },
];

// ---------------- ZUSTAND STORE ----------------
const useStationStore = create((set, get) => ({

  // Load persisted state if available
  nodes: (() => {
    try {
      const saved = localStorage.getItem("smarthub_nodes");
      return saved ? JSON.parse(saved) : HUB_COMPONENTS.map((c) => ({ ...c }));
    } catch {
      return HUB_COMPONENTS.map((c) => ({ ...c }));
    }
  })(),
  wires: (() => {
    try {
      const saved = localStorage.getItem("smarthub_wires");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  running: false,

  // recompute completedMap from wires on load
  completedMap: (() => {
    try {
      const savedWires = localStorage.getItem("smarthub_wires");
      const wires = savedWires ? JSON.parse(savedWires) : [];
      return REQUIRED_CONNECTIONS.reduce((map, conn) => {
        const ok = wires.some((w) => {
          if (!w.a || !w.b) return false; // ✅ guard
          return (
            (w.a.node === conn.a.node && w.a.index === conn.a.index &&
             w.b.node === conn.b.node && w.b.index === conn.b.index) ||
            (w.b.node === conn.a.node && w.b.index === conn.a.index &&
             w.a.node === conn.b.node && w.a.index === conn.b.index)
          );
        });
        map[conn.label] = ok;
        return map;
      }, {});
    } catch {
      return {};
    }
  })(),

  setNodes: (nodes) => {
    set({ nodes });
    localStorage.setItem("smarthub_nodes", JSON.stringify(nodes));
  },

  updateNodePos: (id, x, y) =>
    set((state) => {
      const updated = state.nodes.map((n) =>
        n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n
      );
      localStorage.setItem("smarthub_nodes", JSON.stringify(updated));
      return { nodes: updated };
    }),

  setWires: (wires) => {
    set({
      wires,
      completedMap: REQUIRED_CONNECTIONS.reduce((map, conn) => {
        const ok = wires.some((w) => {
          if (!w.a || !w.b) return false; // ✅ guard
          return (
            (w.a.node === conn.a.node && w.a.index === conn.a.index &&
             w.b.node === conn.b.node && w.b.index === conn.b.index) ||
            (w.b.node === conn.a.node && w.b.index === conn.a.index &&
             w.a.node === conn.b.node && w.a.index === conn.b.index)
          );
        });
        map[conn.label] = ok;
        return map;
      }, {}),
    });
    localStorage.setItem("smarthub_wires", JSON.stringify(wires));
  },

  addWire: (wire) => {
    const newWires = [...get().wires, wire];
    set({
      wires: newWires,
      completedMap: REQUIRED_CONNECTIONS.reduce((map, conn) => {
        const ok = newWires.some((w) => {
          if (!w.a || !w.b) return false; // ✅ guard
          return (
            (w.a.node === conn.a.node && w.a.index === conn.a.index &&
             w.b.node === conn.b.node && w.b.index === conn.b.index) ||
            (w.b.node === conn.a.node && w.b.index === conn.a.index &&
             w.a.node === conn.b.node && w.a.index === conn.b.index)
          );
        });
        map[conn.label] = ok;
        return map;
      }, {}),
    });
    localStorage.setItem("smarthub_wires", JSON.stringify(newWires));
  },

  removeWire: (id) => {
    const newWires = get().wires.filter((w) => w.id !== id);
    set({
      wires: newWires,
      completedMap: REQUIRED_CONNECTIONS.reduce((map, conn) => {
        const ok = newWires.some((w) => {
          if (!w.a || !w.b) return false; // ✅ guard
          return (
            (w.a.node === conn.a.node && w.a.index === conn.a.index &&
             w.b.node === conn.b.node && w.b.index === conn.b.index) ||
            (w.b.node === conn.a.node && w.b.index === conn.a.index &&
             w.a.node === conn.b.node && w.a.index === conn.b.index)
          );
        });
        map[conn.label] = ok;
        return map;
      }, {}),
    });
    localStorage.setItem("smarthub_wires", JSON.stringify(newWires));
  },

  toggleRunning: () => set({ running: !get().running }),
  setRunning: (v) => set({ running: v }),

  reset: () => {
    const freshNodes = HUB_COMPONENTS.map((c) => ({ ...c }));
    set({
      nodes: freshNodes,
      wires: [],
      running: false,
      completedMap: {}, // reset instructions
    });
    localStorage.setItem("smarthub_nodes", JSON.stringify(freshNodes));
    localStorage.setItem("smarthub_wires", JSON.stringify([]));
  },

}));


// ---------------- REQUIRED CONNECTIONS (Instructions) ----------------
// These are the canonical "correct" connections. Completing them enables the simulation.
const REQUIRED_CONNECTIONS = [
   { id: "p1", fromNode: "esp32", fromPin: "3V3", toNode: "dht22", toPin: "VCC", label: "ESP32 3V3 → DHT22 VCC" },
  { id: "p2", fromNode: "esp32", fromPin: "GND", toNode: "dht22", toPin: "GND", label: "ESP32 GND → DHT22 GND" },

  { id: "p3", fromNode: "esp32", fromPin: "3V3", toNode: "pir", toPin: "VCC", label: "ESP32 3V3 → PIR VCC" },
  { id: "p4", fromNode: "esp32", fromPin: "GND", toNode: "pir", toPin: "GND", label: "ESP32 GND → PIR GND" },

  { id: "p5", fromNode: "esp32", fromPin: "3V3", toNode: "relay", toPin: "VCC", label: "ESP32 3V3 → Relay VCC" },
  { id: "p6", fromNode: "esp32", fromPin: "GND", toNode: "relay", toPin: "GND", label: "ESP32 GND → Relay GND" },

  { id: "p7", fromNode: "esp32", fromPin: "3V3", toNode: "ws2812", toPin: "VCC", label: "ESP32 3V3 → WS2812 VCC" },
  { id: "p8", fromNode: "esp32", fromPin: "GND", toNode: "ws2812", toPin: "GND", label: "ESP32 GND → WS2812 GND" },

  { id: "p9", fromNode: "esp32", fromPin: "3V3", toNode: "buzzer", toPin: "VCC", label: "ESP32 3V3 → Buzzer VCC" },
  { id: "p10", fromNode: "esp32", fromPin: "GND", toNode: "buzzer", toPin: "GND", label: "ESP32 GND → Buzzer GND" },

  { id: "p11", fromNode: "esp32", fromPin: "3V3", toNode: "oled", toPin: "VCC", label: "ESP32 3V3 → OLED VCC" },
  { id: "p12", fromNode: "esp32", fromPin: "GND", toNode: "oled", toPin: "GND", label: "ESP32 GND → OLED GND" },

  { id: "p13", fromNode: "esp32", fromPin: "3V3", toNode: "sd", toPin: "VCC", label: "ESP32 3V3 → MicroSD VCC" },
  { id: "p14", fromNode: "esp32", fromPin: "GND", toNode: "sd", toPin: "GND", label: "ESP32 GND → MicroSD GND" },

  { id: "p15", fromNode: "esp32", fromPin: "3V3", toNode: "ldr", toPin: "VCC", label: "ESP32 3V3 → LDR VCC" },
  { id: "p16", fromNode: "esp32", fromPin: "GND", toNode: "ldr", toPin: "GND", label: "ESP32 GND → LDR GND" },

  { id: "p17", fromNode: "esp32", fromPin: "3V3", toNode: "reed", toPin: "VCC", label: "ESP32 3V3 → Reed VCC" },
  { id: "p18", fromNode: "esp32", fromPin: "GND", toNode: "reed", toPin: "GND", label: "ESP32 GND → Reed GND" },

  { id: "p19", fromNode: "esp32", fromPin: "3V3", toNode: "rtc", toPin: "VCC", label: "ESP32 3V3 → RTC VCC" },
  { id: "p20", fromNode: "esp32", fromPin: "GND", toNode: "rtc", toPin: "GND", label: "ESP32 GND → RTC GND" },

  // Digital signals
  { id: "s1", fromNode: "esp32", fromPin: "GPIO4", toNode: "dht22", toPin: "DATA", label: "ESP32 GPIO4 → DHT22 DATA" },
  { id: "s2", fromNode: "esp32", fromPin: "GPIO5", toNode: "relay", toPin: "IN", label: "ESP32 GPIO5 → Relay IN" },
  { id: "s3", fromNode: "esp32", fromPin: "GPIO18(LED)", toNode: "ws2812", toPin: "DIN", label: "ESP32 GPIO18 → WS2812 DIN" },
  { id: "s4", fromNode: "esp32", fromPin: "GPIO23(BUZZ)", toNode: "buzzer", toPin: "SIG", label: "ESP32 GPIO23 → Buzzer SIG" },
  { id: "s5", fromNode: "esp32", fromPin: "GPIO12", toNode: "pir", toPin: "OUT", label: "ESP32 GPIO12 ← PIR OUT" },
  { id: "s6", fromNode: "esp32", fromPin: "GPIO13", toNode: "reed", toPin: "OUT", label: "ESP32 GPIO13 ← Reed OUT" },

  // Analog
  { id: "a1", fromNode: "esp32", fromPin: "GPIO34(ADC)", toNode: "ldr", toPin: "OUT", label: "ESP32 GPIO34(ADC) ← LDR OUT" },

  // I²C
  { id: "i1", fromNode: "esp32", fromPin: "GPIO22(SCL)", toNode: "oled", toPin: "SCL", label: "ESP32 SCL(22) → OLED SCL" },
  { id: "i2", fromNode: "esp32", fromPin: "GPIO21(SDA)", toNode: "oled", toPin: "SDA", label: "ESP32 SDA(21) → OLED SDA" },
  { id: "i3", fromNode: "esp32", fromPin: "GPIO22(SCL)", toNode: "rtc", toPin: "SCL", label: "ESP32 SCL(22) → RTC SCL" },
  { id: "i4", fromNode: "esp32", fromPin: "GPIO21(SDA)", toNode: "rtc", toPin: "SDA", label: "ESP32 SDA(21) → RTC SDA" },

  // SPI (MicroSD)
  { id: "sp1", fromNode: "esp32", fromPin: "SCK(18)", toNode: "sd", toPin: "SCK", label: "ESP32 SCK → MicroSD SCK" },
  { id: "sp2", fromNode: "esp32", fromPin: "MISO(19)", toNode: "sd", toPin: "MISO", label: "ESP32 MISO → MicroSD MISO" },
  { id: "sp3", fromNode: "esp32", fromPin: "MOSI(23)", toNode: "sd", toPin: "MOSI", label: "ESP32 MOSI → MicroSD MOSI" },
  { id: "sp4", fromNode: "esp32", fromPin: "CS(5)", toNode: "sd", toPin: "CS", label: "ESP32 CS → MicroSD CS" },

  // Relay to Fan (mock load loop)
  { id: "l1", fromNode: "relay", fromPin: "NO", toNode: "fan", toPin: "+", label: "Relay NO → Fan +" },
  { id: "l2", fromNode: "relay", fromPin: "COM", toNode: "fan", toPin: "-", label: "Relay COM → Fan -" },

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
export default function SmartHomeHubSimulator() {
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
const saved = localStorage.getItem("smarthub_completed");
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
localStorage.setItem("smarthub_completed", JSON.stringify(completedMap));
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
            <h1 className="text-2xl font-semibold tracking-tight">Smart Home Hub — Wiring Lab</h1>
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
                <li>Click a pin to start a wire, then click another compatible pin to finish.</li>
                <li>I²C devices share SCL/SDA with the MCU; connect both lines and power.</li>
                <li>SPI requires SCK/MISO/MOSI and a unique CS per device.</li>
                <li>PIR/Reed provide digital OUT; route to GPIO inputs on ESP32.</li>
                <li>LDR feeds ADC via divider; we simulate OUT as analog into GPIO34.</li>
                <li>WS2812 DIN needs a stable GPIO; keep power rails short and solid.</li>
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
            <MeterCard title="Voltmeter" subtitle="3V3 rail" icon={Gauge}>
              <Voltmeter running={running} />
            </MeterCard>
            <MeterCard title="Oscilloscope" subtitle="Sensor signal" icon={Waves}>
              <Oscilloscope running={running} />
            </MeterCard>
            <MeterCard title="Logic Analyzer" subtitle="I²C/SPI mock" icon={Activity}>
              <LogicAnalyzer running={running} />
            </MeterCard>
          </div>

          {/* 3D preview */}
          <Card className={`${PANEL} overflow-hidden mt-4`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-700/60 text-emerald-300/50">3D Preview</Badge>
                <span className="text-sm text-emerald-300/80">SmartHomeHub Demo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-0">
              <ThreeBoard3 running={running} />
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
  const liveReadings = useLiveSensorReadings(running); // we can still simulate readings (motion, light, temp, etc.)

  return (
    <Card className={`${PANEL}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge variant="outline" className="border-emerald-700/60 text-emerald-300/50 bg-emerald-500/50">Inspector</Badge>
          <span className="text-emerald-300/80">{selectedNode?.type ?? "Select a component"}</span>
        </CardTitle>
        <CardDescription className="text-emerald-300/70">Properties • Code • Diagnostics</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={inspectorTab} onValueChange={(v) => setInspectorTab(v)}>
          <TabsList className="grid grid-cols-3 bg-emerald-900/40 border border-emerald-800/60">
            <TabsTrigger value="props" className="text-emerald-400  data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Properties</TabsTrigger>
            <TabsTrigger value="code" className="text-emerald-400  data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Code</TabsTrigger>
            <TabsTrigger value="diag" className="text-emerald-400  data-[state=active]:bg-emerald-800/60 data-[state=active]:text-white cursor-pointer">Diagnostics</TabsTrigger>
          </TabsList>

          {/* ---- Properties ---- */}
          <TabsContent value="props" className="mt-3">
            {selectedNode ? (
              <ScrollArea className="h-[300px] rounded-md border border-emerald-800/60 p-3">
                <div className="space-y-3 text-sm">
                  <KV label="Role" value={selectedNode.meta.role} />
                  {selectedNode.meta.bus && <KV label="Bus" value={selectedNode.meta.bus} />}
                  {selectedNode.meta.sig && <KV label="Signal" value={selectedNode.meta.sig} />}
                  <KV label="Pins" value={`${selectedNode.pins.length} total`} />
                  <KV label="Position" value={`x: ${selectedNode.x}, y: ${selectedNode.y}`} />
                  <KV label="Running" value={running ? "Yes" : "No"} />
                  <Separator className="my-1 bg-emerald-800/60" />

                  {/* Pinout */}
                  <div>
                    <div className="text-xs text-emerald-300/60 mb-1">Pinout</div>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedNode.pins.map((p) => (
                        <div
                          key={p}
                          className="rounded-md border text-gray-300 border-emerald-800/60 px-2 py-1 flex items-center gap-1 text-[12px]"
                        >
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

            {/* Live mock readings — tailored for Smart Home */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <LiveChip label="Temp" value={`${liveReadings.temp.toFixed(1)} °C`} />
              <LiveChip label="Light" value={`${liveReadings.light.toFixed(0)} lux`} />
              <LiveChip label="Motion" value={liveReadings.motion ? "Detected" : "None"} />
              <LiveChip label="Door" value={liveReadings.door ? "Open" : "Closed"} />
              <LiveChip label="Fan" value={liveReadings.fanOn ? "On" : "Off"} />
              <LiveChip label="Alarm" value={liveReadings.alarmOn ? "Active" : "Idle"} />
            </div>
          </TabsContent>

          {/* ---- Example Code ---- */}
          <TabsContent value="code" className="mt-3">
            <div className="text-xs mb-2 text-emerald-300/70">
              Example ESP32 Arduino code snippet (pseudo):
            </div>
            <Textarea
              readOnly
              className="h-[280px] text-xs text-gray-300 font-mono bg-emerald-950/50 border-emerald-800/60"
              value={`#include <WiFi.h>
#include <DHT.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_SSD1306.h>

#define DHTPIN 4
#define PIRPIN 12
#define RELAYPIN 5
#define BUZZER 23
#define LEDPIN 18
#define REEDPIN 13
#define LDRPIN 34

DHT dht(DHTPIN, DHT22);
Adafruit_NeoPixel strip(8, LEDPIN, NEO_GRB + NEO_KHZ800);
Adafruit_SSD1306 display(128, 64, &Wire);

void setup() {
  pinMode(PIRPIN, INPUT);
  pinMode(RELAYPIN, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(REEDPIN, INPUT_PULLUP);
  pinMode(LDRPIN, INPUT);

  dht.begin();
  strip.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  SD.begin(5);
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int ldr = analogRead(LDRPIN);
  bool motion = digitalRead(PIRPIN);
  bool door = digitalRead(REEDPIN);

  display.clearDisplay();
  display.setCursor(0,0);
  display.printf("T:%.1fC H:%.0f%%\\nLight:%d\\nDoor:%s", t,h,ldr, door?"Open":"Closed");
  display.display();

  if(motion){ digitalWrite(RELAYPIN,HIGH); strip.fill(strip.Color(0,150,0)); strip.show(); }
  else { digitalWrite(RELAYPIN,LOW); strip.clear(); strip.show(); }
  
  delay(2000);
}`}
            />
          </TabsContent>

          {/* ---- Diagnostics ---- */}
          <TabsContent value="diag" className="mt-3">
            <ScrollArea className="h-[280px] rounded-md border border-emerald-800/60 p-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">ESP32 powered and Wi-Fi enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">I²C bus active (OLED, RTC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-200">SPI bus active (MicroSD logging)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-300">Light sensor nearing low-light threshold</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Buzzer idle (no intrusion alert)</span>
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
    <div className="flex justify-between text-emerald-200/90">
      <span>{label}</span>
      <span className="text-emerald-300/80">{value}</span>
    </div>
  );
}

function LiveChip({ label, value }) {
  return (
    <div className="rounded-md bg-emerald-900/40 border border-emerald-800/60 px-2 py-1 text-xs text-emerald-200 flex items-center justify-between">
      <span>{label}</span>
      <span className="font-mono text-emerald-100">{value}</span>
    </div>
  );
}
// ---------------- Meter Cards ----------------
function MeterCard({ title, subtitle, icon: Icon, children }) {
  return (
    <Card className={`${PANEL}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-300 text-sm">
          <Icon className="h-4 w-4 text-emerald-300" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-emerald-300/70">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="h-32 flex items-center justify-center">{children}</CardContent>
    </Card>
  );
}

// ---------------- Instruments ----------------
function Voltmeter({ running }) {
  const [voltage, setVoltage] = React.useState(3.3);

  React.useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setVoltage((prev) => {
        // generate a small random fluctuation around 3.3V
        let next = 3.3 + (Math.random() - 0.5) * 0.2; // ±0.1V
        return Math.max(3.0, Math.min(3.6, next)); // clamp range
      });
    }, 500); // update every 0.5s

    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="text-3xl font-mono text-emerald-200">
      {running ? `${voltage.toFixed(2)} V` : "---"}
    </div>
  );
}

function Oscilloscope({ running }) {
  return (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <polyline
        points="0,20 10,20 15,5 25,35 35,5 45,35 55,20 65,20 75,5 85,35 95,20 100,20"
        fill="none"
        stroke="#50C878"
        strokeWidth="2"
        className={running ? "scope-anim" : ""}
      />
    </svg>
  );
}

function LogicAnalyzer({ running }) {
  return (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <polyline
        points="0,30 20,30 20,10 40,10 40,30 60,30 60,10 80,10 80,30 100,30"
        fill="none"
        stroke="#50C878"
        strokeWidth="2"
        className={running ? "logic-anim" : ""}
      />
    </svg>
  );
}

// ---------------- 3D Preview ----------------
function ThreeBoard({ running }) {
  const [doorOpen, setDoorOpen] = React.useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setDoorOpen((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <OrbitControls enablePan={false} enableZoom={false} />

      <Float
        speed={running ? 2 : 1}
        rotationIntensity={running ? 1 : 0.3}
        floatIntensity={0.5}
      >
        {/* === WHITE PCB Base === */}
        <mesh>
          <boxGeometry args={[6, 4, 0.15]} />
          <meshStandardMaterial
            color={running ? "#f9fafb" : "#e5e7eb"}   // Tailwind gray-50 / gray-200 (white PCB look)
            metalness={0.25}
            roughness={0.8}
          />
        </mesh>

        {/* FAN */}
       <group position={[-2, -1.2, 0.3]}>
  {/* Fan Base */}
  <mesh>
    <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
    <meshStandardMaterial color="#1f2937" />
  </mesh>

  {/* Fan Blades */}
  {[0, 1, 2, 3].map((i) => (
    <mesh
      key={i}
      rotation={[
        0,
        0,
        (i * Math.PI) / 2 + (running ? Date.now() * 0.25 : 0), // increased speed
      ]}
    >
      <boxGeometry args={[0.1, 1.2, 0.05]} />
      <meshStandardMaterial color="#9ca3af" metalness={0.4} />
    </mesh>
  ))}

  {/* Center Cap */}
  <mesh>
    <sphereGeometry args={[0.15, 16, 16]} />
    <meshStandardMaterial color="#111827" />
  </mesh>
</group>


        {/* LIGHT BULB */}
        <group position={[2, -1.2, 0.4]}>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
              color="#fef3c7"
              emissive="#fde68a"
              emissiveIntensity={running ? (Math.sin(Date.now() * 0.015) + 1.8) : 0}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>

        {/* DOOR */}
        <group position={[0, -1.7, 0.3]}>
          <mesh>
            <boxGeometry args={[1.5, 2.2, 0.1]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh rotation={[0, doorOpen ? -Math.PI / 2.5 : 0, 0]} position={[0, 0, 0.1]}>
            <boxGeometry args={[1.4, 2, 0.08]} />
            <meshStandardMaterial color="#92400e" metalness={0.2} roughness={0.7} />
          </mesh>
        </group>

        {/* ALARM */}
        <group position={[2.2, 1.2, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh
            rotation={[0, running ? Date.now() * 0.02 : 0, 0]}
            position={[0, 0.3, 0]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
            <meshStandardMaterial
              color="#b91c1c"
              emissive="#ef4444"
              emissiveIntensity={running ? (Math.sin(Date.now() * 0.05) + 2) : 0}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>

        {/* OLED */}
        <mesh position={[-1.5, 1.2, 0.2]}>
          <planeGeometry args={[2, 1]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={running ? "#22d3ee" : "#000"}
            emissiveIntensity={running ? 1.2 : 0}
          />
        </mesh>

       
      </Float>
    </Canvas>
  );
}


// ---------------- Mobile Overlay ----------------
function MobileOverlay({ show }) {
  const navigate=useNavigate()
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
        <p className="text-sm text-red-400/90">
          Enjoy NexEmbed by reading the Details of embedded systems
        </p>
        
        <div className="mt-4 flex justify-end">
          <Button className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer" onClick={() => navigate("/details")}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Hooks ----------------
function useLiveSensorReadings(running) {
  const [data, setData] = React.useState({
    temp: 0,
    humidity: 0,
    pressure: 0,
    wind: 0,
    rain: 0,
    dir: 0,
    light: 0,
    motion: false,
    door: false,
    fanOn: false,
    alarmOn: false,
  });

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setData({
        temp: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        pressure: 100000 + Math.random() * 500,
        wind: Math.random() * 5,
        rain: Math.random(),
        dir: Math.random() * 360,
        light: 200 + Math.random() * 800,
        motion: Math.random() > 0.7,
        door: Math.random() > 0.5,
        fanOn: Math.random() > 0.5,
        alarmOn: Math.random() > 0.8,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return data;
}



