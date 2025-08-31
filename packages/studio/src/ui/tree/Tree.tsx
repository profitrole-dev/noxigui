import React, { useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Layout,
  Component,
  Image as ImageIcon,
  Database,
  Edit2,
  Trash2,
} from "lucide-react";

/** Типы узлов */
export type TreeItemType = "folder" | "view" | "component" | "image" | "data";

export type TreeItem = {
  id: string;
  name: string;
  type: TreeItemType;
  children?: TreeItem[];
};

export type DropPosition = "inside" | "before" | "after";

/** Иконки по типам */
export function iconFor(type: TreeItemType, expanded: boolean): React.ReactNode {
  switch (type) {
    case "folder":
      return expanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    case "view":
      return <Layout size={16} />;
    case "component":
      return <Component size={16} />;
    case "image":
      return <ImageIcon size={16} />;
    case "data":
      return <Database size={16} />;
    default:
      return <Layout size={16} />;
  }
}

export type TreeProps = {
  items: TreeItem[];
  expanded: Set<string>;
  selectedId?: string | null;

  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDrop?: (sourceId: string, targetId: string, pos: DropPosition) => void;

  /** Вызывается при подтверждении переименования */
  onRename?: (id: string, nextName: string) => void;

  /** Удалить узел (и его потомков) */
  onDelete?: (id: string) => void;

  renderIcon?: (item: TreeItem, expanded: boolean) => React.ReactNode;

  /** Кастомная политика dnd. По умолчанию: inside только в папку. */
  allowDrop?: (source: TreeItem, target: TreeItem, pos: DropPosition) => boolean;
};

/** Собираем карту id -> item для быстрых проверок */
function collectMap(items: TreeItem[], map = new Map<string, TreeItem>()) {
  for (const it of items) {
    map.set(it.id, it);
    if (it.children) collectMap(it.children, map);
  }
  return map;
}

/** Корневой компонент дерева */
export default function Tree({
                               items,
                               expanded,
                               selectedId,
                               onToggle,
                               onSelect,
                               onDrop,
                               onRename,
                               onDelete,
                               renderIcon,
                               allowDrop,
                             }: TreeProps) {
  const itemsMap = useMemo(() => collectMap(items), [items]);

  // дефолтное правило: inside только в папку; before/after — везде
  const canDrop = useMemo(
    () =>
      allowDrop ??
      ((src: TreeItem, dst: TreeItem, pos: DropPosition) => {
        if (src.id === dst.id) return false;
        if (pos === "inside") return dst.type === "folder";
        return true;
      }),
    [allowDrop]
  );

  // помним текущий перетаскиваемый id (чтобы корректно валидировать over/drop)
  const draggingIdRef = useRef<string | null>(null);

  return (
    <div className="text-sm select-none">
      {items.map((it) => (
        <TreeNode
          key={it.id}
          item={it}
          depth={0}
          expanded={expanded}
          selectedId={selectedId ?? null}
          onToggle={onToggle}
          onSelect={onSelect}
          onDrop={onDrop}
          onRename={onRename}
          onDelete={onDelete}
          renderIcon={renderIcon}
          itemsMap={itemsMap}
          canDrop={canDrop}
          draggingIdRef={draggingIdRef}
        />
      ))}
    </div>
  );
}

/** Узел дерева */
function TreeNode({
                    item,
                    depth,
                    expanded,
                    selectedId,
                    onToggle,
                    onSelect,
                    onDrop,
                    onRename,
                    onDelete,
                    renderIcon,
                    itemsMap,
                    canDrop,
                    draggingIdRef,
                  }: {
  item: TreeItem;
  depth: number;
  expanded: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDrop?: (sourceId: string, targetId: string, pos: DropPosition) => void;
  onRename?: (id: string, nextName: string) => void;
  onDelete?: (id: string) => void;
  renderIcon?: (item: TreeItem, expanded: boolean) => React.ReactNode;
  itemsMap: Map<string, TreeItem>;
  canDrop: (source: TreeItem, target: TreeItem, pos: DropPosition) => boolean;
  draggingIdRef: React.MutableRefObject<string | null>;
}) {
  const isExpanded = expanded.has(item.id);
  const hasChildren = !!(item.children && item.children.length);
  const isSelected = selectedId === item.id;

  const [dropHint, setDropHint] = useState<DropPosition | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function computeDropPosition(e: React.DragEvent): DropPosition {
    const el = rowRef.current!;
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y < rect.height * 0.25) return "before";
    if (y > rect.height * 0.75) return "after";
    return "inside";
  }

  const icon = useMemo(
    () => (renderIcon ? renderIcon(item, isExpanded) : iconFor(item.type, isExpanded)),
    [item, isExpanded, renderIcon]
  );

  // автофокус поля при входе в режим редактирования
  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const confirmRename = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== item.name) onRename?.(item.id, next);
    else setDraft(item.name); // откат текста
  };

  return (
    <div>
      <div
        ref={rowRef}
        className={[
          "group flex items-center gap-2 h-7 px-2 cursor-default",
          isSelected ? "bg-[#2C1A75] text-[#A89FFF]" : "text-neutral-300 hover:bg-[#2a2a2a]",
        ].join(" ")}
        style={{ paddingLeft: 8 + depth * 14 }}
        draggable={!editing}
        onClick={() => onSelect(item.id)}
        onDoubleClick={() => (hasChildren ? onToggle(item.id) : setEditing(true))}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/x-tree-id", item.id);
          e.dataTransfer.effectAllowed = "move";
          draggingIdRef.current = item.id;
        }}
        onDragEnd={() => {
          draggingIdRef.current = null;
        }}
        onDragOver={(e) => {
          if (!onDrop || editing) return;
          e.preventDefault();
          const pos = computeDropPosition(e);
          const srcId = draggingIdRef.current;
          const src = srcId ? itemsMap.get(srcId) : undefined;
          const ok = src ? canDrop(src, item, pos) : false;

          if (!ok) {
            setDropHint(null);
            e.dataTransfer.dropEffect = "none";
            return;
          }
          setDropHint(pos);
          e.dataTransfer.dropEffect = "move";
        }}
        onDragLeave={() => setDropHint(null)}
        onDrop={(e) => {
          if (!onDrop || editing) return;
          e.preventDefault();
          const srcId = e.dataTransfer.getData("text/x-tree-id") || draggingIdRef.current;
          const pos = computeDropPosition(e);
          const src = srcId ? itemsMap.get(srcId) : undefined;

          if (src && canDrop(src, item, pos)) {
            onDrop(src.id, item.id, pos);
          }
          setDropHint(null);
        }}
      >
        {/* Раскрывалка */}
        <button
          className={[
            "shrink-0 w-4 h-4 grid place-items-center rounded hover:bg-[#2a2a2a]",
            hasChildren ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronRight
            size={14}
            className={["transition-transform", isExpanded ? "rotate-90" : ""].join(" ")}
          />
        </button>

        {/* Иконка */}
        <span className={["shrink-0", isSelected ? "text-[#A89FFF]" : "opacity-80 group-hover:opacity-100"].join(" ")}>
          {icon}
        </span>

        {/* Имя / инпут */}
        {!editing ? (
          <span className="truncate">{item.name}</span>
        ) : (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") {
                setDraft(item.name);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 bg-transparent border-b border-neutral-700 outline-none text-neutral-100"
            style={{ padding: 0, height: 18, lineHeight: "18px" }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Кнопки действий */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setDraft(item.name);
            }}
          >
            <Edit2 size={14} />
          </button>
          <button
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {dropHint === "before" && <div style={{ marginLeft: 8 + depth * 14 }} className="h-px bg-[#A89FFF]" />}

      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((ch) => (
            <TreeNode
              key={ch.id}
              item={ch}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
              onDrop={onDrop}
              onRename={onRename}
              onDelete={onDelete}
              renderIcon={renderIcon}
              itemsMap={itemsMap}
              canDrop={canDrop}
              draggingIdRef={draggingIdRef}
            />
          ))}
        </div>
      )}

      {dropHint === "after" && <div style={{ marginLeft: 8 + depth * 14 }} className="h-px bg-[#A89FFF]" />}
    </div>
  );
}
