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
  private rules: SizeRule[] = [];

  constructor(rules: SizeRule[] = []) {
    this.register(...rules);
  }

  register(...r: SizeRule[]): void {
    this.rules.push(...r);
  }

  /**
   * Run registered rules against provided context. The context's `current`
   * value is updated as rules produce results. The last computed size is
   * returned.
   */
  run(ctx: MeasureCtx): number {
    const byPhase: Record<Phase, SizeRule[]> = { normalize: [], primary: [], post: [] };
    for (const r of this.rules) byPhase[r.phase].push(r);
    for (const phase of ['normalize','primary','post'] as Phase[]) {
      const rules = byPhase[phase].sort((a, b) => a.priority - b.priority);
      for (const rule of rules) {
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
