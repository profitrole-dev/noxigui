import React from "react";

export function DataModelsPanel() {
  return (
    <div className="p-2 text-sm">
      <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide">Models</div>
      <ul className="px-2 py-1 space-y-1">
        {["User","Task","Project"].map((n,i)=>(
          <li key={i} className="px-2 py-1 rounded hover:bg-neutral-800/50 cursor-default">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
