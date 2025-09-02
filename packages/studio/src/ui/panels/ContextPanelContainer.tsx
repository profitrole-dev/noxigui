import React from "react";

export function ContextPanelContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="context-panel-container">{children}</div>;
}
