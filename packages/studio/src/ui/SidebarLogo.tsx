import React from "react";
import { Brand } from "./Brand";
import { PanelLeft } from "lucide-react";

export function SidebarLogo({ initial }: { initial: string }) {
  return (
    <div className="sidebar-logo">
      <Brand name="NoxiGUI" initial={initial} />
      <button className="text-neutral-400 hover:text-neutral-200" title="Toggle sidebar">
        <PanelLeft size={16} />
      </button>
    </div>
  );
}
