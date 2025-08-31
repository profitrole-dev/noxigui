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

  // храним предыдущее состояние ассетов (alias -> src), чтобы делать diff
  const prevAssetsRef = useRef<Record<string, string>>({});

  // helper: построить карту alias->src
  const toAssetsMap = (assets: Project["assets"] | undefined | null) =>
    Object.fromEntries((assets ?? []).map((a) => [a.alias, a.src]));

  // аккуратная синхронизация ассетов без reset()
  const syncAssets = async (assets: Project["assets"] | undefined | null) => {
    const prev = prevAssetsRef.current;
    const next = toAssetsMap(assets);

    const prevAliases = new Set(Object.keys(prev));
    const nextAliases = new Set(Object.keys(next));

    const removed: string[] = [];
    const added: string[] = [];
    const changed: string[] = [];

    for (const a of prevAliases) {
      if (!nextAliases.has(a)) removed.push(a);
      else if (prev[a] !== next[a]) changed.push(a);
    }
    for (const a of nextAliases) {
      if (!prevAliases.has(a)) added.push(a);
    }

    // 1) выгружаем удалённые и изменённые alias
    if (removed.length || changed.length) {
      await Promise.all(
        [...removed, ...changed].map(async (alias) => {
          try {
            await PIXI.Assets.unload(alias);
          } catch {
            /* ignore */
          }
          // на всякий случай подчистим текстуру, если вдруг где-то осталась
          const tex = PIXI.Texture.removeFromCache?.(alias);
          void tex;
        })
      );
    }

    // 2) регистрируем актуальные маппинги (idempotent)
    const entries = Object.entries(next).map(([alias, src]) => ({ alias, src }));
    if (entries.length) PIXI.Assets.add(entries);

    // 3) догружаем только новые/изменённые
    const needLoad = [...added, ...changed];
    if (needLoad.length) {
      await PIXI.Assets.load(needLoad);
    }

    // 4) сохраняем "снимок" для следующего diff
    prevAssetsRef.current = next;
  };

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

    const view = app.view as HTMLCanvasElement;
    view.style.width = "100%";
    view.style.height = "100%";
    view.style.display = "block";
    view.style.background = "transparent";
    mount.appendChild(view);

    appRef.current = app;

    return () => {
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

  // Синхронизация ассетов и обновление лейаута при изменении дерева
  useEffect(() => {
    const run = async () => {
      await syncAssets(project.assets);
      const app = appRef.current;
      const gui = guiRef.current;
      if (app && gui) {
        gui.layout({ width: app.renderer.width, height: app.renderer.height });
      }
    };
    run();
  }, [project.assets, project.meta?.assetFolders, project.meta?.assetPaths]);

  // Перезагрузка GUI при смене лейаута или данных
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const reload = async (proj: Project) => {
      // 1) зачистка предыдущего GUI/сцены
      if (guiRef.current) {
        try {
          guiRef.current.destroy();
        } catch {}
        app.stage.removeChildren().forEach((ch: any) => ch.destroy?.());
        guiRef.current = null;
      }

      // 2) создание GUI
      try {
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
  }, [project.layout, project.data]);

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
        {/* mount-узел занимает всю логическую область канваса */}
        <div ref={mountRef} className="w-full h-full" />
      </CanvasStage>
    </div>
  );
}
