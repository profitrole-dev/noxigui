import { TopbarActions } from "./ui/TopbarActions";
import { Sidebar } from "./ui/Sidebar";
import React from "react";
import {AppShell} from "./ui/AppShell.tsx";
import {useStudio} from "./state/useStudio.ts";
import {LayoutTab} from "./ui/tabs/LayoutTab.tsx";
import {DataTab} from "./ui/tabs/DataTab.tsx";
import {AssetsTab} from "./ui/tabs/AssetsTab.tsx";
import {ViewModelsTab} from "./ui/tabs/ViewModelsTab.tsx";
import {Renderer} from "./Renderer.tsx";
type Tab = "Layout" | "Data" | "ViewModels" | "Assets";

export default function App() {
  const { project, activeTab, setTab, newProject } = useStudio() as any;

  const onImport = async () => { /* как у тебя */ };
  const onExport = () => { /* как у тебя */ };
  const onRun = () => console.log("run");

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeTab={activeTab as Tab}
          setTab={setTab as (t: Tab) => void}
          projectName={project.name}
        />
      }
      topbar={
        <TopbarActions
          onRun={onRun}
          onImport={onImport}
          onExport={onExport}
          onNew={newProject}
        />
      }
    >
      <div className="grid grid-cols-2 h-full">
        <div className="border-r border-neutral-800 overflow-hidden">
          {activeTab === "Layout"     && <LayoutTab/>}       {/* временно используем твой LayoutTab */}
          {activeTab === "Data"       && <DataTab/>}
          {activeTab === "ViewModels" && <ViewModelsTab/>}
          {activeTab === "Assets"     && <AssetsTab/>}
        </div>
        <div className="overflow-hidden">
          <Renderer/>
        </div>
      </div>
    </AppShell>
  );
}
