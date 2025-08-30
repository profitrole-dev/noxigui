import React from "react";
import { useStudio } from "./state/useStudio";
import { TopBar } from "./components/TopBar";
import { SideBar } from "./components/SideBar";
import { MainPane } from "./components/MainPane";

export default function App() {
  const { project, activeTab, setTab, exportProject, loadProject, newProject } =
    useStudio();

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

  return (
    <div
      className="w-screen h-screen grid bg-base-100 text-base-content"
      style={{ gridTemplateColumns: "var(--sidebar-width) 1fr" }}
    >
      <SideBar
        activeTab={activeTab}
        setTab={setTab}
        onImport={onImport}
        onExport={onExport}
      />
      <div className="grid" style={{ gridTemplateRows: "var(--header-height) 1fr" }}>
        <TopBar projectName={project.name} onNew={newProject} />
        <MainPane activeTab={activeTab} />
      </div>
    </div>
  );
}
