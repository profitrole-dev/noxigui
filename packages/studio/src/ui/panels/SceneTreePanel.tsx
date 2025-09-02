import React, { useEffect, useState } from "react";
import Tree, { type TreeItem } from "../tree/Tree";
import { useStudio } from "../../state/useStudio";
import { ContextPanel } from "./ContextPanel";
import {
  Box,
  Component,
  Image as ImageIcon,
  MousePointer,
  Square,
  Type as TextIcon,
} from "lucide-react";

// Tags that should not appear in the scene tree.
const HIDDEN_TAGS = new Set(["Resources", "Template"]);

function visibleChildren(el: Element): Element[] {
  return Array.from(el.children).filter(
    (c) => !HIDDEN_TAGS.has(c.tagName) && !c.tagName.includes("."),
  );
}

function buildTree(el: Element, path: string): TreeItem {
  const nameAttr = el.getAttribute("name");
  return {
    id: path,
    name: nameAttr || el.tagName,
    type: "view",
    tag: el.tagName,
    children: visibleChildren(el).map((c, i) => buildTree(c, `${path}.${i}`)),
  };
}

function iconForItem(item: TreeItem): React.ReactNode {
  const tag = item.tag?.toLowerCase() || "";
  if (tag.includes("image")) return <ImageIcon size={16} />;
  if (tag.includes("text") || tag.includes("label")) return <TextIcon size={16} />;
  if (tag.includes("button")) return <MousePointer size={16} />;
  if (tag.includes("rect") || tag.includes("square")) return <Square size={16} />;
  if (item.children && item.children.length) return <Box size={16} />;
  return <Component size={16} />;
}

function findByPath(el: Element, path: string): Element | null {
  const parts = path.split(".").slice(1);
  let curr: Element | undefined = el;
  for (const p of parts) {
    if (!curr) return null;
    const idx = Number(p);
    const kids = visibleChildren(curr);
    curr = kids[idx];
  }
  return curr ?? null;
}

export function SceneTreePanel() {
  const { project, setLayout } = useStudio();
  const [root, setRoot] = useState<TreeItem | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["0"]));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dom = new DOMParser().parseFromString(
      project.layout,
      "application/xml",
    );
    const el = dom.documentElement;
    if (el && el.nodeName !== "parsererror") {
      setRoot(buildTree(el, "0"));
      setExpanded((prev) => (prev.size ? new Set(prev) : new Set(["0"])));
    } else {
      setRoot(null);
    }
  }, [project.layout]);

  if (!root)
    return (
      <ContextPanel topbar={<span>Scene</span>}>
        <div className="px-2 py-1 text-neutral-500">Invalid layout</div>
      </ContextPanel>
    );

  return (
    <ContextPanel topbar={<span>Scene</span>}>
      <Tree
        items={[root]}
        expanded={expanded}
        selected={selected}
        renderIcon={(item) => iconForItem(item)}
        renderLabel={(item) => (
          <span className="truncate">
            {item.name}
            {item.tag && item.name !== item.tag && (
              <span className="ml-1 text-xs text-neutral-400">({item.tag})</span>
            )}
          </span>
        )}
        onToggle={(id) =>
          setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          })
        }
        onSelect={setSelected}
        onRename={(id, nextName) => {
          const dom = new DOMParser().parseFromString(
            project.layout,
            "application/xml",
          );
          const rootEl = dom.documentElement;
          if (!rootEl || rootEl.nodeName === "parsererror") return;
          const target = findByPath(rootEl, id);
          if (!target) return;
          target.setAttribute("name", nextName);
          const xml = new XMLSerializer().serializeToString(dom);
          setLayout(xml);
        }}
      />
    </ContextPanel>
  );
}

