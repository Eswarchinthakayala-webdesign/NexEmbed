// src/components/layout/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cpu, Home, Computer, FolderKanban, Info, FileQuestionMark, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { name: "Home", path: "/",icon:<Home size={20}/> },
  { name: "Simulator", path: "/simulator",icon:<Computer size={20}/> },
  { name: "Projects", path: "/projects",icon:<FolderKanban size={20}/> },
  { name: "Details", path: "/details",icon:<Info size={20}/> },
  {name:"Quiz",path:"/quiz",icon:<FileQuestionMark size={20}/>},
  { name: "Help", path: "/help",icon:<LifeBuoy size={20}/> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate=useNavigate()

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Background with Glassmorphism + glowing underline */}
      <div className="relative bg-[#0b0f17]/70 backdrop-blur-xl border-b border-green-400/10 shadow-lg">
        {/* Green glowing animated underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "linear",
          }}
        />

        <div className="container max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo with icon */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cpu className="text-emerald-500 w-7 h-7" />
            </motion.div>
            <motion.span
              className="text-2xl font-extrabold tracking-wide text-emerald-500"
              whileHover={{ scale: 1.05, textShadow: "0 0 12px #00ff9d" }}
            >
              NexEmbed
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-emerald-500"
                      : "text-gray-300 hover:text-emerald-300"
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.span whileHover={{ scale: 1.1 }} className="px-2 py-1">
                  {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 h-[2px] bg-emerald-500 rounded-full"
                      />
                    )}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 cursor-pointer text-black font-bold px-4 py-2 rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105"
            onClick={()=>navigate("/simulator")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg cursor-pointer text-gray-300 hover:text-emerald-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />

            {/* Floating Glass Sidebar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 80 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 80 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-4 right-4 w-[85%] max-w-sm h-[92%] rounded-2xl bg-[#0b0f17]/80 backdrop-blur-xl border border-green-400/40 shadow-[0_0_25px_rgba(34,197,94,0.25)] md:hidden z-50 flex flex-col p-6 relative"
            >
              {/* Neon animated border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-green-400/40 pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(34,197,94,0.3)",
                    "0 0 40px rgba(34,197,94,0.5)",
                    "0 0 20px rgba(34,197,94,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Close Button */}
              <button
                className="self-end text-gray-400 hover:text-emerald-400 cursor-pointer z-50"
                onClick={() => setMobileOpen(false)}
              >
                <X size={28} />
              </button>

              {/* Nav Links */}
              <nav className="flex flex-col space-y-6 mt-8 relative z-50">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className="text-lg font-medium flex gap-1 items-center border-b-1 hover:border-emerald-400 text-gray-200 hover:text-emerald-400 transition-all hover:translate-x-2"
                    onClick={() => setMobileOpen(false)}
                  >
                  {link.icon}{link.name}
                  </NavLink>
                ))}
              </nav>

              {/* CTA */}
              <div className="mt-4 relative z-50">
                <Button className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-500 cursor-pointer text-black font-semibold px-5 py-2 rounded-xl shadow-lg shadow-green-400/30 transition-all hover:scale-105"
                 onClick={()=>navigate("/simulator")}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
