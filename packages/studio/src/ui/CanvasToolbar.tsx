import React, { useEffect, useState } from "react";
import { Repeat2, ArrowLeftRight, ArrowUpDown } from "lucide-react";

export function CanvasToolbar({
                                width,
                                height,
                                onCommitSize,
                                onSwap,
                                className,
                              }: {
  width: number;
  height: number;
  onCommitSize: (w: number, h: number) => void;
  onSwap: () => void;
  className?: string;
}) {
  const [w, setW] = useState(String(width));
  const [h, setH] = useState(String(height));

  useEffect(() => { setW(String(width)); setH(String(height)); }, [width, height]);

  const commit = () => {
    const nw = parseInt(w, 10);
    const nh = parseInt(h, 10);
    if (Number.isFinite(nw) && Number.isFinite(nh)) onCommitSize(nw, nh);
  };

  return (
    <div
      className={[
        "flex items-center gap-2",
        "border-b border-[rgb(var(--cu-border))] bg-[rgb(var(--cu-grey200))]",
        "px-3 py-2 shadow-sm",
        className || "",
      ].join(" ")}
    >
      <span className="text-xs text-neutral-400">Size</span>
      <input
        value={w}
        onChange={(e) => setW(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        inputMode="numeric"
        aria-label="Width"
        className="h-7 w-[76px] px-2 rounded-sm bg-[rgb(var(--cu-topbar))]
                   border border-[rgb(var(--cu-border))] text-sm outline-none
                   focus:border-neutral-500"
      />
      <span className="text-neutral-500">×</span>
      <input
        value={h}
        onChange={(e) => setH(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        inputMode="numeric"
        aria-label="Height"
        className="h-7 w-[76px] px-2 rounded-sm bg-[rgb(var(--cu-topbar))]
                   border border-[rgb(var(--cu-border))] text-sm outline-none
                   focus:border-neutral-500"
      />

      <div className="mx-1 h-6 w-px bg-[rgb(var(--cu-border))]"/>

      <button
        title="Swap width/height"
        onClick={onSwap}
        className="h-7 w-7 grid place-items-center rounded-sm border
                   border-[rgb(var(--cu-border))] bg-[rgb(var(--cu-topbar))]
                   hover:bg-[rgb(var(--cu-grey200))] text-neutral-200"
      >
        <Repeat2 size={14}/>
      </button>

      <div className="flex items-center gap-1 ml-1 text-xs text-neutral-400">
        <ArrowLeftRight size={12}/> <span>H</span>
        <span className="opacity-40">/</span>
        <ArrowUpDown size={12}/> <span>V</span>
      </div>
    </div>
  );
}
