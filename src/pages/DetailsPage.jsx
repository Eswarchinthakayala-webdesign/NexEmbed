import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Cpu,
  Thermometer,
  Bolt,
  Wifi,
  Monitor,
  Info,
  Grid,
  X,
  Plus,
  Settings,
  ChevronRight,
  Trash,
} from "lucide-react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/*
  Embedded System Dashboard — Final single-file version
  - 30 professional components included
  - Click any component (in list or 3D) to open a detail panel AND focus/visualize it in 3D
  - 3D preview highlights selected component and orbits camera smoothly
  - Search/filter/add/remove components; responsive layout; shadcn/ui + framer-motion UI

  Drop into a React + Tailwind + shadcn project. For production split into modules and load glTFs.
*/

const EMERALD = {
  bg: "bg-emerald-950",
  surface: "bg-black/50",
  panel: "bg-emerald-900/50",
  border: "border-emerald-700",
  text: "text-emerald-100",
  accent: "text-emerald-300",
  button: "bg-emerald-800 hover:bg-emerald-700",
};

const INITIAL_COMPONENTS = [
  { id: "mc_stm32", name: "STM32 Microcontroller", short: "ARM Cortex-M MCU for real-time control.", color: "#0f766e", type: "logic" },
  { id: "mc_esp32", name: "ESP32", short: "WiFi/BLE MCU — great for connectivity.", color: "#06b6d4", type: "network" },
  { id: "mc_nxp", name: "NXP MCU", short: "Low-power MCU family for industrial applications.", color: "#065f46", type: "logic" },
  { id: "sensor_temp", name: "BME280", short: "Temp/pressure/humidity environmental sensor.", color: "#0ea5a4", type: "sensor" },
  { id: "sensor_motion", name: "PIR Motion", short: "Passive infrared motion detector for occupancy.", color: "#128a65", type: "sensor" },
  { id: "sensor_light", name: "Ambient Light", short: "I2C light sensor for brightness adaptive UI.", color: "#16a34a", type: "sensor" },
  { id: "act_relay", name: "Relay Module", short: "Isolated relay for mains switching.", color: "#8bd46f", type: "actuator" },
  { id: "act_motor", name: "DC Motor", short: "Small brushed DC motor with driver.", color: "#7cb342", type: "actuator" },
  { id: "act_stepper", name: "Stepper Motor", short: "Precise positioning actuator with driver.", color: "#5fa24a", type: "actuator" },
  { id: "display_oled", name: "128x64 OLED", short: "Low-power monochrome display.", color: "#059669", type: "io" },
  { id: "display_tft", name: "TFT 2.8\"", short: "Color touchscreen for advanced UIs.", color: "#047857", type: "io" },
  { id: "comm_wifi", name: "WiFi Module", short: "802.11b/g/n connectivity.", color: "#06b6d4", type: "network" },
  { id: "comm_ble", name: "Bluetooth LE", short: "Short-range low-power wireless.", color: "#0ea5a4", type: "network" },
  { id: "comm_zigbee", name: "Zigbee", short: "Mesh networking for smart home devices.", color: "#0891b2", type: "network" },
  { id: "power_reg", name: "Power Regulator", short: "Buck/boost regulator for stable rails.", color: "#9ae6b4", type: "power" },
  { id: "battery", name: "Li-ion Battery", short: "Rechargeable energy storage with BMS.", color: "#7ee3b0", type: "power" },
  { id: "storage_eeprom", name: "EEPROM", short: "Nonvolatile small configuration storage.", color: "#3ddc97", type: "storage" },
  { id: "storage_sd", name: "SD Card", short: "High-capacity removable storage.", color: "#2fb06b", type: "storage" },
  { id: "clock_rtc", name: "RTC", short: "Real-time clock for timestamping and scheduling.", color: "#16a34a", type: "misc" },
  { id: "sensor_gas", name: "Gas Sensor", short: "Air-quality gas detection module.", color: "#2aa876", type: "sensor" },
  { id: "sensor_co2", name: "CO2 Sensor", short: "Indoor air CO₂ concentration sensor.", color: "#1f9d8a", type: "sensor" },
  { id: "security_chip", name: "Secure Element", short: "Hardware root-of-trust for keys and secure boot.", color: "#0b6b61", type: "security" },
  { id: "wifi_ant", name: "Antenna", short: "External antenna for improved RF range.", color: "#06b6d4", type: "network" },
  { id: "sensor_sound", name: "Microphone", short: "Audio input for voice or acoustic detection.", color: "#20c997", type: "sensor" },
  { id: "sensor_vib", name: "Vibration Sensor", short: "Detect mechanical vibration / tamper.", color: "#2fb06b", type: "sensor" },
  { id: "gpio_expander", name: "GPIO Expander", short: "I2C GPIOs for expanded digital IO.", color: "#0ea5a4", type: "logic" },
  { id: "adc", name: "ADC Converter", short: "High-resolution ADC for analog sensors.", color: "#06b6d4", type: "misc" },
  { id: "can_bus", name: "CAN Transceiver", short: "Robust field bus for industrial devices.", color: "#059669", type: "network" },
  { id: "cloud", name: "Cloud Service", short: "Telemetry ingestion, analytics and fleet mgmt.", color: "#0f766e", type: "cloud" },
];

// Utility: generate a unique id for user-added components
function uid(prefix = "c") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* Improved Three.js: highlight + focus selected component */
function useRealisticThree(containerRef, items, selectedId, onPick) {
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x031918);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 10);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 5);
    dir.castShadow = true;
    dir.shadow.camera.left = -10;
    dir.shadow.camera.right = 10;
    dir.shadow.camera.top = 10;
    dir.shadow.camera.bottom = -10;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.radius = 8;
    scene.add(dir);

    const hemi = new THREE.HemisphereLight(0xa0f0e8, 0x062028, 0.6);
    scene.add(hemi);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x072e28, roughness: 0.9, metalness: 0.02 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.1;
    ground.receiveShadow = true;
    scene.add(ground);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const group = new THREE.Group();
    scene.add(group);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function createComponentMesh(meta, index, total) {
      const w = 1.8;
      const h = 0.28;
      const d = 1.2;
      const geometry = new THREE.BoxGeometry(w, h, d);

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(meta.color || 0x0f766e),
        metalness: 0.15,
        roughness: 0.35,
        clearcoat: 0.06,
      });

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(0, 20, 18, 0.9)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 36px system-ui, Arial";
      ctx.fillStyle = meta.color || "#0f766e";
      ctx.textAlign = "center";
      ctx.fillText(meta.name, canvas.width / 2, 72);

      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const labelPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.35), labelMat);
      labelPlane.position.set(0, 0.45, 0);
      mesh.add(labelPlane);

      const chipGeo = new THREE.BoxGeometry(0.4, 0.06, 0.6);
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x021613, metalness: 0.4, roughness: 0.25 });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(-0.4, 0.12, 0);
      chip.castShadow = true;
      mesh.add(chip);

      const connectorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12);
      const conMat = new THREE.MeshStandardMaterial({ color: 0x9ad8d0, metalness: 0.6, roughness: 0.2 });
      const con = new THREE.Mesh(connectorGeo, conMat);
      con.rotation.x = Math.PI / 2;
      con.position.set(0.65, 0.06, 0.35);
      mesh.add(con);

      const spacing = 2.4;
      const x = (index - (total - 1) / 2) * spacing;
      mesh.position.set(x, 0.05, 0);

      mesh.userData = { meta };
      return mesh;
    }

    function rebuild() {
      while (group.children.length) group.remove(group.children[0]);
      items.forEach((it, idx) => {
        const m = createComponentMesh(it, idx, items.length);
        group.add(m);
      });
    }

    rebuild();

    // simple orbit
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let theta = 0.0;
    let phi = 20 * (Math.PI / 180);
    let distance = 10;

    function onPointerDown(e) { isDragging = true; lastX = e.clientX; lastY = e.clientY; }
    function onPointerMove(e) { if (!isDragging) return; const dx = (e.clientX - lastX) / 200; const dy = (e.clientY - lastY) / 200; lastX = e.clientX; lastY = e.clientY; theta -= dx; phi = Math.max(0.1, Math.min(Math.PI / 2.2, phi + dy)); }
    function onPointerUp() { isDragging = false; }
    function onWheel(e) { distance = Math.max(4, Math.min(25, distance + e.deltaY * 0.01)); }

    function onClick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(group.children, true);
      if (intersects.length) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.meta) obj = obj.parent;
        if (obj && obj.userData.meta) {
          const meta = obj.userData.meta;
          onPick && onPick(meta.id);
        }
      }
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    renderer.domElement.addEventListener("click", onClick);

    // camera smoothing targets
    let camTarget = new THREE.Vector3(0, 0, 0);
    let camPos = new THREE.Vector3().copy(camera.position);

    let rafId;
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();

      // dynamic highlight & target if selection
      if (selectedId) {
        // find mesh
        const child = group.children.find((c) => c.userData.meta && c.userData.meta.id === selectedId);
        if (child) {
          // selected scale up, others back
          group.children.forEach((c) => c.scale.setScalar(c === child ? 1.12 : 1.0));

          // compute target as child's world pos
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          camTarget.lerp(worldPos, 0.15);

          // move camera to an offset around target
          const desiredCam = new THREE.Vector3(worldPos.x + 4, worldPos.y + 2.5, worldPos.z + 6);
          camPos.lerp(desiredCam, 0.06);
          camera.position.copy(camPos);
          camera.lookAt(camTarget);
        }
      } else {
        // free orbit
        const camX = distance * Math.sin(phi) * Math.sin(theta);
        const camY = distance * Math.cos(phi);
        const camZ = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 0, 0);
      }

      group.children.forEach((c, i) => {
        c.rotation.y = Math.sin(t * 0.4 + i) * 0.06;
        c.position.y = 0.05 + Math.sin(t * 0.9 + i) * 0.02;
      });

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("click", onClick);
      container.removeChild(renderer.domElement);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      pmrem.dispose();
    };
  }, [containerRef, items, selectedId, onPick]);
}

/* UI helpers */
function PrettyCode({ children }) {
  return (
    <pre className="rounded-md p-4 overflow-auto text-sm bg-emerald-900/40 border border-emerald-700 text-emerald-100">{children}</pre>
  );
}

function Header({ onOpenDocs }) {
    const navigate=useNavigate()
  return (
    <header className={`py-6  ${EMERALD.text} border-b ${EMERALD.border}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl p-3 bg-emerald-800/30 border border-emerald-700">
            <Grid className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-emerald-300">Embedded System Details</h1>
            <p className="text-sm text-emerald-200/80">Detailed Explanation · Components · Realistic 3D preview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className={`flex items-center cursor-pointer gap-2 ${EMERALD.button}`} onClick={onOpenDocs}>
            <Info className="w-4 h-4" /> Docs
          </Button>
          <Button className={`flex items-center cursor-pointer gap-2 ${EMERALD.button}`}
          onClick={()=>navigate("/docs")}
          >
            <Settings className="w-4 h-4" /> Documentation
          </Button>
        </div>
      </div>
    </header>
  );
}

function OverviewCard() {
  return (
    <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
      <CardHeader>
        <CardTitle className="text-2xl text-emerald-300">Overview</CardTitle>
        <CardDescription className="text-emerald-200">High level description and mission statement.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-emerald-100 mb-4">This page documents an embedded  automation controller with production-grade considerations: secure boot, OTA updates, isolation of power domains, and real-time guarantees.</p>
            <ul className="list-disc pl-5 space-y-2 text-emerald-200">
              <li>Security-first design with layered defenses</li>
              <li>Modular hardware that supports safe field upgrades</li>
              <li>Low-latency control loops with deterministic scheduling</li>
            </ul>
          </div>

          <div>
            <p className="text-emerald-100 mb-2 font-medium">Key metrics</p>
            <div className="flex gap-3 flex-wrap">
              <Badge label="Latency: <5ms" />
              <Badge label="Uptime: 99.99%" />
              <Badge label="Power: 5W typical" />
              <Badge label="Firmware: v1.2.4" />
              <Badge label="OTA: Enabled" />
            </div>

            <p className="mt-4 text-emerald-200 text-sm">Design philosophy: keep critical paths local, push observability to cloud while preserving privacy and offline operation.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ label }) {
  return <div className="px-3 py-1 rounded-full text-sm bg-emerald-800/40 border border-emerald-700 text-emerald-100">{label}</div>;
}

/* ComponentsPanel: removed embedded Dialog to avoid scoping issues;
   it now calls onAdd (which in the parent toggles the dialog open) */
function ComponentsPanel({ items, onSelect, onAdd, onChangeUp }) {
  return (
    <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl text-emerald-300">Components</CardTitle>
          <CardDescription className="text-emerald-200">Click a component to inspect — or add a new part to the system.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Trigger the parent's dialog by calling onAdd (parent will set open state) */}
          <Button className={`${EMERALD.button} flex cursor-pointer items-center gap-2`} onClick={() => onAdd(true)}><Plus className="w-4 h-4"/> Add component</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((it) => (
            <motion.button
              key={it.id}
              onClick={() => onSelect(it.id)}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className={`flex flex-col items-start cursor-pointer gap-3 p-4 rounded-2xl shadow-md border ${EMERALD.border} ${EMERALD.panel} text-left overflow-auto`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 rounded-xl" style={{ background: `${it.color}22`, border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="w-6 h-6 rounded-md" style={{ background: it.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-200">{it.name}</h4>
                  <p className="text-sm text-emerald-200/80">{it.short}</p>
                </div>
                <div className="text-emerald-400"> <ChevronRight className="w-4 h-4"/> </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComponentDetail({ item, onClose, onRemove }) {
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`fixed right-6 top-20 bottom-6 sm:w-[520px] w-[400px] rounded-2xl p-6 shadow-2xl bg-emerald-600 border ${EMERALD.border} overflow-auto`}
      >
        <div className="flex  items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-200">{item.name}</h3>
            <p className="text-sm text-gray-200">{item.short}</p>
          </div>
          <div className="flex items-start gap-2">
            <Button onClick={() => onRemove(item.id)} className={`p-2 bg-red-500 hover:bg-red-600 cursor-pointer`}><Trash className="w-4 h-4"/></Button>
            <Button onClick={onClose} className={`p-2 ${EMERALD.button} cursor-pointer`}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className={`bg-black ${EMERALD.border}`}>
            <CardContent>
              <h4 className="font-semibold text-emerald-200 mb-2">Professional summary</h4>
              <p className="text-emerald-200/90">Detailed technical summary, recommended suppliers, lifecycle considerations, and production notes.</p>
            </CardContent>
          </Card>

          <Card className={`bg-black ${EMERALD.border}`}>
            <CardContent>
              <h4 className="font-semibold text-emerald-200 mb-2">Specification highlights</h4>
              <div className="grid grid-cols-2 gap-2 text-emerald-200 text-sm">
                <div>
                  <div className="text-emerald-300 font-medium">Type</div>
                  <div className="text-emerald-100">{item.type}</div>
                </div>
                <div>
                  <div className="text-emerald-300 font-medium">Color</div>
                  <div className="text-emerald-100">{item.color}</div>
                </div>
                <div>
                  <div className="text-emerald-300 font-medium">Part ID</div>
                  <div className="text-emerald-100">{item.id}</div>
                </div>
                <div>
                  <div className="text-emerald-300 font-medium">Status</div>
                  <div className="text-emerald-100">Production-ready</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-black ${EMERALD.border}`}>
            <CardContent>
              <h4 className="font-semibold text-emerald-200 mb-2">Design notes & checklist</h4>
              <ul className="list-disc pl-5 text-emerald-200 space-y-2">
                <li>Verify electrical isolation and power budgets.</li>
                <li>Confirm thermal profile under worst-case loads.</li>
                <li>Plan for firmware update and rollback strategies.</li>
                <li>Define test cases: unit, integration, HIL and field tests.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={`bg-black ${EMERALD.border}`}>
            <CardContent>
              <h4 className="font-semibold text-emerald-200 mb-2">Integration example</h4>
              <PrettyCode>{`// pseudo-code: safe command handling
if (!isAuthorized(sender)) return ERROR;
if (payload.size > MAX) return ERROR;
queue_command(payload);
`}</PrettyCode>
            </CardContent>
          </Card>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

export default function DetailsPage() {
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [selectedId, setSelectedId] = useState(null);
  const [openDocs, setOpenDocs] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const viewportRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [newComp, setNewComp] = useState({
    name: "",
    short: "",
    color: "#0ea5a4",
    type: "sensor",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return components.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!q) return true;
      return (c.name + " " + c.short + " " + c.type).toLowerCase().includes(q);
    });
  }, [search, components, filter]);

  const handlePick = useCallback((id) => {
    // clicking in 3D sends an id
    const found = components.find((c) => c.id === id);
    if (found) setSelectedId(found.id);
  }, [components]);

  useRealisticThree(viewportRef, components, selectedId, handlePick);

  const selected = components.find((c) => c.id === selectedId) || null;
  function handleChange(e) {
    const { name, value } = e.target;
    setNewComp((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * onAddComponent
   * - This function is the core add-flow; it is invoked by the Dialog's Save button.
   * - It supports being triggered from either the Components panel (button) or Quick Actions.
   *
   * Usage:
   * - To open the dialog: call setOpen(true)
   * - To prefill fields before opening, update newComp state and then setOpen(true)
   */
  function onAddComponent(openDialogFlagOrBool) {
    // If called with a boolean to open the dialog, just toggle the dialog (used by ComponentsPanel)
    if (typeof openDialogFlagOrBool === "boolean") {
      setOpen(openDialogFlagOrBool);
      return;
    }

    // Otherwise assume it's the actual submit action (no args)
    if (!newComp.name) {
      // Basic validation – name required
      // Could show inline validation UI; for now, keep simple
      return;
    }
    const id = uid("usr");
    const comp = { id, ...newComp };
    setComponents((s) => [...s, comp]);

    // select new component to show details & focus in 3D
    setTimeout(() => setSelectedId(id), 120);

    // reset form and close dialog
    setNewComp({ name: "", short: "", color: "#0ea5a4", type: "sensor" });
    setOpen(false);
  }

  function removeComponent(id) {
    setComponents((s) => s.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className={`bg-black/70 ${EMERALD.text} pt-20 min-h-screen`}> 
      <Header onOpenDocs={() => setOpenDocs((v) => !v)} />

      <main className="max-w-8xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OverviewCard />
            <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-300">Operational Runbook</CardTitle>
                <CardDescription className="text-emerald-200">Concise actions for day-to-day operators.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3 text-emerald-200">
                  <li><strong>Deploy:</strong> follow BOM and assembly checklist; verify serial numbers and lot traceability.</li>
                  <li><strong>Commission:</strong> run diagnostics, calibrate sensors, and register device to fleet management.</li>
                  <li><strong>Operate:</strong> monitor telemetry; apply scheduled updates in maintenance windows.</li>
                  <li><strong>Incident:</strong> capture logs, preserve device state, and escalate with root-cause analysis data.</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <ComponentsPanel items={filtered} onSelect={(id) => setSelectedId(id)} onAdd={(flag) => onAddComponent(flag)} onChangeUp={handleChange}  />

          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-300">3D Preview</CardTitle>
              <CardDescription className="text-emerald-200">Realistic PBR preview with soft shadows. Click a model to inspect it in the side panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[560px] rounded-lg overflow-hidden border border-emerald-700 flex flex-col md:flex-row">
                <div className="flex-1 min-h-[380px]" ref={viewportRef} />

                <div className="w-full md:w-96 p-4 border-l border-emerald-700 bg-emerald-900/5">
                  <h4 className="text-emerald-300 font-semibold mb-2">Scene contents</h4>
                  <div className="space-y-3 overflow-auto max-h-[460px] pr-2">
                    {components.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-emerald-900/20 border border-emerald-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md" style={{ background: c.color }} />
                          <div>
                            <div className="text-emerald-100 font-medium">{c.name}</div>
                            <div className="text-emerald-200 text-sm">{c.short}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => setSelectedId(c.id)} className={`py-1 px-2 ${EMERALD.button} cursor-pointer`}>Inspect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-300">Integration Patterns</CardTitle>
              <CardDescription className="text-emerald-200">Edge, cloud and hybrid recommendations for production systems.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="local" >
                <TabsList className="bg-emerald-500">
                  <TabsTrigger className=" cursor-pointer" value="local">Local</TabsTrigger>
                  <TabsTrigger className=" cursor-pointer" value="cloud">Cloud</TabsTrigger>
                  <TabsTrigger className=" cursor-pointer" value="hybrid">Hybrid</TabsTrigger>
                </TabsList>

                <TabsContent value="local">
                  <p className="text-emerald-200 mb-3">Local-first: keep critical rules executing inside the controller; rely on the cloud only for analytics and fleet management.</p>
                  <PrettyCode>{`// Deterministic control loop pseudocode
while (1) {
  sample_sensors();
  run_control_loop(); // hard real-time
  send_telemetry_batch();
}`}</PrettyCode>
                </TabsContent>

                <TabsContent value="cloud">
                  <p className="text-emerald-200 mb-3">Cloud-enabled: use cloud for heavy ML workloads and long-term storage. Ensure offline-safe fallbacks.
                  </p>
                  <PrettyCode>{`// Telemetry upload pseudo
publish("telemetry", packed_samples, { encrypted: true });`}</PrettyCode>
                </TabsContent>

                <TabsContent value="hybrid">
                  <p className="text-emerald-200 mb-3">Hybrid: combine the two — run safety-critical code on-device and aggregate noncritical data to cloud pipelines.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-lg text-emerald-300">Search & Filters</CardTitle>
              <CardDescription className="text-emerald-200">Quick find or narrow by component type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Input className="text-white" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search components..." />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => setFilter("all")} className={`py-1 px-3 ${EMERALD.button}`}>All</Button>
                  <Button onClick={() => setFilter("logic")} className={`py-1 px-3 ${EMERALD.button}`}>Logic</Button>
                  <Button onClick={() => setFilter("sensor")} className={`py-1 px-3 ${EMERALD.button}`}>Sensor</Button>
                  <Button onClick={() => setFilter("actuator")} className={`py-1 px-3 ${EMERALD.button}`}>Actuator</Button>
                  <Button onClick={() => setFilter("network")} className={`py-1 px-3 ${EMERALD.button}`}>Network</Button>
                  <Button onClick={() => setFilter("power")} className={`py-1 px-3 ${EMERALD.button}`}>Power</Button>
                  <Button onClick={() => setFilter("storage")} className={`py-1 px-3 ${EMERALD.button}`}>Storage</Button>
                  <Button onClick={() => setFilter("security")} className={`py-1 px-3 ${EMERALD.button}`}>Security</Button>
                  <Button onClick={() => setFilter("cloud")} className={`py-1 px-3 ${EMERALD.button}`}>Cloud</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-lg text-emerald-300">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {/* Dialog is defined once here, controlling the add-component flow */}
                <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      className={`${EMERALD.button} flex cursor-pointer items-center gap-2`}
      onClick={() => setOpen(true)}
    >
      <Plus className="w-4 h-4" /> Add component
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-[500px] bg-emerald-900 border border-green-400 text-emerald-100 shadow-xl">
    <DialogHeader>
      <DialogTitle className="text-white text-lg font-semibold ">
        Add a new component
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-5">
      {/* Name */}
      <div>
        <Label className="text-emerald-300 pb-2">Name</Label>
        <Input
          name="name"
          value={newComp.name}
          onChange={handleChange}
          placeholder="e.g. Light Sensor"
          className="mt-1 bg-emerald-900/60 border-emerald-700 text-emerald-100 placeholder:text-white"
        />
      </div>

      {/* Short Description */}
      <div>
        <Label className="text-emerald-300 pb-2">Short Description</Label>
        <Input
          name="short"
          value={newComp.short}
          onChange={handleChange}
          placeholder="e.g. Detects ambient light"
          className="mt-1 bg-emerald-900/60 border-emerald-700 placeholder:text-white text-emerald-100"
        />
      </div>

      {/* Color Picker */}
      <div>
        <Label className="text-emerald-300 pb-2">Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="mt-1 w-full justify-start bg-emerald-900/60 border-emerald-700 text-emerald-100"
            >
              <div
                className="w-4 h-4 rounded-full mr-2 border"
                style={{ backgroundColor: newComp.color }}
              />
              {newComp.color}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit bg-emerald-950 border-emerald-700 p-2">
            <Input
              type="color"
              name="color"
              value={newComp.color}
              onChange={handleChange}
              className="h-10 w-16 p-1 cursor-pointer border-emerald-600 bg-emerald-950"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Component Type */}
      <div>
        <Label className="text-emerald-300 pb-2">Type</Label>
        <Select
          value={newComp.type}
          onValueChange={(val) => setNewComp((p) => ({ ...p, type: val }))}
        >
          <SelectTrigger className="mt-1  bg-emerald-900/60 cursor-pointer border-emerald-700 text-emerald-100">
            <SelectValue placeholder="Select component type" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-700 text-emerald-100">
            <SelectItem className="cursor-pointer" value="logic">Logic</SelectItem>
            <SelectItem className="cursor-pointer" value="sensor">Sensor</SelectItem>
            <SelectItem className="cursor-pointer" value="actuator">Actuator</SelectItem>
            <SelectItem className="cursor-pointer" value="io">I/O</SelectItem>
            <SelectItem className="cursor-pointer" value="network">Network</SelectItem>
            <SelectItem className="cursor-pointer" value="power">Power</SelectItem>
            <SelectItem className="cursor-pointer" value="storage">Storage</SelectItem>
            <SelectItem className="cursor-pointer" value="security">Security</SelectItem>
            <SelectItem className="cursor-pointer" value="cloud">Cloud</SelectItem>
            <SelectItem className="cursor-pointer" value="misc">Misc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <DialogFooter>
      <Button
        onClick={() => onAddComponent()}
        className="bg-emerald-600 hover:bg-emerald-500 text-white"
      >
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

                <Button className={`${EMERALD.button}`}><Bolt className="w-4 h-4"/> Run diagnostics</Button>
                <Button className={`${EMERALD.button}`}><Cpu className="w-4 h-4"/> Flash firmware</Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-lg text-emerald-300">Status</CardTitle>
              <CardDescription className="text-emerald-200">Live health and telemetry snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-emerald-200 space-y-2 text-sm">
                <div className="flex justify-between"><span>Uptime</span><strong>12d 6h</strong></div>
                <div className="flex justify-between"><span>Memory</span><strong>42%</strong></div>
                <div className="flex justify-between"><span>CPU</span><strong>17%</strong></div>
                <div className="flex justify-between"><span>Network</span><strong>WiFi (good)</strong></div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${EMERALD.surface} ${EMERALD.border}`}>
            <CardHeader>
              <CardTitle className="text-lg text-emerald-300">Documentation</CardTitle>
              <CardDescription className="text-emerald-200">Links and quick references</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-emerald-200 space-y-2 text-sm">
                <li><a className="underline">Hardware design guide</a></li>
                <li><a className="underline">Firmware architecture</a></li>
                <li><a className="underline">Security checklist</a></li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>

      <ComponentDetail item={selected} onClose={() => setSelectedId(null)} onRemove={removeComponent} />

      <AnimatePresence>
        {openDocs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed left-6 bottom-6 w-[360px] rounded-2xl p-4 bg-black border ${EMERALD.border}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-emerald-200 font-semibold">Quick Docs</p>
                <p className="text-xs text-emerald-200/80">Best practices and security checklist</p>
              </div>
              <Button className={`${EMERALD.button} p-2 cursor-pointer`} onClick={() => setOpenDocs(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-emerald-200 text-sm space-y-2">
              <p className="text-emerald-200/90">• Enforce least privilege for network services.</p>
              <p className="text-emerald-200/90">• Use signed firmware and secure boot.</p>
              <p className="text-emerald-200/90">• Graceful fallback for cloud outages.</p>
              <p className="text-emerald-200/90">• Rate-limit and validate incoming control messages.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
