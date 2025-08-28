import { UIElement } from '@noxigui/core';
import type { Size, Rect } from '@noxigui/core';

/**
 * Simple presenter that proxies measurement and arrangement to a single child.
 */
export class ContentPresenter extends UIElement {
  child?: UIElement;

  measure(avail: Size) {
    if (this.child) {
      this.child.measure(avail);
      const intrinsicW = this.child.desired.width + this.margin.l + this.margin.r;
      const intrinsicH = this.child.desired.height + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH),
      };
    } else {
      const intrinsicW = this.margin.l + this.margin.r;
      const intrinsicH = this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH),
      };
    }
  }

  arrange(rect: Rect) {
    const x = rect.x + this.margin.l, y = rect.y + this.margin.t;
    const w = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const h = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x, y, width: w, height: h };
    if (this.child) this.child.arrange({ x, y, width: w, height: h });
  }
}
