// src/state/useStudio.ts
import { create } from "zustand";
import { ProjectZ } from "../types/project";
import type { Project } from "../types/project";
import {
  saveProjectToIDB,
  loadProjectFromIDB,
  deleteMissingAssetBlobs,
} from "./storage";
import { applyPatch, compare } from "fast-json-patch";

export const defaultProject: Project = {
  name: "Untitled",
  version: "0.1",
  layout: "<Grid/>",
  data: {},
  assets: [],
  screen: { width: 1280, height: 720 },
  meta: {
    assetFolders: [],
    assetPaths: {}, // alias -> "Folder/Subfolder", пусто = корень
  },
};

const defaultCanvas = { width: 1280, height: 720 };

type Tab = "Layout" | "Data" | "ViewModels" | "Assets";
type Dirty = { layout: boolean; data: boolean; assets: boolean };

type StudioState = {
  project: Project;
  activeTab: Tab;
  dirty: Dirty;

  // tabs
  setTab: (t: Tab) => void;

  // persistence
  hydrate: () => Promise<void>;         // загрузка из IndexedDB при старте
  loadProject: (raw: unknown) => void;  // импорт из JSON
  exportProject: () => string;          // экспорт в JSON
  newProject: () => void;

  // edits
  renameProject: (name: string) => void;
  setLayout: (s: string) => void;
  setData: (o: any) => void;
  setAssets: (a: Project["assets"]) => void;

  // canvas
  canvas: { width: number; height: number };
  setCanvasSize: (w: number, h: number) => void;
  swapCanvasSize: () => void;

  // assets & folders
  addAssetFolder: (path: string) => void;
  setAssetPath: (alias: string, path: string | null) => void; // null => в корень
  renameAssetDisplayName: (alias: string, name: string) => void; // только display name (НЕ alias)
  deleteAsset: (alias: string) => void;

  renameAssetFolder: (oldPath: string, newPath: string) => void; // переносит подпапки/ассеты
  deleteAssetFolder: (path: string) => void; // удаляет папку(+вложенные), ассеты в корень

  // undo/redo
  undo: () => void;
  redo: () => void;
};

export const useStudio = create<StudioState>((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const p = get().project;
        await saveProjectToIDB(p);
        await deleteMissingAssetBlobs((p.assets ?? []).map((a) => a.alias));
      } catch (e) {
        console.warn("Save failed:", e);
      }
    }, 300);
  };

  type Command = { execute: () => void; undo: () => void };
  const history: Command[] = [];
  let cursor = 0;
  const exec = (cmd: Command) => {
    if (cursor < history.length) history.splice(cursor);
    cmd.execute();
    history.push(cmd);
    if (history.length > 10) history.shift();
    cursor = history.length;
  };
  const runProjectCommand = (mutate: (p: Project) => Project) => {
    const before = structuredClone(get().project);
    const after = mutate(structuredClone(before));
    const patch = compare(before, after);
    const inverse = compare(after, before);
    exec({
      execute() {
        set((s) => ({
          project: applyPatch(structuredClone(s.project), patch).newDocument,
          dirty: { ...s.dirty, assets: true },
        }));
        queueMicrotask(() => scheduleSave());
      },
      undo() {
        set((s) => ({
          project: applyPatch(structuredClone(s.project), inverse).newDocument,
          dirty: { ...s.dirty, assets: true },
        }));
        queueMicrotask(() => scheduleSave());
      },
    });
  };

  return {
    project: { ...defaultProject }, // гидрируем позже
    activeTab: "Layout",
    dirty: { layout: false, data: false, assets: false },
    canvas: { ...defaultCanvas },

    // ===== Tabs =====
    setTab: (t) => set({ activeTab: t }),

    // ===== Persistence =====
    hydrate: async () => {
      try {
        const loaded = await loadProjectFromIDB();
        if (loaded) {
          set({
            project: loaded,
            activeTab: "Layout",
            dirty: { layout: false, data: false, assets: false },
            canvas: { ...defaultCanvas },
          });
        }
      } catch (e) {
        console.warn("Hydrate failed:", e);
      }
    },

    loadProject: (raw) => {
      const parsed = ProjectZ.parse(raw);
      set({
        project: parsed,
        dirty: { layout: false, data: false, assets: false },
        activeTab: "Layout",
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
        activeTab: "Layout",
        canvas: { ...defaultCanvas },
      });
      scheduleSave();
    },

    // ===== Edits =====
    renameProject: (name) => {
      const next = name.trim();
      if (!next) return;
      set((s) => ({ project: { ...s.project, name: next } }));
      scheduleSave();
    },

    setLayout: (layout) => {
      set((s) => ({
        project: { ...s.project, layout },
        dirty: { ...s.dirty, layout: true },
      }));
      scheduleSave();
    },

    setData: (data) => {
      set((s) => ({
        project: { ...s.project, data },
        dirty: { ...s.dirty, data: true },
      }));
      scheduleSave();
    },

    setAssets: (assets) =>
      runProjectCommand((p) => ({ ...p, assets })),

    // ===== Canvas =====
    setCanvasSize: (width, height) =>
      set((s) => {
        const prev = s.project.screen ?? { width: 1280, height: 720 };
        const w = Number.isFinite(width) ? Math.max(1, Math.round(width)) : prev.width;
        const h = Number.isFinite(height) ? Math.max(1, Math.round(height)) : prev.height;
        const next = { ...s.project, screen: { width: w, height: h } };
        // сохраняем после обновления стейта
        queueMicrotask(() => scheduleSave());
        return { project: next };
      }),

    swapCanvasSize: () =>
      set((s) => {
        const prev = s.project.screen ?? { width: 1280, height: 720 };
        const next = { ...s.project, screen: { width: prev.height, height: prev.width } };
        queueMicrotask(() => scheduleSave());
        return { project: next };
      }),

    // ===== Asset Folders & Paths =====
    addAssetFolder: (path) =>
      runProjectCommand((p) => {
        const folders = new Set(p.meta?.assetFolders ?? []);
        folders.add(path.trim());
        return {
          ...p,
          meta: { ...(p.meta ?? {}), assetFolders: Array.from(folders) },
        };
      }),

    setAssetPath: (alias, path) =>
      runProjectCommand((p) => {
        const meta = {
          ...(p.meta ?? {}),
          assetPaths: { ...(p.meta?.assetPaths ?? {}) },
        };
        if (!path || !path.trim()) {
          delete meta.assetPaths[alias];
        } else {
          meta.assetPaths[alias] = path.trim();
          const folders = new Set(meta.assetFolders ?? []);
          folders.add(path.trim());
          meta.assetFolders = Array.from(folders);
        }
        return { ...p, meta };
      }),

    renameAssetDisplayName: (alias, name) =>
      runProjectCommand((p) => {
        const assets = (p.assets ?? []).map((a) =>
          a.alias === alias ? ({ ...a, name } as any) : a
        );
        return { ...p, assets };
      }),

    deleteAsset: (alias) =>
      runProjectCommand((p) => {
        const assets = (p.assets ?? []).filter((a) => a.alias !== alias);
        const meta = {
          ...(p.meta ?? {}),
          assetPaths: { ...(p.meta?.assetPaths ?? {}) },
        };
        delete meta.assetPaths[alias];
        return { ...p, assets, meta };
      }),

    renameAssetFolder: (oldPath, newPath) =>
      runProjectCommand((p) => {
        const meta0 = p.meta ?? { assetFolders: [], assetPaths: {} };
        const folders = (meta0.assetFolders ?? []).map((pth) =>
          pth === oldPath || pth.startsWith(oldPath + "/")
            ? newPath + pth.slice(oldPath.length)
            : pth
        );
        const assetPaths = { ...(meta0.assetPaths ?? {}) };
        for (const [alias, pth] of Object.entries(assetPaths)) {
          if (!pth) continue;
          if (pth === oldPath || pth.startsWith(oldPath + "/")) {
            assetPaths[alias] = newPath + pth.slice(oldPath.length);
          }
        }
        return {
          ...p,
          meta: {
            ...meta0,
            assetFolders: Array.from(new Set(folders)),
            assetPaths,
          },
        };
      }),

    deleteAssetFolder: (path) =>
      runProjectCommand((p) => {
        const meta0 = p.meta ?? { assetFolders: [], assetPaths: {} };
        const folders = (meta0.assetFolders ?? []).filter(
          (pth) => pth !== path && !pth.startsWith(path + "/")
        );
        const assetPaths = { ...(meta0.assetPaths ?? {}) };
        const assets = (p.assets ?? []).filter((a) => {
          const pth = assetPaths[a.alias];
          const inside = pth && (pth === path || pth.startsWith(path + "/"));
          if (inside) delete assetPaths[a.alias];
          return !inside;
        });
        return {
          ...p,
          assets,
          meta: { ...meta0, assetFolders: folders, assetPaths },
        };
      }),

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
