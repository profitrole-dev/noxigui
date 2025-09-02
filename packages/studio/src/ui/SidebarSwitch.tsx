import React from "react";
import { NavItem } from "./NavItem";
import { Layout, Database, Link2, Image } from "lucide-react";
import type { Tab } from "./Sidebar";

export function SidebarSwitch({
  activeTab,
  setTab,
}: {
  activeTab: Tab;
  setTab: (t: Tab) => void;
}) {
  return (
    <div className="sidebar-nav">
      <NavItem
        icon={<Layout size={16} />}
        label="Layout"
        active={activeTab === "Layout"}
        onClick={() => setTab("Layout")}
      />
      <NavItem
        icon={<Database size={16} />}
        label="Data"
        active={activeTab === "Data"}
        onClick={() => setTab("Data")}
      />
      <NavItem
        icon={<Link2 size={16} />}
        label="ViewModels"
        active={activeTab === "ViewModels"}
        onClick={() => setTab("ViewModels")}
      />
      <NavItem
        icon={<Image size={16} />}
        label="Assets"
        active={activeTab === "Assets"}
        onClick={() => setTab("Assets")}
      />
    </div>
  );
}
