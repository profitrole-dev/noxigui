import { create } from "zustand";
import { ProjectZ } from "../types/project";
import type { Project } from "../types/project";

export const defaultProject: Project = {
  name: "Untitled",
  version: "0.1",
  layout: "<Grid/>",
  data: {},
  assets: [],
  screen: { width: 1280, height: 720 },
  meta: {
    assetFolders: [],
    assetPaths: {},   // alias -> "Folder/Subfolder", пусто = корень
  }
}

const defaultCanvas = { width: 1280, height: 720 };

type Tab = "Layout" | "Data" | "ViewModels" | "Assets";
type Dirty = { layout: boolean; data: boolean; assets: boolean };

type StudioState = {
  project: Project;
  activeTab: Tab;
  dirty: Dirty;

  // tabs
  setTab: (t: Tab) => void;

  // io
  loadProject: (raw: unknown) => void;
  exportProject: () => string;
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

  addAssetFolder: (path: string) => void;
  setAssetPath: (alias: string, path: string | null) => void; // null => в корень
  // asset/folder ops
  renameAssetDisplayName: (alias: string, name: string) => void; // меняем читаемое имя (НЕ alias)
  deleteAsset: (alias: string) => void;

  renameAssetFolder: (oldPath: string, newPath: string) => void; // переносит все подпапки/ассеты
  deleteAssetFolder: (path: string) => void; // удаляет папку(+вложенные записи), ассеты уезжают в корень
};

export const useStudio = create<StudioState>((set, get) => {
  const STORAGE_KEY = "noxigui:project";
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleSave = () => {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(get().project));
      } catch {
        /* ignore */
      }
    }, 300);
  };

  // bootstrap from localStorage
  let initial: Project = { ...defaultProject };
  if (typeof window !== "undefined" && window.localStorage) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        initial = ProjectZ.parse(JSON.parse(raw));
      } catch {
        /* ignore invalid persisted data */
      }
    }
  }

  return {
    project: initial,
    activeTab: "Layout",
    dirty: { layout: false, data: false, assets: false },
    canvas: { ...defaultCanvas }, // ✅ есть сразу

    setTab: (t) => set({ activeTab: t }),

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
        canvas: { ...defaultCanvas }, // ✅ сброс
      });
      scheduleSave();
    },

    // === edits ===
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

    setCanvasSize: (width, height) =>
      set((s) => {
        const prev = s.project.screen ?? { width: 1280, height: 720 };
        const w = Number.isFinite(width) ? Math.max(1, Math.round(width)) : prev.width;
        const h = Number.isFinite(height) ? Math.max(1, Math.round(height)) : prev.height;
        const next = { ...s.project, screen: { width: w, height: h } };
        queueMicrotask(() => scheduleSave());
        return { project: next };
      }),


    swapCanvasSize: () =>
      set((s) => {
        const prev = s.project.screen ?? { width: 1280, height: 720 };
        const next = { ...s.project, screen: { width: prev.height, height: prev.width } };
        // ↓ тоже сохраняем
        queueMicrotask(() => scheduleSave());
        return { project: next };
      }),

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
        const meta = { ...(s.project.meta ?? {}), assetPaths: { ...(s.project.meta?.assetPaths ?? {}) } };
        if (!path || !path.trim()) {
          // в корень → удаляем запись
          delete meta.assetPaths[alias];
        } else {
          meta.assetPaths[alias] = path.trim();
          // авто-добавим папку, если её ещё нет
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
          a.alias === alias ? { ...a, name } : a
        );
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, assets } };
      }),

    deleteAsset: (alias) =>
      set((s) => {
        const assets = (s.project.assets ?? []).filter((a) => a.alias !== alias);
        const meta = { ...(s.project.meta ?? {}), assetPaths: { ...(s.project.meta?.assetPaths ?? {}) } };
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
        const meta = { ...meta0, assetFolders: Array.from(new Set(folders)), assetPaths };
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
        // ассеты из этой папки и подпапок — в корень
        const assetPaths = { ...(meta0.assetPaths ?? {}) };
        for (const [alias, p] of Object.entries(assetPaths)) {
          if (!p) continue;
          if (p === path || p.startsWith(path + "/")) {
            delete assetPaths[alias]; // в корень
          }
        }
        const meta = { ...meta0, assetFolders: folders, assetPaths };
        queueMicrotask(() => scheduleSave());
        return { project: { ...s.project, meta } };
      }),
  };
});
