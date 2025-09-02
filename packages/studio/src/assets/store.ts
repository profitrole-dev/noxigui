import type { StateCreator } from 'zustand';
import type { Project } from '../types/project.js';

export type AssetsSlice = {
  selectAssetAliases: string[] | null;
  clearSelectAssetAliases: () => void;
  setAssets: (a: Project['assets']) => void;
  addAssets: (a: Project['assets']) => void;
  addAssetFolder: (path: string) => void;
  setAssetPath: (alias: string, path: string | null) => void;
  renameAssetDisplayName: (alias: string, name: string) => void;
  deleteAssets: (aliases: string[]) => void;
  deleteAsset: (alias: string) => void;
  renameAssetFolder: (oldPath: string, newPath: string) => void;
  deleteAssetFolder: (path: string) => void;
};

export const createAssetsSlice = (
  runProjectCommand: (
    mutate: (p: Project) => Project,
    sideEffects?: { onExecute?: () => void; onUndo?: () => void }
  ) => void
): StateCreator<any, [], [], AssetsSlice> => (set, get) => ({
  selectAssetAliases: null,
  clearSelectAssetAliases: () => set({ selectAssetAliases: null }),
  setAssets: (assets) => runProjectCommand((p) => ({ ...p, assets })),
  addAssets: (toAdd) =>
    runProjectCommand((p) => {
      const assets = [...(p.assets ?? [])];
      const byAlias = new Map(assets.map((a) => [a.alias, a]));
      for (const asset of toAdd) {
        const existing = byAlias.get(asset.alias);
        if (existing) {
          existing.src = asset.src;
          if (!existing.name) existing.name = asset.name;
        } else {
          assets.push(asset);
          byAlias.set(asset.alias, asset);
        }
      }
      return { ...p, assets };
    }),
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
  deleteAssets: (aliases) =>
    runProjectCommand(
      (p) => {
        const remove = new Set(aliases);
        const assets = (p.assets ?? []).filter((a) => !remove.has(a.alias));
        const meta = {
          ...(p.meta ?? {}),
          assetPaths: { ...(p.meta?.assetPaths ?? {}) },
        };
        for (const alias of aliases) delete meta.assetPaths[alias];
        return { ...p, assets, meta };
      },
      {
        onExecute: () => set({ selectAssetAliases: [] }),
        onUndo: () => set({ selectAssetAliases: aliases }),
      }
    ),
  deleteAsset: (alias) => get().deleteAssets([alias]),
  renameAssetFolder: (oldPath, newPath) =>
    runProjectCommand((p) => {
      const meta0 = p.meta ?? { assetFolders: [], assetPaths: {} };
      const folders = (meta0.assetFolders ?? []).map((pth) =>
        pth === oldPath || pth.startsWith(oldPath + '/')
          ? newPath + pth.slice(oldPath.length)
          : pth
      );
      const assetPaths = { ...(meta0.assetPaths ?? {}) };
      for (const [alias, pth] of Object.entries(assetPaths)) {
        if (!pth) continue;
        if (pth === oldPath || pth.startsWith(oldPath + '/')) {
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
        (pth) => pth !== path && !pth.startsWith(path + '/')
      );
      const assetPaths = { ...(meta0.assetPaths ?? {}) };
      const assets = (p.assets ?? []).filter((a) => {
        const pth = assetPaths[a.alias];
        const inside = pth && (pth === path || pth.startsWith(path + '/'));
        if (inside) delete assetPaths[a.alias];
        return !inside;
      });
      return {
        ...p,
        assets,
        meta: { ...meta0, assetFolders: folders, assetPaths },
      };
    }),
});
