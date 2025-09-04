import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStudio } from "../../state/useStudio";
import CanvasStage from "./CanvasStage";

// helper: tags to skip in render tree
const HIDDEN_TAGS = new Set(["Resources", "Template", "Grid.RowDefinitions", "Grid.ColumnDefinitions"]);

function visibleChildren(el: Element): Element[] {
  return Array.from(el.children).filter(
    (c) => !HIDDEN_TAGS.has(c.tagName) && !c.tagName.includes("."),
  );
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

// grid definition utils
 type Def = { type: "px" | "*"; value: number };

function parseDefs(grid: Element, kind: "row" | "col"): Def[] {
  const groupTag = kind === "row" ? "Grid.RowDefinitions" : "Grid.ColumnDefinitions";
  const defTag = kind === "row" ? "RowDefinition" : "ColumnDefinition";
  const attr = kind === "row" ? "Height" : "Width";
  const group = Array.from(grid.children).find((c) => c.tagName === groupTag);
  if (!group) return [];
  return Array.from(group.children)
    .filter((c) => c.tagName === defTag)
    .map((c) => {
      const val = (c as Element).getAttribute(attr) || "*";
      if (val.endsWith("*"))
        return { type: "*", value: parseFloat(val.slice(0, -1)) || 1 };
      return { type: "px", value: parseFloat(val) || 0 };
    });
}

function defsToTemplate(defs: Def[]): string {
  return defs
    .map((d) => (d.type === "px" ? `${d.value}px` : `${d.value}fr`))
    .join(" ");
}

function computeSizes(defs: Def[], total: number): number[] {
  const fixed = defs.filter((d) => d.type === "px").reduce((s, d) => s + d.value, 0);
  const star = defs.filter((d) => d.type === "*").reduce((s, d) => s + d.value, 0);
  const unit = star > 0 ? Math.max(0, (total - fixed) / star) : 0;
  return defs.map((d) => (d.type === "px" ? d.value : d.value * unit));
}

function applyDefs(grid: Element, defs: Def[], kind: "row" | "col") {
  const groupTag = kind === "row" ? "Grid.RowDefinitions" : "Grid.ColumnDefinitions";
  const defTag = kind === "row" ? "RowDefinition" : "ColumnDefinition";
  const attr = kind === "row" ? "Height" : "Width";
  let group = Array.from(grid.children).find((c) => c.tagName === groupTag) as Element | undefined;
  if (!group) {
    group = grid.ownerDocument.createElement(groupTag);
    grid.insertBefore(group, grid.firstChild);
  }
  while (group.firstChild) group.removeChild(group.firstChild);
  defs.forEach((d) => {
    const el = grid.ownerDocument.createElement(defTag);
    el.setAttribute(attr, d.type === "px" ? `${Math.round(d.value)}` : `${Math.round(d.value)}*`);
    group!.appendChild(el);
  });
}

export function HtmlRenderer() {
  const { project, selectedLayoutIds, setLayout } = useStudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Record<string, HTMLElement | null>>({});
  const [overlay, setOverlay] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    cols: number[];
    rows: number[];
  } | null>(null);

  const doc = useMemo(() => {
    const dom = new DOMParser().parseFromString(project.layout, "application/xml");
    return dom.documentElement?.nodeName === "parsererror" ? null : dom.documentElement;
  }, [project.layout]);

  const renderElement = (el: Element, path: string): React.ReactNode => {
    const ref = (node: HTMLElement | null) => {
      elementRefs.current[path] = node;
    };
    const placement: React.CSSProperties = {};
    const row = el.getAttribute("Grid.Row");
    const col = el.getAttribute("Grid.Column");
    const rowSpan = el.getAttribute("Grid.RowSpan");
    const colSpan = el.getAttribute("Grid.ColumnSpan");
    if (row) placement.gridRow = `${Number(row) + 1} / span ${rowSpan ? Number(rowSpan) : 1}`;
    if (col) placement.gridColumn = `${Number(col) + 1} / span ${colSpan ? Number(colSpan) : 1}`;

    if (el.tagName === "Grid") {
      const rowDefs = parseDefs(el, "row");
      const colDefs = parseDefs(el, "col");
      return (
        <div
          key={path}
          ref={ref}
          data-path={path}
          style={{
            position: "relative",
            display: "grid",
            width: "100%",
            height: "100%",
            gridTemplateRows: defsToTemplate(rowDefs) || "1fr",
            gridTemplateColumns: defsToTemplate(colDefs) || "1fr",
            ...placement,
          }}
        >
          {visibleChildren(el).map((c, i) => renderElement(c, `${path}.${i}`))}
        </div>
      );
    }

    return (
      <div
        key={path}
        ref={ref}
        data-path={path}
        style={{
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          fontSize: 10,
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          ...placement,
        }}
      >
        {el.getAttribute("name") || el.tagName}
        {visibleChildren(el).map((c, i) => renderElement(c, `${path}.${i}`))}
      </div>
    );
  };

  // overlay computation
  useEffect(() => {
    const id = Array.from(selectedLayoutIds)[0];
    const container = containerRef.current;
    const rootEl = doc;
    if (!id || !container || !rootEl) {
      setOverlay(null);
      return;
    }
    const gridEl = elementRefs.current[id];
    const gridXml = findByPath(rootEl, id);
    if (!gridEl || !gridXml) {
      setOverlay(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const rect = gridEl.getBoundingClientRect();
    const rowDefs = parseDefs(gridXml, "row");
    const colDefs = parseDefs(gridXml, "col");
    const colSizes = computeSizes(colDefs, rect.width);
    const rowSizes = computeSizes(rowDefs, rect.height);
    const colLines: number[] = [];
    const rowLines: number[] = [];
    let acc = 0;
    for (let i = 0; i < colSizes.length - 1; i++) {
      acc += colSizes[i];
      colLines.push(acc);
    }
    acc = 0;
    for (let i = 0; i < rowSizes.length - 1; i++) {
      acc += rowSizes[i];
      rowLines.push(acc);
    }
    setOverlay({
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
      cols: colLines,
      rows: rowLines,
    });
  }, [doc, selectedLayoutIds, project.screen?.width, project.screen?.height]);

  // drag logic
  const dragRef = useRef<
    | { type: "col" | "row"; index: number; startX: number; startY: number; layout: string }
    | null
  >(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const id = Array.from(selectedLayoutIds)[0];
      if (!id) return;
      const dom = new DOMParser().parseFromString(drag.layout, "application/xml");
      const rootEl = dom.documentElement;
      const grid = findByPath(rootEl, id);
      if (!grid || !overlay) return;
      const defs = parseDefs(grid, drag.type);
      const sizes = computeSizes(defs, drag.type === "col" ? overlay.width : overlay.height);
      const delta = drag.type === "col" ? e.clientX - drag.startX : e.clientY - drag.startY;
      const i = drag.index;
      const a = Math.max(0, sizes[i] + delta);
      const b = Math.max(0, sizes[i + 1] - delta);
      sizes[i] = a;
      sizes[i + 1] = b;
      const nextDefs = defs.map((d, idx) => ({
        type: d.type,
        value: sizes[idx],
      }));
      applyDefs(grid, nextDefs, drag.type);
      const xml = new XMLSerializer().serializeToString(dom);
      setLayout(xml);
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      dragRef.current = null;
    }
    if (dragRef.current) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [overlay, selectedLayoutIds, setLayout]);

  const startDrag = (type: "col" | "row", index: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      type,
      index,
      startX: e.clientX,
      startY: e.clientY,
      layout: project.layout,
    };
  };

  if (!doc)
    return (
      <div className="w-full h-full relative">
        <CanvasStage>
          <div className="w-full h-full" />
        </CanvasStage>
      </div>
    );

  return (
    <div className="w-full h-full relative">
      <CanvasStage>
        <div ref={containerRef} className="w-full h-full relative">
          {renderElement(doc, "0")}
          {overlay && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: overlay.x,
                top: overlay.y,
                width: overlay.width,
                height: overlay.height,
              }}
            >
              {overlay.cols.map((x, i) => (
                <div
                  key={`c${i}`}
                  className="absolute top-0 bottom-0 cursor-col-resize pointer-events-auto"
                  style={{ left: x - 1, width: 2, background: "rgba(0,150,255,0.8)" }}
                  onMouseDown={(e) => startDrag("col", i, e)}
                />
              ))}
              {overlay.rows.map((y, i) => (
                <div
                  key={`r${i}`}
                  className="absolute left-0 right-0 cursor-row-resize pointer-events-auto"
                  style={{ top: y - 1, height: 2, background: "rgba(0,150,255,0.8)" }}
                  onMouseDown={(e) => startDrag("row", i, e)}
                />
              ))}
            </div>
          )}
        </div>
      </CanvasStage>
    </div>
  );
}

export default HtmlRenderer;
