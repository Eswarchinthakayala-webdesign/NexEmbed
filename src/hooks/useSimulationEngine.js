import { useEffect, useState } from "react";
import { useComponentsStore } from "./useComponentsStore";

export function useSimulationEngine() {
  const { components, wires, updateComponent } = useComponentsStore();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      // Simple mock simulation logic: toggle digital pins
      components.forEach((c) => {
        const pins = c.pins || [];
        pins.forEach((p, idx) => {
          if (p.mode === "OUT") {
            p.state = p.state === "H" ? "L" : "H";
          } else if (p.mode === "IN") {
            p.state = Math.random() > 0.5 ? "H" : "L";
          }
        });
        updateComponent(c.id, { pins });
      });
    }, 500);
    return () => clearInterval(interval);
  }, [running, components, updateComponent]);

  const run = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => {
    components.forEach((c) => {
      const pins = c.pins?.map(p => ({ ...p, state: "L" })) || [];
      updateComponent(c.id, { pins });
    });
    setRunning(false);
  };

  return { running, run, pause, reset };
}
