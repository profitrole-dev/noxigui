import React, { useEffect, useState } from "react";
import Tree, { type TreeItem } from "../tree/Tree";
import { useStudio } from "../../state/useStudio";

function buildTree(el: Element, path: string): TreeItem {
  return {
    id: path,
    name: el.tagName,
    type: "view",
    children: Array.from(el.children).map((c, i) =>
      buildTree(c, `${path}.${i}`),
    ),
  };
}

export function SceneTreePanel() {
  const { project } = useStudio();
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
      setExpanded(new Set(["0"]));
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
      />
    </div>
  );
}

