import React from "react";

export function ViewModelsPanel() {
  return (
    <div className="p-2 text-sm">
      <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide">ViewModels</div>
      <ul className="px-2 py-1 space-y-1">
        {["InboxVM","BoardVM","PlayerHUDVM"].map((n,i)=>(
          <li key={i} className="px-2 py-1 rounded hover:bg-neutral-800/50 cursor-default">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
