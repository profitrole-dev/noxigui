import React, { useEffect, useState } from "react";
import Tree, { type TreeItem } from "../tree/Tree";
import { useStudio } from "../../state/useStudio";

// Tags that should not appear in the scene tree.
const HIDDEN_TAGS = new Set(["Resources", "Template"]);

function visibleChildren(el: Element): Element[] {
  return Array.from(el.children).filter(
    (c) => !HIDDEN_TAGS.has(c.tagName) && !c.tagName.includes("."),
  );
}

function buildTree(el: Element, path: string): TreeItem {
  return {
    id: path,
    name: el.getAttribute("name") || el.tagName,
    type: "view",
    children: visibleChildren(el).map((c, i) => buildTree(c, `${path}.${i}`)),
  };
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
      <div className="p-2 text-sm">
        <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide">
          Scene
        </div>
        <div className="px-2 py-1 text-neutral-500">Invalid layout</div>
      </div>
    );

  return (
    <div className="p-2 text-sm">
      <div className="px-2 py-1 text-neutral-400 uppercase text-xs tracking-wide">
        Scene
      </div>
      <Tree
        items={[root]}
        expanded={expanded}
        selected={selected}
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
    </div>
  );
}

