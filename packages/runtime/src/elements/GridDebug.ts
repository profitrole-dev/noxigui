import type { Renderer, RenderGraphics } from '../renderer.js';
import { BorderPanel } from './BorderPanel.js';
import { Grid } from './Grid.js';
import type { Col } from './Grid.js';

export interface GridDebugLayer {
  g: RenderGraphics;
  draw(grid: Grid, xs: number[], ys: number[]): void;
}

export function createGridDebug(renderer: Renderer): GridDebugLayer {
  const g = renderer.createGraphics();
  g.setVisible?.(false);
  (g.getDisplayObject() as any).zIndex = 100000;

  const draw = (grid: Grid, xs: number[], ys: number[]) => {
    g.setVisible?.(grid.debug);
    g.clear();
    if (!grid.debug) return;
    if (grid.final.width <= 0 || grid.final.height <= 0) return;

    const x0 = grid.final.x, y0 = grid.final.y;
    const w0 = grid.final.width, h0 = grid.final.height;

    const STROKE = 0x00ffff;
    const STROKE_ALPHA = 0.7;
    const GRID_LINE_ALPHA = 0.45;
    const GAP_FILL = 0xff00ff;
    const GAP_ALPHA = 0.10;
    const MARGIN_FILL = 0xff9900;
    const MARGIN_ALPHA = 0.22;
    const PADDING_FILL = 0x66ccff;
    const PADDING_ALPHA = 0.18;

    g.lineStyle?.({ width: 2, color: STROKE, alpha: STROKE_ALPHA });
    g.drawRect(x0, y0, w0, h0);

    const colorForCol = (c: Col) =>
      c.len.kind === 'px' ? 0x3da5ff : c.len.kind === 'auto' ? 0x5fff7a : 0xffb347;

    for (let c = 0; c < grid.cols.length; c++) {
      const cx = xs[c] + c * grid.colGap;
      const trackW = (xs[c + 1] - xs[c]);
      g.lineStyle?.({ width: 0, color: 0, alpha: 0 });
      g.beginFill(colorForCol(grid.cols[c]), 0.06);
      g.drawRect(cx, y0, trackW, h0);
      g.endFill();
    }

    for (let c = 0; c < grid.cols.length - 1; c++) {
      const gx = xs[c + 1] + c * grid.colGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(gx, y0, grid.colGap, h0);
      g.endFill();
    }
    for (let r = 0; r < grid.rows.length - 1; r++) {
      const gy = ys[r + 1] + r * grid.rowGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(x0, gy, w0, grid.rowGap);
      g.endFill();
    }

    g.lineStyle?.({ width: 2, color: STROKE, alpha: GRID_LINE_ALPHA });
    for (let c = 0; c <= grid.cols.length; c++) {
      const bx = (c < grid.cols.length)
        ? xs[c] + c * grid.colGap
        : xs[c] + (c - 1) * grid.colGap;
      g.moveTo?.(bx, y0); g.lineTo?.(bx, y0 + h0);
    }
    for (let r = 0; r <= grid.rows.length; r++) {
      const by = (r < grid.rows.length)
        ? ys[r] + r * grid.rowGap
        : ys[r] + (r - 1) * grid.rowGap;
      g.moveTo?.(x0, by); g.lineTo?.(x0 + w0, by);
    }

    for (let r = 0; r < grid.rows.length; r++) {
      for (let c = 0; c < grid.cols.length; c++) {
        const cx = xs[c] + c * grid.colGap;
        const cy = ys[r] + r * grid.rowGap;
        const cw = (xs[c + 1] - xs[c]);
        const ch = (ys[r + 1] - ys[r]);
        g.lineStyle?.({ width: 1, color: STROKE, alpha: 0.5 });
        g.drawRect(cx, cy, cw, ch);
      }
    }

    const ring = (x:number,y:number,w:number,h:number,l:number,t:number,rn:number,b:number,color:number,alpha:number) => {
      if (w <= 0 || h <= 0) return;
      g.lineStyle?.({ width: 0, color, alpha });
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

    for (const ch of grid.children) {
      let r = Grid.getRow(ch) ?? 0;
      let c = Grid.getCol(ch) ?? 0;
      r = Math.min(Math.max(0, r), grid.rows.length - 1);
      c = Math.min(Math.max(0, c), grid.cols.length - 1);
      let rs = Grid.getRowSpan(ch) ?? 1;
      let cs = Grid.getColSpan(ch) ?? 1;
      rs = Math.min(Math.max(1, rs), grid.rows.length - r);
      cs = Math.min(Math.max(1, cs), grid.cols.length - c);

      const slotX = xs[c] + c * grid.colGap;
      const slotY = ys[r] + r * grid.rowGap;
      const slotW = (xs[c + cs] - xs[c]) + (cs - 1) * grid.colGap;
      const slotH = (ys[r + rs] - ys[r]) + (rs - 1) * grid.rowGap;

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
  };

  return { g, draw };
}
