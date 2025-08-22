import React from "react";
import { motion } from "framer-motion";

export default function NodeInstance({ node, onSelect, selected }) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onClick={() => onSelect(node)}
      style={{ left: node.x, top: node.y }}
      className={`absolute p-3 rounded-xl border shadow-lg cursor-move ${
        selected ? "border-indigo-400 bg-indigo-500/10" : "border-neutral-700/50 bg-neutral-900/80"
      }`}
    >
      <div className="text-sm font-medium">{node.type}</div>
      <div className="mt-2 flex gap-1">
        {node.pins?.map((_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-emerald-400/80" />
        ))}
      </div>
    </motion.div>
  );
}
