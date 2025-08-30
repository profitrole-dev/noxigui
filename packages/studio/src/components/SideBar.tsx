import React from "react";
import {
  CodeBracketIcon,
  RectangleStackIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { ToolbarButton } from "./ToolbarButton";
import type { Tab } from "../state/useStudio";

export function SideBar({
  activeTab,
  setTab,
  onImport,
  onExport,
}: {
  activeTab: Tab;
  setTab: (t: Tab) => void;
  onImport: () => void;
  onExport: () => void;
}) {
  return (
    <aside className="bg-base-200 border-r border-base-300 flex flex-col items-center pt-4 pb-3 gap-2" style={{width:'var(--sidebar-width)'}}>
      <ToolbarButton label="Code" active={activeTab === "Code"} onClick={() => setTab("Code")}>
        <CodeBracketIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton label="Data" active={activeTab === "Data"} onClick={() => setTab("Data")}>
        <RectangleStackIcon className="w-5 h-5" />
      </ToolbarButton>
      <ToolbarButton label="Assets" active={activeTab === "Assets"} onClick={() => setTab("Assets")}>
        <PhotoIcon className="w-5 h-5" />
      </ToolbarButton>
      <div className="mt-auto flex flex-col gap-2">
        <ToolbarButton label="Import" onClick={onImport}>
          <ArrowDownTrayIcon className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton label="Export" onClick={onExport}>
          <ArrowUpTrayIcon className="w-5 h-5" />
        </ToolbarButton>
      </div>
    </aside>
  );
}
