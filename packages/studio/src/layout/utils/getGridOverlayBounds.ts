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
  const content = (el as any).content;
  if (content) kids.push(content);
  return kids;
};

export function getGridOverlayBounds(
  gui: { root: any } | null,
  layoutSelection: LayoutSelection | null,
): { x: number; y: number; width: number; height: number } | null {
  if (!gui || !layoutSelection || layoutSelection.tag.toLowerCase() !== "grid") return null;
  const parts = layoutSelection.id.split(".").slice(1);
  let el: any = gui.root;
  const rootFinal = el.final ?? { x: 0, y: 0 };
  const rootMargin = el.margin ?? { l: 0, t: 0 };
  const rootHx = (el as any).horizontalOffset ?? 0;
  const rootVy = (el as any).verticalOffset ?? 0;
  let m: Mat = [
    1,
    0,
    0,
    1,
    rootFinal.x - rootMargin.l - rootHx,
    rootFinal.y - rootMargin.t - rootVy,
  ];
  for (const p of parts) {
    const idx = Number(p);
    const kids = getKids(el);
    const child = kids[idx];
    if (!child) return null;
    const final = child.final ?? { x: 0, y: 0 };
    const margin = child.margin ?? { l: 0, t: 0 };
    const hx = (el as any).horizontalOffset ?? 0;
    const vy = (el as any).verticalOffset ?? 0;
    const local: Mat = [1, 0, 0, 1, final.x - margin.l - hx, final.y - margin.t - vy];
    m = mul(m, local);
    el = child;
  }
  if (!(el instanceof Grid)) return null;
  const margin = el.margin ?? { l: 0, t: 0, r: 0, b: 0 };
  const width = el.final.width + margin.l + margin.r;
  const height = el.final.height + margin.t + margin.b;
  const topLeft = pt(m, 0, 0);
  const bottomRight = pt(m, width, height);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}
