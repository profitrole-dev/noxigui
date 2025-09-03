import React from "react";
import { Plus } from "lucide-react";
import { useStudio } from "../state/useStudio";
import SchemaEditor from "./components/SchemaEditor";
import type { SchemaField } from "./types/schema.js";

export function DataTab() {
  const { project, selectedSchema, selectedDataset, addSchema, setSchemaFields } =
    useStudio();
  const schemas = project.data.schemas;

  if (
    Object.keys(schemas).length === 0 &&
    Object.keys(project.data.datasets ?? {}).length === 0
  ) {
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
    ? (schemas[selectedSchema] as SchemaField[] | undefined)
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
  if (selectedDataset) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400">
        Dataset editor not implemented
      </div>
    );
  }
  return null;
}

