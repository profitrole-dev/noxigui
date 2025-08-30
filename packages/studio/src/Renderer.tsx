import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import Noxi from "noxi.js";
import { useStudio } from "./state/useStudio";
import type { Project } from "./types/project";

export function Renderer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const guiRef = useRef<ReturnType<typeof Noxi.gui.create> | null>(null);
  const resizeCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = new PIXI.Application({
      resizeTo: container,
      backgroundColor: 0x222222,
      antialias: true,
      eventFeatures: { wheel: true },
    });
    container.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const reload = async (project: Project) => {
      if (!appRef.current) return;
      const app = appRef.current;

      if (guiRef.current) {
        try {
          guiRef.current.destroy();
        } catch {}
        app.stage.removeChildren().forEach((ch) => ch.destroy());
        guiRef.current = null;
      }
      resizeCleanup.current?.();
      resizeCleanup.current = null;

      try {
        PIXI.Assets.reset();
        if (project.assets?.length) {
          PIXI.Assets.add(project.assets.map((a) => ({ alias: a.alias, src: a.src })));
          await PIXI.Assets.load(project.assets.map((a) => a.alias));
        }

        const gui = Noxi.gui.create(project.layout);
        guiRef.current = gui;
        (gui as any).viewModel = project.data;
        app.stage.addChild(gui.container.getDisplayObject());

        const relayout = () => {
          if (!appRef.current || !guiRef.current) return;
          guiRef.current.layout({
            width: appRef.current.renderer.width,
            height: appRef.current.renderer.height,
          });
        };
        relayout();

        const r: any = app.renderer as any;
        if (r && typeof r.on === "function") r.on("resize", relayout);
        else if (r && typeof r.addListener === "function") r.addListener("resize", relayout);
        resizeCleanup.current = () => {
          if (r && typeof r.off === "function") r.off("resize", relayout);
          else if (r && typeof r.removeListener === "function") r.removeListener("resize", relayout);
        };
      } catch (e) {
        console.warn("Runtime reload error:", e);
      }
    };

    const unsub = useStudio.subscribe((state, prev) => {
      if (state.project !== prev.project) reload(state.project);
    });
    reload(useStudio.getState().project);

    return () => {
      unsub();
      resizeCleanup.current?.();
      if (guiRef.current) {
        try {
          guiRef.current.destroy();
        } catch {}
        guiRef.current = null;
      }
      if (appRef.current) {
        try {
          (appRef.current as any).destroy(true, { children: true });
        } catch {}
        appRef.current = null;
      }
    };
  }, []);

  return <div id="renderer-root" ref={containerRef} className="w-full h-full" />;
}
