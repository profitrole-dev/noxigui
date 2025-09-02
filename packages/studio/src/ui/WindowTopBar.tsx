import React from "react";

export function WindowTopBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-12 px-3 flex items-center justify-between bg-[rgb(var(--cu-topbar))] border-b-[1px] border-[rgb(var(--cu-border))]">
      {children}
    </div>
  );
}

export default WindowTopBar;
