import React from "react";
import {useStudio} from "../../state/useStudio.ts";
import NoxiEditor from "../NoxiEditor.tsx";

export function DataTab() {
  const { project, setData } = useStudio();
  return (
    <NoxiEditor
      value={JSON.stringify(project.data, null, 2)}
      onChange={(txt) => {
        try { setData(JSON.parse(txt)); } catch {/* валидацию можно добавить */}
      }}
      language="json"
    />
  );
}

