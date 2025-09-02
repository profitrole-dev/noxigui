import React from "react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarSwitch } from "./SidebarSwitch";
import { SidebarSeparator } from "./SidebarSeparator";
import { SceneTreePanel } from "./panels/SceneTreePanel";
import { DataModelsPanel } from "./panels/DataModelsPanel";
import { ViewModelsPanel } from "./panels/ViewModelsPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { ContextPanelContainer } from "./panels/ContextPanelContainer";

export type Tab = "Layout" | "Data" | "ViewModels" | "Assets";

export function Sidebar({
  activeTab,
  setTab,
  projectName,
}: {
  activeTab: Tab;
  setTab: (t: Tab) => void;
  projectName: string;
}) {
  const appInitial = projectName?.[0]?.toUpperCase() || "N";

  return (
    <div className="sidebar" role="navigation" aria-label="Primary">
      <SidebarLogo initial={appInitial} />
      <SidebarSwitch activeTab={activeTab} setTab={setTab} />
      <SidebarSeparator />
      <ContextPanelContainer>
        {activeTab === "Layout" && <SceneTreePanel />}
        {activeTab === "Data" && <DataModelsPanel />}
        {activeTab === "ViewModels" && <ViewModelsPanel />}
        {activeTab === "Assets" && <AssetsPanel />}
      </ContextPanelContainer>
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
