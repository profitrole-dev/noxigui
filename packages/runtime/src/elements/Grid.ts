import { UIElement } from '../core.js';
import type { Size, Rect } from '../core.js';
import type { Len } from '../helpers.js';
import type { Renderer, RenderGraphics } from '../renderer.js';
import { BorderPanel } from './BorderPanel.js';

export class Row { actual = 0; desired = 0; constructor(public len: Len) {} }
export class Col { actual = 0; desired = 0; constructor(public len: Len) {} }

const rowMap = new WeakMap<UIElement, number>();
const colMap = new WeakMap<UIElement, number>();
const rowSpan = new WeakMap<UIElement, number>();
const colSpan = new WeakMap<UIElement, number>();

export class Grid extends UIElement {
  rows: Row[] = [];
  cols: Col[] = [];
  children: UIElement[] = [];
  rowGap = 0;
  colGap = 0;

  debug = false;
  debugG: RenderGraphics;

  constructor(renderer: Renderer) {
    super();
    this.debugG = renderer.createGraphics();
  }

  add(ch: UIElement) { this.children.push(ch); }
  static setRow(el: UIElement, i: number) { rowMap.set(el, i|0); }
  static setCol(el: UIElement, i: number) { colMap.set(el, i|0); }
  static setRowSpan(el: UIElement, n: number) { rowSpan.set(el, Math.max(1, n|0)); }
  static setColSpan(el: UIElement, n: number) { colSpan.set(el, Math.max(1, n|0)); }

  measure(avail: Size) {
    if (this.rows.length === 0) this.rows.push(new Row({ kind: 'star', v: 1 }));
    if (this.cols.length === 0) this.cols.push(new Col({ kind: 'star', v: 1 }));

    const innerAvail = {
      width: Math.max(0, avail.width - this.margin.l - this.margin.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b),
    };

    const finiteW = Number.isFinite(innerAvail.width);
    const finiteH = Number.isFinite(innerAvail.height);

    const rowCount = this.rows.length;
    const colCount = this.cols.length;

    this.rows.forEach(r => { r.actual = r.len.kind === 'px' ? r.len.v : 0; r.desired = 0; });
    this.cols.forEach(c => { c.actual = c.len.kind === 'px' ? c.len.v : 0; c.desired = 0; });

    const totalRowGaps = Math.max(0, rowCount - 1) * this.rowGap;
    const totalColGaps = Math.max(0, colCount - 1) * this.colGap;

    const pixelHAll = this.rows.filter(r => r.len.kind === 'px').reduce((s, r) => s + r.len.v, 0);
    const pixelWAll = this.cols.filter(c => c.len.kind === 'px').reduce((s, c) => s + c.len.v, 0);

    const starHAll = finiteH ? this.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0) : 0;
    const starWAll = finiteW ? this.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0) : 0;

    const remH0 = finiteH ? Math.max(0, innerAvail.height - pixelHAll - totalRowGaps) : 0;
    const remW0 = finiteW ? Math.max(0, innerAvail.width - pixelWAll - totalColGaps) : 0;

    const sumPixelCols = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const c = this.cols[start + i]; if (c && c.len.kind === 'px') s += c.len.v; }
      return s;
    };
    const sumPixelRows = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const r = this.rows[start + i]; if (r && r.len.kind === 'px') s += r.len.v; }
      return s;
    };
    const sumStarCols = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const c = this.cols[start + i]; if (c && c.len.kind === 'star') s += c.len.v; }
      return s;
    };
    const sumStarRows = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const r = this.rows[start + i]; if (r && r.len.kind === 'star') s += r.len.v; }
      return s;
    };

    for (const ch of this.children) {
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
        (cs - 1) * this.colGap;

      const baseH =
        sumPixelRows(r, rs) +
        (starHAll > 0 ? (sumStarRows(r, rs) / starHAll) * remH0 : 0) +
        (rs - 1) * this.rowGap;

      const hasWidthLimiter = (sumPixelCols(c, cs) > 0) || (finiteW && sumStarCols(c, cs) > 0);
      const hasHeightLimiter = (sumPixelRows(r, rs) > 0) || (finiteH && sumStarRows(r, rs) > 0);

      const approxW = hasWidthLimiter ? Math.max(1, baseW) : Infinity;
      const approxH = hasHeightLimiter ? Math.max(1, baseH) : Infinity;

      ch.measure({ width: approxW, height: approxH });

      const perRow = ch.desired.height / rs;
      for (let i = 0; i < rs; i++) {
        const row = this.rows[r + i];
        if (!row) continue;
        if (row.len.kind === 'auto') row.desired = Math.max(row.desired, perRow);
        if (!finiteH && row.len.kind === 'star') row.desired = Math.max(row.desired, perRow);
      }

      const perCol = ch.desired.width / cs;
      for (let i = 0; i < cs; i++) {
        const col = this.cols[c + i];
        if (!col) continue;
        if (col.len.kind === 'auto') col.desired = Math.max(col.desired, perCol);
        if (!finiteW && col.len.kind === 'star') col.desired = Math.max(col.desired, perCol);
      }
    }

    for (const r of this.rows) if (r.len.kind === 'auto') r.actual = Math.ceil(r.desired);
    for (const c of this.cols) if (c.len.kind === 'auto') c.actual = Math.ceil(c.desired);

    const usedW = this.cols.reduce((s, c) => s + c.actual, 0);
    const usedH = this.rows.reduce((s, r) => s + r.actual, 0);

    const remW = finiteW ? Math.max(0, innerAvail.width - usedW - totalColGaps) : 0;
    const remH = finiteH ? Math.max(0, innerAvail.height - usedH - totalRowGaps) : 0;

    const starWUsed = this.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0);
    const starHUsed = this.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0);

    for (const c of this.cols) {
      if (c.len.kind === 'star') {
        c.actual = finiteW ? (starWUsed ? c.len.v / starWUsed : 0) * remW : Math.ceil(c.desired);
      }
    }
    for (const r of this.rows) {
      if (r.len.kind === 'star') {
        r.actual = finiteH ? (starHUsed ? r.len.v / starHUsed : 0) * remH : Math.ceil(r.desired);
      }
    }

    const widthSum = this.cols.reduce((s, c) => s + c.actual, 0) + totalColGaps;
    const heightSum = this.rows.reduce((s, r) => s + r.actual, 0) + totalRowGaps;

    const intrinsicW = widthSum + this.margin.l + this.margin.r;
    const intrinsicH = heightSum + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const rowCount = this.rows.length;
    const colCount = this.cols.length;
    const innerX = rect.x + this.margin.l;
    const innerY = rect.y + this.margin.t;
    const innerW = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: innerX, y: innerY, width: innerW, height: innerH };

    const xs: number[] = [0];
    for (const c of this.cols) xs.push(xs[xs.length - 1] + c.actual);
    const ys: number[] = [0];
    for (const r of this.rows) ys.push(ys[ys.length - 1] + r.actual);

    for (const ch of this.children) {
      let r = (rowMap.get(ch) ?? 0) | 0;
      let c = (colMap.get(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), Math.max(0, rowCount - 1));
      c = Math.min(Math.max(0, c), Math.max(0, colCount - 1));

      let rs = (rowSpan.get(ch) ?? 1) | 0;
      let cs = (colSpan.get(ch) ?? 1) | 0;
      rs = Math.min(Math.max(1, rs), Math.max(1, rowCount - r));
      cs = Math.min(Math.max(1, cs), Math.max(1, colCount - c));

      const x = xs[c] + c * this.colGap;
      const y = ys[r] + r * this.rowGap;

      const w = (xs[c + cs] - xs[c]) + (cs - 1) * this.colGap;
      const h = (ys[r + rs] - ys[r]) + (rs - 1) * this.rowGap;

      ch.arrange({ x, y, width: w, height: h });
    }

    this.drawDebug(xs, ys);
  }

  private drawDebug(xs: number[], ys: number[]) {
    const g: any = this.debugG.getDisplayObject();
    g.visible = this.debug;
    g.clear();
    if (!this.debug) return;
    if (this.final.width <= 0 || this.final.height <= 0) return;

    const x0 = this.final.x, y0 = this.final.y;
    const w0 = this.final.width, h0 = this.final.height;

    const STROKE = 0x00ffff;
    const STROKE_ALPHA = 0.7;
    const GRID_LINE_ALPHA = 0.45;
    const GAP_FILL = 0xff00ff;
    const GAP_ALPHA = 0.10;
    const MARGIN_FILL = 0xff9900;
    const MARGIN_ALPHA = 0.22;
    const PADDING_FILL = 0x66ccff;
    const PADDING_ALPHA = 0.18;

    g.lineStyle({ width: 2, color: STROKE, alpha: STROKE_ALPHA, alignment: 0 });
    g.drawRect(x0, y0, w0, h0);

    const colorForCol = (c: Col) =>
      c.len.kind === 'px' ? 0x3da5ff : c.len.kind === 'auto' ? 0x5fff7a : 0xffb347;

    for (let c = 0; c < this.cols.length; c++) {
      const cx = xs[c] + c * this.colGap;
      const trackW = (xs[c + 1] - xs[c]);
      g.lineStyle(0);
      g.beginFill(colorForCol(this.cols[c]), 0.06);
      g.drawRect(cx, y0, trackW, h0);
      g.endFill();
    }

    for (let c = 0; c < this.cols.length - 1; c++) {
      const gx = xs[c + 1] + c * this.colGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(gx, y0, this.colGap, h0);
      g.endFill();
    }
    for (let r = 0; r < this.rows.length - 1; r++) {
      const gy = ys[r + 1] + r * this.rowGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(x0, gy, w0, this.rowGap);
      g.endFill();
    }

    g.lineStyle({ width: 2, color: STROKE, alpha: GRID_LINE_ALPHA, alignment: 0 });
    for (let c = 0; c <= this.cols.length; c++) {
      const bx = (c < this.cols.length)
        ? xs[c] + c * this.colGap
        : xs[c] + (c - 1) * this.colGap;
      g.moveTo(bx, y0); g.lineTo(bx, y0 + h0);
    }
    for (let r = 0; r <= this.rows.length; r++) {
      const by = (r < this.rows.length)
        ? ys[r] + r * this.rowGap
        : ys[r] + (r - 1) * this.rowGap;
      g.moveTo(x0, by); g.lineTo(x0 + w0, by);
    }

    for (let r = 0; r < this.rows.length; r++) {
      for (let c = 0; c < this.cols.length; c++) {
        const cx = xs[c] + c * this.colGap;
        const cy = ys[r] + r * this.rowGap;
        const cw = (xs[c + 1] - xs[c]);
        const ch = (ys[r + 1] - ys[r]);
        g.lineStyle({ width: 1, color: STROKE, alpha: 0.5, alignment: 0 });
        g.drawRect(cx, cy, cw, ch);
      }
    }

    const ring = (x:number,y:number,w:number,h:number,l:number,t:number,rn:number,b:number,color:number,alpha:number) => {
      if (w <= 0 || h <= 0) return;
      g.lineStyle(0);
      g.beginFill(color, alpha);
      if (t > 0) g.drawRect(x, y, w, t);
      if (b > 0) g.drawRect(x, y + h - b, w, b);
      const midH = h - t - b;
      if (midH > 0) {
        if (l > 0) g.drawRect(x, y + t, l, midH);
        if (rn > 0) g.drawRect(x + w - rn, y + t, rn, midH);
      }
      g.endFill();
    };

    for (const ch of this.children) {
      let r = (rowMap.get(ch) ?? 0) | 0;
      let c = (colMap.get(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), this.rows.length - 1);
      c = Math.min(Math.max(0, c), this.cols.length - 1);
      let rs = (rowSpan.get(ch) ?? 1) | 0;
      let cs = (colSpan.get(ch) ?? 1) | 0;
      rs = Math.min(Math.max(1, rs), this.rows.length - r);
      cs = Math.min(Math.max(1, cs), this.cols.length - c);

      const slotX = xs[c] + c * this.colGap;
      const slotY = ys[r] + r * this.rowGap;
      const slotW = (xs[c + cs] - xs[c]) + (cs - 1) * this.colGap;
      const slotH = (ys[r + rs] - ys[r]) + (rs - 1) * this.rowGap;

      const m = ch.margin;
      if (m.l || m.t || m.r || m.b) {
        ring(slotX, slotY, slotW, slotH, m.l, m.t, m.r, m.b, MARGIN_FILL, MARGIN_ALPHA);
      }

      if (ch instanceof BorderPanel) {
        const pad = ch.padding;
        const bx = ch.final.x, by = ch.final.y, bw = ch.final.width, bh = ch.final.height;
        if (pad.l || pad.t || pad.r || pad.b) {
          ring(bx, by, bw, bh, pad.l, pad.t, pad.r, pad.b, PADDING_FILL, PADDING_ALPHA);
        }
      }
    }
  }
}
