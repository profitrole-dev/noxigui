import React, { useEffect, useRef, useState } from "react";

export function SplitContainer({
                               children,
                             }: {
  children: React.ReactElement[];
}) {
  const childArray = React.Children.toArray(children) as React.ReactElement[];
  const containerRef = useRef<HTMLDivElement>(null);

  const [sizes, setSizes] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("split-sizes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === childArray.length) {
            return parsed as number[];
          }
        } catch {
        }
      }
    }
    return childArray.map(() => 100 / childArray.length);
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("split-sizes", JSON.stringify(sizes));
    }
  }, [sizes]);

  const startDrag = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSizes = [...sizes];
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || 1;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const deltaPercent = (delta / width) * 100;
      const next = [...startSizes];
      next[index] = Math.max(5, startSizes[index] + deltaPercent);
      next[index + 1] = Math.max(5, startSizes[index + 1] - deltaPercent);
      setSizes(next);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div ref={containerRef} className="flex w-full h-full">
      {childArray.map((child, i) => (
        <React.Fragment key={i}>
          <div style={{ width: `${sizes[i]}%` }} className="min-h-0">
            {child}
          </div>
          {i < childArray.length - 1 && (
            <div
              className="w-1 h-full cursor-col-resize bg-neutral-700"
              onMouseDown={startDrag(i)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
