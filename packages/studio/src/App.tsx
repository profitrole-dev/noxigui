import React, { useEffect } from 'react'
import { useStudio } from './state/useStudio'
import { AppShell } from './ui/AppShell'
import { Sidebar } from './ui/Sidebar'
import { TopbarActions } from './ui/TopbarActions'
import { TopbarTitle } from './ui/TopbarTitle'
import { LayoutTab } from './ui/tabs/LayoutTab'
import { DataTab } from './ui/tabs/DataTab'
import { AssetsTab } from './ui/tabs/AssetsTab'
import { Renderer } from './Renderer'
import { SplitPane } from './ui/SplitPane'

type Tab = 'Layout' | 'Data' | 'ViewModels' | 'Assets'

export default function App() {
  const { hydrate } = useStudio()

  useEffect(() => {
    hydrate() // восстановить проект и ассеты из IndexedDB
  }, [hydrate])

  const {
    project,
    activeTab,
    setTab,
    newProject,
    renameProject, // ← добавь в стор, если ещё нет
    undo,
    redo,
  } = useStudio() as any

  useEffect(() => {
    const isTextInput = (el: any) =>
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable ||
      el.closest?.('.monaco-editor')
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (isTextInput(e.target as HTMLElement)) return
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const onImport = async () => {
    /* твой код */
  }
  const onExport = () => {
    /* твой код */
  }
  const onRun = () => console.log('run')

  const defaultEditorWidth =
    typeof window !== 'undefined' ? window.innerWidth / 2 : 600

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
      <SplitPane
        storageKey="App.mainSplit"
        defaultLeftWidth={defaultEditorWidth}
        className="h-full"
        left={
          <div className="min-h-0 overflow-hidden">
            {/* левая панель с редакторами */}
            {activeTab === 'Layout' && <LayoutTab />}
            {activeTab === 'Data' && <DataTab />}
            {activeTab === 'ViewModels' && (
              <div className="p-4">ViewModels editor WIP</div>
            )}
            {activeTab === 'Assets' && <AssetsTab />}
          </div>
        }
        right={
          <div className="min-h-0 overflow-hidden">
            {/* правая панель с CanvasStage */}
            <div className="h-full relative">
              <Renderer />
            </div>
          </div>
        }
      />
    </AppShell>
  )
}
