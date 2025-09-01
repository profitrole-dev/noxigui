import React from "react";
import { useStudio } from "../../state/useStudio.ts";
import NoxiEditor from "../NoxiEditor.tsx";
import SchemaEditor from "../SchemaEditor.tsx";
import type { SchemaField } from "../../types/schema.js";

export function DataTab() {
  const { project, setData, selectedSchema, setSchemaFields } = useStudio();
  const schema = selectedSchema
    ? (project.data[selectedSchema] as SchemaField[] | undefined)
    : undefined;
  if (selectedSchema && Array.isArray(schema)) {
    return (
      <div className="p-2 overflow-auto h-full">
        <SchemaEditor
          fields={schema}
          onChange={(f) => setSchemaFields(selectedSchema, f)}
        />
      </div>
    );
  }
  return (
    <NoxiEditor
      value={JSON.stringify(project.data, null, 2)}
      onChange={(txt) => {
        try {
          setData(JSON.parse(txt));
        } catch {
          /* валидацию можно добавить */
        }
      }}
      language="json"
    />
  );
}

