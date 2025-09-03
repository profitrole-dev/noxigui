import React, { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import Tree, { type TreeItem } from '../../ui/tree/Tree';
import { useStudio } from '../../state/useStudio';
import { ContextPanel } from '../../ui/panels/ContextPanel';

function buildRoots(data: { schemas: Record<string, any>; datasets: Record<string, any> }): TreeItem[] {
  return [
    {
      id: 'schemas-root',
      name: 'Schemas',
      type: 'folder',
      children: Object.keys(data.schemas ?? {}).map((name) => ({
        id: `schema:${name}`,
        name,
        type: 'schema',
        children: [],
      })),
    },
    {
      id: 'datasets-root',
      name: 'DataSet',
      type: 'folder',
      children: Object.keys(data.datasets ?? {}).map((name) => ({
        id: `dataset:${name}`,
        name,
        type: 'dataset',
        children: [],
      })),
    },
  ];
}

export function DataModelsPanel() {
  const {
    project,
    addSchema,
    addDataset,
    selectedSchema,
    selectedDataset,
    setSelectedSchema,
    setSelectedDataset,
    renameSchema,
    renameDataset,
    deleteSchema,
    deleteDataset,
  } = useStudio();
  const [roots, setRoots] = useState<TreeItem[]>(() => buildRoots(project.data));
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['schemas-root', 'datasets-root'])
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRoots(buildRoots(project.data));
  }, [project.data]);

  useEffect(() => {
    if (selectedSchema) setSelected(new Set([`schema:${selectedSchema}`]));
    else if (selectedDataset) setSelected(new Set([`dataset:${selectedDataset}`]));
    else setSelected(new Set());
  }, [selectedSchema, selectedDataset]);

  const visible = useMemo(() => roots, [roots]);

  const collectIds = (arr: TreeItem[]): Set<string> => {
    const ids = new Set<string>();
    const walk = (node: TreeItem) => {
      ids.add(node.id);
      node.children?.forEach(walk);
    };
    arr.forEach(walk);
    return ids;
  };

  const allIds = useMemo(() => collectIds(roots), [roots]);
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
          if (first && first.startsWith('schema:')) {
            setSelectedSchema(first.slice('schema:'.length));
            setSelectedDataset(null);
          } else if (first && first.startsWith('dataset:')) {
            setSelectedDataset(first.slice('dataset:'.length));
            setSelectedSchema(null);
          } else {
            setSelectedSchema(null);
            setSelectedDataset(null);
          }
        }}
        onRename={(id, nextName) => {
          if (id.startsWith('schema:'))
            renameSchema(id.slice('schema:'.length), nextName);
          else if (id.startsWith('dataset:'))
            renameDataset(id.slice('dataset:'.length), nextName);
        }}
        onDelete={(id) => {
          if (id.startsWith('schema:')) deleteSchema(id.slice('schema:'.length));
          else if (id.startsWith('dataset:'))
            deleteDataset(id.slice('dataset:'.length));
        }}
        renderActions={(item) => {
          if (item.id === 'schemas-root')
            return (
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                title="Add schema"
                onClick={(e) => {
                  e.stopPropagation();
                  addSchema();
                }}
              >
                <Plus size={14} />
              </button>
            );
          if (item.id === 'datasets-root')
            return (
              <button
                className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
                title="Add dataset"
                onClick={(e) => {
                  e.stopPropagation();
                  addDataset();
                }}
              >
                <Plus size={14} />
              </button>
            );
          return undefined;
        }}
      />
    </ContextPanel>
  );
}
