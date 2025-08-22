// src/components/layout/Canvas.jsx
import React from "react";

export default function Canvas() {
  return (
    <div className="relative flex-1 bg-[#0f1724]">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-emerald-500/40">
        Canvas Workspace
      </div>
    </div>
  );
}
