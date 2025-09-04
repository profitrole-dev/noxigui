import { Grid } from "@noxigui/runtime";

export type LayoutSelection = { id: string; tag: string; name: string };

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

const getKids = (el: any): any[] => {
  const kids: any[] = [];
  if (Array.isArray(el.children)) kids.push(...el.children);
  const child = (el as any).child;
  if (child) kids.push(child);
  return kids;
};

export function getGridOverlayBounds(
  gui: { root: any } | null,
  layoutSelection: LayoutSelection | null,
): { x: number; y: number; width: number; height: number } | null {
  if (!gui || !layoutSelection || layoutSelection.tag.toLowerCase() !== "grid") return null;
  const parts = layoutSelection.id.split(".").slice(1);
  let el: any = gui.root;
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
  const topLeft = pt(m, 0, 0);
  const bottomRight = pt(m, el.final.width, el.final.height);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}
