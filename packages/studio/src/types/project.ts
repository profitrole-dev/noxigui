import { z } from "zod";

export const AssetZ = z.object({ alias: z.string(), src: z.string() });

export const ScreenZ = z.object({
  width: z.number().int().min(1).default(1280),
  height: z.number().int().min(1).default(720),
  name: z.string().optional(),
});

export const ProjectZ = z.object({
  name: z.string(),
  version: z.string().default("0.1"),
  layout: z.string(),
  data: z.record(z.string(), z.any()).default({}),
  assets: z.array(AssetZ).default([]),
  meta: z
    .object({
      theme: z.string().optional(),
      assetFolders: z.array(z.string()).default([]),                // список папок (корневых и/или вложенных, формат "Textures/Monsters")
      assetPaths: z.record(z.string(), z.string()).default({}),     // alias -> "Textures/Monsters" ; пустая строка или отсутствие => корень
    })
    .default({ assetFolders: [], assetPaths: {} }),
  screen: ScreenZ.default({ width: 1280, height: 720 }),
});
export type Project = z.infer<typeof ProjectZ>;

