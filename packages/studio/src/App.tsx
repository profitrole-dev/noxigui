import React, { useEffect } from "react";
import { useStudio } from "./state/useStudio";
import { AppShell } from "./ui/AppShell";
import { Sidebar } from "./ui/Sidebar";
import { TopbarActions } from "./ui/TopbarActions";
import { TopbarTitle } from "./ui/TopbarTitle";
import { LayoutTab } from "./layout/LayoutTab";
import { DataTab } from "./data/DataTab";
import { AssetsTab } from "./assets/AssetsTab";
import { ViewModelsTab } from "./viewmodels/ViewModelsTab";
import { Renderer } from "./layout/components/Renderer";
import { SplitContainer } from "./ui/SplitContainer";
import { SplitWindow } from "./ui/SplitWindow";

type Tab = "Layout" | "Data" | "ViewModels" | "Assets";

export default function App() {
  const { hydrate } = useStudio();

  useEffect(() => {
    hydrate(); // восстановить проект и ассеты из IndexedDB
  }, [hydrate]);


  const {
    project,
    activeTab,
    setTab,
    newProject,
    renameProject, // ← добавь в стор, если ещё нет
    undo,
    redo,
  } = useStudio() as any;

  useEffect(() => {
    const isTextInput = (el: any) =>
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable ||
      el.closest?.('.monaco-editor');
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (isTextInput(e.target as HTMLElement)) return;
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

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
      <SplitContainer>
        <SplitWindow>
          {activeTab === "Layout" && <LayoutTab />}
          {activeTab === "Data" && <DataTab />}
          {activeTab === "ViewModels" && <ViewModelsTab />}
          {activeTab === "Assets" && <AssetsTab />}
        </SplitWindow>
        <SplitWindow>
          <div className="h-full relative">
            <Renderer/>
          </div>
        </SplitWindow>
      </SplitContainer>
    </AppShell>
  );
}
