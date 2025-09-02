import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useStudio } from "../../state/useStudio.ts";
import SchemaEditor from "../SchemaEditor.tsx";
import NoxiEditor from "../NoxiEditor.tsx";
import type { SchemaField } from "../../types/schema.js";

export function DataTab() {
  const { project, selectedSchema, addSchema, setSchemaFields } = useStudio();
  const data = project.data;
  const [mode, setMode] = useState<"table" | "json">("table");
  const [json, setJson] = useState("");

  useEffect(() => {
    if (selectedSchema && Array.isArray(data[selectedSchema])) {
      setJson(JSON.stringify(data[selectedSchema], null, 2));
    }
  }, [selectedSchema, data]);

  if (Object.keys(data).length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <button
          className="inline-flex items-center gap-1 px-3 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
          onClick={addSchema}
        >
          <Plus size={14} /> Create schema
        </button>
      </div>
    );
  }

  const schema = selectedSchema
    ? (data[selectedSchema] as SchemaField[] | undefined)
    : undefined;
  if (selectedSchema && Array.isArray(schema)) {
    const handleJsonChange = (v: string) => {
      setJson(v);
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed))
          setSchemaFields(selectedSchema, parsed as SchemaField[]);
      } catch {
        // ignore parse errors
      }
    };

    return (
      <div className="p-2 h-full flex flex-col">
        <div className="flex justify-end mb-2">
          <button
            className="px-2 py-1 text-sm rounded bg-neutral-700 hover:bg-neutral-600"
            onClick={() => setMode(mode === "table" ? "json" : "table")}
          >
            {mode === "table" ? "JSON" : "Table"} view
          </button>
        </div>
        {mode === "table" ? (
          <SchemaEditor
            fields={schema}
            onChange={(f) => setSchemaFields(selectedSchema, f)}
          />
        ) : (
          <NoxiEditor
            className="flex-1"
            value={json}
            onChange={handleJsonChange}
            language="json"
          />
        )}
      </div>
    );
  }
  return null;
}

