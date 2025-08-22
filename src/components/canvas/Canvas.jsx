import React from "react";
import NodeInstance from "./NodeInstance";
import Wire from "./Wire";
import { useComponentsStore } from "../../hooks/useComponentsStore";

export default function Canvas({ selected, setSelected }) {
  const { components, wires } = useComponentsStore();

  return (
    <div className="relative flex-1 bg-[radial-gradient(#1a1f2e_1px,transparent_1px)] [background-size:16px_16px]">
      {components.map(c => (
        <NodeInstance key={c.id} node={c} onSelect={setSelected} selected={selected?.id === c.id} />
      ))}
      {wires.map(w => (
        <Wire key={w.id} wire={w} components={components} />
      ))}
    </div>
  );
}
