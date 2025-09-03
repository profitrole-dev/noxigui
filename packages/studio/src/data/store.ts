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
  renameSchema: (oldName: string, nextName: string) => void;
  addDataset: (schemaRef: string) => void;
  setDatasetRows: (name: string, rows: Dataset['rows']) => void;
  renameDataset: (oldName: string, nextName: string) => void;
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
  renameSchema: (oldName, nextName) => {
    set((s: any) => {
      const existing = new Set(Object.keys(s.project.data.schemas));
      existing.delete(oldName);
      const base = nextName.trim();
      let name = base;
      let i = 2;
      while (existing.has(name)) name = `${base} ${i++}`;
      const schemas = { ...s.project.data.schemas };
      const schema = schemas[oldName];
      if (!schema) return {};
      delete schemas[oldName];
      schemas[name] = schema;
      const datasets = { ...s.project.data.datasets };
      for (const key of Object.keys(datasets)) {
        if (datasets[key].schemaRef === oldName) {
          datasets[key] = { ...datasets[key], schemaRef: name };
        }
      }
      return {
        project: {
          ...s.project,
          data: { ...s.project.data, schemas, datasets },
        },
        selectedSchema: s.selectedSchema === oldName ? name : s.selectedSchema,
        selectedDataset: s.selectedDataset,
        dirty: { ...s.dirty, data: true },
      };
    });
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
  renameDataset: (oldName, nextName) => {
    set((s: any) => {
      const existing = new Set(Object.keys(s.project.data.datasets));
      existing.delete(oldName);
      const base = nextName.trim();
      let name = base;
      let i = 2;
      while (existing.has(name)) name = `${base} ${i++}`;
      const datasets = { ...s.project.data.datasets };
      const dataset = datasets[oldName];
      if (!dataset) return {};
      delete datasets[oldName];
      datasets[name] = dataset;
      return {
        project: {
          ...s.project,
          data: { ...s.project.data, datasets },
        },
        selectedDataset: s.selectedDataset === oldName ? name : s.selectedDataset,
        selectedSchema: s.selectedSchema,
        dirty: { ...s.dirty, data: true },
      };
    });
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
