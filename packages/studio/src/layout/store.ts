import type { StateCreator } from 'zustand';

export type LayoutSlice = {
  canvas: { width: number; height: number };
  setLayout: (layout: string) => void;
  setCanvasSize: (w: number, h: number) => void;
  swapCanvasSize: () => void;
  selectedLayoutIds: Set<string>;
  selectLayout: (ids: Set<string>) => void;
};

export const defaultCanvas = { width: 1280, height: 720 };

export const createLayoutSlice = (
  scheduleSave: () => void
): StateCreator<any, [], [], LayoutSlice> => (set, _get) => ({
  canvas: { ...defaultCanvas },
  selectedLayoutIds: new Set<string>(),
  setLayout: (layout) => {
    set((s: any) => ({
      project: { ...s.project, layout },
      dirty: { ...s.dirty, layout: true },
    }));
    scheduleSave();
  },
  selectLayout: (ids) => set({ selectedLayoutIds: new Set(ids) }),
  setCanvasSize: (width, height) =>
    set((s: any) => {
      const prev = s.project.screen ?? { width: 1280, height: 720 };
      const w = Number.isFinite(width) ? Math.max(1, Math.round(width)) : prev.width;
      const h = Number.isFinite(height) ? Math.max(1, Math.round(height)) : prev.height;
      const next = { ...s.project, screen: { width: w, height: h } };
      queueMicrotask(() => scheduleSave());
      return { project: next };
    }),
  swapCanvasSize: () =>
    set((s: any) => {
      const prev = s.project.screen ?? { width: 1280, height: 720 };
      const next = { ...s.project, screen: { width: prev.height, height: prev.width } };
      queueMicrotask(() => scheduleSave());
      return { project: next };
    }),
});
