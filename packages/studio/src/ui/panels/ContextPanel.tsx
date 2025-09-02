import React from "react";
import { WindowTopBar } from "../WindowTopBar";

export function ContextPanel({
  topbar,
  children,
}: {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="context-panel">
      {topbar && <WindowTopBar>{topbar}</WindowTopBar>}
      {children}
    </div>
  );
}
