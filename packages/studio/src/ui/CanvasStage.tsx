import React, { useRef, useState, useEffect } from "react";
import { useStudio } from "../state/useStudio";
import { CanvasToolbar } from "./CanvasToolbar";
import {useFitScale} from "../hooks/useFitScale";

export default function CanvasStage({
                                      children,
                                      className,
                                    }: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { project, setCanvasSize, swapCanvasSize } = useStudio();
  const { width, height } = project.screen ?? { width: 1280, height: 720 };

  // 1) реф тулбара и его динамическая высота
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarH, setToolbarH] = useState(40); // дефолт 40px (h-10)

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const update = () => setToolbarH(el.offsetHeight || 40);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // 2) safe-area: пространство для канваса с учётом отступов
  const safeRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(safeRef, width, height);

  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden bg-[rgb(var(--cu-topbar))]",
        className || "",
      ].join(" ")}
    >
      {/* Тулбар прижат к верху, без скруглений */}
      <div ref={toolbarRef} className="absolute top-0 left-0 right-0">
        <CanvasToolbar
          width={width}
          height={height}
          onCommitSize={(nw, nh) => setCanvasSize(nw, nh)}
          onSwap={swapCanvasSize}
          className="h-10 border-b border-[rgb(var(--cu-border))] bg-[rgb(var(--cu-grey200))]"
        />
      </div>

      {/* SAFE-AREA: 8px от всех краёв + под тулбаром ещё его высота */}
      <div
        ref={safeRef}
        className="absolute"
        style={{
          top: toolbarH + 8, // тулбар + 8px
          left: 8,
          right: 8,
          bottom: 8,
        }}
      >
        {/* Центрирование и скейл канваса внутри safe-area */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <div
            className="relative border border-[rgb(var(--cu-border))] overflow-hidden"
            style={{
              width,
              height,
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.02) 1px),
                linear-gradient(0deg,  rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.02) 1px)
              `,
              backgroundSize: "24px 24px",
              backgroundColor: "rgb(var(--cu-topbar))",
            }}
          >
            <div className="relative w-full h-full">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
