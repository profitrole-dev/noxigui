import type { Rect } from '@noxigui/core';

const getKids = (el: any): any[] => {
  const kids: any[] = [];
  if (Array.isArray(el.children)) kids.push(...el.children);
  const child = (el as any).child;
  if (child) kids.push(child);
  const content = (el as any).content;
  if (content) kids.push(content);
  return kids;
};

export function getElementBounds(root: any, id: string): Rect | null {
  const parts = id.split('.').slice(1);
  let el: any = root;
  const path: any[] = [root];
  for (const p of parts) {
    const idx = Number(p);
    const kids = getKids(el);
    const child = kids[idx];
    if (!child) return null;
    el = child;
    path.push(el);
  }
  const rootMargin = path[0].margin ?? { l: 0, t: 0, r: 0, b: 0 };
  let x = 0;
  let y = 0;
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    const m = node.margin ?? { l: 0, t: 0, r: 0, b: 0 };
    x += (node.final?.x ?? 0) - m.l + (node.horizontalOffset ?? 0);
    y += (node.final?.y ?? 0) - m.t + (node.verticalOffset ?? 0);
    if (i < path.length - 1) {
      const p = node.padding ?? { l: 0, t: 0, r: 0, b: 0 };
      x += p.l;
      y += p.t;
    }
  }
  const target = path[path.length - 1];
  const margin = target.margin ?? { l: 0, t: 0, r: 0, b: 0 };
  if (path.length > 1) {
    x += rootMargin.l;
    y += rootMargin.t;
  }
  return {
    x,
    y,
    width: (target.final?.width ?? 0) + margin.l + margin.r,
    height: (target.final?.height ?? 0) + margin.t + margin.b,
  };
}
