import React from 'react'
import { SplitPane } from './SplitPane'

export function AppShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: React.ReactNode
  topbar?: React.ReactNode // оставим как есть — внутрь передадим уже готовый flex
  children: React.ReactNode
}) {
  return (
    <SplitPane
      storageKey="AppShell.sidebarWidth"
      defaultLeftWidth={260}
      className="w-screen h-screen bg-[rgb(var(--cu-grey100))] text-neutral-200"
      left={
        <aside className="flex flex-col bg-[rgb(var(--cu-grey200))] border-r-[1px] border-[rgb(var(--cu-border))]">
          {sidebar}
        </aside>
      }
      right={
        <main className="grid grid-rows-[48px_1fr] min-h-0">
          <div className="h-12 px-3 flex items-center justify-between bg-[rgb(var(--cu-topbar))] border-b-[1px] border-[rgb(var(--cu-border))]">
            {topbar}
          </div>
          <div className="min-h-0 overflow-hidden">{children}</div>
        </main>
      }
    />
  )
}
