import {useStudio} from "../../state/useStudio.ts";
import React from "react";
import NoxiEditor from "../NoxiEditor";


export function LayoutTab() {
  const { project, setLayout } = useStudio();
  return (
    <NoxiEditor
      value={project.layout}
      onChange={setLayout}
      language="xml"
      height="100%"
    />
  );
}
