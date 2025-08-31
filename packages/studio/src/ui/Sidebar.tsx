import React from "react";
import { NavItem } from "./NavItem";
import { Brand } from "./Brand";

import {
  Layout,
  Database,
  Image,
  PanelLeft, Link2,
} from "lucide-react";
import {SceneTreePanel} from "./panels/SceneTreePanel";
import {DataModelsPanel} from "./panels/DataModelsPanel";
import {ViewModelsPanel} from "./panels/ViewModelsPanel";
import {AssetsPanel} from "./panels/AssetsPanel";

type Tab = "Layout" | "Data" | "ViewModels" | "Assets";

export function Sidebar({
                          activeTab, setTab, projectName
                        }: {
  activeTab: Tab;
  setTab: (t: Tab) => void;
  projectName: string;
}) {
  const appInitial = projectName?.[0]?.toUpperCase() || "N";

  return (
    <div className="flex flex-col h-full" role="navigation" aria-label="Primary">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between bg-cu-grey200 border-b-[1px] border-neutral-700">
        <Brand name="Noxi" initial={appInitial}/>
        <button className="text-neutral-400 hover:text-neutral-200" title="Toggle sidebar">
          <PanelLeft size={16}/>
        </button>
      </div>

      {/* Primary nav */}
      <div className="p-2 flex flex-col gap-2">
        <NavItem icon={<Layout size={16}/>} label="Layout"
                 active={activeTab === "Layout"} onClick={() => setTab("Layout")}/>
        <NavItem icon={<Database size={16}/>} label="Data"
                 active={activeTab === "Data"} onClick={() => setTab("Data")}/>
        <NavItem icon={<Link2 size={16}/>} label="ViewModels"
                 active={activeTab === "ViewModels"} onClick={() => setTab("ViewModels")}/>
        <NavItem icon={<Image size={16}/>} label="Assets"
                 active={activeTab === "Assets"} onClick={() => setTab("Assets")}/>
      </div>

      {/* divider */}
      <div className="mx-2 my-2 border-t-[1px] border-neutral-700"/>

      {/* Context panel */}
      <div className="flex-1 overflow-auto text-sm">
        {activeTab === "Layout" && <SceneTreePanel/>}
        {activeTab === "Data" && <DataModelsPanel/>}
        {activeTab === "ViewModels" && <ViewModelsPanel/>}
        {activeTab === "Assets" && <AssetsPanel/>}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800 px-3 py-2 flex items-center justify-between">
        <button className="text-sm text-neutral-300 hover:text-white flex items-center gap-2">
          <span>👥</span> Invite
        </button>
        <span className="opacity-30">|</span>
        <button className="text-sm text-neutral-300 hover:text-white flex items-center gap-2">
          <span>❔</span> Help
        </button>
      </div>
    </div>
  );
}
