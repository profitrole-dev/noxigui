import type { StateCreator } from 'zustand';
import type { SchemaField } from './types/schema.js';
import type { Dataset } from './types/dataset.js';

export type DataSlice = {
  selectedSchema: string | null;
  selectedDataset: string | null;
  setSelectedSchema: (name: string | null) => void;
  setSelectedDataset: (name: string | null) => void;
  addSchema: () => void;
  setSchemaFields: (name: string, fields: SchemaField[]) => void;
  addDataset: (schemaRef: string) => void;
  setDatasetRows: (name: string, rows: Dataset['rows']) => void;
  setData: (o: any) => void;
};

export const createDataSlice = (
  scheduleSave: () => void
): StateCreator<any, [], [], DataSlice> => (set, _get) => ({
  selectedSchema: null,
  selectedDataset: null,
  setSelectedSchema: (name) => set({ selectedSchema: name, selectedDataset: null }),
  setSelectedDataset: (name) => set({ selectedDataset: name, selectedSchema: null }),
  addSchema: () => {
    set((s: any) => {
      const existing = new Set(Object.keys(s.project.data.schemas ?? {}));
      const base = 'New schema';
      let name = base;
      let i = 2;
      while (existing.has(name)) name = `${base} ${i++}`;
      const data = {
        ...s.project.data,
        schemas: { ...s.project.data.schemas, [name]: [] as SchemaField[] },
      };
      return {
        project: { ...s.project, data },
        selectedSchema: name,
        dirty: { ...s.dirty, data: true },
      };
    });
    scheduleSave();
  },
  setSchemaFields: (name, fields) => {
    set((s: any) => ({
      project: {
        ...s.project,
        data: {
          ...s.project.data,
          schemas: { ...s.project.data.schemas, [name]: fields },
        },
      },
      dirty: { ...s.dirty, data: true },
    }));
    scheduleSave();
  },
  addDataset: (schemaRef) => {
    set((s: any) => {
      const existing = new Set(Object.keys(s.project.data.datasets ?? {}));
      const base = 'New dataset';
      let name = base;
      let i = 2;
      while (existing.has(name)) name = `${base} ${i++}`;
      const data = {
        ...s.project.data,
        datasets: {
          ...s.project.data.datasets,
          [name]: { schemaRef, rows: [] as Dataset['rows'] },
        },
      };
      return {
        project: { ...s.project, data },
        selectedDataset: name,
        dirty: { ...s.dirty, data: true },
      };
    });
    scheduleSave();
  },
  setDatasetRows: (name, rows) => {
    set((s: any) => ({
      project: {
        ...s.project,
        data: {
          ...s.project.data,
          datasets: { ...s.project.data.datasets, [name]: { ...s.project.data.datasets[name], rows } },
        },
      },
      dirty: { ...s.dirty, data: true },
    }));
    scheduleSave();
  },
  setData: (data) => {
    set((s: any) => ({
      project: { ...s.project, data },
      dirty: { ...s.dirty, data: true },
    }));
    scheduleSave();
  },
});
