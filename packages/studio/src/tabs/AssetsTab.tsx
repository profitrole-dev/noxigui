import React from "react";
import { useStudio } from "../state/useStudio";
import type { DragEvent } from "react";

export function AssetsTab() {
  const { project, setAssets } = useStudio();

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const entries = await Promise.all(
      files.map(async (f) => {
        const url = URL.createObjectURL(f);
        return { alias: f.name.replace(/\.[^/.]+$/, ""), src: url };
      })
    );
    setAssets([...(project.assets || []), ...entries]);
  };

  return (
    <div
      className="h-full w-full p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="grid grid-cols-4 gap-8">
        {(project.assets || []).map((a) => (
          <div key={a.alias} className="flex flex-col gap-2 items-center">
            <img
              src={a.src}
              className="w-24 h-24 object-contain bg-neutral-900 rounded"
            />
            <div className="text-xs opacity-80">{a.alias}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm opacity-60">Drag & drop images here…</div>
    </div>
  );
}


