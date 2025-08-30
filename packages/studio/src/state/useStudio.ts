import { create } from "zustand";
import { ProjectZ } from "../types/project";
import type { Project } from "../types/project";

type Tab = "Code" | "Data" | "Assets";
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
};
export const useStudio = create<StudioState>((set, get) => ({
  project: { name: "Untitled", version: "0.1", layout: "<Grid/>", data: {}, assets: [] },
  activeTab: "Code",
  dirty: { layout: false, data: false, assets: false },
  setTab: (t) => set({ activeTab: t }),
  loadProject: (raw) => {
    const parsed = ProjectZ.parse(raw);
    set({ project: parsed, dirty: { layout: false, data: false, assets: false } });
  },
  exportProject: () => {
    const out = JSON.stringify(get().project, null, 2);
    set({ dirty: { layout: false, data: false, assets: false } });
    return out;
  },
  setLayout: (layout) =>
    set((s) => ({ project: { ...s.project, layout }, dirty: { ...s.dirty, layout: true } })),
  setData: (data) =>
    set((s) => ({ project: { ...s.project, data }, dirty: { ...s.dirty, data: true } })),
  setAssets: (assets) =>
    set((s) => ({ project: { ...s.project, assets }, dirty: { ...s.dirty, assets: true } })),
}));
