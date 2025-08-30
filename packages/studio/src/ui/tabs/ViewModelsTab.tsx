import React from "react";
import MonacoEditor from "react-monaco-editor";
import {useStudio} from "../../state/useStudio.ts";


export function ViewModelsTab() {
  const { project, setData } = useStudio();
  return (
    <MonacoEditor
      language="json"
      value={JSON.stringify(project.data, null, 2)}
      onChange={(v) => {
        try {
          setData(JSON.parse(v));
        } catch {}
      }}
      options={{ minimap: { enabled: false }, fontSize: 14 }}
      width="100%"
      height="100%"
    />
  );
}

