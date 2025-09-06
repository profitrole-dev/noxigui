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
  const ancestors: any[] = [];
  for (const p of parts) {
    ancestors.push(el);
    const idx = Number(p);
    const kids = getKids(el);
    const child = kids[idx];
    if (!child) return null;
    el = child;
  }
  if (!el) return null;
  let x = el.final?.x ?? 0;
  let y = el.final?.y ?? 0;
  for (const anc of ancestors) {
    x += anc.horizontalOffset ?? 0;
    y += anc.verticalOffset ?? 0;
  }
  const margin = el.margin ?? { l: 0, t: 0, r: 0, b: 0 };
  if (parts.length === 0) {
    return {
      x: 0,
      y: 0,
      width: (el.final?.width ?? 0) + margin.l + margin.r,
      height: (el.final?.height ?? 0) + margin.t + margin.b,
    };
  }
  return {
    x: x - margin.l,
    y: y - margin.t,
    width: (el.final?.width ?? 0) + margin.l + margin.r,
    height: (el.final?.height ?? 0) + margin.t + margin.b,
  };
}
