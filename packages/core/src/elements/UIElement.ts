import type { MeasureCtx } from '../layout/engine.js';
import { RuleRegistry } from '../layout/engine.js';
import { createDefaultRegistry } from '../layout/register-defaults.js';

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
