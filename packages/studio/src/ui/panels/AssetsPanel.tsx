import React, { useEffect, useRef, useState } from "react";
import { Plus, FolderPlus } from "lucide-react";
import Tree, { type TreeItem, type DropPosition } from "../tree/Tree";
import { useStudio } from "../../state/useStudio";

// === Вспомогалки ===
const makeUnique = (base: string, taken: Set<string>, sep = "-") => {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}${sep}${i}`)) i++;
  return `${base}${sep}${i}`;
};

const parentPath = (full: string) => {
  const parts = full.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
};
const leafName = (full: string) => full.split("/").filter(Boolean).pop() ?? "";

// file -> dataURL, чтобы жить без бэкенда
const fileToDataURL = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// Построение дерева из проекта
function buildAssetsRoot(project: {
  assets: Array<{ alias: string; src: string; name?: string }>;
  meta?: { assetFolders?: string[]; assetPaths?: Record<string, string> };
}): TreeItem {
  const root: TreeItem = { id: "assets-root", name: "Assets", type: "folder", children: [] };
  const folders = new Set(project.meta?.assetFolders ?? []);
  const assetPaths = project.meta?.assetPaths ?? {};

  // индекс папок по пути
  const byPath = new Map<string, TreeItem>();
  const ensureFolder = (fullPath: string): TreeItem => {
    if (byPath.has(fullPath)) return byPath.get(fullPath)!;
    const parts = fullPath.split("/").filter(Boolean);
    let cursor = root;
    let acc = "";
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      let next = byPath.get(acc);
      if (!next) {
        next = { id: `folder:${acc}`, name: part, type: "folder", children: [] };
        cursor.children = cursor.children ?? [];
        cursor.children.push(next);
        byPath.set(acc, next);
      }
      cursor = next;
    }
    return cursor;
  };

  // 1) папки
  for (const p of folders) if (p.trim()) ensureFolder(p.trim());

  // 2) ассеты
  for (const a of project.assets ?? []) {
    const display = a.name ?? a.alias;
    const node: TreeItem = { id: `asset:${a.alias}`, name: display, type: "image" };
    const p = (assetPaths[a.alias] || "").trim();
    if (p) ensureFolder(p).children!.push(node);
    else {
      root.children = root.children ?? [];
      root.children.push(node);
    }
  }
  return root;
}

// локальный dnd для UI (persist делаем отдельно)
function extractNode(arr: TreeItem[], id: string): TreeItem | null {
  for (let i = 0; i < arr.length; i++) {
    const it = arr[i];
    if (it.id === id) {
      arr.splice(i, 1);
      return it;
    }
    if (it.children) {
      const got = extractNode(it.children, id);
      if (got) return got;
    }
  }
  return null;
}
function moveNode(root: TreeItem, sourceId: string, targetId: string, pos: DropPosition): TreeItem {
  const clone: TreeItem = structuredClone(root);
  const src = extractNode(clone.children ?? [], sourceId);
  if (!src) return clone;

  if (targetId === root.id) {
    clone.children = clone.children ?? [];
    pos === "before" ? clone.children.unshift(src) : clone.children.push(src);
    return clone;
  }
  const insert = (arr: TreeItem[], parent: TreeItem | null): boolean => {
    for (let i = 0; i < arr.length; i++) {
      const it = arr[i];
      if (it.id === targetId) {
        if (pos === "inside") {
          it.children = it.children ?? [];
          it.children.push(src);
          return true;
        }
        const siblings = parent ? parent.children! : arr;
        const idx = siblings.findIndex((n) => n.id === targetId);
        const at = pos === "before" ? idx : idx + 1;
        siblings.splice(at, 0, src);
        return true;
      }
      if (it.children && insert(it.children, it)) return true;
    }
    return false;
  };
  insert(clone.children ?? [], null);
  return clone;
}

// === Панель ассетов ===
export function AssetsPanel() {
  const {
    project,
    setAssets,
    addAssetFolder,
    setAssetPath,
    renameAssetDisplayName,
    deleteAsset,
    renameAssetFolder,
    deleteAssetFolder,
  } = useStudio();

  const [root, setRoot] = useState<TreeItem>(() => buildAssetsRoot(project));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["assets-root"]));
  const [selected, setSelected] = useState<string | null>(null);

  // Перестраиваем при изменении проекта
  useEffect(() => {
    setRoot(buildAssetsRoot(project));
  }, [project.assets, project.meta?.assetFolders, project.meta?.assetPaths]);

  const visible = [root];

  // input для добавления картинок
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Добавить картинки: ПЕРЕЗАПИСЫВАЕМ существующий alias, а не делаем -2
  const onAddFiles = async (files: FileList | null) => {
    if (!files) return;

    const existing = project.assets ?? [];
    const nextAssets = [...existing];
    const byAlias = new Map(existing.map((a) => [a.alias, a]));

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;

      const dataUrl = await fileToDataURL(f);
      const rawBase = f.name.replace(/\.[^.]+$/, ""); // "hero" из "hero.png"
      const alias = rawBase;                           // КЛЮЧЕВОЕ: НЕ уникализируем

      const existed = byAlias.get(alias);
      if (existed) {
        existed.src = dataUrl;      // overwrite src
        if (!existed.name) existed.name = f.name;
      } else {
        const asset = { alias, src: dataUrl, name: f.name };
        nextAssets.push(asset);
        byAlias.set(alias, asset);
      }
    }

    setAssets(nextAssets);
  };

  // Новая папка (в корне)
  const onNewFolder = () => {
    const base = "New Folder";
    const siblings = new Set(
      (project.meta?.assetFolders ?? [])
        .filter((p) => !p.includes("/"))
        .map((p) => leafName(p))
    );
    const leaf = makeUnique(base, siblings, " ");
    addAssetFolder(leaf);
  };

  // DnD: persist путей при броске
  const handleDrop = (src: string, dst: string, pos: DropPosition) => {
    if (src === dst) return;

    setRoot((r) => moveNode(r, src, dst, pos));

    const isAsset = src.startsWith("asset:");
    const alias = isAsset ? src.slice("asset:".length) : "";

    if (isAsset) {
      if (dst.startsWith("folder:") && pos === "inside") {
        const folderPath = dst.slice("folder:".length);
        setAssetPath(alias, folderPath || null);
      } else if (dst === "assets-root") {
        setAssetPath(alias, null);
      }
    }
  };

  // Переименование
  const handleRename = (id: string, nextName: string) => {
    if (id.startsWith("asset:")) {
      const alias = id.slice("asset:".length);
      renameAssetDisplayName(alias, nextName);
      return;
    }
    if (id.startsWith("folder:")) {
      const full = id.slice("folder:".length);
      const parent = parentPath(full);
      const siblingLeaves = new Set(
        (project.meta?.assetFolders ?? [])
          .filter((p) => parentPath(p) === parent)
          .map((p) => leafName(p))
      );
      const uniqueLeaf = makeUnique(nextName, siblingLeaves, " ");
      const newFull = parent ? `${parent}/${uniqueLeaf}` : uniqueLeaf;
      if (newFull !== full) {
        renameAssetFolder(full, newFull);
      }
    }
  };

  // Удаление
  const handleDelete = (id: string) => {
    if (id.startsWith("asset:")) {
      const alias = id.slice("asset:".length);
      deleteAsset(alias);
      return;
    }
    if (id.startsWith("folder:")) {
      const full = id.slice("folder:".length);
      deleteAssetFolder(full);
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* заголовок */}
      <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide flex items-center justify-between">
        <span>Assets</span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
            onClick={onNewFolder}
            title="New folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            title="Add images"
          >
            <Plus size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onAddFiles(e.target.files)}
          />
        </div>
      </div>

      {/* дерево */}
      <div className="-ml-2">
        <Tree
          items={visible}
          expanded={expanded}
          selectedId={selected}
          onToggle={(id) =>
            setExpanded((prev) => {
              const next = new Set(prev);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            })
          }
          onSelect={setSelected}
          onDrop={handleDrop}
          onRename={handleRename}
          onDelete={handleDelete}
          allowDrop={(src, dst, pos) => {
            if (src.id === dst.id) return false;
            if (pos === "inside") return dst.type === "folder";
            return true;
          }}
        />
      </div>
    </div>
  );
}
