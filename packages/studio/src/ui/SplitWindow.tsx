import React from "react";

export function SplitWindow({
                             topbar,
                             children,
                           }: {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {topbar && (
        <div className="border-b border-neutral-800 px-2 py-1">
          {topbar}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
