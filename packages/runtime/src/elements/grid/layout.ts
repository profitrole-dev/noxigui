import type { Size, Rect } from '@noxigui/core';
import { Grid, Row, Col } from '../Grid.js';
import { rowMap, colMap, rowSpan, colSpan } from './data.js';

export function measureGrid(g: Grid, avail: Size) {
  if (g.rows.length === 0) g.rows.push(new Row({ kind: 'star', v: 1 }));
  if (g.cols.length === 0) g.cols.push(new Col({ kind: 'star', v: 1 }));

  const innerAvail = {
    width: Math.max(0, avail.width - g.margin.l - g.margin.r),
    height: Math.max(0, avail.height - g.margin.t - g.margin.b),
  };

  const finiteW = Number.isFinite(innerAvail.width);
  const finiteH = Number.isFinite(innerAvail.height);

  const rowCount = g.rows.length;
  const colCount = g.cols.length;

  g.rows.forEach(r => { r.actual = r.len.kind === 'px' ? r.len.v : 0; r.desired = 0; });
  g.cols.forEach(c => { c.actual = c.len.kind === 'px' ? c.len.v : 0; c.desired = 0; });

  const totalRowGaps = Math.max(0, rowCount - 1) * g.rowGap;
  const totalColGaps = Math.max(0, colCount - 1) * g.colGap;

  const pixelHAll = g.rows.filter(r => r.len.kind === 'px').reduce((s, r) => s + r.len.v, 0);
  const pixelWAll = g.cols.filter(c => c.len.kind === 'px').reduce((s, c) => s + c.len.v, 0);

  const starHAll = finiteH ? g.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0) : 0;
  const starWAll = finiteW ? g.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0) : 0;

  const remH0 = finiteH ? Math.max(0, innerAvail.height - pixelHAll - totalRowGaps) : 0;
  const remW0 = finiteW ? Math.max(0, innerAvail.width - pixelWAll - totalColGaps) : 0;

  const sumPixelCols = (start: number, span: number) => {
    let s = 0; for (let i = 0; i < span; i++) { const c = g.cols[start + i]; if (c && c.len.kind === 'px') s += c.len.v; }
    return s;
  };
  const sumPixelRows = (start: number, span: number) => {
    let s = 0; for (let i = 0; i < span; i++) { const r = g.rows[start + i]; if (r && r.len.kind === 'px') s += r.len.v; }
    return s;
  };
  const sumStarCols = (start: number, span: number) => {
    let s = 0; for (let i = 0; i < span; i++) { const c = g.cols[start + i]; if (c && c.len.kind === 'star') s += c.len.v; }
    return s;
  };
  const sumStarRows = (start: number, span: number) => {
    let s = 0; for (let i = 0; i < span; i++) { const r = g.rows[start + i]; if (r && r.len.kind === 'star') s += r.len.v; }
    return s;
  };

  for (const ch of g.children) {
    let r = (rowMap.get(ch) ?? 0) | 0;
    let c = (colMap.get(ch) ?? 0) | 0;
    r = Math.min(Math.max(0, r), rowCount - 1);
    c = Math.min(Math.max(0, c), colCount - 1);

    let rs = (rowSpan.get(ch) ?? 1) | 0;
    let cs = (colSpan.get(ch) ?? 1) | 0;
    rs = Math.min(Math.max(1, rs), rowCount - r);
    cs = Math.min(Math.max(1, cs), colCount - c);

    const baseW =
      sumPixelCols(c, cs) +
      (starWAll > 0 ? (sumStarCols(c, cs) / starWAll) * remW0 : 0) +
      (cs - 1) * g.colGap;

    const baseH =
      sumPixelRows(r, rs) +
      (starHAll > 0 ? (sumStarRows(r, rs) / starHAll) * remH0 : 0) +
      (rs - 1) * g.rowGap;

    const hasWidthLimiter = (sumPixelCols(c, cs) > 0) || (finiteW && sumStarCols(c, cs) > 0);
    const hasHeightLimiter = (sumPixelRows(r, rs) > 0) || (finiteH && sumStarRows(r, rs) > 0);

    const approxW = hasWidthLimiter ? Math.max(1, baseW) : Infinity;
    const approxH = hasHeightLimiter ? Math.max(1, baseH) : Infinity;

    ch.measure({ width: approxW, height: approxH });

    const perRow = ch.desired.height / rs;
    for (let i = 0; i < rs; i++) {
      const row = g.rows[r + i];
      if (!row) continue;
      if (row.len.kind === 'auto') row.desired = Math.max(row.desired, perRow);
      if (!finiteH && row.len.kind === 'star') row.desired = Math.max(row.desired, perRow);
    }

    const perCol = ch.desired.width / cs;
    for (let i = 0; i < cs; i++) {
      const col = g.cols[c + i];
      if (!col) continue;
      if (col.len.kind === 'auto') col.desired = Math.max(col.desired, perCol);
      if (!finiteW && col.len.kind === 'star') col.desired = Math.max(col.desired, perCol);
    }
  }

  for (const r of g.rows) if (r.len.kind === 'auto') r.actual = Math.ceil(r.desired);
  for (const c of g.cols) if (c.len.kind === 'auto') c.actual = Math.ceil(c.desired);

  const usedW = g.cols.reduce((s, c) => s + c.actual, 0);
  const usedH = g.rows.reduce((s, r) => s + r.actual, 0);

  const remW = finiteW ? Math.max(0, innerAvail.width - usedW - totalColGaps) : 0;
  const remH = finiteH ? Math.max(0, innerAvail.height - usedH - totalRowGaps) : 0;

  const starWUsed = g.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0);
  const starHUsed = g.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0);

  for (const c of g.cols) {
    if (c.len.kind === 'star') {
      c.actual = finiteW ? (starWUsed ? c.len.v / starWUsed : 0) * remW : Math.ceil(c.desired);
    }
  }
  for (const r of g.rows) {
    if (r.len.kind === 'star') {
      r.actual = finiteH ? (starHUsed ? r.len.v / starHUsed : 0) * remH : Math.ceil(r.desired);
    }
  }

  const widthSum = g.cols.reduce((s, c) => s + c.actual, 0) + totalColGaps;
  const heightSum = g.rows.reduce((s, r) => s + r.actual, 0) + totalRowGaps;

  const intrinsicW = widthSum + g.margin.l + g.margin.r;
  const intrinsicH = heightSum + g.margin.t + g.margin.b;
  (g as any).desired = {
    width: (g as any).measureAxis('x', avail.width, intrinsicW),
    height: (g as any).measureAxis('y', avail.height, intrinsicH),
  } as Size;
}

export function arrangeGrid(g: Grid, rect: Rect) {
  const rowCount = g.rows.length;
  const colCount = g.cols.length;
  const inner = (g as any).arrangeSelf(rect) as Rect;

  const xs: number[] = [0];
  for (const c of g.cols) xs.push(xs[xs.length - 1] + c.actual);
  const ys: number[] = [0];
  for (const r of g.rows) ys.push(ys[ys.length - 1] + r.actual);

  for (const ch of g.children) {
    let r = (rowMap.get(ch) ?? 0) | 0;
    let c = (colMap.get(ch) ?? 0) | 0;
    r = Math.min(Math.max(0, r), Math.max(0, rowCount - 1));
    c = Math.min(Math.max(0, c), Math.max(0, colCount - 1));

    let rs = (rowSpan.get(ch) ?? 1) | 0;
    let cs = (colSpan.get(ch) ?? 1) | 0;
    rs = Math.min(Math.max(1, rs), Math.max(1, rowCount - r));
    cs = Math.min(Math.max(1, cs), Math.max(1, colCount - c));

    const x = inner.x + xs[c] + c * g.colGap;
    const y = inner.y + ys[r] + r * g.rowGap;

    const w = (xs[c + cs] - xs[c]) + (cs - 1) * g.colGap;
    const h = (ys[r + rs] - ys[r]) + (rs - 1) * g.rowGap;

    ch.arrange({ x, y, width: w, height: h });
  }

  if (g.debug) {
    import('./debug.js').then(m => m.drawDebug(g, xs.map(v => v + inner.x), ys.map(v => v + inner.y)));
  }
}

