import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Tree, { type TreeItem } from '../tree/Tree';
import { useStudio } from '../../state/useStudio';

function buildRoot(data: Record<string, any>): TreeItem {
  return {
    id: 'data-root',
    name: 'Data',
    type: 'data',
    children: Object.keys(data).map((name) => ({
      id: `schema:${name}`,
      name,
      type: 'schema',
      children: [],
    })),
  };
}

export function DataModelsPanel() {
  const { project, addSchema, selectedSchema, setSelectedSchema, renameSchema } = useStudio();
  const [root, setRoot] = useState<TreeItem>(() => buildRoot(project.data));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['data-root']));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRoot(buildRoot(project.data));
  }, [project.data]);

  useEffect(() => {
    if (selectedSchema) setSelected(new Set([`schema:${selectedSchema}`]));
    else setSelected(new Set());
  }, [selectedSchema]);

  const visible = useMemo(() => [root], [root]);

  return (
    <div className="h-full overflow-auto p-2 text-sm">
      <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide flex items-center justify-between">
        <span>Data</span>
        <button
          className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
          onClick={addSchema}
          title="Add schema"
        >
          <Plus size={14} />
        </button>
      </div>
      <Tree
        items={visible}
        expanded={expanded}
        selected={selected}
        onToggle={(id) =>
          setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          })
        }
        onSelect={(next) => {
          setSelected(next);
          const first = Array.from(next)[0];
          if (first && first.startsWith('schema:'))
            setSelectedSchema(first.slice('schema:'.length));
          else setSelectedSchema(null);
        }}
        onRename={(id, nextName) => {
          if (id.startsWith('schema:'))
            renameSchema(id.slice('schema:'.length), nextName);
        }}
      />
    </div>
  );
}
