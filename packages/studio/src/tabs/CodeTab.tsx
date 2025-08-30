import React from "react";
import { useStudio } from "../state/useStudio";

export function CodeTab() {
  const { project, setLayout } = useStudio();
  return (
    <textarea
      className="w-full h-full p-3 bg-base-100 text-base-content font-mono text-sm"
      value={project.layout}
      onChange={(e) => setLayout(e.target.value)}
      spellCheck={false}
    />
  );
}

