import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import Noxi from "noxi.js";
import { useStudio } from "./state/useStudio";
import type { Project } from "./types/project";
import CanvasStage from "./ui/CanvasStage";

export function Renderer() {
  const { project } = useStudio();
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const guiRef = useRef<ReturnType<typeof Noxi.gui.create> | null>(null);

  // Инициализация Pixi один раз и маунт в CanvasStage
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const app = new PIXI.Application({
      antialias: true,
      backgroundAlpha: 0,
      width: project.screen?.width ?? 1280,
      height: project.screen?.height ?? 720,
      eventFeatures: { wheel: true },
    });

    // стиль канваса: занять всю логическую область стейджа
    const view = app.view as HTMLCanvasElement;
    view.style.width = "100%";
    view.style.height = "100%";
    view.style.display = "block";
    view.style.background = "transparent";
    mount.appendChild(view);

    appRef.current = app;

    return () => {
      // cleanup
      try {
        guiRef.current?.destroy();
      } catch {}
      guiRef.current = null;
      try {
        (app as any).destroy(true, { children: true });
      } catch {}
      appRef.current = null;
      if (mount.contains(view)) mount.removeChild(view);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // только один раз

  // Перезагрузка GUI при смене проекта
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const reload = async (proj: Project) => {
      // зачистка предыдущего GUI/сцены
      if (guiRef.current) {
        try {
          guiRef.current.destroy();
        } catch {}
        app.stage.removeChildren().forEach((ch: any) => ch.destroy?.());
        guiRef.current = null;
      }

      try {
        // ассеты
        PIXI.Assets.reset();
        if (proj.assets?.length) {
          PIXI.Assets.add(proj.assets.map(a => ({ alias: a.alias, src: a.src })));
          await PIXI.Assets.load(proj.assets.map(a => a.alias));
        }

        // создание GUI
        const gui = Noxi.gui.create(proj.layout);
        guiRef.current = gui;
        (gui as any).viewModel = proj.data;

        app.stage.addChild(gui.container.getDisplayObject());

        // первичный layout по текущему логическому размеру
        gui.layout({ width: app.renderer.width, height: app.renderer.height });
      } catch (e) {
        console.warn("Runtime reload error:", e);
      }
    };

    reload(project);
  }, [project]);

  // Ресайз рендерера при смене логического размера канваса
  useEffect(() => {
    const app = appRef.current;
    const gui = guiRef.current;
    if (!app) return;

    const w = project.screen?.width ?? 1280;
    const h = project.screen?.height ?? 720;

    app.renderer.resize(w, h);
    gui?.layout({ width: w, height: h });
  }, [project.screen?.width, project.screen?.height]);

  return (
    <div className="w-full h-full relative">
      <CanvasStage>
        {/* Внутри логической области канваса — наш mount-узел */}
        <div ref={mountRef} className="w-full h-full" />
      </CanvasStage>
    </div>
  );
}
