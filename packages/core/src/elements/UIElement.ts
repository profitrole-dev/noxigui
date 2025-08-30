import type { MeasureCtx } from '../layout/engine.js';
import { RuleRegistry } from '../layout/engine.js';
import { createDefaultRegistry } from '../layout/register-defaults.js';

export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

const defaultRegistry = createDefaultRegistry();

/**
 * Core UI element providing margin, preferred/min sizes and box measurement
 * backed by the layout rule registry.
 */
export abstract class UIElement {
  desired: Size = { width: 0, height: 0 };
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };

  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0; minH = 0;
  prefW?: number; prefH?: number;

  /** Flag set when a new arrange pass is required. */
  arrangeDirty = false;

  protected registry: RuleRegistry;

  constructor(registry: RuleRegistry = defaultRegistry) {
    this.registry = registry;
  }

  /** Marks this element as needing an arrange pass. */
  invalidateArrange() {
    this.arrangeDirty = true;
  }

  protected measureAxis(axis: 'x' | 'y', avail: number, intrinsic: number): number {
    const pref = axis === 'x' ? this.prefW : this.prefH;
    const marginSum = axis === 'x'
      ? this.margin.l + this.margin.r
      : this.margin.t + this.margin.b;
    const min = (axis === 'x' ? this.minW : this.minH) + marginSum;
    const prefVal = pref !== undefined ? pref + marginSum : undefined;
    const style = prefVal !== undefined
      ? ({ unit: 'px', value: prefVal } as const)
      : ({ unit: 'auto' } as const);
    const ctx: MeasureCtx = {
      axis,
      box: { marginStart: 0, marginEnd: 0, borderStart: 0, borderEnd: 0, paddingStart: 0, paddingEnd: 0 },
      style,
      constraints: { available: avail, min },
      intrinsic,
    };
    return this.registry.run(ctx);
  }

  /**
     * Apply margin to the given rect, update final bounds and return the inner
     * rect available for children.
     */
  protected arrangeSelf(rect: Rect): Rect {
    const x = rect.x + this.margin.l;
    const y = rect.y + this.margin.t;
    const width = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const height = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x, y, width, height };
    this.arrangeDirty = false;
    return this.final;
  }

  abstract measure(avail: Size): void;
  abstract arrange(rect: Rect): void;
}
