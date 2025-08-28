// Core UI primitives

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

export abstract class UIElement {
  desired: Size = { width: 0, height: 0 };
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };
  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0; minH = 0; // MinWidth/MinHeight
  prefW?: number; prefH?: number; // Width/Height (desired size)

  abstract measure(avail: Size): void;
  abstract arrange(rect: Rect): void;
}

export class ContentPresenter extends UIElement {
  child?: UIElement;
  measure(avail: Size) {
    if (this.child) {
      this.child.measure(avail);
      this.desired = {
        width: this.child.desired.width + this.margin.l + this.margin.r,
        height: this.child.desired.height + this.margin.t + this.margin.b,
      };
    } else {
      this.desired = {
        width: this.margin.l + this.margin.r,
        height: this.margin.t + this.margin.b,
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
