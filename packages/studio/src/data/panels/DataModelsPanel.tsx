import React, { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import Tree, { type TreeItem } from '../../ui/tree/Tree';
import { useStudio } from '../../state/useStudio';
import { ContextPanel } from '../../ui/panels/ContextPanel';

function buildRoot(data: Record<string, any>): TreeItem {
  return {
    id: 'schema-root',
    name: 'Schemas',
    type: 'folder',
    children: Object.keys(data).map((name) => ({
      id: `schema:${name}`,
      name,
      type: 'schema',
      children: [],
    })),
  };
}

export function DataModelsPanel() {
  const { project, addSchema, selectedSchema, setSelectedSchema } = useStudio();
  const [root, setRoot] = useState<TreeItem>(() => buildRoot(project.data));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['schema-root']));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRoot(buildRoot(project.data));
  }, [project.data]);

  useEffect(() => {
    if (selectedSchema) setSelected(new Set([`schema:${selectedSchema}`]));
    else setSelected(new Set());
  }, [selectedSchema]);

  const visible = useMemo(() => [root], [root]);

  const collectIds = (it: TreeItem): Set<string> => {
    const ids = new Set<string>();
    const walk = (node: TreeItem) => {
      ids.add(node.id);
      node.children?.forEach(walk);
    };
    walk(it);
    return ids;
  };

  const allIds = useMemo(() => collectIds(root), [root]);
  const expandAll = () => setExpanded(new Set(allIds));
  const collapseAll = () => setExpanded(new Set());

    return (
      <ContextPanel
        topbar={
          <>
            <span>Data</span>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                onClick={expandAll}
                title="Expand all"
              >
                <ChevronsUpDown size={14} />
              </button>
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                onClick={collapseAll}
                title="Collapse all"
              >
                <ChevronsDownUp size={14} />
              </button>
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                onClick={addSchema}
                title="Add schema"
              >
                <Plus size={14} />
              </button>
            </div>
          </>
        }
      >
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
        />
      </ContextPanel>
    );
  }
