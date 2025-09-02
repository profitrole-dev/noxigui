import React, { useEffect, useState } from "react";
import { Plus, Braces, Table } from "lucide-react";
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

    const handleFieldsChange = (f: SchemaField[]) => {
      const filtered = f.filter(
        (r) => r.key || r.type || (r.default ?? "") !== "",
      );
      setSchemaFields(selectedSchema, filtered);
    };

    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-[rgb(var(--cu-border))] bg-[rgb(var(--cu-grey200))] flex items-center justify-end shadow-sm">
          <div className="flex border border-[rgb(var(--cu-border))] rounded-sm overflow-hidden">
            <button
              className={[
                "h-7 w-7 grid place-items-center",
                mode === "table"
                  ? "bg-[#2C1A75] text-[#A89FFF]"
                  : "bg-[rgb(var(--cu-topbar))] hover:bg-[rgb(var(--cu-grey200))] text-neutral-300",
              ].join(" ")}
              onClick={() => setMode("table")}
              title="Table view"
            >
              <Table size={14} />
            </button>
            <button
              className={[
                "h-7 w-7 grid place-items-center",
                mode === "json"
                  ? "bg-[#2C1A75] text-[#A89FFF]"
                  : "bg-[rgb(var(--cu-topbar))] hover:bg-[rgb(var(--cu-grey200))] text-neutral-300",
              ].join(" ")}
              onClick={() => setMode("json")}
              title="JSON view"
            >
              <Braces size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {mode === "table" ? (
            <SchemaEditor fields={schema} onChange={handleFieldsChange} />
          ) : (
            <NoxiEditor
              className="flex-1"
              value={json}
              onChange={handleJsonChange}
              language="json"
            />
          )}
        </div>
      </div>
    );
  }
  return null;
}

