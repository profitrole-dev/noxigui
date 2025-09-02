import React from "react";

export function ContextPanel({
  topbar,
  children,
}: {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="context-panel">
      {topbar && <div className="context-panel-topbar">{topbar}</div>}
      <div className="context-panel-body">{children}</div>
    </div>
  );
}
