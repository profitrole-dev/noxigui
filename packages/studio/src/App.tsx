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
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export default function App() {
  const { project, activeTab, setTab, exportProject, loadProject } = useStudio();

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

  const onNew = () => {
    console.log("new project");
  };

  return (
    <div className="w-screen h-screen grid grid-rows-[48px_1fr] bg-base-100 text-base-content">
      {/* Topbar */}
      <header className="bg-base-200 border-b border-base-300 flex items-center px-3">
        <span className="font-semibold">Noxi <span className="opacity-70">0.1</span></span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm opacity-80">{project.name}</span>
          <button className="btn btn-sm btn-primary" onClick={onNew}>
            New
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="grid" style={{ gridTemplateColumns: "56px 1fr" }}>
        {/* Left toolbar */}
        <aside className="bg-base-200 border-r border-base-300 flex flex-col items-center pt-4 pb-3 gap-2">
          <IconBtn label="Code" active={activeTab === "Code"} onClick={() => setTab("Code")}>
            <CodeBracketIcon className="w-5 h-5" />
          </IconBtn>
          <IconBtn label="Data" active={activeTab === "Data"} onClick={() => setTab("Data")}>
            <RectangleStackIcon className="w-5 h-5" />
          </IconBtn>
          <IconBtn label="Assets" active={activeTab === "Assets"} onClick={() => setTab("Assets")}>
            <PhotoIcon className="w-5 h-5" />
          </IconBtn>
          <div className="mt-auto flex flex-col gap-2">
            <IconBtn label="Import" onClick={onImport}>
              <ArrowDownTrayIcon className="w-5 h-5" />
            </IconBtn>
            <IconBtn label="Export" onClick={onExport}>
              <ArrowUpTrayIcon className="w-5 h-5" />
            </IconBtn>
          </div>
        </aside>

        {/* Main area */}
        <div className="grid grid-cols-2">
          <section className="border-r border-base-300 overflow-hidden">
            {activeTab === "Code" && <CodeTab />}
            {activeTab === "Data" && <DataTab />}
            {activeTab === "Assets" && <AssetsTab />}
          </section>
          <section className="overflow-hidden bg-base-200">
            <Renderer />
          </section>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-base-300 ${
        active ? "bg-base-300 text-primary" : "text-base-content"
      }`}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
