// storage.ts
import { get, set, del, keys } from "idb-keyval";
import type { Project } from "../types/project.js";

const PROJECT_KEY = "noxigui:project:v2";
const ASSET_PREFIX = "noxigui:asset:";

const isDataUrl = (s: string) => s.startsWith("data:");

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

// 🔹 добавь помощник Blob -> dataURL
async function blobToDataURL(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function saveProjectToIDB(project: Project) {
  const metaOnly: Project = {
    ...project,
    // в проект не кладём тяжёлые src
    assets: project.assets.map(a => ({ alias: a.alias, name: (a as any).name, src: "" } as any)),
  };
  await set(PROJECT_KEY, metaOnly);

  for (const a of project.assets) {
    if (!a.src) continue;
    if (isDataUrl(a.src)) {
      const blob = await dataUrlToBlob(a.src);
      await set(ASSET_PREFIX + a.alias, blob);
    } else {
      await set(ASSET_PREFIX + a.alias, a.src); // внешний URL
    }
  }
}

export async function loadProjectFromIDB(): Promise<Project | null> {
  const meta = (await get(PROJECT_KEY)) as Project | undefined;
  if (!meta) return null;

  const assets: Project["assets"] = [];
  for (const a of meta.assets ?? []) {
    const stored = await get(ASSET_PREFIX + a.alias);
    let src = "";
    if (stored instanceof Blob) {
      // 🔸 ключевая строка: делаем dataURL, не blob:URL
      src = await blobToDataURL(stored);
    } else if (typeof stored === "string") {
      src = stored; // внешний URL
    }
    assets.push({ alias: a.alias, name: (a as any).name, src });
  }
  return { ...meta, assets };
}

export async function deleteMissingAssetBlobs(validAliases: string[]) {
  const valid = new Set(validAliases.map(a => ASSET_PREFIX + a));
  for (const k of await keys()) {
    if (typeof k === "string" && k.startsWith(ASSET_PREFIX) && !valid.has(k)) {
      await del(k);
    }
  }
}
