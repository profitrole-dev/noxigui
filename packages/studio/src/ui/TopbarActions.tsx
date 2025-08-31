import React from "react";

import { Play, Download, Upload, Plus } from "lucide-react";

export function TopbarActions({
                                onRun, onImport, onExport, onNew
                              }: {
  onRun: ()=>void; onImport: ()=>void; onExport: ()=>void; onNew: ()=>void;
}) {
  const btn = "h-8 px-2 rounded-md border border-neutral-700 bg-cu-grey200 hover:bg-neutral-700/40";
  const icon = "w-4 h-4";
  return (
    <div className="flex items-center gap-2">
      <button className={btn} title="Run" onClick={onRun}><Play className={icon}/></button>
      <button className={btn} title="Import" onClick={onImport}><Download className={icon}/></button>
      <button className={btn} title="Export" onClick={onExport}><Upload className={icon}/></button>
      <button className={btn} title="New" onClick={onNew}><Plus className={icon}/></button>
    </div>
  );
}
