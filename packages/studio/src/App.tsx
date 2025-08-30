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

  const onRun = () => {
    console.log("run");
  };

  return (
    <div
      className="w-screen h-screen grid bg-base-100 text-base-content"
      style={{ gridTemplateColumns: "56px 1fr" }}
    >
      {/* Left toolbar */}
      <aside className="bg-base-200 border-r border-base-300 flex flex-col items-center py-2 gap-2">
        <IconBtn label="Code" onClick={() => setTab("Code")}>
          <CodeBracketIcon className="w-5 h-5" />
        </IconBtn>
        <IconBtn label="Data" onClick={() => setTab("Data")}>
          <RectangleStackIcon className="w-5 h-5" />
        </IconBtn>
        <IconBtn label="Assets" onClick={() => setTab("Assets")}>
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
      <div className="grid grid-rows-[48px_1fr]">
        {/* Topbar */}
        <header className="bg-base-200 border-b border-base-300 flex items-center px-3">
          <div className="tabs tabs-boxed bg-base-300 p-1">
            <a
              className={`tab tab-sm ${activeTab === "Code" ? "tab-active" : ""}`}
              onClick={() => setTab("Code")}
            >
              Code
            </a>
            <a
              className={`tab tab-sm ${activeTab === "Data" ? "tab-active" : ""}`}
              onClick={() => setTab("Data")}
            >
              Data
            </a>
            <a
              className={`tab tab-sm ${activeTab === "Assets" ? "tab-active" : ""}`}
              onClick={() => setTab("Assets")}
            >
              Assets
            </a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn btn-sm btn-ghost">{project.name}</button>
            <button className="btn btn-sm btn-primary" onClick={onRun}>
              Run
            </button>
          </div>
        </header>

        {/* Split: editor | render */}
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
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="btn btn-square btn-ghost hover:bg-base-300"
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
