import {create} from "zustand";

export const useComponentsStore = create((set, get) => ({
  components: [],   // {id, type, x, y, props, pins}
  wires: [],        // {id, from: {compId, pin}, to: {compId, pin}}

  addComponent: (component) => set({ components: [...get().components, component] }),
  updateComponent: (id, newProps) =>
    set({ components: get().components.map(c => c.id === id ? { ...c, ...newProps } : c) }),
  removeComponent: (id) =>
    set({ components: get().components.filter(c => c.id !== id) }),

  addWire: (wire) => set({ wires: [...get().wires, wire] }),
  updateWire: (id, newWire) =>
    set({ wires: get().wires.map(w => w.id === id ? { ...w, ...newWire } : w) }),
  removeWire: (id) =>
    set({ wires: get().wires.filter(w => w.id !== id) }),
}));
