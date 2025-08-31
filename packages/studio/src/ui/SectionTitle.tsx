import React from "react";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs uppercase tracking-wider text-neutral-400">
      {children}
    </div>
  );
}
