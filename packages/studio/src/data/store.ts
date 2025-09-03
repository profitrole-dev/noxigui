import type { StateCreator } from 'zustand';
import type { SchemaField } from './types/schema.js';
import type { Project } from '../types/project.js';

export type DataSlice = {
  selectedSchema: string | null;
  selectedDataset: string | null;
  setSelectedSchema: (name: string | null) => void;
  setSelectedDataset: (name: string | null) => void;
  addSchema: () => void;
  addDataset: () => void;
  renameSchema: (oldName: string, nextName: string) => void;
  renameDataset: (oldName: string, nextName: string) => void;
  deleteSchema: (name: string) => void;
  deleteDataset: (name: string) => void;
  setSchemaFields: (name: string, fields: SchemaField[]) => void;
  setDatasetValue: (name: string, value: any) => void;
  setData: (o: Project['data']) => void;
};

export const createDataSlice = (
  runProjectCommand: (
    mutate: (p: Project) => Project,
    sideEffects?: { onExecute?: () => void; onUndo?: () => void }
  ) => void,
): StateCreator<any, [], [], DataSlice> => (set, get) => ({
  selectedSchema: null,
  selectedDataset: null,
  setSelectedSchema: (name) => set({ selectedSchema: name, selectedDataset: null }),
  setSelectedDataset: (name) => set({ selectedDataset: name, selectedSchema: null }),

  addSchema: () => {
    const existing = new Set(Object.keys(get().project.data.schemas ?? {}));
    const base = 'New schema';
    let name = base;
    let i = 2;
    while (existing.has(name)) name = `${base} ${i++}`;

    runProjectCommand(
      (p) => {
        const schemas = { ...(p.data.schemas ?? {}), [name]: [] as SchemaField[] };
        return { ...p, data: { ...p.data, schemas } };
      },
      {
        onExecute: () => set({ selectedSchema: name }),
        onUndo: () => set({ selectedSchema: null }),
      },
    );
  },

  addDataset: () => {
    const existing = new Set(Object.keys(get().project.data.datasets ?? {}));
    const base = 'New dataset';
    let name = base;
    let i = 2;
    while (existing.has(name)) name = `${base} ${i++}`;

    runProjectCommand(
      (p) => {
        const datasets = { ...(p.data.datasets ?? {}), [name]: [] };
        return { ...p, data: { ...p.data, datasets } };
      },
      {
        onExecute: () => set({ selectedDataset: name }),
        onUndo: () => set({ selectedDataset: null }),
      },
    );
  },

  renameSchema: (oldName, nextName) => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === oldName) return;
    runProjectCommand(
      (p) => {
        const schemas = { ...(p.data.schemas ?? {}) };
        schemas[trimmed] = schemas[oldName];
        delete schemas[oldName];
        return { ...p, data: { ...p.data, schemas } };
      },
      {
        onExecute: () => {
          if (get().selectedSchema === oldName) set({ selectedSchema: trimmed });
        },
        onUndo: () => {
          if (get().selectedSchema === trimmed) set({ selectedSchema: oldName });
        },
      },
    );
  },

  renameDataset: (oldName, nextName) => {
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === oldName) return;
    runProjectCommand(
      (p) => {
        const datasets = { ...(p.data.datasets ?? {}) };
        datasets[trimmed] = datasets[oldName];
        delete datasets[oldName];
        return { ...p, data: { ...p.data, datasets } };
      },
      {
        onExecute: () => {
          if (get().selectedDataset === oldName)
            set({ selectedDataset: trimmed });
        },
        onUndo: () => {
          if (get().selectedDataset === trimmed)
            set({ selectedDataset: oldName });
        },
      },
    );
  },

  deleteSchema: (name) =>
    runProjectCommand(
      (p) => {
        const schemas = { ...(p.data.schemas ?? {}) };
        delete schemas[name];
        return { ...p, data: { ...p.data, schemas } };
      },
      {
        onExecute: () => {
          if (get().selectedSchema === name) set({ selectedSchema: null });
        },
        onUndo: () => set({ selectedSchema: name }),
      },
    ),

  deleteDataset: (name) =>
    runProjectCommand(
      (p) => {
        const datasets = { ...(p.data.datasets ?? {}) };
        delete datasets[name];
        return { ...p, data: { ...p.data, datasets } };
      },
      {
        onExecute: () => {
          if (get().selectedDataset === name) set({ selectedDataset: null });
        },
        onUndo: () => set({ selectedDataset: name }),
      },
    ),

  setSchemaFields: (name, fields) =>
    runProjectCommand((p) => {
      const schemas = { ...(p.data.schemas ?? {}), [name]: fields };
      return { ...p, data: { ...p.data, schemas } };
    }),

  setDatasetValue: (name, value) =>
    runProjectCommand((p) => {
      const datasets = { ...(p.data.datasets ?? {}), [name]: value };
      return { ...p, data: { ...p.data, datasets } };
    }),

  setData: (data) => runProjectCommand((p) => ({ ...p, data })),
});

