// src/components/layout/Footer.jsx
import { Github, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-[#0b1220]/90 backdrop-blur-md border-t border-emerald-500/20 mt-3 overflow-hidden">
      {/* Animated glowing top border */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
      />

      {/* emerald gradient overlay for theme consistency */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      {/* Bottom note */}
      <div className="relative text-center text-gray-500 text-xs py-5 border-t border-emerald-500/10">
        © {new Date().getFullYear()}{" "}
        <span className="text-emerald-400 font-semibold">NexEmbed</span>. All rights reserved.Made with 💚 by Eswar
      </div>
    </footer>
  );
}
