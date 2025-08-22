import React from "react";

export default function Wire({ wire, components }) {
  const fromNode = components.find(c => c.id === wire.from.compId);
  const toNode = components.find(c => c.id === wire.to.compId);
  if (!fromNode || !toNode) return null;

  const x1 = fromNode.x + 40;
  const y1 = fromNode.y + 20;
  const x2 = toNode.x + 40;
  const y2 = toNode.y + 20;

  return (
    <svg className="absolute inset-0 pointer-events-none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#f59e0b" strokeWidth="3" fill="none" />
      <circle cx={x1} cy={y1} r="4" fill="#f59e0b" />
      <circle cx={x2} cy={y2} r="4" fill="#f59e0b" />
    </svg>
  );
}
