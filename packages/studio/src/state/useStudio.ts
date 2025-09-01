// src/state/useStudio.ts
import { create } from "zustand";
import { ProjectZ } from "../types/project";
import type { Project } from "../types/project";
import {
  saveProjectToIDB,
  loadProjectFromIDB,
  deleteMissingAssetBlobs,
} from "./storage";

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

    setAssets: (assets) => {
      set((s) => ({
        project: { ...s.project, assets },
        dirty: { ...s.dirty, assets: true },
      }));
      scheduleSave();
    },

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
      set((s) => {
        const folders = new Set(s.project.meta?.assetFolders ?? []);
        folders.add(path.trim());
        const next = {
          ...s.project,
          meta: { ...(s.project.meta ?? {}), assetFolders: Array.from(folders) },
        };
        queueMicrotask(() => scheduleSave());
        return { project: next };
      }),

    setAssetPath: (alias, path) =>
      set((s) => {
        const meta = {
          ...(s.project.meta ?? {}),
          assetPaths: { ...(s.project.meta?.assetPaths ?? {}) },
        };
        if (!path || !path.trim()) {
          delete meta.assetPaths[alias]; // в корень
        } else {
          meta.assetPaths[alias] = path.trim();
          const folders = new Set(meta.assetFolders ?? []);
          folders.add(path.trim());
          meta.assetFolders = Array.from(folders);
        }
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, meta } };
      }),

    renameAssetDisplayName: (alias, name) =>
      set((s) => {
        const assets = (s.project.assets ?? []).map((a) =>
          a.alias === alias ? ({ ...a, name } as any) : a
        );
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, assets } };
      }),

    deleteAsset: (alias) =>
      set((s) => {
        const assets = (s.project.assets ?? []).filter((a) => a.alias !== alias);
        const meta = {
          ...(s.project.meta ?? {}),
          assetPaths: { ...(s.project.meta?.assetPaths ?? {}) },
        };
        delete meta.assetPaths[alias];
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, assets, meta } };
      }),

    renameAssetFolder: (oldPath, newPath) =>
      set((s) => {
        const meta0 = s.project.meta ?? { assetFolders: [], assetPaths: {} };
        const folders = (meta0.assetFolders ?? []).map((p) =>
          p === oldPath || p.startsWith(oldPath + "/")
            ? newPath + p.slice(oldPath.length)
            : p
        );
        const assetPaths = { ...(meta0.assetPaths ?? {}) };
        for (const [alias, p] of Object.entries(assetPaths)) {
          if (!p) continue;
          if (p === oldPath || p.startsWith(oldPath + "/")) {
            assetPaths[alias] = newPath + p.slice(oldPath.length);
          }
        }
        const meta = {
          ...meta0,
          assetFolders: Array.from(new Set(folders)),
          assetPaths,
        };
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, meta } };
      }),

    deleteAssetFolder: (path) =>
      set((s) => {
        const meta0 = s.project.meta ?? { assetFolders: [], assetPaths: {} };
        // выкидываем саму папку и все подпапки
        const folders = (meta0.assetFolders ?? []).filter(
          (p) => p !== path && !p.startsWith(path + "/")
        );
        // ассеты из этой папки и подпапок — удаляем
        const assetPaths = { ...(meta0.assetPaths ?? {}) };
        const assets = (s.project.assets ?? []).filter((a) => {
          const p = assetPaths[a.alias];
          const inside = p && (p === path || p.startsWith(path + "/"));
          if (inside) delete assetPaths[a.alias];
          return !inside;
        });
        const meta = { ...meta0, assetFolders: folders, assetPaths };
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, assets, meta } };
      }),
  };
});
