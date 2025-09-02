import React, { useEffect, useRef, useState } from "react";
import { SplitGutter } from "./SplitGutter";

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

  const handleResize = (index: number, delta: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || 1;
    const deltaPercent = (delta / width) * 100;
    setSizes((prev) => {
      const next = [...prev];
      next[index] = Math.max(5, prev[index] + deltaPercent);
      next[index + 1] = Math.max(5, prev[index + 1] - deltaPercent);
      return next;
    });
  };

  return (
    <div ref={containerRef} className="flex w-full h-full">
      {childArray.map((child, i) => (
        <React.Fragment key={i}>
          <div style={{ width: `${sizes[i]}%` }} className="min-h-0">
            {child}
          </div>
          {i < childArray.length - 1 && (
            <SplitGutter index={i} orientation="vertical" onResize={handleResize} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
