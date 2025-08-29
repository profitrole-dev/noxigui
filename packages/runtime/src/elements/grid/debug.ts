import { BorderPanel } from '../BorderPanel.js';
import { Grid, Col } from '../Grid.js';
import { rowMap, colMap, rowSpan, colSpan } from './data.js';

export function drawDebug(g: Grid, xs: number[], ys: number[]) {
  const gfx: any = g.debugG.getDisplayObject();
  gfx.visible = g.debug;
  gfx.clear();
  if (!g.debug) return;
  if (g.final.width <= 0 || g.final.height <= 0) return;

  const x0 = g.final.x, y0 = g.final.y;
  const w0 = g.final.width, h0 = g.final.height;

  const STROKE = 0x00ffff;
  const STROKE_ALPHA = 0.7;
  const GRID_LINE_ALPHA = 0.45;
  const GAP_FILL = 0xff00ff;
  const GAP_ALPHA = 0.10;
  const MARGIN_FILL = 0xff9900;
  const MARGIN_ALPHA = 0.22;
  const PADDING_FILL = 0x66ccff;
  const PADDING_ALPHA = 0.18;

  gfx.lineStyle({ width: 2, color: STROKE, alpha: STROKE_ALPHA, alignment: 0 });
  gfx.drawRect(x0, y0, w0, h0);

  const colorForCol = (c: Col) =>
    c.len.kind === 'px' ? 0x3da5ff : c.len.kind === 'auto' ? 0x5fff7a : 0xffb347;

  for (let c = 0; c < g.cols.length; c++) {
    const cx = xs[c] + c * g.colGap;
    const trackW = (xs[c + 1] - xs[c]);
    gfx.lineStyle(0);
    gfx.beginFill(colorForCol(g.cols[c]), 0.06);
    gfx.drawRect(cx, y0, trackW, h0);
    gfx.endFill();
  }

  for (let c = 0; c < g.cols.length - 1; c++) {
    const gx = xs[c + 1] + c * g.colGap;
    gfx.beginFill(GAP_FILL, GAP_ALPHA);
    gfx.drawRect(gx, y0, g.colGap, h0);
    gfx.endFill();
  }
  for (let r = 0; r < g.rows.length - 1; r++) {
    const gy = ys[r + 1] + r * g.rowGap;
    gfx.beginFill(GAP_FILL, GAP_ALPHA);
    gfx.drawRect(x0, gy, w0, g.rowGap);
    gfx.endFill();
  }

  gfx.lineStyle({ width: 2, color: STROKE, alpha: GRID_LINE_ALPHA, alignment: 0 });
  for (let c = 0; c <= g.cols.length; c++) {
    const bx = (c < g.cols.length)
      ? xs[c] + c * g.colGap
      : xs[c] + (c - 1) * g.colGap;
    gfx.moveTo(bx, y0); gfx.lineTo(bx, y0 + h0);
  }
  for (let r = 0; r <= g.rows.length; r++) {
    const by = (r < g.rows.length)
      ? ys[r] + r * g.rowGap
      : ys[r] + (r - 1) * g.rowGap;
    gfx.moveTo(x0, by); gfx.lineTo(x0 + w0, by);
  }

  for (let r = 0; r < g.rows.length; r++) {
    for (let c = 0; c < g.cols.length; c++) {
      const cx = xs[c] + c * g.colGap;
      const cy = ys[r] + r * g.rowGap;
      const cw = (xs[c + 1] - xs[c]);
      const ch = (ys[r + 1] - ys[r]);
      gfx.lineStyle({ width: 1, color: STROKE, alpha: 0.5, alignment: 0 });
      gfx.drawRect(cx, cy, cw, ch);
    }
  }

  const ring = (x:number,y:number,w:number,h:number,l:number,t:number,rn:number,b:number,color:number,alpha:number) => {
    if (w <= 0 || h <= 0) return;
    gfx.lineStyle(0);
    gfx.beginFill(color, alpha);
    if (t > 0) gfx.drawRect(x, y, w, t);
    if (b > 0) gfx.drawRect(x, y + h - b, w, b);
    const midH = h - t - b;
    if (midH > 0) {
      if (l > 0) gfx.drawRect(x, y + t, l, midH);
      if (rn > 0) gfx.drawRect(x + w - rn, y + t, rn, midH);
    }
    gfx.endFill();
  };

  for (const ch of g.children) {
    let r = (rowMap.get(ch) ?? 0) | 0;
    let c = (colMap.get(ch) ?? 0) | 0;
    r = Math.min(Math.max(0, r), g.rows.length - 1);
    c = Math.min(Math.max(0, c), g.cols.length - 1);
    let rs = (rowSpan.get(ch) ?? 1) | 0;
    let cs = (colSpan.get(ch) ?? 1) | 0;
    rs = Math.min(Math.max(1, rs), g.rows.length - r);
    cs = Math.min(Math.max(1, cs), g.cols.length - c);

    const slotX = xs[c] + c * g.colGap;
    const slotY = ys[r] + r * g.rowGap;
    const slotW = (xs[c + cs] - xs[c]) + (cs - 1) * g.colGap;
    const slotH = (ys[r + rs] - ys[r]) + (rs - 1) * g.rowGap;

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
