import React from "react";
import { useStudio } from "./state/useStudio";
import { CodeTab } from "./tabs/CodeTab";
import { DataTab } from "./tabs/DataTab";
import { AssetsTab } from "./tabs/AssetsTab";
import { Renderer } from "./Renderer";
import {
  CodeBracketIcon,
  RectangleStackIcon,
  PhotoIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

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
    <div className="w-screen h-screen flex bg-base-100 text-base-content">
      {/* Left Toolbar */}
      <div className="w-14 border-r border-base-300 flex flex-col gap-2 p-2 bg-base-200">
        <button onClick={() => setTab("Code")} title="Code" className="btn btn-square btn-ghost btn-sm">
          <CodeBracketIcon className="w-5 h-5" />
        </button>
        <button onClick={() => setTab("Data")} title="Data" className="btn btn-square btn-ghost btn-sm">
          <RectangleStackIcon className="w-5 h-5" />
        </button>
        <button onClick={() => setTab("Assets")} title="Assets" className="btn btn-square btn-ghost btn-sm">
          <PhotoIcon className="w-5 h-5" />
        </button>
        <button onClick={onRun} title="Run" className="btn btn-square btn-ghost btn-sm">
          <PlayIcon className="w-5 h-5" />
        </button>
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={onImport} title="Import" className="btn btn-square btn-ghost btn-sm">
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button onClick={onExport} title="Export" className="btn btn-square btn-ghost btn-sm">
            <ArrowUpTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 grid grid-rows-[auto_1fr]">
        <div className="h-10 border-b border-base-300 flex items-center px-3 justify-end bg-base-200">
          <div className="flex items-center gap-2">
            <div className="text-sm opacity-80">{project.name}</div>
            <button className="btn btn-primary btn-sm" onClick={newProject}>
              New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="border-r border-base-300 overflow-hidden">
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
