import { z } from "zod";

export const AssetZ = z.object({ alias: z.string(), src: z.string() });
export const ProjectZ = z.object({
  name: z.string(),
  version: z.string().default("0.1"),
  layout: z.string(),
  data: z.record(z.string(), z.any()).default({}),
  assets: z.array(AssetZ).default([]),
  meta: z.object({ theme: z.string().optional() }).optional()
});
export type Project = z.infer<typeof ProjectZ>;

