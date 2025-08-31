import React from "react";
import { useStudio } from "./state/useStudio";
import { AppShell } from "./ui/AppShell";
import { Sidebar } from "./ui/Sidebar";
import { TopbarActions } from "./ui/TopbarActions";
import { TopbarTitle } from "./ui/TopbarTitle";
import { LayoutTab } from "./ui/tabs/LayoutTab";
import { DataTab } from "./ui/tabs/DataTab";
import { AssetsTab } from "./ui/tabs/AssetsTab";
import { Renderer } from "./Renderer";

type Tab = "Layout" | "Data" | "ViewModels" | "Assets";

export default function App() {
  const {
    project,
    activeTab,
    setTab,
    newProject,
    renameProject, // ← добавь в стор, если ещё нет
  } = useStudio() as any;

  const onImport = async () => { /* твой код */ };
  const onExport = () => { /* твой код */ };
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
        // слева — название с инлайновым редактированием, справа — действия
        <div className="w-full flex items-center justify-between">
          <div className="pl-1">
            <TopbarTitle
              name={project.name}
              onRename={(next) => renameProject?.(next)}
            />
          </div>
          <TopbarActions
            onRun={onRun}
            onImport={onImport}
            onExport={onExport}
            onNew={newProject}
          />
        </div>
      }
    >
      <div className="grid grid-cols-2 h-full">
        {/* левая панель с редакторами */}
        <div className="min-h-0 border-r border-neutral-800 overflow-hidden">
          {/* табы */}
          {activeTab === "Layout" && <LayoutTab/>}
          {activeTab === "Data" && <DataTab/>}
          {activeTab === "ViewModels" && <div className="p-4">ViewModels editor WIP</div>}
          {activeTab === "Assets" && <AssetsTab/>}
        </div>

        {/* правая панель с CanvasStage */}
        <div className="min-h-0 overflow-hidden">
          <div className="h-full relative">
            <Renderer/>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
