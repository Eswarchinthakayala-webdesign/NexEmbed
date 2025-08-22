// src/pages/DocumentationPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Play,
  Settings,
  Folder,
  Wrench,
  Monitor,
  Puzzle,
  HelpCircle,
} from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // shadcn wrapper
// (ScrollArea should render Radix scroll area internally. We'll query for the viewport.)

/* --------------------------- Documentation data -------------------------- */
const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: BookOpen,
    content: `Welcome to the NexEmbed Documentation.
NexEmbed is a modern web platform designed to bring embedded systems development directly into the browser.`,
  },
  {
    id: "installation",
    title: "Installation & Setup",
    icon: Wrench,
    content: `NexEmbed is browser-based, so no complex installation is required.
Simply sign up, create a project, and start coding in seconds.`,
  },
  {
    id: "project-structure",
    title: "Project Structure",
    icon: Folder,
    content: `Each NexEmbed project is organized as follows:
- /src: Your embedded code
- /sim: Simulator configs
- /docs: Documentation
- /build: Binaries & logs`,
  },
  {
    id: "simulator",
    title: "Simulator",
    icon: Cpu,
    content: `The NexEmbed simulator allows you to test code in a hardware-accurate virtual environment.
It supports ARM Cortex-M, RISC-V, and AVR architectures.`,
  },
  {
    id: "visual-debugger",
    title: "Visual Debugger",
    icon: Monitor,
    content: `NexEmbed includes a powerful visual debugger with:
- Register inspection
- Step execution
- UART/I2C monitoring`,
  },
  {
    id: "coding-guidelines",
    title: "Coding Guidelines",
    icon: Code2,
    content: `To maintain consistency in your embedded projects:
- Write modular functions
- Use HAL APIs
- Keep ISR routines minimal`,
  },
  {
    id: "modules",
    title: "Extending with Modules",
    icon: Puzzle,
    content: `Extend NexEmbed with modules like sensors, communication drivers, or UI visualization tools.`,
  },
  {
    id: "running",
    title: "Running Simulations",
    icon: Play,
    content: `Steps to run a simulation:
1. Open project
2. Select target MCU
3. Attach peripherals
4. Upload code
5. Run simulation`,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    content: `Customize:
- Theme (light/dark/emerald)
- Performance tuning
- Keybindings
- Cloud sync preferences`,
  },
  {
    id: "faq",
    title: "FAQ & Best Practices",
    icon: HelpCircle,
    content: `Q: Can I use NexEmbed offline?
A: Yes, offline mode is supported.`,
  },
];

/* ----------------------------- Helpers / Layout --------------------------- */
// Adjust these if your actual navbar/footer heights differ
const NAV_HEIGHT = 72; // px (approx top bar height)
const FOOTER_HEIGHT = 72; // px (space reserved at bottom)
const EXTRA_OFFSET = 12; // extra spacing so heading isn't flush to top

export default function DocumentationPage() {
  // refs
  const scrollAreaRootRef = useRef(null); // ref to the ScrollArea root DOM node
  const viewportRef = useRef(null); // will point to Radix viewport element
  const sectionRefs = useRef({}); // holds DOM nodes of sections

  const [activeId, setActiveId] = useState(sections[0].id);

  // after mount, find the Radix viewport inside the ScrollArea DOM
  useEffect(() => {
    const root = scrollAreaRootRef.current;
    if (!root) return;

    // Radix adds data attribute "data-radix-scroll-area-viewport" to the viewport element
    const vp = root.querySelector('[data-radix-scroll-area-viewport], [data-radix-viewport]');
    if (vp) {
      viewportRef.current = vp;
    } else {
      // fallback: try finding element with overflow auto inside root
      const fallback = root.querySelector('[style*="overflow"]') || root.querySelector('div');
      viewportRef.current = fallback;
    }
  }, []);

  // programmatic scrolling into Radix viewport
  const scrollToId = useCallback((id, smooth = true) => {
    const vp = viewportRef.current;
    const el = sectionRefs.current[id];
    if (!vp || !el) return;

    // compute top of element relative to viewport
    const vpRect = vp.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // If the element is inside the viewport element, compute target scrollTop
    const curScrollTop = vp.scrollTop;
    const relativeTop = elRect.top - vpRect.top;
    const target = Math.max(0, Math.round(curScrollTop + relativeTop - NAV_HEIGHT / 2 - EXTRA_OFFSET));

    vp.scrollTo({
      top: target,
      behavior: smooth ? "smooth" : "auto",
    });

    // update hash without default browser jump
    if (history && history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  // click handler for sidebar links
  const onNavClick = useCallback(
    (e, id) => {
      e.preventDefault();
      scrollToId(id, true);
    },
    [scrollToId]
  );

  // deep link support once viewportRef is available
  useEffect(() => {
    const tryDeepLink = () => {
      if (!viewportRef.current) return;
      const hash = window.location.hash;
      if (hash && hash.startsWith("#")) {
        const id = hash.slice(1);
        // ensure sections refs exist
        if (sectionRefs.current[id]) {
          // small timeout to let layout settle
          setTimeout(() => scrollToId(id, false), 60);
        }
      }
    };

    // try immediately, and also a short delay (in case viewport wasn't available yet)
    tryDeepLink();
    const t = setTimeout(tryDeepLink, 120);
    return () => clearTimeout(t);
  }, [scrollToId]);

  // Scrollspy: observe which section is most visible inside viewport
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // sort by intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("id");
          if (id && id !== activeId) setActiveId(id);
        }
      },
      {
        root: vp,
        rootMargin: `-${NAV_HEIGHT}px 0px -40% 0px`, // trigger earlier
        threshold: [0.25, 0.5, 0.75],
      }
    );

    // observe each section element
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // include activeId? we intentionally don't include it as dependency to avoid re-registering
  }, [/* run when viewportRef is set; viewportRef is non-react ref so we rely on mount */]);

  // memoized sidebar items with active styling
  const sidebar = useMemo(
    () =>
      sections.map(({ id, title }) => {
        const active = id === activeId;
        return (
          <button
            key={id}
            onClick={(e) => onNavClick(e, id)}
            aria-current={active ? "true" : undefined}
            className={[
              "w-full text-left px-4 py-2 rounded-lg transition-all",
              "text-gray-300 hover:text-emerald-400 hover:bg-emerald-400/8",
              active ? "text-emerald-300 bg-emerald-400/6 border-l-2 border-emerald-400/60" : "border-l-2 border-transparent",
            ].join(" ")}
          >
            {title}
          </button>
        );
      }),
    [activeId, onNavClick]
  );

  return (
    <div className="relative flex pt-26 min-h-screen bg-[#0b0f17] text-gray-100">
      {/* Sidebar */}
      <aside className="fixed top-24 left-6 w-64 hidden lg:flex flex-col gap-3 z-40">
        {sidebar}
      </aside>

      {/* ScrollArea root: attach ref to the root so we can query the internal viewport */}
      <div
        ref={scrollAreaRootRef}
        className="flex-1"
        style={{ height: `calc(100vh - ${NAV_HEIGHT + FOOTER_HEIGHT}px)` }}
      >
        {/* we still render the shadcn ScrollArea so theme and scrollbars match */}
        <ScrollArea className="h-full">
          {/* the viewport will be found via querySelector after mount */}
          {/* content padding top accounts for navbar overlap */}
          <div className="px-6 lg:pl-72 pt-6 pb-8 h-full overflow-visible">
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-8"
            >
              Documentation
            </motion.h1>

            <div className="space-y-16 pb-6">
              {sections.map(({ id, title, icon: Icon, content }) => (
                <section
                  key={id}
                  id={id}
                  ref={(el) => (sectionRefs.current[id] = el)}
                  className="scroll-mt-28 bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-emerald-400/20 shadow-xl shadow-emerald-900/30 p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="text-emerald-400 w-6 h-6" />
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{content}</p>
                </section>
              ))}

              {/* bottom spacer so the last section isn't obscured by fixed footer */}
              <div style={{ height: Math.max(FOOTER_HEIGHT, 96) }} />
            </div>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
