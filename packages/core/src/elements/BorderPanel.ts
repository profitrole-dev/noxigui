import { UIElement } from './UIElement.js';
import type { Size, Rect } from '../common/geometry.js';

export class BorderPanel extends UIElement {
  child?: UIElement;
  background?: number;
  clipToBounds = false;
  padding = { l: 0, t: 0, r: 0, b: 0 };

  constructor(opts?: { background?: number; child?: UIElement }) {
    super();
    this.background = opts?.background;
    this.child = opts?.child;
  }

  measure(avail: Size) {
    const inner = {
      width: Math.max(0, avail.width - this.margin.l - this.margin.r - this.padding.l - this.padding.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b - this.padding.t - this.padding.b),
    };
    let intrinsicW = this.margin.l + this.margin.r + this.padding.l + this.padding.r;
    let intrinsicH = this.margin.t + this.margin.b + this.padding.t + this.padding.b;
    if (this.child) {
      this.child.measure(inner);
      intrinsicW += this.child.desired.width;
      intrinsicH += this.child.desired.height;
    }
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const innerX = rect.x + this.margin.l;
    const innerY = rect.y + this.margin.t;
    const innerW = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: innerX, y: innerY, width: innerW, height: innerH };

    if (this.child) {
      const cx = this.padding.l;
      const cy = this.padding.t;
      const cw = Math.max(0, innerW - this.padding.l - this.padding.r);
      const ch = Math.max(0, innerH - this.padding.t - this.padding.b);
      this.child.arrange({ x: cx, y: cy, width: cw, height: ch });
    }
  }
}
