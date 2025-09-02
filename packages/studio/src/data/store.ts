import type { StateCreator } from 'zustand';
import type { SchemaField } from './types/schema.js';

export type DataSlice = {
  selectedSchema: string | null;
  setSelectedSchema: (name: string | null) => void;
  addSchema: () => void;
  setSchemaFields: (name: string, fields: SchemaField[]) => void;
  setData: (o: any) => void;
};

export const createDataSlice = (
  scheduleSave: () => void
): StateCreator<any, [], [], DataSlice> => (set, get) => ({
  selectedSchema: null,
  setSelectedSchema: (name) => set({ selectedSchema: name }),
  addSchema: () => {
    set((s: any) => {
      const existing = new Set(Object.keys(s.project.data ?? {}));
      const base = 'New schema';
      let name = base;
      let i = 2;
      while (existing.has(name)) name = `${base} ${i++}`;
      const data = { ...s.project.data, [name]: [] as SchemaField[] };
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
        data: { ...s.project.data, [name]: fields },
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
