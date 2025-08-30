import { UIElement, type Size, type Rect } from '@noxigui/core';

export class WrapPanel extends UIElement {
  children: UIElement[] = [];
  orientation: 'Horizontal' | 'Vertical' = 'Horizontal';
  itemWidth?: number;
  itemHeight?: number;
  gapX = 0;
  gapY = 0;

  add(ch: UIElement) { this.children.push(ch); }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);
    const cwConstraint = this.itemWidth ?? Infinity;
    const chConstraint = this.itemHeight ?? Infinity;

    if (this.orientation === 'Horizontal') {
      let rowW = 0, rowH = 0, maxW = 0, totalH = 0;
      for (const ch of this.children) {
        ch.measure({ width: cwConstraint, height: chConstraint });
        const w = this.itemWidth ?? ch.desired.width;
        const h = this.itemHeight ?? ch.desired.height;
        if (rowW > 0 && rowW + this.gapX + w > innerW) {
          if (rowW > maxW) maxW = rowW;
          totalH += rowH;
          totalH += this.gapY;
          rowW = w;
          rowH = h;
        } else {
          rowW += (rowW > 0 ? this.gapX : 0) + w;
          if (h > rowH) rowH = h;
        }
      }
      if (rowW > maxW) maxW = rowW;
      totalH += rowH;
      const intrinsicW = maxW + this.margin.l + this.margin.r;
      const intrinsicH = totalH + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH),
      };
    } else {
      let colW = 0, colH = 0, totalW = 0, maxH = 0;
      for (const ch of this.children) {
        ch.measure({ width: cwConstraint, height: chConstraint });
        const w = this.itemWidth ?? ch.desired.width;
        const h = this.itemHeight ?? ch.desired.height;
        if (colH > 0 && colH + this.gapY + h > innerH) {
          totalW += colW;
          totalW += this.gapX;
          if (colH > maxH) maxH = colH;
          colW = w;
          colH = h;
        } else {
          colH += (colH > 0 ? this.gapY : 0) + h;
          if (w > colW) colW = w;
        }
      }
      totalW += colW;
      if (colH > maxH) maxH = colH;
      const intrinsicW = totalW + this.margin.l + this.margin.r;
      const intrinsicH = maxH + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH),
      };
    }
  }

  arrange(rect: Rect) {
    const inner = this.arrangeSelf(rect);
    if (this.orientation === 'Horizontal') {
      let x = inner.x;
      let y = inner.y;
      let rowH = 0;
      for (const ch of this.children) {
        const w = this.itemWidth ?? ch.desired.width;
        const h = this.itemHeight ?? ch.desired.height;
        if (x !== inner.x && x + w > inner.x + inner.width) {
          x = inner.x;
          y += rowH + this.gapY;
          rowH = 0;
        }
        ch.arrange({ x, y, width: w, height: h });
        if (h > rowH) rowH = h;
        x += w + this.gapX;
      }
    } else {
      let x = inner.x;
      let y = inner.y;
      let colW = 0;
      for (const ch of this.children) {
        const w = this.itemWidth ?? ch.desired.width;
        const h = this.itemHeight ?? ch.desired.height;
        if (y !== inner.y && y + h > inner.y + inner.height) {
          y = inner.y;
          x += colW + this.gapX;
          colW = 0;
        }
        ch.arrange({ x, y, width: w, height: h });
        if (w > colW) colW = w;
        y += h + this.gapY;
      }
    }
  }
}
