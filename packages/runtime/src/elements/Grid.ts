import * as PIXI from 'pixi.js';
import { Grid as CoreGrid, Col } from '../../../core/src/index.js';
import { BorderPanel } from './BorderPanel.js';

export { Row, Col } from '../../../core/src/index.js';

export class Grid extends CoreGrid {
  debugG = new PIXI.Graphics();

  protected postArrange(xs: number[], ys: number[]) {
    const g = this.debugG;
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
      let r = (CoreGrid.getRow(ch) ?? 0) | 0;
      let c = (CoreGrid.getCol(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), this.rows.length - 1);
      c = Math.min(Math.max(0, c), this.cols.length - 1);
      let rs = (CoreGrid.getRowSpan(ch) ?? 1) | 0;
      let cs = (CoreGrid.getColSpan(ch) ?? 1) | 0;
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
