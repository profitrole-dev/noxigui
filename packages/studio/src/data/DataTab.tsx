import React from "react";
import { Plus } from "lucide-react";
import { useStudio } from "../state/useStudio";
import SchemaEditor from "./components/SchemaEditor";
import DatasetEditor from "./components/DatasetEditor";
import type { SchemaField } from "./types/schema.js";

export function DataTab() {
  const {
    project,
    selectedSchema,
    selectedDataset,
    addSchema,
    setSchemaFields,
    addDataset,
    setDatasetRows,
  } = useStudio();
  const data = project.data;

  if (
    Object.keys(data.schemas).length === 0 &&
    Object.keys(data.datasets).length === 0
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <button
          className="inline-flex items-center gap-1 px-3 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
          onClick={addSchema}
        >
          <Plus size={14} /> Create schema
        </button>
        <button
          className="ml-2 inline-flex items-center gap-1 px-3 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
          onClick={() => {
            const first = Object.keys(data.schemas)[0];
            if (first) addDataset(first);
          }}
        >
          <Plus size={14} /> Create dataset
        </button>
      </div>
    );
  }

  const schema = selectedSchema
    ? (data.schemas[selectedSchema] as SchemaField[] | undefined)
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

  const dataset = selectedDataset
    ? project.data.datasets[selectedDataset]
    : undefined;
  if (selectedDataset && dataset) {
    const schema = project.data.schemas[dataset.schemaRef] as SchemaField[];
    return (
      <div className="p-2 overflow-auto h-full">
        <DatasetEditor
          schema={schema}
          rows={dataset.rows}
          onChange={(rows) => setDatasetRows(selectedDataset, rows)}
        />
      </div>
    );
  }
  return null;
}

