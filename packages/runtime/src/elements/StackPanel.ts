import { UIElement, type Size, type Rect } from '@noxigui/core';

export class StackPanel extends UIElement {
  children: UIElement[] = [];
  orientation: 'Vertical' | 'Horizontal' = 'Vertical';
  spacing = 0;

  add(ch: UIElement) { this.children.push(ch); }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);
    let totalW = 0, totalH = 0, maxW = 0, maxH = 0;
    if (this.orientation === 'Vertical') {
      for (const ch of this.children) {
        ch.measure({ width: innerW, height: Infinity });
        totalH += ch.desired.height;
        if (ch.desired.width > maxW) maxW = ch.desired.width;
      }
      if (this.children.length > 1) totalH += this.spacing * (this.children.length - 1);
      const intrinsicW = maxW + this.margin.l + this.margin.r;
      const intrinsicH = totalH + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH),
      };
    } else {
      for (const ch of this.children) {
        ch.measure({ width: Infinity, height: innerH });
        totalW += ch.desired.width;
        if (ch.desired.height > maxH) maxH = ch.desired.height;
      }
      if (this.children.length > 1) totalW += this.spacing * (this.children.length - 1);
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
    if (this.orientation === 'Vertical') {
      let y = inner.y;
      for (const ch of this.children) {
        const h = ch.desired.height;
        ch.arrange({ x: inner.x, y, width: inner.width, height: h });
        y += h + this.spacing;
      }
    } else {
      let x = inner.x;
      for (const ch of this.children) {
        const w = ch.desired.width;
        ch.arrange({ x, y: inner.y, width: w, height: inner.height });
        x += w + this.spacing;
      }
    }
  }
}

