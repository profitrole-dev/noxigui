import React from "react";
import { ContextPanel } from "../../ui/panels/ContextPanel";

export function ViewModelsPanel() {
  return (
    <ContextPanel topbar={<span>ViewModels</span>}>
      <ul className="px-2 py-1 space-y-1">
        {["InboxVM", "BoardVM", "PlayerHUDVM"].map((n, i) => (
          <li
            key={i}
            className="px-2 py-1 rounded hover:bg-neutral-800/50 cursor-default"
          >
            {n}
          </li>
        ))}
      </ul>
    </ContextPanel>
  );
}
