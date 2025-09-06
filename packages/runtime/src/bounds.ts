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

  const rootMargin = root.margin ?? { l: 0, t: 0, r: 0, b: 0 };

  // start from the root's outer position relative to the canvas
  let x = (root.final?.x ?? 0) - rootMargin.l;
  let y = (root.final?.y ?? 0) - rootMargin.t;

  for (let i = 0; i < path.length - 1; i++) {
    const parent = path[i];
    const child = path[i + 1];
    const p = parent.padding ?? { l: 0, t: 0, r: 0, b: 0 };
    x += (parent.horizontalOffset ?? 0) + p.l;
    y += (parent.verticalOffset ?? 0) + p.t;
    const cm = child.margin ?? { l: 0, t: 0, r: 0, b: 0 };
    x += (child.final?.x ?? 0) - cm.l;
    y += (child.final?.y ?? 0) - cm.t;
  }

  const target = path[path.length - 1];
  const margin = target.margin ?? { l: 0, t: 0, r: 0, b: 0 };

  return {
    x,
    y,
    width: (target.final?.width ?? 0) + margin.l + margin.r,
    height: (target.final?.height ?? 0) + margin.t + margin.b,
  };
}
