import React from "react";

type Orientation = "vertical" | "horizontal";

export function SplitGutter({
  index,
  orientation,
  onResize,
}: {
  index: number;
  orientation: Orientation;
  onResize: (index: number, delta: number) => void;
}) {
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const getPos = (ev: { clientX: number; clientY: number }) =>
      orientation === "vertical" ? ev.clientX : ev.clientY;
    let prev = getPos(e);
    const onMouseMove = (ev: MouseEvent) => {
      const pos = getPos(ev);
      const delta = pos - prev;
      prev = pos;
      onResize(index, delta);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const className =
    orientation === "vertical"
      ? "w-1 h-full cursor-col-resize bg-neutral-800"
      : "h-1 w-full cursor-row-resize bg-neutral-800";

  return <div className={className} onMouseDown={startDrag} />;
}

export default SplitGutter;
