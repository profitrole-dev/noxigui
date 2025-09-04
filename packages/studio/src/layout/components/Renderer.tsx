import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import Noxi from "noxi.js";
import { Grid } from "@noxigui/runtime";
import { useStudio } from "../../state/useStudio";
import type { Project } from "../../types/project";
import CanvasStage from "./CanvasStage";

export function Renderer() {
  const { project } = useStudio();
  const mountRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const guiRef = useRef<ReturnType<typeof Noxi.gui.create> | null>(null);

  // хранить прошлую карту alias->src, чтобы делать дифф
  const prevAssetsRef = useRef<Record<string, string>>({});

  const toMap = (assets: Project["assets"] | undefined | null) =>
    Object.fromEntries((assets ?? []).map((a) => [a.alias, a.src]));

  // надежная синхронизация ассетов
  const syncAssets = async (assets: Project["assets"] | undefined | null) => {
    const prev = prevAssetsRef.current;
    const next = toMap(assets);

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

    // 1) выгружаем из Assets и TextureCache удалённые/изменённые
    const toUnload = [...removed, ...changed];
    if (toUnload.length) {
      await Promise.all(
        toUnload.map(async (alias) => {
          try { await PIXI.Assets.unload(alias); } catch {}
          try { PIXI.Texture.removeFromCache?.(alias); } catch {}
        })
      );
    }

    // 2) регистрируем актуальные пары alias/src
    const entries = Object.entries(next).map(([alias, src]) => ({ alias, src }));
    if (entries.length) PIXI.Assets.add(entries);

    // 3) загружаем новые/изменённые (на холодном старте это будут все)
    const needLoad = [...added, ...changed];
    if (needLoad.length) {
      const loaded = await PIXI.Assets.load(needLoad);

      // 3.1) положить текстуры в TextureCache под алиасами
      for (const alias of needLoad) {
        const res = (loaded as any)[alias] ?? PIXI.Assets.get(alias);
        // Пытаемся извлечь Texture из результата (часто это Texture/BaseTexture/HTMLImage)
        let texture: PIXI.Texture | null = null;
        if (res instanceof PIXI.Texture) texture = res;
        else if (res?.baseTexture instanceof PIXI.BaseTexture) texture = new PIXI.Texture(res.baseTexture);
        else if (res instanceof HTMLImageElement) texture = PIXI.Texture.from(res);

        if (texture) {
          // добавляем под alias на всякий случай
          try { PIXI.Texture.addToCache?.(texture, alias); } catch {}
        }
      }
    }

    prevAssetsRef.current = next;
  };

  // Инициализация Pixi и маунт
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
      try { guiRef.current?.destroy(); } catch {}
      guiRef.current = null;
      try { (app as any).destroy(true, { children: true }); } catch {}
      appRef.current = null;
      if (mount.contains(view)) mount.removeChild(view);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перезагрузка сцены при смене проекта (layout/data/assets/screen)
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    (async () => {
      // 0) ассеты — строго дождаться загрузки
      await syncAssets(project.assets);

      // 1) зачистить предыдущий GUI
      if (guiRef.current) {
        try { guiRef.current.destroy(); } catch {}
        app.stage.removeChildren().forEach((ch: any) => ch.destroy?.());
        guiRef.current = null;
      }

      // 2) создать GUI и положить на сцену ТОЛЬКО после загрузки ассетов
      try {
        const gui = Noxi.gui.create(project.layout);
        guiRef.current = gui;
        (gui as any).viewModel = project.data;

        app.stage.addChild(gui.container.getDisplayObject());
        gui.layout({ width: app.renderer.width, height: app.renderer.height });
      } catch (e) {
        console.warn("Runtime reload error:", e);
      }
    })();
  }, [project]);

  // Ресайз Pixi при смене logical screen size
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
        <>
          <div ref={mountRef} className="w-full h-full" />
          <SelectionOverlay guiRef={guiRef} />
        </>
      </CanvasStage>
    </div>
  );
}

function SelectionOverlay({
  guiRef,
}: {
  guiRef: React.MutableRefObject<ReturnType<typeof Noxi.gui.create> | null>;
}) {
  const project = useStudio((s) => s.project); // subscribe to project changes
  const layoutSelection = useStudio((s) => s.layoutSelection);
  if (!layoutSelection || layoutSelection.tag.toLowerCase() !== "grid") return null;
  const gui = guiRef.current;
  if (!gui) return null;

  const getKids = (el: any): any[] => {
    const kids: any[] = [];
    if (Array.isArray(el.children)) kids.push(...el.children);
    const child = (el as any).child;
    if (child) kids.push(child);
    return kids;
  };

  const parts = layoutSelection.id.split(".").slice(1);
  let el: any = gui.root;

  // 2x3 matrix: [a, b, c, d, tx, ty]
  type Mat = [number, number, number, number, number, number];
  const mul = (m1: Mat, m2: Mat): Mat => [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
  const pt = (m: Mat, x: number, y: number) => ({
    x: m[0] * x + m[2] * y + m[4],
    y: m[1] * x + m[3] * y + m[5],
  });

  let m: Mat = [1, 0, 0, 1, el.final?.x ?? 0, el.final?.y ?? 0];
  for (const p of parts) {
    const idx = Number(p);
    const kids = getKids(el);
    el = kids[idx];
    if (!el) return null;
    const local: Mat = [1, 0, 0, 1, el.final?.x ?? 0, el.final?.y ?? 0];
    m = mul(m, local);
  }
  if (!(el instanceof Grid)) return null;

  const color = "#3da5ff";
  const size =
    parts.length === 0
      ? {
          width: project.screen?.width ?? el.final.width,
          height: project.screen?.height ?? el.final.height,
        }
      : { width: el.final.width, height: el.final.height };
  const topLeft = pt(m, 0, 0);
  const bottomRight = pt(m, size.width, size.height);
  const x = topLeft.x;
  const y = topLeft.y;
  const w = bottomRight.x - topLeft.x;
  const h = bottomRight.y - topLeft.y;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        border: `2px solid ${color}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: 0,
          transform: "translateY(-100%)",
          background: color,
          color: "#fff",
          fontSize: 10,
          padding: "1px 4px",
        }}
      >
        {layoutSelection.name}
      </div>
    </div>
  );
}
