import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial } from "@react-three/drei";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils"; // optional, if you have it; safe fallback below

// shadcn/ui
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import * as THREE from "three";
// lucide-react icons
import {
  Search,
  Image as ImageIcon,
  Book,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Upload,
  Star,
  StarOff,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Download,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Pin,
  Check,
} from "lucide-react";
import BackgroundAnimation from "../components/BackgroundAnimation";
import SAMPLE_DATA from "../data/labs";
import rehypeHighlight from "rehype-highlight";
import Sidebar from "../components/Sidebar";
/**
 * NexEmbed – Professional Lab Showcase
 *
 * ✓ Responsive header for all screens
 * ✓ Emerald dark theme (polished & consistent)
 * ✓ 3D animated background (react-three-fiber) — pro-level starfield
 * ✓ Search + status filter + grid/list toggle
 * ✓ Completed/Pending tracking (localStorage)
 * ✓ Pin (Save important) experiments section
 * ✓ Import JSON to extend experiments
 * ✓ Markdown Aim/Procedure/Result + Output image preview dialog
 * ✓ Smooth Framer Motion transitions
 *
 * Replace SAMPLE_DATA with your full set (1–28). IDs must be unique.
 */

// ------------------------------
// Safe cn helper if not provided
// ------------------------------
function classNames(...args) {
  return args.filter(Boolean).join(" ");
}

// ------------------------------
// 3D Background (Starfield) — Pro level
// ------------------------------
function EnergyCore() {
  const mesh = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    mesh.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05); // pulsing
    mesh.current.rotation.y += 0.002; // slow rotation
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2, 3]} />
      <meshStandardMaterial
        color={"#10b981"}
        emissive={"#34d399"}
        emissiveIntensity={1.5}
        roughness={0.2}
        metalness={0.7}
      />
    </mesh>
  );
}

// Orbiting shards
function OrbitingShards() {
  const group = useRef();
  const shardCount = 30;

  useFrame(({ clock }) => {
    group.current.rotation.y = clock.getElapsedTime() * 0.2;
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
  });

  return (
    <group ref={group}>
      {Array.from({ length: shardCount }).map((_, i) => {
        const angle = (i / shardCount) * Math.PI * 2;
        const radius = 5 + Math.random() * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 2,
              Math.sin(angle) * radius,
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI,
            ]}
          >
            <tetrahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color={"#6ee7b7"}
              emissive={"#10b981"}
              emissiveIntensity={0.8}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Subtle emerald energy field (transparent sphere)
function EnergyField() {
  return (
    <mesh>
      <sphereGeometry args={[6, 64, 64]} />
      <meshBasicMaterial
        color={"#10b981"}
        transparent
        opacity={0.05}
        wireframe
      />
    </mesh>
  );
}

function ThreeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 14], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} color={"#10b981"} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color={"#34d399"} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color={"#047857"} />

        {/* Unique Animation */}
        <EnergyCore />
        <OrbitingShards />
        <EnergyField />

        {/* Lock controls */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>

      {/* Dark emerald overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-900/95 to-black/95" />
    </div>
  );
}

// ------------------------------
// Small helpers
// ------------------------------
const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const STATUS = {
  ALL: "all",
  COMPLETED: "completed",
  PENDING: "pending",
};

// ------------------------------
// Main Component
// ------------------------------
export default function NexEmbedLab() {
  // state
  const [query, setQuery] = useState("");
  const [experiments, setExperiments] = useState(SAMPLE_DATA);
  const [selectedId, setSelectedId] = useState(SAMPLE_DATA[0]?.id || null);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem("nexembed:completed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pinned, setPinned] = useState(() => {
    try {
      const saved = localStorage.getItem("nexembed:pinned");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState(STATUS.ALL);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // effects: persist
  useEffect(() => {
    localStorage.setItem("nexembed:completed", JSON.stringify(completed));
  }, [completed]);
  useEffect(() => {
    localStorage.setItem("nexembed:pinned", JSON.stringify(pinned));
  }, [pinned]);
  useEffect(() => {
    const saved = localStorage.getItem("nexembed:selected");
    if (saved) {
      const id = Number(saved);
      if (SAMPLE_DATA.some((x) => x.id === id)) setSelectedId(id);
    }
  }, []);
  useEffect(() => {
    if (selectedId != null) localStorage.setItem("nexembed:selected", String(selectedId));
  }, [selectedId]);

  // derived
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = experiments.filter((x) => {
      const hay = [x.title, String(x.id), x.aim, x.procedure, x.result].join("\n").toLowerCase();
      return hay.includes(q);
    });
    if (statusFilter === STATUS.COMPLETED) list = list.filter((x) => completed[x.id]);
    if (statusFilter === STATUS.PENDING) list = list.filter((x) => !completed[x.id]);
    // sort: pinned first, then id
    list.sort((a, b) => {
      const pa = pinned[a.id] ? 0 : 1;
      const pb = pinned[b.id] ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return a.id - b.id;
    });
    return list;
  }, [experiments, query, statusFilter, completed, pinned]);

  const selected = useMemo(() => experiments.find((x) => x.id === selectedId), [selectedId, experiments]);

  const total = experiments.length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  // handlers
  const toggleCompleted = (id) => setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  const togglePinned = (id) => setPinned((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleImport = () => {
    try {
      const data = JSON.parse(importContent);
      if (Array.isArray(data)) {
        // ensure unique IDs
        const existingIds = new Set(experiments.map((e) => e.id));
        const filteredNew = data.filter((d) => d && !existingIds.has(d.id));
        setExperiments((prev) => [...prev, ...filteredNew]);
        if (filteredNew.length) setSelectedId(filteredNew[0].id);
        setImportContent("");
        setImportDialogOpen(false);
      } else {
        alert("Invalid format. Must be an array of experiments.");
      }
    } catch (e) {
      alert("Invalid JSON.");
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "nexembed-experiments.json";
    a.click();
  };

  // layout
  return (
    <div className="relative z-20 pt-20 min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-950/90 to-black text-emerald-100">
      <ThreeBackdrop />
      <Sidebar/>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-emerald-800/40 backdrop-blur bg-emerald-950/70">
  <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 py-3">
    <div className="flex flex-wrap items-center gap-2">
      {/* Logo + Badge */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-emerald-700/40 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="font-semibold tracking-tight text-lg sm:text-xl leading-none">NexEmbed</div>
        <Badge variant="secondary" className="ml-1 bg-emerald-600/40 text-emerald-100 border-emerald-700/80">
          Labs
        </Badge>
      </div>

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto sm:hidden cursor-pointer hover:bg-emerald-800/60"
        onClick={() => setMobileMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop controls */}
      <div className="ml-auto hidden sm:flex flex-wrap items-center gap-2">
        <div className="relative w-36 md:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiments…"
            className="pl-8 w-full border bg-emerald-950/60 border-emerald-700/60 focus-visible:ring-0 placeholder:text-emerald-400/70"
          />
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* View Toggle */}
          <Toggle
            pressed={viewMode === "grid"}
            onPressedChange={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
            className={classNames(
              "border-emerald-700/60 text-emerald-100",
              viewMode === "grid" ? "bg-emerald-800/60" : "bg-emerald-900/40"
            )}
            aria-label="Toggle view"
          >
            {viewMode === "grid" ? <ListIcon className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Toggle>

          {/* Filter + Export + Import */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-emerald-700/70 bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/60 cursor-pointer"
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-emerald-950/95 border-emerald-700 text-emerald-100"
            >
              <DropdownMenuLabel className="text-emerald-300">Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-800" />
              <DropdownMenuItem onClick={() => setStatusFilter(STATUS.ALL)} className="focus:bg-emerald-800/60">
                {statusFilter === STATUS.ALL ? <Check className="h-4 w-4 mr-2" /> : <span className="w-6" />} All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(STATUS.COMPLETED)} className="focus:bg-emerald-800/60">
                {statusFilter === STATUS.COMPLETED ? <Check className="h-4 w-4 mr-2" /> : <span className="w-6" />} Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(STATUS.PENDING)} className="focus:bg-emerald-800/60">
                {statusFilter === STATUS.PENDING ? <Check className="h-4 w-4 mr-2" /> : <span className="w-6" />} Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="border-emerald-700/70 bg-emerald-800/60 text-emerald-100 hover:bg-emerald-700/60 cursor-pointer"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 text-emerald-950 hover:bg-emerald-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-emerald-950/95 border border-emerald-700 rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-emerald-300">Import Experiments (JSON)</DialogTitle>
              </DialogHeader>
              <Textarea
                rows={10}
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder='Paste JSON array...'
                className="bg-emerald-950/70 border border-emerald-700 rounded-lg placeholder:text-emerald-500 text-emerald-100 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Button
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-emerald-950 rounded-lg shadow-md transition-all duration-200"
                onClick={handleImport}
              >
                Import
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full mt-3">
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm opacity-80">Progress</div>
          <div className="text-xs opacity-70">{doneCount} / {total} completed</div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-emerald-950 border border-emerald-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div {...fade} className="sm:hidden mt-3 w-full grid gap-2">
            <div className="relative border border-emerald-700/60 rounded">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experiments…"
                className="pl-8 w-full bg-emerald-950/60 placeholder:text-emerald-400 border-emerald-700/60 focus-visible:ring-emerald-400/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="flex-1 min-w-[100px] bg-emerald-800/60 hover:bg-emerald-700/60 border-emerald-700/60 text-emerald-100 cursor-pointer"
                onClick={() =>
                  setStatusFilter((s) =>
                    s === STATUS.ALL ? STATUS.COMPLETED : s === STATUS.COMPLETED ? STATUS.PENDING : STATUS.ALL
                  )
                }
              >
                <Filter className="h-4 w-4 mr-2" /> {statusFilter === STATUS.ALL ? "All" : statusFilter === STATUS.COMPLETED ? "Completed" : "Pending"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[80px] bg-emerald-800/60 hover:bg-emerald-700/60 border-emerald-700/60 text-emerald-100 cursor-pointer"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 min-w-[80px] bg-emerald-600 hover:bg-emerald-500 text-emerald-950 cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl bg-emerald-950/95 border border-emerald-700 rounded-2xl shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-300">Import Experiments (JSON)</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    rows={10}
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    placeholder="Paste JSON array..."
                    className="bg-emerald-950/70 border border-emerald-700 rounded-lg placeholder:text-emerald-500 text-emerald-100 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Button
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-emerald-950 rounded-lg shadow-md transition-all duration-200"
                    onClick={handleImport}
                  >
                    Import
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</header>


      {/* Main */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <section className="lg:col-span-4 space-y-4">
          {/* Pinned */}
          <Card className="bg-emerald-900/60 border-emerald-800/60 rounded-2xl shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-emerald-200">Pinned Experiments</CardTitle>
                  <CardDescription className="text-emerald-400/80">Quick access to your starred labs</CardDescription>
                </div>
                <Pin className="h-4 w-4 text-emerald-400/80" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[18vh] sm:h-[22vh]">
                <div className="p-3 overflow-auto grid gap-2">
                  {experiments.filter((e) => pinned[e.id]).length === 0 ? (
                    <div className="text-xs opacity-70 px-1 py-3 text-emerald-200/80">
                      No pinned experiments yet. Use the <Star className="inline h-3 w-3" /> icon to save important labs.
                    </div>
                  ) : (
                    experiments
                      .filter((e) => pinned[e.id])
                      .sort((a, b) => a.id - b.id)
                      .map((exp) => (
                        <PinnedRow
                          key={exp.id}
                          exp={exp}
                          onOpen={() => setSelectedId(exp.id)}
                          done={!!completed[exp.id]}
                          onTogglePin={() => togglePinned(exp.id)}
                        />
                      ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Experiments List */}
          <Card className="bg-emerald-950/60 border-emerald-800/60 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-emerald-300" />
                  <CardTitle className="text-base text-emerald-300">Experiments ({filtered.length})</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-emerald-700/50 border-emerald-800/70 text-emerald-100">
                  {statusFilter === STATUS.ALL ? "All" : statusFilter === STATUS.COMPLETED ? "Completed" : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[42vh] sm:h-[56vh] lg:h-[64vh]">
                <div className={classNames("grid gap-2 p-3", viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                  {filtered.map((exp) => (
                    <ExperimentRow
                      key={exp.id}
                      exp={exp}
                      active={selectedId === exp.id}
                      done={!!completed[exp.id]}
                      pinned={!!pinned[exp.id]}
                      onOpen={() => setSelectedId(exp.id)}
                      onToggleDone={() => toggleCompleted(exp.id)}
                      onTogglePin={() => togglePinned(exp.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Right Column: Details */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} {...fade}>
                <Card className="bg-emerald-950/70 opacity-70 border-emerald-800/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                  <CardHeader className="pb-0">
                    <div className="flex items-start flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl sm:text-2xl text-emerald-300 font-semibold tracking-tight">{selected.title}</CardTitle>
                        <div className="text-xs sm:text-sm opacity-70 mt-1 text-emerald-200/80">NexEmbed • Lab Experiment #{selected.id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" className="border-emerald-800/60 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60 cursor-pointer" onClick={() => togglePinned(selected.id)}>
                                {pinned[selected.id] ? <Star className=" h-4 w-4" /> : <StarOff className=" h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-emerald-950/95 border-emerald-800 text-emerald-100">Save as important</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-emerald-800/60 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60 cursor-pointer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> View Image
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-3xl border border-emerald-800 bg-emerald-950/95">
                        <DialogHeader>
                          <DialogTitle className="text-emerald-200">Output Preview</DialogTitle>
                        </DialogHeader>

                        {/* Animated Image */}
                        <motion.img
                          key={selected?.image} // ensures animation runs on change
                          src={selected?.image}
                          alt={selected?.title}
                          className="w-full h-auto rounded-xl border border-emerald-800/60"
                          loading="lazy"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        />
                      </DialogContent>
                    </Dialog>

                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                      {/* Markdown Tabs */}
                      <div className="xl:col-span-3">
                        <Tabs defaultValue="aim" className="w-full">
                          <TabsList className="grid grid-cols-3 w-full bg-emerald-800/50 border border-emerald-800/60 rounded-xl">
                            <TabsTrigger className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-100 cursor-pointer rounded-lg" value="aim">
                              Aim
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-100 cursor-pointer rounded-lg" value="procedure">
                              Procedure
                            </TabsTrigger>
                            <TabsTrigger className="data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-100 cursor-pointer rounded-lg" value="result">
                              Result
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="aim">
                            <ArticleMarkdown content={selected.aim} />
                          </TabsContent>
                          <TabsContent value="procedure">
                            <ArticleMarkdown content={selected.procedure} />
                          </TabsContent>
                          <TabsContent value="result">
                            <ArticleMarkdown content={selected.result} />
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Image Panel */}
                      <div className="xl:col-span-2">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-2xl border border-emerald-800/60 bg-emerald-950/60 overflow-hidden shadow-xl"
                        >
                          <div className="aspect-video w-full bg-black/40">
                            <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3 text-xs sm:text-sm opacity-80 flex items-center gap-2 text-emerald-200 bg-emerald-900/60">
                            <ImageIcon className="h-4 w-4" /> Output snapshot
                          </div>
                          <Separator className="bg-emerald-800/60" />
                          <div className="p-3 flex items-center justify-between bg-emerald-900/60">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200">
                              {completed[selected.id] ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                              {completed[selected.id] ? "Completed" : "Pending"}
                            </div>
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-emerald-950 cursor-pointer hover:bg-emerald-500"
                              onClick={() => toggleCompleted(selected.id)}
                            >
                              {completed[selected.id] ? "Mark Pending" : "Mark Completed"}
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div {...fade}>
                <Card className="bg-emerald-950/70 border-emerald-800/60 backdrop-blur-sm">
                  <CardContent className="p-10 text-center text-sm opacity-70 text-emerald-200/80">No experiment selected.</CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

// ------------------------------
// Subcomponents
// ------------------------------
function ExperimentRow({ exp, active, done, pinned, onOpen, onToggleDone, onTogglePin }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={classNames(
        "border rounded-2xl transition-colors",
        "bg-emerald-900/50 border-emerald-800/60 hover:bg-emerald-900/70",
        active && "ring-1 ring-emerald-500/70"
      )}
    >
      <button className="w-full text-left px-3 py-3" onClick={onOpen}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={done}
            onCheckedChange={(e) => {
              e?.stopPropagation?.();
              onToggleDone();
            }}
            className="mt-0.5 border-emerald-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-emerald-950"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant={active ? "default" : "secondary"}
                className={classNames(
                  "rounded-xl border",
                  active ? "bg-emerald-600/30 text-emerald-100 border-emerald-700" : "bg-emerald-800/40 text-emerald-200 border-emerald-700/60"
                )}
              >
                #{exp.id}
              </Badge>
              {done ? (
                <span className="inline-flex items-center gap-1 text-emerald-200 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-300/80 text-xs"><Circle className="h-3.5 w-3.5" /> Pending</span>
              )}
            </div>
            <div className="font-medium leading-snug mt-1 line-clamp-2 text-emerald-100">{exp.title}</div>
            <div className="text-xs opacity-70 mt-1 line-clamp-2 text-emerald-200/80">{(exp.aim || "").replace("**Aim:** ", "").slice(0, 110)}</div>
          </div>
        </div>
      </button>
      <div className="px-3 pb-3 -mt-1 flex items-center justify-between">
        <Button
          className="cursor-pointer text-emerald-100 hover:text-black"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Open <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-emerald-200 hover:text-black cursor-pointer "
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                aria-label={pinned ? "Unpin" : "Pin"}
              >
                {pinned ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-emerald-950/95 border-emerald-800  text-emerald-100">
              {pinned ? "Unpin" : "Pin as important"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}

function PinnedRow({ exp, onOpen, done, onTogglePin }) {
  return (
    <div className="flex items-center overflow-auto gap-3 border rounded-2xl px-3 py-2 bg-emerald-900/50 border-emerald-800/60">
      <Button
        variant="ghost"
        className="text-emerald-200 hover:text-emerald-100"
        size="icon"
        onClick={onTogglePin}
        aria-label="Unpin"
      >
        <Star className="h-4 w-4" />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge className="rounded-xl bg-emerald-800/40 border-emerald-700/60 text-emerald-200">#{exp.id}</Badge>
          {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Circle className="h-3.5 w-3.5 text-emerald-300/70" />}
        </div>
        <div className="text-sm truncate text-emerald-100">{exp.title}</div>
      </div>
      <Button
        className="cursor-pointer hover:text-black text-emerald-100 "
        variant="ghost"
        size="sm"
        onClick={onOpen}
      >
        Open <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function ArticleMarkdown({ content }) {
  return (
    <div className="prose prose-invert w-full p-4 bg-emerald-950/60 rounded-2xl text-emerald-100 min-h-[300px] border border-emerald-800/60">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({node, ...props}) => (
            <h1 className="text-emerald-400 text-2xl font-bold mb-3" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-emerald-300 text-xl font-semibold mt-4 mb-2" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-emerald-200 text-lg font-medium mt-3 mb-1" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="text-emerald-100/90 leading-relaxed mb-2" {...props} />
          ),
          // Lists
          ul: ({node, ...props}) => (
            <ul className="list-disc list-inside text-emerald-100/90 space-y-1" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal list-inside text-emerald-100/90 space-y-1" {...props} />
          ),
          pre: ({node, ...props}) => (
            <pre
              className="w-full max-w-full overflow-x-auto mt-4 rounded-lg bg-black/80 p-3 text-sm border border-emerald-800/60"
              {...props}
            />
          ),
          code: ({node, inline, className, children, ...props}) => {
            return inline ? (
              <code className="bg-emerald-900/70 px-1.5 py-0.5 rounded text-emerald-300" {...props}>
                {children}
              </code>
            ) : (
              <code className="block text-emerald-200 font-mono whitespace-pre-wrap break-words" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
