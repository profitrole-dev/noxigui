import { create } from "zustand";
import { ProjectZ } from "../types/project";
import type { Project } from "../types/project";

export const defaultProject: Project = {
  name: "Untitled",
  version: "0.1",
  layout: "<Grid/>",
  data: {},
  assets: [],
};

export type Tab = "Code" | "Data" | "Assets";
type Dirty = { layout: boolean; data: boolean; assets: boolean };
type StudioState = {
  project: Project;
  activeTab: Tab;
  dirty: Dirty;
  setTab: (t: Tab) => void;
  loadProject: (raw: unknown) => void;
  exportProject: () => string;
  setLayout: (s: string) => void;
  setData: (o: any) => void;
  setAssets: (a: Project["assets"]) => void;
  newProject: () => void;
};
export const useStudio = create<StudioState>((set, get) => {
  const STORAGE_KEY = "noxigui:project";
  let saveTimer: ReturnType<typeof setTimeout>;

  const scheduleSave = () => {
    if (typeof window === "undefined" || !window.localStorage) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(get().project)
        );
      } catch {
        /* ignore */
      }
    }, 500);
  };

  let initial: Project = { ...defaultProject };
  if (typeof window !== "undefined" && window.localStorage) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        initial = ProjectZ.parse(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }

  return {
    project: initial,
    activeTab: "Code",
    dirty: { layout: false, data: false, assets: false },
    setTab: (t) => set({ activeTab: t }),
    loadProject: (raw) => {
      const parsed = ProjectZ.parse(raw);
      set({ project: parsed, dirty: { layout: false, data: false, assets: false } });
      scheduleSave();
    },
    exportProject: () => {
      const out = JSON.stringify(get().project, null, 2);
      set({ dirty: { layout: false, data: false, assets: false } });
      scheduleSave();
      return out;
    },
    setLayout: (layout) => {
      set((s) => ({ project: { ...s.project, layout }, dirty: { ...s.dirty, layout: true } }));
      scheduleSave();
    },
    setData: (data) => {
      set((s) => ({ project: { ...s.project, data }, dirty: { ...s.dirty, data: true } }));
      scheduleSave();
    },
    setAssets: (assets) => {
      set((s) => ({ project: { ...s.project, assets }, dirty: { ...s.dirty, assets: true } }));
      scheduleSave();
    },
    newProject: () => {
      set({ project: { ...defaultProject }, dirty: { layout: false, data: false, assets: false } });
      scheduleSave();
    },
  };
});
