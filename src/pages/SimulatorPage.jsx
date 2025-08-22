// SimulatorPage.jsx — Emerald Dark + Searchable Sidebar + Responsive Toolbar
// -------------------------------------------------------------------------------------------------
// Notes:
// - Uses your existing logic (nodes/wires, Zustand store, instruments). Functionality is unchanged.
// - New: emerald-dark visual pass, lucide-react icons, shadcn Badge chips, sidebar search & categories,
//   responsive toolbar for mobile/tablet/desktop, and component cards styled like your screenshot.
// - Dependencies used here: react, zustand, uuid, lucide-react, (optional) shadcn/ui Badge.
//   If you already installed shadcn/ui, Badge is assumed at "@/components/ui/badge".
// - If you don’t have shadcn Badge, replace <Badge> with a tiny styled <span> below (fallback shown).
// - Tailwind classes are used for layout/look, but core logic remains identical.
// -------------------------------------------------------------------------------------------------

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  Cpu,
  CircuitBoard,
  Radio,
  Activity,
  Waves,
  Gauge,
  Cpu as Mcu,
  Satellite,
  Bluetooth,
  Wifi,
  Zap,
  Thermometer,
  Sun as LightIcon,
  Waves as UltrasonicIcon,
  Compass,
  Battery,
  Bolt,
  ToggleLeft,
  PlugZap,
  Dice6,
  ScanLine,
  LayoutGrid,
  Search as SearchIcon,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Grid3X3,
  Minus,
  Sun,
  Moon,
  Undo2,
  Redo2,
  Code2,
  Bug,
  Wrench,
  GaugeCircle,
} from "lucide-react";

// If you have shadcn/ui badge:
let Badge;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Badge = require("@/components/ui/badge").Badge;
} catch {
  // Fallback pill if shadcn Badge isn't available.
  // Replace usages with <Badge> to keep API identical.
  Badge = ({ className = "", children }) => (
    <span
      className={
        "inline-flex items-center rounded-md border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium " +
        "text-emerald-300/90 bg-emerald-500/10 whitespace-nowrap " +
        className
      }
    >
      {children}
    </span>
  );
}

// ============================================================================
// Theme tokens (Emerald Dark)
// ============================================================================

const NAVBAR_HEIGHT = 64;
const GRID_SIZE = 10;
const MINI_SCOPE_SAMPLES = 40;
const LOGIC_CHANNELS = ["CH0", "CH1", "CH2", "CH3"];
const SIDEBAR_WIDTH = 300;
const INSPECTOR_WIDTH = 360;

const COLORS = {
  bgA: "#061b12", // deep emerald
  bgB: "#03140e", // deeper emerald
  panel: "rgba(16, 53, 42, 0.65)",
  panelSoft: "rgba(12, 43, 34, 0.55)",
  card: "rgba(10, 36, 28, 0.7)",
  cardAlt: "rgba(14, 42, 33, 0.6)",
  border: "rgba(16, 185, 129, 0.22)", // emerald-500/22
  borderSoft: "rgba(16, 185, 129, 0.12)",
  textHi: "#e6fff4",
  text: "rgba(224, 255, 244, 0.86)",
  textDim: "rgba(224, 255, 244, 0.62)",
  pin: "#f43f5e", // rose-500
  wire: "#34d399", // emerald-400
  wireGlow: "rgba(20, 184, 166, 0.28)", // teal-ish glow
  info: "#60a5fa",
  warn: "#f59e0b",
  ok: "#22c55e",
  err: "#ef4444",
};

// ============================================================================
// Helpers
// ============================================================================

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const snap = (v, g = GRID_SIZE) => Math.round(v / g) * g;

function fmtTime(ms) {
  const centi = Math.floor((ms % 1000) / 10);
  const sec = Math.floor(ms / 1000) % 60;
  const mins = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
    sec
  ).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;
}

function pinPos(node, side) {
  return {
    x: node.x + (side === "right" ? node.width : 0),
    y: node.y + node.height / 2,
  };
}

function makeWirePath(x1, y1, x2, y2) {
  const dx = (x2 - x1) / 2;
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function isPointInsideRect(el, clientX, clientY) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function rgbToHex(c) {
  if (!c) return "#10b981"; // emerald-500 default
  if (c.startsWith("#")) return c;
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return "#10b981";
  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  return (
    "#" +
    [r, g, b]
      .map((v) => {
        const s = v.toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")
  );
}

// ============================================================================
// Palette (with categories + badges like screenshot)
// ============================================================================

const CATEGORIES = [
  {
    key: "boards",
    title: "BOARDS",
    icon: <CircuitBoard className="h-4 w-4" />,
    items: [
      {
        id: "arduino_uno",
        label: "Arduino Uno",
        width: 200,
        height: 90,
        color: "#0ea5e9",
        icon: <Cpu className="h-5 w-5 text-sky-300" />,
        badges: ["GPIO", "PWM", "ADC"],
      },
      {
        id: "esp32_devkit",
        label: "ESP32 DevKit",
        width: 200,
        height: 90,
        color: "#6366f1",
        icon: <Radio className="h-5 w-5 text-indigo-300" />,
        badges: ["WiFi", "ADC", "3.3V"],
      },
      {
        id: "rp2040",
        label: "Raspberry Pi Pico",
        width: 200,
        height: 90,
        color: "#22d3ee",
        icon: <Cpu className="h-5 w-5 text-cyan-300" />,
        badges: ["RP2040", "PIO"],
      },
    ],
  },
  {
    key: "sensors",
    title: "SENSORS",
    icon: <Gauge className="h-4 w-4" />,
    items: [
      {
        id: "dht11",
        label: "DHT11",
        width: 140,
        height: 56,
        color: "#14b8a6",
        icon: <Thermometer className="h-5 w-5 text-teal-200" />,
        badges: ["temp"],
      },
      {
        id: "ldr",
        label: "LDR",
        width: 140,
        height: 56,
        color: "#a78bfa",
        icon: <LightIcon className="h-5 w-5 text-purple-200" />,
        badges: ["analog"],
      },
      {
        id: "ultrasonic",
        label: "Ultrasonic",
        width: 160,
        height: 60,
        color: "#f59e0b",
        icon: <UltrasonicIcon className="h-5 w-5 text-amber-200" />,
        badges: ["distance"],
      },
    ],
  },
  {
    key: "actuators",
    title: "ACTUATORS",
    icon: <PlugZap className="h-4 w-4" />,
    items: [
      {
        id: "led_red",
        label: "LED (Red)",
        width: 120,
        height: 50,
        color: "#ef4444",
        icon: <Zap className="h-5 w-5 text-rose-200" />,
        badges: ["GPIO"],
      },
      {
        id: "servo_sg90",
        label: "Servo SG90",
        width: 160,
        height: 60,
        color: "#f59e0b",
        icon: <GaugeCircle className="h-5 w-5 text-amber-200" />,
        badges: ["PWM"],
      },
      {
        id: "lcd_16x2",
        label: "LCD 16x2",
        width: 200,
        height: 70,
        color: "#10b981",
        icon: <ScanLine className="h-5 w-5 text-emerald-100" />,
        badges: ["I2C"],
      },
    ],
  },
  {
  key: "passives",
  title: "PASSIVES",
  icon: <Minus className="h-4 w-4" />,   // substitute icon
  items: [
    {
      id: "resistor",
      label: "Resistor",
      width: 120,
      height: 40,
      color: "#f97316", // orange-ish
      icon: <Minus className="h-5 w-5 text-orange-300" />, // using Minus as resistor symbol
      badges: ["Ω", "Analog"],
    },
    {
      id: "capacitor",
      label: "Capacitor",
      width: 120,
      height: 40,
      color: "#3b82f6", // blue
      icon: <Activity className="h-5 w-5 text-blue-300" />,
      badges: ["μF", "Filter"],
    },
    {
      id: "inductor",
      label: "Inductor",
      width: 120,
      height: 40,
      color: "#22c55e", // green
      icon: <Waves className="h-5 w-5 text-green-300" />,
      badges: ["mH", "Filter"],
    },
  ],
},
{
  key: "interfaces",
  title: "INTERFACES",
  icon: <PlugZap className="h-4 w-4" />,
  items: [
    {
      id: "i2c_bus",
      label: "I²C Bus",
      width: 160,
      height: 50,
      color: "#10b981",
      icon: <CircuitBoard className="h-5 w-5 text-emerald-300" />,
      badges: ["SDA", "SCL"],
    },
    {
      id: "spi_bus",
      label: "SPI Bus",
      width: 160,
      height: 50,
      color: "#6366f1",
      icon: <Cpu className="h-5 w-5 text-indigo-300" />,
      badges: ["MISO", "MOSI", "CLK"],
    },
    {
      id: "uart",
      label: "UART",
      width: 160,
      height: 50,
      color: "#f59e0b",
      icon: <Radio className="h-5 w-5 text-amber-300" />,
      badges: ["TX", "RX"],
    },
    {
      id: "power_rail",
      label: "Power Rail",
      width: 160,
      height: 50,
      color: "#ef4444",
      icon: <Battery className="h-5 w-5 text-red-300" />,
      badges: ["VCC", "GND"],
    },
  ],
},

  
];

// Flatten for quick search match
const FLAT_PALETTE = CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({ ...i, category: c.key }))
);

// ============================================================================
// Zustand Store (unchanged logic)
// ============================================================================

const useSimStore = create((set, get) => ({
  nodes: [],
  wires: [],
  selectedId: null,
  ui: {
    grid: true,
    theme: "dark",
  },
  sim: {
    running: false,
    elapsedMs: 0,
  },

  addNode: (node) =>
    set((s) => ({
      nodes: [...s.nodes, node],
    })),

  moveNode: (id, pos) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...pos } : n)),
    })),

  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      wires: s.wires.filter((w) => w.from.node !== id && w.to.node !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  addWire: (wire) =>
    set((s) => {
      const exists = s.wires.some(
        (w) =>
          (w.from.node === wire.from.node &&
            w.from.side === wire.from.side &&
            w.to.node === wire.to.node &&
            w.to.side === wire.to.side) ||
          (w.from.node === wire.to.node &&
            w.from.side === wire.to.side &&
            w.to.node === wire.from.node &&
            w.to.side === wire.from.side)
      );
      if (exists) return {};
      return { wires: [...s.wires, wire] };
    }),

  removeWire: (wireId) =>
    set((s) => ({
      wires: s.wires.filter((w) => w.id !== wireId),
    })),

  clearWires: () => set({ wires: [] }),

  setSelected: (id) => set({ selectedId: id }),
  setTheme: (theme) => set((s) => ({ ui: { ...s.ui, theme } })),
  setGrid: (grid) => set((s) => ({ ui: { ...s.ui, grid } })),

  setRunning: (running) => set((s) => ({ sim: { ...s.sim, running } })),
  setElapsed: (elapsedMs) => set((s) => ({ sim: { ...s.sim, elapsedMs } })),

  exportSnapshot: () => {
    const s = get();
    return {
      nodes: s.nodes,
      wires: s.wires,
      ui: s.ui,
      sim: s.sim,
    };
  },

  importSnapshot: (payload) =>
    set(() => {
      const p = payload || {};
      return {
        nodes: Array.isArray(p.nodes) ? p.nodes : [],
        wires: Array.isArray(p.wires) ? p.wires : [],
        ui: p.ui || { grid: true, theme: "dark" },
        sim: p.sim || { running: false, elapsedMs: 0 },
        selectedId: null,
      };
    }),

  setGraph: (nodes, wires) => set({ nodes, wires }),
}));

// ============================================================================
// Small UI bits (emerald styled)
// ============================================================================

function IconBtn({ title, onClick, children, disabled, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
        disabled
          ? "cursor-not-allowed border-emerald-600/20 bg-emerald-500/10 text-emerald-300/40"
          : danger
          ? "border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/15 text-rose-200"
          : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-100",
        "transition-colors",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider({ vertical, className = "" }) {
  if (vertical) {
    return <div className={"h-6 w-px bg-emerald-500/20 " + className} />;
  }
  return <div className={"h-px w-full bg-emerald-500/20 " + className} />;
}

// ============================================================================
// Node (draggable) — unchanged logic, emerald visuals
// ============================================================================

function Node({ node, onDragEndCheckTrash, onSelect }) {
  const moveNode = useSimStore((s) => s.moveNode);
  const setSelected = useSimStore((s) => s.setSelected);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    e.stopPropagation();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      moveNode(node.id, {
        x: snap(e.clientX - offset.x),
        y: snap(e.clientY - offset.y),
      });
    };
    const onUp = (e) => {
      if (dragging) {
        setDragging(false);
        onDragEndCheckTrash?.(node.id, e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, moveNode, node.id, offset, onDragEndCheckTrash]);

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(node.id);
        onSelect?.(node.id);
      }}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      className="select-none cursor-move rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-100 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm flex items-center justify-center font-semibold tracking-wide"
    >
      {node.label}
    </div>
  );
}

// ============================================================================
// Sidebar with search + categories (emerald styled)
// ============================================================================

function ComponentCard({ item, onAdd }) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-left text-emerald-100 hover:bg-emerald-500/15 transition-colors"
      title="Tap to add to canvas"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-content-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            {item.icon}
          </div>
          <div className="font-semibold">{item.label}</div>
        </div>
        <div className="text-[11px] text-emerald-300/70">
          {item.width}×{item.height}
        </div>
      </div>
      {item.badges?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {item.badges.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function Category({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <div className="flex items-center gap-2 text-emerald-100">
          {icon}
          <span className="text-xs tracking-wider text-emerald-200/80">
            {title}
          </span>
        </div>
        <div className="text-emerald-300/70">{open ? "–" : "+"}</div>
      </button>
      {open ? <div className="border-t border-emerald-500/10 p-3 grid gap-2">{children}</div> : null}
    </div>
  );
}

function Sidebar({ onAdd }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CATEGORIES;
    const hits = FLAT_PALETTE.filter(
      (i) =>
        i.label.toLowerCase().includes(s) ||
        i.badges?.some((b) => b.toLowerCase().includes(s)) ||
        i.id.toLowerCase().includes(s)
    );
    const byCat = hits.reduce((acc, cur) => {
      acc[cur.category] = acc[cur.category] || [];
      acc[cur.category].push(cur);
      return acc;
    }, {});
    return CATEGORIES.map((c) => ({
      ...c,
      items: byCat[c.key] || [],
    })).filter((c) => c.items.length > 0);
  }, [q]);

  return (
    <aside
      className="flex h-full flex-col gap-3 overflow-y-auto border-r border-emerald-500/15 bg-gradient-to-b from-emerald-950/70 to-emerald-950/30 p-3"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="px-1">
        <div className="text-sm font-semibold text-emerald-100">
          Components
        </div>
        <div className="text-[12px] text-emerald-300/70">
          Drag to canvas or tap to place
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300/60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search components…"
          className="w-full rounded-lg border border-emerald-500/25 bg-emerald-900/40 py-2 pl-9 pr-3 text-sm text-emerald-100 placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((cat) => (
          <Category key={cat.key} title={cat.title} icon={cat.icon}>
            <div className="grid gap-2">
              {cat.items.map((item) => (
                <ComponentCard key={item.id} item={item} onAdd={onAdd} />
              ))}
            </div>
          </Category>
        ))}
        {!filtered.length && (
          <div className="text-center text-sm text-emerald-300/60">
            No components match “{q}”.
          </div>
        )}
      </div>

      <div className="mt-2 rounded-lg border border-emerald-500/15 bg-emerald-900/30 p-2 text-[12px] text-emerald-300/70">
        Tip: Click a red pin on one node, then a pin on another to connect.
      </div>
    </aside>
  );
}

// ============================================================================
// Canvas (grid + wires + pins + trash area)
// ============================================================================

function TrashArea() {
  return (
    <div
      id="trash-area"
      className="pointer-events-none absolute bottom-4 right-4 grid h-28 w-28 place-content-center rounded-2xl border-2 border-dashed border-rose-400/70 bg-rose-900/20 text-rose-100 text-xs"
    >
      <Trash2 className="mx-auto mb-1 h-5 w-5" />
      Trash
    </div>
  );
}

function Canvas({
  theme,
  grid,
  nodes,
  wires,
  pending,
  onPinClick,
  onCanvasClick,
  onDragEndCheckTrash,
}) {
  const setSelected = useSimStore((s) => s.setSelected);

  return (
    <div
      onClick={onCanvasClick}
      className="relative flex-1 overflow-hidden"
      style={{
        backgroundColor: COLORS.bgB,
        backgroundImage: grid
          ? "radial-gradient(rgba(16,185,129,0.12) 1px, transparent 1px)"
          : "none",
        backgroundSize: grid ? "16px 16px" : "auto",
      }}
    >
      <svg
        aria-label="wires-layer"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {wires.map((w) => {
          const a = nodes.find((n) => n.id === w.from.node);
          const b = nodes.find((n) => n.id === w.to.node);
          if (!a || !b) return null;
          const p1 = pinPos(a, w.from.side);
          const p2 = pinPos(b, w.to.side);
          const d = makeWirePath(p1.x, p1.y, p2.x, p2.y);
          return (
            <g key={w.id} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <path
                d={d}
                stroke={COLORS.wireGlow}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={d}
                stroke={COLORS.wire}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {pending && (
          <text x={20} y={26} fill={COLORS.warn} style={{ fontSize: 14 }}>
            Click another pin to connect…
          </text>
        )}
      </svg>

      {nodes.map((node) => (
        <Fragment key={node.id}>
          <Node
            node={node}
            onDragEndCheckTrash={onDragEndCheckTrash}
            onSelect={() => setSelected(node.id)}
          />
          {/* Left pin */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(node.id, "left");
            }}
            className="absolute h-3 w-3 -translate-x-2 -translate-y-1/2 cursor-pointer rounded-full border border-black/40 bg-rose-500"
            style={{
              left: node.x,
              top: node.y + node.height / 2,
            }}
            title="Left pin"
          />
          {/* Right pin */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(node.id, "right");
            }}
            className="absolute h-3 w-3 -translate-y-1/2 cursor-pointer rounded-full border border-black/40 bg-rose-500"
            style={{
              left: node.x + node.width - 4,
              top: node.y + node.height / 2,
            }}
            title="Right pin"
          />
        </Fragment>
      ))}

      <TrashArea />
    </div>
  );
}

// ============================================================================
// Instruments (unchanged logic, emerald visuals)
// ============================================================================

function InstrumentCard({ title, children, right }) {
  return (
    <div className="grid gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
        <span>{title}</span>
        {right ? right : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function MultimeterMini() {
  const running = useSimStore((s) => s.sim.running);
  const elapsedMs = useSimStore((s) => s.sim.elapsedMs);
  const t = elapsedMs / 1000;
  const V = useMemo(() => 4.1 + Math.sin(t), [t]);
  const I = useMemo(() => 0.03 + Math.abs(Math.sin(t * 0.4)) * 0.02, [t]);
  const R = useMemo(() => 100 + (1 + Math.sin(t * 0.2)) * 450, [t]);

  return (
    <InstrumentCard
      title="Multimeter"
      right={
        <span className="text-[11px] text-emerald-300/70">
          {running ? "LIVE" : "PAUSED"}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2 text-[12px] font-[tabular-nums] text-emerald-100">
        <div>
          V: <b>{V.toFixed(2)} V</b>
        </div>
        <div>
          I: <b>{I.toFixed(3)} A</b>
        </div>
        <div>
          R: <b>{R.toFixed(0)} Ω</b>
        </div>
        <div>
          Mode: <b>Auto</b>
        </div>
      </div>
    </InstrumentCard>
  );
}

function OscilloscopeMini() {
  const running = useSimStore((s) => s.sim.running);
  const elapsedMs = useSimStore((s) => s.sim.elapsedMs);
  const samples = useMemo(() => {
    const pts = [];
    const t = elapsedMs / 1000;
    for (let i = 0; i < MINI_SCOPE_SAMPLES; i++) {
      const phase = t + i * 0.08;
      const y =
        Math.sin(phase * 2.2) * 0.6 +
        (Math.sin(phase * 0.7) > 0 ? 0.2 : -0.2);
      pts.push(y);
    }
    return pts;
  }, [elapsedMs]);

  const width = 240;
  const height = 60;
  const midY = height / 2;
  const stepX = width / (MINI_SCOPE_SAMPLES - 1);
  const path = useMemo(() => {
    let d = "";
    samples.forEach((y, i) => {
      const px = i * stepX;
      const py = midY - y * (height / 2 - 6);
      d += i === 0 ? `M${px},${py}` : ` L${px},${py}`;
    });
    return d;
  }, [samples, stepX, midY, height]);

  return (
    <InstrumentCard
      title="Oscilloscope"
      right={
        <span className="text-[11px] text-emerald-300/70">
          {running ? "LIVE" : "PAUSED"}
        </span>
      }
    >
      <svg width={width} height={height} className="block rounded-md">
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="rgba(4,120,87,0.25)"
          stroke="rgba(16,185,129,0.25)"
        />
        <line
          x1="0"
          y1={midY}
          x2={width}
          y2={midY}
          stroke="rgba(16,185,129,0.35)"
          strokeDasharray="4 4"
        />
        <path d={path} stroke="#34d399" fill="none" strokeWidth="2" />
      </svg>
      <div className="text-[11px] text-emerald-300/70">
        CH1 • 1V/div • 1ms/div (display only)
      </div>
    </InstrumentCard>
  );
}

function LogicAnalyzerMini() {
  const running = useSimStore((s) => s.sim.running);
  const elapsedMs = useSimStore((s) => s.sim.elapsedMs);
  const t = elapsedMs / 200;
  const channels = useMemo(() => {
    return LOGIC_CHANNELS.map((name, idx) => {
      const period = (idx + 1) * 6;
      const on = Math.floor(t) % period < period / 2;
      return { name, on };
    });
  }, [t]);

  return (
    <InstrumentCard
      title="Logic Analyzer"
      right={
        <span className="text-[11px] text-emerald-300/70">
          {running ? "LIVE" : "PAUSED"}
        </span>
      }
    >
      <div className="grid gap-2">
        {channels.map((ch) => (
          <div key={ch.name} className="flex items-center gap-2">
            <div className="w-10 text-emerald-100">{ch.name}</div>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <div
                className={[
                  "absolute inset-y-0 left-0 w-1/2 transition-colors",
                  ch.on ? "bg-emerald-500" : "bg-transparent",
                ].join(" ")}
              />
            </div>
            <div
              className={[
                "h-2 w-2 rounded-full border border-black/40",
                ch.on ? "bg-emerald-500" : "bg-rose-500",
              ].join(" ")}
              title={ch.on ? "High" : "Low"}
            />
          </div>
        ))}
      </div>
    </InstrumentCard>
  );
}

function SimulationDetailsMini() {
  const running = useSimStore((s) => s.sim.running);
  const elapsedMs = useSimStore((s) => s.sim.elapsedMs);

  return (
    <InstrumentCard title="Simulation Details">
      <div className="grid gap-2 text-[12px] text-emerald-100">
        <div>
          State:{" "}
          <b className={running ? "text-emerald-400" : "text-amber-400"}>
            {running ? "Running" : "Paused"}
          </b>
        </div>
        <div>
          Time:{" "}
          <b className="tabular-nums">{fmtTime(elapsedMs)}</b>
        </div>
        <div className="text-emerald-300/70">Engine: <b>Event-Loop (demo)</b></div>
      </div>
    </InstrumentCard>
  );
}

// ============================================================================
// Inspector (tabs + instruments) — unchanged logic, emerald visuals
// ============================================================================

function Inspector({ selectedNode, wires }) {
  const updateNode = useSimStore((s) => s.updateNode);
  const [tab, setTab] = useState("Properties");

  const pinData = useMemo(() => {
    if (!selectedNode) return [];
    const pins = [
      { pin: "left", title: "Left Pin" },
      { pin: "right", title: "Right Pin" },
    ];
    return pins.map((p) => {
      const count = wires.filter(
        (w) =>
          (w.from.node === selectedNode.id && w.from.side === p.pin) ||
          (w.to.node === selectedNode.id && w.to.side === p.pin)
      ).length;
      return { ...p, connections: count };
    });
  }, [selectedNode, wires]);

  return (
    <div className="grid h-full grid-rows-[auto,1fr] gap-2 overflow-y-auto">
      <div className="flex flex-wrap gap-2">
        {["Properties", "Pins", "Code", "Diagnostics"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs font-semibold",
              tab === t
                ? "border-indigo-400/40 bg-indigo-400/20 text-indigo-100"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 gap-3 overflow-auto rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
        {!selectedNode ? (
          <div className="text-sm text-emerald-300/70">No selection</div>
        ) : tab === "Properties" ? (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-emerald-300/80">
                Label
              </label>
              <input
                defaultValue={selectedNode.label}
                onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                className="w-full rounded-lg border border-emerald-500/25 bg-emerald-900/40 px-2 py-2 text-sm text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] text-emerald-300/80">
                  Width
                </label>
                <input
                  defaultValue={String(selectedNode.width)}
                  onChange={(e) => {
                    const w = parseInt(e.target.value, 10);
                    if (!Number.isNaN(w)) {
                      updateNode(selectedNode.id, { width: clamp(w, 60, 600) });
                    }
                  }}
                  className="w-full rounded-lg border border-emerald-500/25 bg-emerald-900/40 px-2 py-2 text-sm text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-emerald-300/80">
                  Height
                </label>
                <input
                  defaultValue={String(selectedNode.height)}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    if (!Number.isNaN(h)) {
                      updateNode(selectedNode.id, { height: clamp(h, 40, 420) });
                    }
                  }}
                  className="w-full rounded-lg border border-emerald-500/25 bg-emerald-900/40 px-2 py-2 text-sm text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] text-emerald-300/80">
                  Color
                </label>
                <input
                  type="color"
                  defaultValue={rgbToHex(selectedNode.color || "#10b981")}
                  onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
                  className="h-9 w-full cursor-pointer rounded-lg border border-emerald-500/25 bg-transparent"
                  title="Change node color"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-emerald-300/80">
                  ID
                </label>
                <div className="truncate text-[12px] text-emerald-300/70">
                  {selectedNode.id}
                </div>
              </div>
            </div>
          </div>
        ) : tab === "Pins" ? (
          <div className="grid gap-2">
            {pinData.map((p) => (
              <div
                key={p.pin}
                className="grid grid-cols-2 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-900/20 p-2"
              >
                <div>
                  Pin: <b>{p.pin}</b>
                </div>
                <div className="text-right">
                  Connections: <b>{p.connections}</b>
                </div>
              </div>
            ))}
          </div>
        ) : tab === "Code" ? (
          <div>
            <div className="mb-2 text-[12px] text-emerald-300/70">
              Attach/preview code related to the selected node (placeholder).
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-emerald-500/20 bg-emerald-900/30 p-3 text-[12px] text-emerald-100">{`// Example (mock)
void setup(){
  // init
}
void loop(){
  // logic
}`}</pre>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="rounded-lg border border-emerald-500/20 bg-amber-500/10 p-2 text-amber-200">
              <b>Info</b>: Connect pins by clicking a pin on one node and then a pin on another.
            </div>
            {wires.length === 0 ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/30 p-2 text-emerald-300/70">
                No wires yet — try connecting two nodes.
              </div>
            ) : null}
          </div>
        )}

        <Divider />

        <div className="grid gap-3">
          <MultimeterMini />
          <OscilloscopeMini />
          <LogicAnalyzerMini />
          <SimulationDetailsMini />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Toolbar (responsive)
// ============================================================================

function Toolbar({
  running,
  elapsedMs,
  onRunToggle,
  onResetTime,
  onUndo,
  onRedo,
  onExport,
  onImportClick,
  theme,
  setTheme,
  grid,
  setGrid,
}) {
  return (
    <div className="sticky top-0 z-10 pt-10  border-b border-emerald-500/15 bg-emerald-950/80 backdrop-blur supports-[backdrop-filter]:bg-emerald-950/60">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Cpu size={30}/>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-emerald-100">
              NexEmbed Simulator
            </div>
            <div className="text-[11px] text-emerald-300/70">
              Drag • Wire • Inspect • Timer
            </div>
          </div>
        </div>

        {/* Middle: Controls (wrap on small) */}
        <div className="flex flex-wrap items-center gap-2">
          <IconBtn
            title={running ? "Pause simulation" : "Run simulation"}
            onClick={onRunToggle}
          >
            {running ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Run
              </>
            )}
          </IconBtn>

          <IconBtn title="Reset time" onClick={onResetTime}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </IconBtn>

          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-100">
            {running ? "Running • " : "Idle • "}
            <span className="tabular-nums">{fmtTime(elapsedMs)}</span>
          </div>

          <IconBtn title="Undo" onClick={onUndo}>
            <Undo2 className="h-4 w-4" />
            Undo
          </IconBtn>
          <IconBtn title="Redo" onClick={onRedo}>
            <Redo2 className="h-4 w-4" />
            Redo
          </IconBtn>
        </div>

        {/* Right: Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          <IconBtn title="Export Scene" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </IconBtn>
          <IconBtn title="Import Scene" onClick={onImportClick}>
            <Upload className="h-4 w-4" />
            Import
          </IconBtn>

          <IconBtn title="Toggle Grid" onClick={() => setGrid(!grid)}>
            <LayoutGrid className="h-4 w-4" />
            {grid ? "Grid: On" : "Grid: Off"}
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Undo/Redo history hook (unchanged logic)
// ============================================================================

function useHistory() {
  const setGraph = useSimStore((s) => s.setGraph);
  const exportSnapshot = useSimStore((s) => s.exportSnapshot);

  const histRef = useRef({ stack: [], idx: -1 });

  const push = useCallback(() => {
    const snap = exportSnapshot();
    const entry = { nodes: snap.nodes, wires: snap.wires };
    const h = histRef.current;
    const next = h.stack.slice(0, h.idx + 1);
    next.push(JSON.parse(JSON.stringify(entry)));
    histRef.current = { stack: next, idx: next.length - 1 };
  }, [exportSnapshot]);

  const undo = useCallback(() => {
    const h = histRef.current;
    if (h.idx <= 0) return;
    h.idx -= 1;
    const s = h.stack[h.idx];
    if (s) setGraph(s.nodes || [], s.wires || []);
    histRef.current = h;
  }, [setGraph]);

  const redo = useCallback(() => {
    const h = histRef.current;
    if (h.idx >= h.stack.length - 1) return;
    h.idx += 1;
    const s = h.stack[h.idx];
    if (s) setGraph(s.nodes || [], s.wires || []);
    histRef.current = h;
  }, [setGraph]);

  return { push, undo, redo };
}

// ============================================================================
// Main Page — logic preserved, visuals emerald
// ============================================================================

export default function SimulatorPage() {
  const nodes = useSimStore((s) => s.nodes);
  const wires = useSimStore((s) => s.wires);
  const selectedId = useSimStore((s) => s.selectedId);

  const addNode = useSimStore((s) => s.addNode);
  const addWire = useSimStore((s) => s.addWire);
  const removeNode = useSimStore((s) => s.removeNode);
  const setSelected = useSimStore((s) => s.setSelected);

  const theme = useSimStore((s) => s.ui.theme);
  const grid = useSimStore((s) => s.ui.grid);
  const setTheme = useSimStore((s) => s.setTheme);
  const setGrid = useSimStore((s) => s.setGrid);

  const running = useSimStore((s) => s.sim.running);
  const elapsedMs = useSimStore((s) => s.sim.elapsedMs);
  const setRunning = useSimStore((s) => s.setRunning);
  const setElapsed = useSimStore((s) => s.setElapsed);

  const exportSnapshot = useSimStore((s) => s.exportSnapshot);
  const importSnapshot = useSimStore((s) => s.importSnapshot);

  const [pending, setPending] = useState(null);
  const fileRef = useRef(null);

  const { push, undo, redo } = useHistory();

  useEffect(() => {
    push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, wires.length]);

  // Timer
  const timerRef = useRef(null);
  useEffect(() => {
    if (running) {
      const start = Date.now() - elapsedMs;
      timerRef.current = setInterval(() => setElapsed(Date.now() - start), 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running, elapsedMs, setElapsed]);

  // Handlers

  const handleAddFromPalette = (tpl) => {
    addNode({
      id: uuidv4(),
      label: tpl.label,
      x: 40 + Math.floor(Math.random() * 80),
      y: 60 + Math.floor(Math.random() * 70),
      width: tpl.width,
      height: tpl.height,
      color: tpl.color,
      meta: { type: tpl.id },
    });
  };

  const handlePinClick = (nodeId, side) => {
    if (!pending) {
      setPending({ node: nodeId, side });
    } else {
      if (pending.node !== nodeId) {
        addWire({
          id: uuidv4(),
          from: pending,
          to: { node: nodeId, side },
        });
      }
      setPending(null);
    }
  };

  const handleCanvasClick = () => {
    if (pending) setPending(null);
    setSelected(null);
  };

  const onDragEndCheckTrash = (nodeId, clientX, clientY) => {
    const el = document.getElementById("trash-area");
    if (!el) return;
    if (isPointInsideRect(el, clientX, clientY)) {
      removeNode(nodeId);
    }
  };

  const onRunToggle = () => setRunning(!running);
  const onResetTime = () => setElapsed(0);

  const onExport = () => {
    try {
      const data = exportSnapshot();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexembed-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const onImportClick = () => fileRef.current?.click();
  const onImportChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (data?.nodes && data?.wires) {
          importSnapshot(data);
        } else {
          console.warn("Invalid snapshot format");
        }
      } catch (err) {
        console.error("Import error:", err);
      }
    };
    r.readAsText(f);
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  return (
    <div
      className="flex h-screen w-screen flex-col"
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgA}, ${COLORS.bgB})`,
        color: COLORS.text,
        paddingTop: NAVBAR_HEIGHT,
      }}
    >
      <Toolbar
        running={running}
        elapsedMs={elapsedMs}
        onRunToggle={onRunToggle}
        onResetTime={onResetTime}
        onUndo={undo}
        onRedo={redo}
        onExport={onExport}
        onImportClick={onImportClick}
        theme={theme}
        setTheme={setTheme}
        grid={grid}
        setGrid={setGrid}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onImportChange}
      />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <Sidebar onAdd={handleAddFromPalette} />

        {/* Canvas + Inspector */}
        <div className="flex min-h-0 flex-1">
          <Canvas
            theme={theme}
            grid={grid}
            nodes={nodes}
            wires={wires}
            pending={pending}
            onPinClick={handlePinClick}
            onCanvasClick={handleCanvasClick}
            onDragEndCheckTrash={onDragEndCheckTrash}
          />

          {/* Inspector */}
          <div
            className="grid min-h-0 grid-rows-[auto,1fr] gap-1 border-l border-emerald-500/15 bg-gradient-to-b from-emerald-950/20 to-transparent p-3"
            style={{ width: INSPECTOR_WIDTH }}
          >
            <div className="leading-tight">
              <div className="text-sm font-semibold text-emerald-100">
                Inspector
              </div>
              <div className="text-[12px] text-emerald-300/70 min-h-[16px]">
                {selectedNode ? selectedNode.label : "Nothing selected"}
              </div>
            </div>
            <Inspector selectedNode={selectedNode} wires={wires} />
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// End — Functionality preserved from your previous file with the requested emerald-dark styling,
// sidebar search & categories, badges, lucide icons, and a responsive toolbar. Paste in place.
// Based on your prior SimulatorPage structure and behaviors. :contentReference[oaicite:1]{index=1}
