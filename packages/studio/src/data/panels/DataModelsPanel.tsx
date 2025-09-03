import React, { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import Tree, { type TreeItem } from '../../ui/tree/Tree';
import { useStudio } from '../../state/useStudio';
import { ContextPanel } from '../../ui/panels/ContextPanel';

type DataRoot = { schemas: Record<string, any>; datasets: Record<string, any> };

function buildRoot(data: DataRoot): TreeItem {
  return {
    id: 'data-root',
    name: 'Data',
    type: 'folder',
    children: [
      {
        id: 'schema-root',
        name: 'Models',
        type: 'folder',
        children: Object.keys(data.schemas).map((name) => ({
          id: `schema:${name}`,
          name,
          type: 'schema',
          children: [],
        })),
      },
      {
        id: 'dataset-root',
        name: 'Datasets',
        type: 'folder',
        children: Object.keys(data.datasets).map((name) => ({
          id: `dataset:${name}`,
          name,
          type: 'dataset',
          children: [],
        })),
      },
    ],
  };
}

export function DataModelsPanel() {
  const {
    project,
    addSchema,
    addDataset,
    selectedSchema,
    setSelectedSchema,
    selectedDataset,
    setSelectedDataset,
  } = useStudio();
  const [root, setRoot] = useState<TreeItem>(() =>
    buildRoot(project.data ?? { schemas: {}, datasets: {} })
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['schema-root', 'dataset-root']));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRoot(buildRoot(project.data ?? { schemas: {}, datasets: {} }));
  }, [project.data]);

  useEffect(() => {
    if (selectedSchema) setSelected(new Set([`schema:${selectedSchema}`]));
    else if (selectedDataset) setSelected(new Set([`dataset:${selectedDataset}`]));
    else setSelected(new Set());
  }, [selectedSchema, selectedDataset]);

  const visible = useMemo(() => root.children ?? [], [root]);

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
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                onClick={() => {
                  const first = Object.keys(project.data.schemas)[0];
                  if (first) addDataset(first);
                }}
                title="Add dataset"
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
            else if (first && first.startsWith('dataset:'))
              setSelectedDataset(first.slice('dataset:'.length));
            else {
              setSelectedSchema(null);
              setSelectedDataset(null);
            }
          }}
        />
      </ContextPanel>
    );
  }
