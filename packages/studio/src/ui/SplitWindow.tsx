import React from "react";
import { WindowTopBar } from "./WindowTopBar";

export function SplitWindow({
                             topbar,
                             children,
                           }: {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {topbar && <WindowTopBar>{topbar}</WindowTopBar>}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
