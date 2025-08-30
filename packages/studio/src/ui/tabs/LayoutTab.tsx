import React from "react";
import MonacoEditor from "react-monaco-editor";
import {useStudio} from "../../state/useStudio.ts";

export function LayoutTab() {
  const { project, setLayout } = useStudio();
  return (
    <MonacoEditor
      language="xml"
      value={project.layout}
      onChange={(v) => setLayout(v)}
      options={{ minimap: { enabled: false }, fontSize: 14 }}
      width="100%"
      height="100%"
    />
  );
}

