// src/components/layout/Inspector.jsx
import React from "react";

export default function Inspector() {
  return (
    <aside className="w-80 bg-[rgba(13,18,24,0.85)] border-l border-emerald-500/20 p-4">
      <h3 className="text-emerald-300 font-semibold mb-2">Inspector</h3>
      <div className="text-emerald-100/70 text-sm">Select a component to edit properties</div>
    </aside>
  );
}
