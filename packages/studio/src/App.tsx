import React from "react";
import { useStudio } from "./state/useStudio";
import { CodeTab } from "./tabs/CodeTab";
import { DataTab } from "./tabs/DataTab";
import { AssetsTab } from "./tabs/AssetsTab";
import { Renderer } from "./Renderer";

export default function App() {
  const { project, activeTab, setTab, exportProject, loadProject, newProject } = useStudio();

  const onImport = async () => {
    const inp = document.createElement("input");
    inp.type = "file";
    const file: File = await new Promise((res) => {
      inp.onchange = () => res(inp.files![0]);
      inp.click();
    });
    const json = JSON.parse(await file.text());
    loadProject(json);
  };

  const onExport = () => {
    const blob = new Blob([exportProject()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.noxiproject";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onRun = () => {
    console.log("run");
  };

  return (
    <div className="w-screen h-screen flex bg-neutral-950 text-neutral-200">
      {/* Left Toolbar */}
      <div className="w-14 border-r border-neutral-800 flex flex-col gap-2 p-2">
        <button onClick={() => setTab("Code")} title="Code">{"</>"}</button>
        <button onClick={() => setTab("Data")} title="Data">{"{ }"}</button>
        <button onClick={() => setTab("Assets")} title="Assets">🖼️</button>
        <button onClick={onRun} title="Run">▶️</button>
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={onImport} title="Import">📥</button>
          <button onClick={onExport} title="Export">📤</button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 grid grid-rows-[auto_1fr]">
        <div className="h-10 border-b border-neutral-800 flex items-center px-3 justify-between">
          <div className="flex gap-3">
            <TabButton label="Code" active={activeTab === "Code"} onClick={() => setTab("Code")} />
            <TabButton label="Data" active={activeTab === "Data"} onClick={() => setTab("Data")} />
            <TabButton label="Assets" active={activeTab === "Assets"} onClick={() => setTab("Assets")} />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm opacity-80">{project.name}</div>
            <button
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
              onClick={newProject}
            >
              New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="border-r border-neutral-800 overflow-hidden">
            {activeTab === "Code" && <CodeTab />}
            {activeTab === "Data" && <DataTab />}
            {activeTab === "Assets" && <AssetsTab />}
          </div>
          <div className="overflow-hidden">
            <Renderer />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`px-3 py-1 rounded ${active ? "bg-neutral-800" : "hover:bg-neutral-900"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

