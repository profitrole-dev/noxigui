// Runtime base UIElement built on core RuleRegistry

import type { MeasureCtx } from '../../core/src/index.js';
import { createDefaultRegistry, RuleRegistry } from '../../core/src/index.js';

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

const defaultRegistry = createDefaultRegistry();

/**
 * Basic UI element supporting margin and preferred/min sizes. The size
 * computation is delegated to the core RuleRegistry to avoid duplicating
 * clamp logic across runtime elements.
 */
export abstract class UIElement {
  desired: Size = { width: 0, height: 0 };
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };

  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0; minH = 0;
  prefW?: number; prefH?: number;

  protected registry: RuleRegistry = defaultRegistry;

  protected measureAxis(axis: 'x' | 'y', avail: number, intrinsic: number): number {
    const pref = axis === 'x' ? this.prefW : this.prefH;
    const marginSum = axis === 'x' ? this.margin.l + this.margin.r : this.margin.t + this.margin.b;
    const min = (axis === 'x' ? this.minW : this.minH) + marginSum;
    const prefVal = pref !== undefined ? pref + marginSum : undefined;
    const style = prefVal !== undefined ? { unit: 'px', value: prefVal } as const : { unit: 'auto' } as const;
    const ctx: MeasureCtx = {
      axis,
      box: { marginStart: 0, marginEnd: 0, borderStart: 0, borderEnd: 0, paddingStart: 0, paddingEnd: 0 },
      style,
      constraints: { available: avail, min },
      intrinsic,
    };
    return this.registry.run(ctx);
  }

  abstract measure(avail: Size): void;
  abstract arrange(rect: Rect): void;
}

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

