import React from "react";
import { PlusIcon, SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { ToolbarButton } from "./ToolbarButton";

export function TopBar({
  projectName,
  onNew,
}: {
  projectName: string;
  onNew: () => void;
}) {
  const [theme, setTheme] = React.useState(
    () => document.documentElement.dataset.theme || "cappuccin"
  );

  const toggleTheme = () => {
    const next = theme === "cappuccin" ? "light" : "cappuccin";
    document.documentElement.dataset.theme = next;
    setTheme(next);
  };

  return (
    <header className="bg-base-200 border-b border-base-300 flex items-center px-3 shadow-subtle" style={{height:'var(--header-height)'}}>
      <span className="font-semibold">Noxi <span className="opacity-70">0.1</span></span>
      <div className="ml-auto flex items-center gap-2">
        <ToolbarButton label="Toggle theme" onClick={toggleTheme}>
          {theme === "cappuccin" ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </ToolbarButton>
        <span className="text-sm opacity-80">{projectName}</span>
        <button className="btn btn-sm btn-primary flex items-center gap-1" onClick={onNew}>
          <PlusIcon className="w-4 h-4" />
          New
        </button>
      </div>
    </header>
  );
}
