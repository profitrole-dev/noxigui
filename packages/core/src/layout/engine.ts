export type Phase = 'normalize' | 'primary' | 'post';
export type Axis = 'x' | 'y';

export interface AxisBox {
  marginStart: number; marginEnd: number;
  borderStart: number; borderEnd: number;
  paddingStart: number; paddingEnd: number;
}

export interface AxisStyle {
  unit: 'px'|'%'|'content'|'auto'|'stretch';
  value?: number;
}

export interface AxisConstraints {
  available: number;
  min?: number; max?: number;
}

export interface MeasureCtx {
  axis: Axis;
  box: AxisBox;
  style: AxisStyle;
  constraints: AxisConstraints;
  intrinsic?: number;
  pairedIntrinsic?: number;
  current?: number;
}

export interface AxisResult { size: number; final?: boolean; }

export interface SizeRule {
  id: string;
  phase: Phase;
  priority: number;
  applies(ctx: MeasureCtx): boolean;
  compute(ctx: MeasureCtx): AxisResult | null;
}

/**
 * Registry for sizing rules. Rules are executed grouped by phase and priority.
 */
export class RuleRegistry {
  private rules: Record<Phase, SizeRule[]> = { normalize: [], primary: [], post: [] };

  constructor(rules: SizeRule[] = []) {
    this.register(...rules);
  }

  register(...r: SizeRule[]): void {
    const changed = new Set<Phase>();
    for (const rule of r) {
      this.rules[rule.phase].push(rule);
      changed.add(rule.phase);
    }
    for (const phase of changed) {
      this.rules[phase].sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * Run registered rules against provided context. The context's `current`
   * value is updated as rules produce results. The last computed size is
   * returned.
   */
  run(ctx: MeasureCtx): number {
    for (const phase of ['normalize', 'primary', 'post'] as Phase[]) {
      for (const rule of this.rules[phase]) {
        if (!rule.applies(ctx)) continue;
        const res = rule.compute(ctx);
        if (res) {
          ctx.current = res.size;
          if (res.final) break;
        }
      }
    }
    return ctx.current ?? 0;
  }
}
