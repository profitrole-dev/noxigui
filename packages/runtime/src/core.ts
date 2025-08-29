import { UIElement as CoreUIElement, createDefaultRegistry, type Axis, type MeasureCtx } from '../../core/src/index.js';

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

const defaultRegistry = createDefaultRegistry();

/**
 * Framework element extending the core {@link UIElement} with margin and
 * preferred/minimum sizing support. Measurement delegates to the core rule
 * registry to keep logic centralized.
 */
export abstract class UIElement extends CoreUIElement {
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };

  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0; minH = 0;
  prefW?: number; prefH?: number;

  constructor() { super(defaultRegistry); }

  protected override ctx(axis: Axis, available: number): MeasureCtx {
    const ctx = super.ctx(axis, available);
    const marginSum = axis === 'x' ? this.margin.l + this.margin.r : this.margin.t + this.margin.b;
    ctx.constraints.min = (axis === 'x' ? this.minW : this.minH) + marginSum;
    return ctx;
  }

  measure(avail: Size): void {
    this.boxX.marginStart = this.margin.l; this.boxX.marginEnd = this.margin.r;
    this.boxY.marginStart = this.margin.t; this.boxY.marginEnd = this.margin.b;
    this.styleX = this.prefW !== undefined
      ? { unit: 'px', value: this.prefW + this.margin.l + this.margin.r }
      : { unit: 'auto' };
    this.styleY = this.prefH !== undefined
      ? { unit: 'px', value: this.prefH + this.margin.t + this.margin.b }
      : { unit: 'auto' };
    super.measure(avail);
  }

  abstract arrange(rect: Rect): void;
}

/**
 * Presenter that proxies measurement and arrangement to a single child.
 */
export class ContentPresenter extends UIElement {
  child?: UIElement;

  measure(avail: Size) {
    if (this.child) {
      this.child.measure(avail);
      this.intrinsicWidth = this.child.desired.width + this.margin.l + this.margin.r;
      this.intrinsicHeight = this.child.desired.height + this.margin.t + this.margin.b;
    } else {
      this.intrinsicWidth = this.margin.l + this.margin.r;
      this.intrinsicHeight = this.margin.t + this.margin.b;
    }
    super.measure(avail);
  }

  arrange(rect: Rect) {
    const x = rect.x + this.margin.l, y = rect.y + this.margin.t;
    const w = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const h = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x, y, width: w, height: h };
    if (this.child) this.child.arrange({ x, y, width: w, height: h });
  }
}
