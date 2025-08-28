import type { UIElement } from './core.js';
import { Grid } from './elements/Grid.js';

export function applyGridAttachedProps(node: Element, el: UIElement) {
  const r  = node.getAttribute('Grid.Row');         if (r)  Grid.setRow(el, +r);
  const c  = node.getAttribute('Grid.Column');      if (c)  Grid.setCol(el, +c);
  const rs = node.getAttribute('Grid.RowSpan');     if (rs) Grid.setRowSpan(el, +rs);
  const cs = node.getAttribute('Grid.ColumnSpan');  if (cs) Grid.setColSpan(el, +cs);
}

export function parseSizeAttrs(node: Element, el: UIElement) {
  const w = node.getAttribute('Width');      if (w) el.prefW = parseFloat(w);
  const h = node.getAttribute('Height');     if (h) el.prefH = parseFloat(h);
  const minW = node.getAttribute('MinWidth'); if (minW) el.minW = parseFloat(minW);
  const minH = node.getAttribute('MinHeight');if (minH) el.minH = parseFloat(minH);
}

export type Len = { kind: 'auto'|'px'|'star'; v: number };
export const Auto = (): Len => ({ kind: 'auto', v: 0 });
export const Px   = (n: number): Len => ({ kind: 'px', v: n });
export const Star = (n = 1): Len => ({ kind: 'star', v: n });

export function parseLen(s?: string|null): Len {
  if (!s || s === '*') return Star(1);
  if (s === 'Auto') return Auto();
  if (s.endsWith('*')) return Star(parseFloat(s) || 1);
  return Px(parseFloat(s));
}

export function parseColor(hex?: string|null): number|undefined {
  if (!hex) return undefined;
  if (hex.startsWith('#')) return parseInt(hex.slice(1), 16);
  const n = Number(hex);
  return Number.isFinite(n) ? n : undefined;
}

export type Margin = { l: number; t: number; r: number; b: number };
export function parseMargin(s?: string | null): Margin {
  if (!s || !s.trim()) return { l: 0, t: 0, r: 0, b: 0 };
  const raw = s.trim().split(/[ ,\s]+/).filter(Boolean);
  const toNum = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const a = raw.map(toNum);
  if (a.length === 1) { const [m] = a; return { l: m, t: m, r: m, b: m }; }
  if (a.length === 2) { const [h, v] = a; return { l: h, t: v, r: h, b: v }; }
  if (a.length === 3) { const [l, t, r] = a; return { l, t, r, b: t }; }
  const [l, t, r, b] = a; return { l, t, r, b };
}

export function applyMargin(node: Element, el: UIElement) {
  const m = node.getAttribute('Margin'); if (m) (el as any).margin = parseMargin(m);
}

export function applyAlignment(node: Element, el: any) {
  const ha = node.getAttribute('HorizontalAlignment'); if (ha) el.hAlign = ha as any;
  const va = node.getAttribute('VerticalAlignment'); if (va) el.vAlign = va as any;
}
