import type { Axis, AxisBox, AxisStyle, AxisConstraints, MeasureCtx } from '../layout/engine.js';
import { RuleRegistry } from '../layout/engine.js';

export interface Size { width: number; height: number; }

function defaultBox(): AxisBox {
  return { marginStart: 0, marginEnd: 0, borderStart: 0, borderEnd: 0, paddingStart: 0, paddingEnd: 0 };
}

export class UIElement {
  protected boxX: AxisBox = defaultBox();
  protected boxY: AxisBox = defaultBox();
  protected styleX: AxisStyle = { unit: 'auto' };
  protected styleY: AxisStyle = { unit: 'auto' };
  protected intrinsicWidth?: number;
  protected intrinsicHeight?: number;
  desired: Size = { width: 0, height: 0 };

  constructor(protected registry: RuleRegistry) {}

  protected ctx(axis: Axis, available: number): MeasureCtx {
    const style = axis === 'x' ? this.styleX : this.styleY;
    const box = axis === 'x' ? this.boxX : this.boxY;
    const intrinsic = axis === 'x' ? this.intrinsicWidth : this.intrinsicHeight;
    const pairedIntrinsic = axis === 'x' ? this.intrinsicHeight : this.intrinsicWidth;
    const constraints: AxisConstraints = { available };
    return { axis, box, style, constraints, intrinsic, pairedIntrinsic };
  }

  protected ctxX(avail: number): MeasureCtx { return this.ctx('x', avail); }
  protected ctxY(avail: number): MeasureCtx { return this.ctx('y', avail); }

  measure(avail: Size): void {
    const width = this.registry.run(this.ctxX(avail.width));
    const height = this.registry.run(this.ctxY(avail.height));
    this.desired = { width, height };
  }
}
