// EmbeddedSyllabusPage.jsx
// React (JavaScript) — NOT TypeScript / NOT Next.js
// Uses: framer-motion, three, react-markdown, remark-gfm, lucide-react, sonner, shadcn/ui
// Adjust shadcn/ui import paths if your folder structure differs.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // stable theme
import "highlight.js/lib/common";
import "highlight.js/styles/atom-one-dark.css"; 
import "highlight.js/styles/github.css";
import { FaCheckDouble } from "react-icons/fa";
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
  RefreshCcw,
  CheckCheck,
  CircleDashed,
  Hourglass,
} from "lucide-react";
import rehypeHighlight from "rehype-highlight";
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
    "Design Examples"
  ],
notes: `# UNIT I — Embedded Computing

## Introduction
Embedded computing is a specialized branch of computer engineering that focuses on designing dedicated hardware and software systems for specific tasks. Unlike general-purpose computers, which are built for versatility, embedded systems are optimized to meet strict constraints. These constraints may relate to time, where the system must meet real-time deadlines; power, where efficiency and battery longevity are crucial; memory, where only limited RAM and ROM are available; cost, where the bill of materials must remain low for large-scale production; and reliability, where the system must maintain stable and safe operation even in harsh environments. The fundamental goals of embedded systems are predictability, ensuring deterministic behavior under timing constraints; efficiency, with designs optimized for performance while consuming minimal resources; reliability and safety, which ensure the system avoids catastrophic failures; and maintainability, where systems can be updated with new firmware or diagnostics in the field.

---

### Historical Evolution
The evolution of embedded computing has been shaped by technological advances over the decades. In the 1970s, the introduction of 4-bit and 8-bit microcontrollers such as the Intel 4004 and the 8051 laid the foundation for embedded applications. During the 1980s and 1990s, the industry transitioned to more powerful 16-bit and 32-bit microcontrollers, accompanied by the adoption of early real-time operating systems (RTOS) and applications in fields like automotive engine control units (ECUs). The 2000s marked the dominance of ARM Cortex-M devices and the widespread integration of system-on-chip (SoC) solutions, which enabled higher performance in smaller, more efficient packages. In the 2010s and 2020s, embedded computing further expanded with the rise of the Internet of Things (IoT), wearable devices, and the integration of artificial intelligence accelerators within embedded systems.

---

## Complex Systems and Microprocessor

### Characteristics of Complex Embedded Systems
Modern embedded systems are complex because they integrate sensing, actuation, computation, and communication in a tightly coordinated manner. They often involve heterogeneous hardware, combining microcontrollers, digital signal processors (DSPs), field-programmable gate arrays (FPGAs), and application-specific integrated circuits (ASICs) within a single design. These systems are frequently distributed, with multiple interconnected nodes communicating over buses such as CAN or networks like Ethernet and wireless protocols. Additionally, many applications demand strong safety and security guarantees, particularly in automotive, aerospace, and medical domains, which must comply with standards such as ISO 26262 or IEC 62304.

---

### Microprocessor vs. Microcontroller
A microprocessor is primarily CPU-centric and relies on external components such as RAM, Flash memory, and peripherals to function. This makes it suitable for high-performance applications like laptops, servers, or systems that run full operating systems such as Linux or Windows. By contrast, a microcontroller integrates the CPU, memory, and peripherals into a single chip, offering a compact and cost-effective solution. Microcontrollers are widely used in consumer appliances, IoT devices, and automotive ECUs because of their low power consumption, affordability, and ability to run real-time operating systems or bare-metal applications.

---

### Metrics of Embedded Systems
The performance and quality of an embedded system can be evaluated using a variety of metrics. Latency measures the time the system takes to respond to an event, while throughput quantifies the number of operations it can perform per unit of time. Jitter refers to the variability in timing, which must be minimized in real-time applications. Worst-case execution time (WCET) is critical for safety systems, ensuring deadlines are always met. Other metrics include energy per task, which reflects power efficiency; code size and memory footprint, which indicate resource usage; and mean time to failure (MTTF), which represents the system’s reliability and expected operational lifetime.

---


## Embedded System Design Process

### Design Flow Stages
The embedded system design process begins with requirements analysis, where engineers identify both functional goals, such as the tasks the system must perform, and non-functional constraints, such as timing, power, safety, and cost. These are followed by a detailed specification, which defines system interfaces, timing diagrams, and communication protocols. Architecture design comes next, involving decisions about partitioning tasks between hardware and software, selecting an RTOS, defining communication stacks, and addressing security. Once the architecture is established, the system is implemented through the development of low-level drivers, hardware abstraction layers, middleware, and application logic. Verification ensures the correctness of the system through unit testing, integration testing, timing analysis, and fault injection. Finally, deployment and maintenance involve field updates via over-the-air mechanisms, remote diagnostics, and applying cybersecurity patches to keep the system secure and reliable throughout its lifecycle.

---

### Tip
Prototyping with development kits such as STM32 Nucleo or ESP32 boards allows rapid iteration and validation. Once the design stabilizes, engineers can transition to custom PCBs for production deployment.

---

## Formalisms for System Design

### State-based Modeling
State-based models, particularly finite state machines (FSMs), are widely used in embedded design to represent systems with discrete states and predictable transitions. Extensions such as statecharts add hierarchy and parallelism, making them well suited for modeling complex systems such as communication protocols or user interfaces.

---

### Dataflow Models
Dataflow approaches represent computation as a network of operations connected by data streams. In synchronous dataflow (SDF), operations consume and produce data tokens at fixed rates, making it suitable for predictable applications such as digital filters. Kahn process networks (KPN) provide asynchronous communication between processes via FIFO channels, enabling efficient modeling of streaming applications like multimedia processing.

---

### Petri Nets
Petri nets provide a graphical and mathematical framework for representing concurrent systems. They consist of places representing states and transitions representing events. Their ability to capture concurrency, synchronization, and resource sharing makes them highly useful in embedded applications that require parallel processing.

---

### UML/SysML
Unified Modeling Language (UML) and Systems Modeling Language (SysML) offer a rich set of diagrams for system specification. Use-case diagrams capture functional requirements, sequence diagrams show message flows over time, activity diagrams illustrate workflows, and component diagrams represent system building blocks. Deployment diagrams further map software to hardware platforms, giving a complete architectural view.

---

### Temporal Logic
Temporal logic frameworks such as Linear Temporal Logic (LTL) and Computation Tree Logic (CTL) allow formal specification of system properties. They are particularly useful for defining safety properties, such as ensuring that undesirable events never occur, and liveness properties, which guarantee that desired events eventually happen.

---

### Why Use Formalisms?
By employing formal models, engineers gain predictability, analyzability, and testability, reducing ambiguity and making timing analysis easier. This approach often leads to correctness-by-construction, minimizing design flaws before implementation begins.

---

## Design Examples

### Example 1: Thermostat
A thermostat system integrates a temperature sensor as input and uses a control algorithm such as PID to regulate a heating element. The outputs typically involve actuating a PWM-controlled heater and activating a safety relay. The system must operate with constraints such as maintaining ±1°C accuracy and incorporating fail-safe behavior if the sensor disconnects.

---

### Example 2: Wearable Pedometer
A wearable pedometer processes signals from an IMU that includes accelerometers and gyroscopes. The system applies filters to remove noise and detects peaks corresponding to steps. The output is presented as a step count and synchronized with a smartphone using Bluetooth Low Energy. Key design constraints include ultra-low power operation to ensure long battery life.

---

### Example 3: Smart Irrigation System
In a smart irrigation system, soil moisture sensors provide feedback, while weather forecast data may be integrated to optimize water usage. The system operates on low-power wireless networks such as LoRa, powered by solar energy. The actuators control water pumps to irrigate crops, and the system must operate reliably for years in remote field conditions.

---

### Example 4: Pacemaker (Medical Device)
A pacemaker monitors ECG signals to detect arrhythmias and provides electrical stimulation to regulate heartbeats. Because it directly sustains human life, its design must prioritize absolute safety, redundancy, and adherence to rigorous medical certification processes such as FDA approval.

---

### Pseudo-code Example: Simple FSM for Traffic Light

\`\`\`c
enum State { RED, GREEN, YELLOW };
State current = RED;

while (1) {
  switch (current) {
    case RED:
      turnOn(RED_LED);
      wait(5000);
      current = GREEN;
      break;
    case GREEN:
      turnOn(GREEN_LED);
      wait(3000);
      current = YELLOW;
      break;
    case YELLOW:
      turnOn(YELLOW_LED);
      wait(2000);
      current = RED;
      break;
  }
}
\`\`\`

---
`

},
  {
  id: "unit2",
  title: "UNIT II — Embedded C  & Applications",
  topics: [
    "Features of Embedded Programming Languages",
    "C vs Embedded C",
    "Key Characteristics of Embedded C",
    "Standard Embedded C Data Types",
    "Block Diagram Explanation",
    "Basic Programming Steps",
    "Advanced Techniques"
  ],
  notes: `# UNIT II — Embedded C  & Applications

## Features of Embedded Programming Languages
Embedded C programming languages are tailored to directly interact with hardware while maintaining predictable and efficient execution. Unlike general-purpose languages, embedded languages focus on **low-level control of microcontrollers and processors**, ensuring reliable timing and resource usage. They provide constructs for **bitwise operations, fixed-point arithmetic, and direct register access**, which are crucial for controlling peripherals and optimizing memory. Furthermore, embedded C has a **small runtime footprint** and avoids unnecessary abstraction layers, making it highly suitable for devices with limited memory and processing power.

---

## C vs. Embedded C
Although Embedded C is derived from standard C, it diverges in design philosophy and execution environment. **Standard (hosted) C** typically assumes the presence of an operating system and full support for the C standard library, whereas **Embedded C** is considered a freestanding implementation, meaning it runs without an OS and often with restricted library support. Instead, embedded compilers provide **vendor-specific header files** that expose hardware features such as memory-mapped registers, timers, and interrupt controllers. For example, ARM-based microcontrollers use the **CMSIS (Cortex Microcontroller Software Interface Standard)** to define consistent register-level access. This enables developers to write portable yet hardware-aware programs.

---

## Key Characteristics of Embedded C
Embedded C emphasizes **deterministic execution** and minimal overhead. Programs are designed to meet real-time deadlines, so developers must carefully avoid practices like unbounded loops, heavy recursion, or dynamic memory allocation. A key feature of Embedded C is the use of the **volatile keyword**, which prevents the compiler from optimizing out hardware register reads and writes, ensuring correctness in I/O operations. Additionally, **interrupt service routines (ISRs)** must be kept short to reduce latency, with most processing deferred to background tasks or state machines. These design rules ensure reliability in systems where even microseconds of delay can lead to failures.

---

## Standard Embedded C Data Types
Portability is essential in embedded software, as applications often migrate across different microcontrollers. To maintain consistency, developers rely on **fixed-width data types** provided in the \`<stdint.h>\` header file, such as \`uint8_t\`, \`int16_t\`, and \`uint32_t\`. These ensure predictable memory sizes regardless of the platform. For example, a sensor driver written with \`uint16_t\` will behave consistently on both an 8-bit AVR and a 32-bit ARM Cortex-M microcontroller. This clarity reduces debugging time and improves code reliability across architectures.

---

## Toolchain Block Diagram
The development of embedded C programs follows a structured compilation toolchain:

**Source Code (.c/.h)** → **Preprocessing** → **Compilation** → **Assembly** → **Linking/Locating** → **Executable (HEX/ELF)** → **Flashing to MCU** → **Execution on Target**

This toolchain transforms high-level C code into machine instructions suitable for a specific microcontroller. The resulting **.hex or .elf files** are loaded into flash memory using programmers or debuggers (e.g., JTAG, SWD). Once flashed, the program executes directly on the target hardware.

---

## Basic Programming Steps
Writing an embedded application typically begins with **initialization of the system clock and peripherals**. Next, **low-level drivers** are developed to control GPIO, UART, I2C, SPI, or ADC/DAC interfaces. The core application logic often follows a **finite state machine (FSM) or statechart model**, ensuring predictable and maintainable control flow. After implementation, the system undergoes **on-target debugging and unit testing**, where breakpoints, logic analyzers, or oscilloscopes validate the software’s interaction with real hardware. These iterative steps allow developers to refine performance, power usage, and reliability.

---

## Advanced Techniques
To meet the growing complexity of modern embedded systems, advanced programming techniques are widely used. **DMA (Direct Memory Access)** pipelines, circular buffers, and double buffering schemes reduce CPU load and enable efficient data transfer. Power optimization strategies, such as **sleep modes, clock gating, and dynamic voltage scaling**, extend battery life in IoT and wearable devices. Code quality is enforced through **MISRA-C guidelines, static analysis tools, and code coverage metrics**, ensuring long-term safety and maintainability. These practices are especially critical in safety-critical industries such as automotive, aerospace, and medical devices.

---`
}
,{
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
    "Resource Sharing & Priority Inheritance"
  ],
  notes: `# UNIT III — Introduction to RTOS

## Principles of RTOS
A **Real-Time Operating System (RTOS)** provides deterministic and predictable task execution, making it essential for embedded systems where timing is critical. Its principles include:
- **Preemptive, priority-based scheduling**: High-priority tasks can interrupt lower-priority ones, ensuring deadlines are met.  
- **Bounded latency system calls**: Kernel functions execute within known time limits, enabling deterministic behavior.  
- **Inter-process communication (IPC) mechanisms**: Semaphores, message queues, and events provide safe communication between tasks without data corruption.  

The key distinction between an RTOS and a general-purpose OS is **determinism**—not throughput.

---

## Tasks and Task States
In RTOS, applications are divided into **tasks** (lightweight threads). Each task has its own **stack, priority, and control block**. A task can exist in multiple states:
- **Ready**: Waiting to be scheduled.  
- **Running**: Actively executing on the CPU.  
- **Blocked**: Waiting for an event, semaphore, or resource.  
- **Suspended**: Manually paused, not eligible for scheduling.  

The **scheduler** determines task execution based on priority and system events, with **context switching** enabling multitasking.

---

## Semaphores and Queues
- **Semaphores**:  
  - **Binary semaphore** acts as a signal (lock/unlock).  
  - **Counting semaphore** tracks the availability of multiple identical resources.  
- **Queues**: Provide a **FIFO mechanism** for message passing between tasks, avoiding race conditions in shared memory.  

Semaphores prevent **race conditions**, while queues improve modularity by decoupling producer and consumer tasks.

---

## Message Queues, Mailboxes, and Pipes
- **Message Queues**: Store multiple fixed-size messages, suitable for asynchronous task communication.  
- **Mailboxes**: Store a **single message slot** (overwrites old messages when new arrives).  
- **Pipes**: Stream-oriented communication, enabling **byte or character streams** between tasks.  

Choosing the right IPC mechanism depends on **data size, frequency, and synchronization needs**.

---

## Timer Functions, Events, and Memory Management
RTOS kernels use **timer services** to support periodic tasks:  
- **Tick-based kernel**: Regular system tick interrupts drive scheduling.  
- **Tickless kernel**: Saves power by waking only when required.  
- **Event Groups**: Allow multiple tasks to wait on specific events (bitmask-based signaling).  
- **Memory Management**: Instead of malloc/free, RTOS often uses **fixed-size memory pools**, ensuring O(1) allocation and avoiding fragmentation.

---

## Interrupts in an RTOS
Interrupt Service Routines (ISRs) are crucial in real-time systems, but they must be kept minimal:
- Perform only **essential operations** inside ISRs.  
- Defer heavy work to **tasks** using semaphores or queues.  
- Avoid blocking calls and long execution inside ISRs to maintain **low interrupt latency**.  

---

## Real-Time Scheduling (RMS & EDF)
Two widely used scheduling algorithms:  

- **Rate Monotonic Scheduling (RMS):**  
  - Assigns **higher priority to tasks with shorter periods**.  
  - Works best for **periodic, independent tasks**.  
  - Utilization bound:  
    \`U = n (2^(1/n) - 1)\`  
    where *n* is the number of tasks. If total CPU utilization ≤ U, deadlines are guaranteed.  

- **Earliest Deadline First (EDF):**  
  - Dynamically assigns priority to tasks with **closest deadlines**.  
  - More efficient than RMS; optimal for **uniprocessor scheduling**.  
  - Handles higher CPU utilizations but requires **dynamic priority management**.  

---

## Resource Sharing and Priority Inheritance
When multiple tasks share resources (e.g., UART, sensors), improper handling can lead to **deadlocks** or **priority inversion** (low-priority task blocking a high-priority task).  
Solutions include:  
- **Priority Inheritance Protocol (PIP):** Temporarily boosts the priority of a low-priority task holding a resource.  
- **Priority Ceiling Protocol (PCP):** Assigns each resource a maximum priority level to prevent deadlock.  
- **Stack Resource Policy (SRP):** Ensures tasks only start when all resources they need are available.  

These protocols ensure predictable execution and fairness in resource usage.

---`
}
,
{
  id: "unit4",
  title: "UNIT IV — Hardware–Software Co-Design",
  topics: [
    "Memory & Power Optimization",
    "Example RTOS: µC/OS",
    "Development Tools: Host/Target, Linker/Locator",
    "HW–SW Co-Simulation & Partitioning",
    "Optimization Techniques: ILP, Kernighan–Lin, GA, PSO",
    "Power-Aware & Functional Partitioning",
  ],
  notes: `# UNIT IV — Hardware–Software Co-Design

## Memory & Power Optimization
- **Memory Efficiency**: 
  - Use fixed-size arrays, avoid fragmentation from dynamic memory.
  - Compact data types (\`uint8_t\` vs \`int\`), lookup tables instead of recomputation.
  - Code compression & link-time optimization (LTO).
- **Power Efficiency**:
  - Dynamic Voltage & Frequency Scaling (DVFS).
  - Peripheral clock gating, sleep/standby modes.
  - Sensor batching and event-driven I/O instead of polling.

## Example RTOS: µC/OS
- **µC/OS-II/III**:
  - Portable, preemptive, priority-based kernel.
  - Rich IPC: semaphores, mailboxes, queues.
  - Deterministic scheduling suitable for safety-critical systems.
- Widely used in automotive, avionics (DO-178B certifiable).

## Development Tools
- **Host Side**: IDE, compiler, emulator/simulator, debugging utilities.
- **Target Side**: Embedded board, JTAG/SWD probe, on-chip debugger.
- **Linker/Locator**:
  - Memory maps (Flash, SRAM, peripherals).
  - Section placement (\`.text\`, \`.data\`, \`.bss\`, stacks/heap).
  - Overlaying unused memory regions for tighter fits.

## HW–SW Co-Simulation & Partitioning
- **Co-Simulation**:
  - Transaction-Level Modeling (TLM) in SystemC.
  - FPGA-in-the-loop to validate acceleration blocks.
- **Partitioning**:
  - HW for compute-intensive, parallel tasks (DSP/accelerator).
  - SW for flexibility, control logic, OS services.
  - Balance performance, power, cost.

## Optimization Techniques
- **ILP (Integer Linear Programming)**: exact mathematical formulation, optimal but NP-hard.
- **Kernighan–Lin**: heuristic for graph-based partitioning (fast, scalable).
- **Genetic Algorithms (GA)**: evolutionary meta-heuristic, explores large design spaces.
- **Particle Swarm Optimization (PSO)**: swarm intelligence, converges quickly for HW–SW trade-offs.

## Power-Aware & Functional Partitioning
- **Power-Aware**:
  - Clock gating & power domains, DVFS policies.
  - Minimize switching activity in logic blocks.
- **Functional Partitioning**:
  - Group related tasks into clusters (cache-locality, bus optimization).
  - Schedule tasks to align with idle/sleep windows.
  - Balance latency vs. throughput depending on application domain.
`
},
{
  id: "unit5",
  title: "UNIT V — Advanced Architectures",
  topics: [
    "ARM & ARM7 (LPC2148)",
    "Networked Systems",
    "DSPs, FPGAs, ASICs",
    "SoC Architecture & On-Chip Interconnect",
    "SoC Case Study: Digital Camera"
  ],
  notes: `# UNIT V — Advanced Architectures

## ARM & ARM7 (LPC2148)
The ARM7 family, particularly the ARM7TDMI core, represents a widely adopted 32-bit RISC architecture designed for embedded systems. It uses a 3-stage pipeline and supports both 32-bit ARM instructions and 16-bit Thumb instructions, making it efficient in terms of performance and code density. The LPC2148, based on ARM7, integrates several on-chip peripherals such as UART, SPI, I²C, ADC, DAC, PWM, timers, and a watchdog timer. It also features a Vector Interrupt Controller for fast and prioritized interrupt handling, and PLL circuits for clock scaling.  

- Compact and efficient design suitable for real-time embedded systems.  
- Thumb instruction set improves memory efficiency.  
- Vectored interrupts enable low-latency response.  

## Networked Systems
Modern embedded devices often rely on multiple communication protocols. I²C provides a simple two-wire bus system supporting multiple masters and slaves, making it ideal for sensor networks. CAN is robust, supporting error detection and reliable communication in automotive and industrial systems. RS232, although legacy, remains in use for debugging and console ports. USB is the most versatile, supporting a wide range of peripherals with high data rates. IrDA uses infrared for short-range line-of-sight communication, while Bluetooth dominates in wireless short-range connectivity, especially in IoT and consumer electronics.  

- Protocols vary in speed, reliability, and use cases.  
- USB and Bluetooth dominate modern consumer devices.  
- CAN and I²C remain crucial in automotive and sensor networks.  

## DSPs, FPGAs, and ASICs
Digital Signal Processors (DSPs) are specialized for handling mathematical operations like MAC (Multiply-Accumulate), making them ideal for audio, video, and control applications. FPGAs, in contrast, are reconfigurable logic devices capable of rapid prototyping and custom hardware acceleration. They are used extensively in networking and data-intensive applications. ASICs, while costly to develop, provide the most efficient and high-performance solutions for large-scale deployment in products like smartphones, GPUs, and AI accelerators.  

- DSPs excel in real-time signal processing.  
- FPGAs provide flexibility for prototyping and specialized tasks.  
- ASICs offer unmatched performance and efficiency at volume.  

## SoC Architecture & On-Chip Interconnect
System-on-Chip (SoC) designs integrate multiple subsystems including CPUs, caches, memory controllers, accelerators, and I/O blocks on a single chip. Communication within the SoC is handled using bus protocols like AXI, AHB, and APB, each optimized for different levels of performance and power. Direct Memory Access (DMA) reduces CPU load by managing data transfers independently. Advanced SoCs also employ Network-on-Chip (NoC) architectures to overcome bandwidth bottlenecks while incorporating power-saving techniques such as DVFS and clock gating.  

- SoCs combine computing, memory, and I/O into a single platform.  
- AXI, AHB, and APB ensure efficient interconnect.  
- NoC and DVFS address bandwidth and power challenges.  

## SoC Case Study: Digital Camera

\`\`\`c
#define N 5
int coeff[N] = {1, 2, 3, 2, 1};
int buffer[N];

int FIR_Filter(int input) {
    int i, result = 0;
    
    return result;
}
\`\`\`
A digital camera SoC demonstrates the integration of multiple subsystems to meet real-time performance requirements. Image data flows from the sensor into an Image Signal Processor (ISP), where operations like demosaicing, noise reduction, and white balance are performed. Compression units handle JPEG for photos and H.264/HEVC for video. Memory controllers and DDR manage frame buffering, while output interfaces handle display, storage, or wireless transmission. Constraints include maintaining frame rates (e.g., 30 fps at 1080p), ensuring power efficiency for battery operation, and managing thermal performance.  

- ISP ensures image quality through processing pipelines.  
- Compression and memory systems enable real-time capture.  
- Power and thermal constraints drive design optimizations.  


`
}


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
          className="flex-1 bg-emerald-700 cursor-pointer hover:bg-emerald-600"
          onClick={() => setRunning((v) => !v)}
        >
          {running ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" className={emerald.border,"cursor-pointer"} onClick={() => setSecs(25 * 60)}>
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
        <Card key={q.id} className={cn("bg-black/50",emerald.border)}>
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
                      className={cn(
                        "data-[state=checked]:bg-emerald-600 cursor-pointer data-[state=checked]:border-emerald-600",
                        "data-[state=checked]:text-white border-emerald-400"
                      )}
                    />

                    <span className="text-white">{o}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "tf" && (
              <div className="flex gap-3">
                <Button
                  variant={state[q.id] === "true" ? "default" : "outline"}
                  className={cn("bg-emerald-400 cursor-pointer hover:bg-emerald-500",state[q.id] === "true" ? "bg-emerald-700" : "", emerald.border)}
                  onClick={() => setState((p) => ({ ...p, [q.id]: "true" }))}
                >
                  True
                </Button>
                <Button
                  variant={state[q.id] === "false" ? "default" : "outline"}
                  className={cn("bg-emerald-400 cursor-pointer hover:bg-emerald-500",state[q.id] === "false" ? "bg-emerald-700" : "", emerald.border)}
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
          className="bg-emerald-700 cursor-pointer hover:bg-emerald-600"
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
            className={emerald.border,"cursor-pointer"}
            onClick={() => setTasks(tasks.map((t) => ({ ...t, done: true })))}
          >
           <Tooltip>
          <TooltipTrigger><CheckCheck/> </TooltipTrigger>
          <TooltipContent>
            <p>Mark All</p>
          </TooltipContent>
        </Tooltip>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={emerald.border,"cursor-pointer"}
            onClick={() => setTasks(tasks.map((t) => ({ ...t, done: false })))}
          >
           <Tooltip>
          <TooltipTrigger><RefreshCcw/> </TooltipTrigger>
          <TooltipContent>
            <p>Refresh</p>
          </TooltipContent>
        </Tooltip>
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
              className={cn(
                "transition-colors duration-200",
                "border-emerald-400 cursor-pointer hover:border-emerald-500",
                "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600",
                "data-[state=checked]:text-white"
              )}
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
              className="text-red-300 cursor-pointer hover:bg-red-500 hover:text-black"
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
          className="bg-emerald-700 cursor-pointer hover:bg-emerald-600"
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
              "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-400"
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
            "w-72 sm:w-80 text-emerald-50 m-2 p-2"
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
              "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-400"
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
    "mx-auto max-w-7xl w-full px-4 py-6 grid gap-6",
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
                  <div className="flex items-center gap-2 w-full p-2">
                    <Badge className="bg-emerald-700/70 border-emerald-600/50">
                      {u.id.toUpperCase()}
                    </Badge>
                    <span className="text-left flex-1 text-gray-300">{u.title}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 cursor-pointer hover:bg-emerald-400 hover:text-black"
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
                          className="text-emerald-300 bg-emerald-400/50 cursor-pointer hover:text-emerald-400 hover:bg-emerald-500/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            markComplete(u.id, !done);
                          }}
                        >
                          {done ?<Hourglass/>:<Check
                            className={cn(
                              "h-4 w-4 text-emerald-400"
                            )}
                          />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {done ? "pending" : "completed"}
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
                            className="justify-start cursor-pointer text-emerald-200 hover:text-emerald-700 w-full text-left  text-wrap "
                            onClick={() => {
                              setSelectedTopic((cur) => (cur === t ? null : t));
                              setTopicEditing(false);
                            }}
                          >
                            <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-wrap">{t}</span>
                          </Button>


                         
                          {/* Inline responsive container */}
                          {selectedTopic === t && openUnit === u.id && (
                            <div className="mt-2 w-full rounded-xl border border-emerald-800/60 bg-black p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-emerald-500 text-wrap font-semibold">
                                  {t}

                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
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
                                    <TooltipContent>View (Markdown Preview)</TooltipContent>
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
                                    <TooltipContent>Editor (Markdown)</TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>

                              {!topicEditing ? (
                                                    <div className="w-full text-sm mt-3  break-words whitespace-pre-wrap">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => (
                                  <h1 className="text-emerald-300 text-xl text-wrap font-bold mt-4 mb-2" {...props} />
                                ),
                                h2: ({node, ...props}) => (
                                  <h2 className="text-emerald-300 text-wrap text-lg font-semibold mt-3 mb-2" {...props} />
                                ),
                                h3: ({node, ...props}) => (
                                  <h3 className="text-emerald-300 text-wrap text-base font-semibold mt-2 mb-1" {...props} />
                                ),
                                p: ({node, ...props}) => (
                                  <p className="text-emerald-300 text-wrap leading-relaxed mb-2" {...props} />
                                ),
                                ul: ({node, ...props}) => (
                                  <ul className="list-disc list-inside text-wrap text-emerald-100 mb-2 space-y-1" {...props} />
                                ),
                                ol: ({node, ...props}) => (
                                  <ol className="list-decimal list-inside text-wrap text-emerald-100 mb-2 space-y-1" {...props} />
                                ),
                                li: ({node, ...props}) => <li className="mb-1 text-red text-wrap" {...props} />,
                                strong: ({node, ...props}) => (
                                  <strong className="text-emerald-200  text-wrap font-semibold" {...props} />
                                ),
                                em: ({node, ...props}) => (
                                  <em className="italic text-emerald-300" {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote
                                    className="border-l-4 border-emerald-500 pl-3 italic text-emerald-300 my-3"
                                    {...props}
                                  />
                                ),
                                code({node, inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      wrapLongLines
                                      customStyle={{
                                        margin: "0.75rem 0",
                                        borderRadius: "0.5rem",
                                        padding: "1rem",
                                        fontSize: "0.85rem",
                                        background: "#1e1e1e",
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code
                                      className="bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono text-emerald-200"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {activeTopicNotes}
                            </ReactMarkdown>
                          </div>
                              ) : (
                                <div className="mt-3 space-y-2">
                                  <Label className="text-emerald-200">
                                    Edit Markdown (stored per unit in local storage)
                                  </Label>
                                  <Textarea
                                    className={cn(
                                      emerald.border,
                                      "w-full min-h-[220px] bg-emerald-950/70 text-emerald-50 resize-y"
                                    )}
                                    value={
                                      customNotes[u.id]?.length ? customNotes[u.id] : u.notes
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
                                      className="bg-emerald-700 cursor-pointer hover:bg-emerald-600"
                                      onClick={() => setTopicEditing(false)}
                                    >
                                      Done
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className={emerald.border,"cursor-pointer"}
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
                                      className="bg-emerald-800/60 cursor-pointer hover:text-white hover:bg-emerald-300"
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
    <Card className={cn(emerald.panel,"overflow-auto", emerald.border)}>
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
                className=" w-full justify-start text-wrap  cursor-pointer text-gray-300 bg-emerald-800/50 hover:bg-emerald-700/60"
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
                    "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-500"
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
                    "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-500"
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
                    "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-500"
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
                    "bg-emerald-950/60 cursor-pointer text-emerald-100 hover:bg-emerald-500"
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
            <TabsList className="bg-emerald-400 flex flex-wrap">
              <TabsTrigger value="notes" className="cursor-pointer data-[state=active]:text-white data-[state=active]:bg-emerald-900">Notes</TabsTrigger>
              <TabsTrigger value="quiz" className="cursor-pointer data-[state=active]:text-white data-[state=active]:bg-emerald-900">Quiz</TabsTrigger>
              <TabsTrigger value="tasks" className="cursor-pointer data-[state=active]:text-white data-[state=active]:bg-emerald-900">Tasks</TabsTrigger>
             
            </TabsList>

            {/* NOTES */}
            <TabsContent value="notes" className="pt-4">
              <div className="flex flex-col lg:flex-row rounded-2xl border border-emerald-400/50 bg-black/50 items-start gap-6">
                <div className="flex-1 min-w-0 p-5 w-full">
                  {!markdownEditing ? (
                    <article
                      className={cn(
                        "prose prose-invert max-w-none break-words whitespace-pre-wrap",
                        densityClass
                      )}
                    >
                       <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => (
                                  <h1 className="text-emerald-300 text-wrap text-xl font-bold " {...props} />
                                ),
                                h2: ({node, ...props}) => (
                                  <h2 className="text-emerald-300 text-wrap text-lg font-semibold " {...props} />
                                ),
                                h3: ({node, ...props}) => (
                                  <h3 className="text-emerald-300 text-wrap text-base font-semibold " {...props} />
                                ),
                                p: ({node, ...props}) => (
                                  <p className="text-emerald-300 text-wrap leading-relaxed " {...props} />
                                ),
                                ul: ({node, ...props}) => (
                                  <ul className="list-disc list-inside text-wrap text-emerald-100 " {...props} />
                                ),
                                ol: ({node, ...props}) => (
                                  <ol className="list-decimal list-inside text-wrap text-emerald-100 " {...props} />
                                ),
                                li: ({node, ...props}) => <li  {...props} />,
                                strong: ({node, ...props}) => (
                                  <strong className="text-emerald-200 text-wrap font-semibold" {...props} />
                                ),
                                em: ({node, ...props}) => (
                                  <em className="italic text-wrap text-emerald-300" {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote
                                    className="border-l-4 border-emerald-500 text-wrap  italic text-emerald-300 my-3"
                                    {...props}
                                  />
                                ),
                                code({node, inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      wrapLongLines
                                      customStyle={{
                                        margin: "0.75rem 0",
                                        borderRadius: "0.5rem",
                                        padding: "1rem",
                                        fontSize: "0.85rem",
                                        background: "#1e1e1e",
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code
                                      className="bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono text-emerald-200"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
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
                          className="bg-emerald-700 cursor-pointer hover:bg-emerald-600"
                        >
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          className={emerald.border,"cursor-pointer"}
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
                          className="bg-emerald-800/60 cursor-pointer hover:text-white hover:bg-emerald-300"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar widgets */}
                <aside className="w-full p-2 lg:w-64 shrink-0 space-y-3">
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
    
              Shortcuts: Ctrl/Cmd+K (Search), Ctrl/Cmd+P (Print), Ctrl/Cmd+B (Bookmark), Ctrl/Cmd+M (Read).
            </footer>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
