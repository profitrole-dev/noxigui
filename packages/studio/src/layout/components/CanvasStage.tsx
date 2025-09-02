import React, { useRef } from "react";
import { useStudio } from "../../state/useStudio";
import { useFitScale } from "../hooks/useFitScale";

export default function CanvasStage({
                                      children,
                                      className,
                                    }: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { project } = useStudio();
  const { width, height } = project.screen ?? { width: 1280, height: 720 };

  // safe-area: пространство для канваса с учётом отступов
  const safeRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(safeRef, width, height);

  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden bg-[rgb(var(--cu-topbar))]",
        className || "",
      ].join(" ")}
    >
      {/* SAFE-AREA: 8px от всех краёв */}
      <div
        ref={safeRef}
        className="absolute"
        style={{
          top: 8,
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
