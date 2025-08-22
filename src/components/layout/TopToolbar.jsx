// src/components/layout/TopToolbar.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Save, FileJson, RotateCcw, HelpCircle } from "lucide-react";

export default function TopToolbar() {
  return (
    <div className="h-12 flex items-center gap-2 px-3 bg-[rgba(13,18,24,0.85)] border-b border-emerald-500/20">
      <Button size="sm" variant="outline"><Save className="w-4 h-4 mr-1" /> Save</Button>
      <Button size="sm" variant="outline"><FileJson className="w-4 h-4 mr-1" /> Export</Button>
      <Button size="sm" variant="outline"><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
      <div className="flex-1" />
      <Button size="sm" className="bg-emerald-500 text-black hover:bg-emerald-400">
        <Play className="w-4 h-4 mr-1" /> Simulate
      </Button>
      <Button size="sm" variant="outline"><HelpCircle className="w-4 h-4 mr-1" /> Help</Button>
    </div>
  );
}
