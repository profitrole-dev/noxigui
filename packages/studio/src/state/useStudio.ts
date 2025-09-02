import { create } from 'zustand';
import { ProjectZ } from '../types/project.js';
import type { Project } from '../types/project.js';
import {
  saveProjectToIDB,
  loadProjectFromIDB,
  deleteMissingAssetBlobs,
} from '../assets/store/storage.js';
import jsonPatch from 'fast-json-patch';
import { createLayoutSlice, LayoutSlice, defaultCanvas } from '../layout/store';
import { createDataSlice, DataSlice } from '../data/store';
import { createAssetsSlice, AssetsSlice } from '../assets/store';
import { createViewModelsSlice, ViewModelsSlice } from '../viewmodels/store';

const { applyPatch, compare } = jsonPatch;

export const defaultProject: Project = {
  name: 'Untitled',
  version: '0.1',
  layout: '<Grid/>',
  data: {},
  assets: [],
  screen: { width: 1280, height: 720 },
  meta: {
    assetFolders: [],
    assetPaths: {},
  },
};

export type Tab = 'Layout' | 'Data' | 'ViewModels' | 'Assets';
export type Dirty = { layout: boolean; data: boolean; assets: boolean };

export type StudioState = LayoutSlice &
  DataSlice &
  AssetsSlice &
  ViewModelsSlice & {
    project: Project;
    activeTab: Tab;
    dirty: Dirty;
    setTab: (t: Tab) => void;
    hydrate: () => Promise<void>;
    loadProject: (raw: unknown) => void;
    exportProject: () => string;
    newProject: () => void;
    renameProject: (name: string) => void;
    undo: () => void;
    redo: () => void;
  };

export const useStudio = create<StudioState>()((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const p = get().project;
        await saveProjectToIDB(p);
        await deleteMissingAssetBlobs((p.assets ?? []).map((a) => a.alias));
      } catch (e) {
        console.warn('Save failed:', e);
      }
    }, 300);
  };

  type Command = { execute: () => void; undo: () => void };
  const history: Command[] = [];
  let cursor = 0;

  const runProjectCommand = (
    mutate: (p: Project) => Project,
    sideEffects?: { onExecute?: () => void; onUndo?: () => void }
  ) => {
    const before = structuredClone(get().project);
    const after = mutate(structuredClone(before));
    const patch = compare(before, after);
    const inverse = compare(after, before);
    if (cursor < history.length) history.splice(cursor);
    const cmd: Command = {
      execute() {
        set((s) => ({
          project: applyPatch(structuredClone(s.project), patch).newDocument,
          dirty: { ...s.dirty, assets: true },
        }));
        queueMicrotask(() => scheduleSave());
        sideEffects?.onExecute?.();
      },
      undo() {
        set((s) => ({
          project: applyPatch(structuredClone(s.project), inverse).newDocument,
          dirty: { ...s.dirty, assets: true },
        }));
        queueMicrotask(() => scheduleSave());
        sideEffects?.onUndo?.();
      },
    };
    cmd.execute();
    history.push(cmd);
    if (history.length > 10) history.shift();
    cursor = history.length;
  };

  return {
    project: { ...defaultProject },
    activeTab: 'Layout',
    dirty: { layout: false, data: false, assets: false },
    ...createLayoutSlice(scheduleSave)(set, get),
    ...createDataSlice(scheduleSave)(set, get),
    ...createAssetsSlice(runProjectCommand)(set, get),
    ...createViewModelsSlice()(set, get),

    setTab: (t) => set({ activeTab: t }),

    hydrate: async () => {
      try {
        const loaded = await loadProjectFromIDB();
        if (loaded) {
          set({
            project: loaded,
            activeTab: 'Layout',
            dirty: { layout: false, data: false, assets: false },
            canvas: { ...defaultCanvas },
          });
        }
      } catch (e) {
        console.warn('Hydrate failed:', e);
      }
    },

    loadProject: (raw) => {
      const parsed = ProjectZ.parse(raw);
      set({
        project: parsed,
        dirty: { layout: false, data: false, assets: false },
        activeTab: 'Layout',
        canvas: { ...defaultCanvas },
      });
      scheduleSave();
    },

    exportProject: () => {
      const out = JSON.stringify(get().project, null, 2);
      set({ dirty: { layout: false, data: false, assets: false } });
      scheduleSave();
      return out;
    },

    newProject: () => {
      set({
        project: { ...defaultProject },
        dirty: { layout: false, data: false, assets: false },
        activeTab: 'Layout',
        canvas: { ...defaultCanvas },
      });
      scheduleSave();
    },

    renameProject: (name) => {
      const next = name.trim();
      if (!next) return;
      set((s) => ({ project: { ...s.project, name: next } }));
      scheduleSave();
    },

    undo: () => {
      if (cursor === 0) return;
      cursor--;
      history[cursor]?.undo();
    },

    redo: () => {
      if (cursor >= history.length) return;
      history[cursor]?.execute();
      cursor++;
    },
  };
});
