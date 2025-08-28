import type { SizeRule, MeasureCtx } from '../engine.js';

function appliesUnit(ctx: MeasureCtx, unit: string) {
  return ctx.style.unit === unit;
}

export const FixedPxRule: SizeRule = {
  id: 'fixed-px',
  phase: 'primary',
  priority: 0,
  applies: ctx => appliesUnit(ctx, 'px') && typeof ctx.style.value === 'number',
  compute: ctx => ({ size: ctx.style.value!, final: true }),
};

export const PercentRule: SizeRule = {
  id: 'percent',
  phase: 'primary',
  priority: 10,
  applies: ctx => appliesUnit(ctx, '%') && typeof ctx.style.value === 'number',
  compute: ctx => ({ size: (ctx.constraints.available * ctx.style.value!) / 100, final: true }),
};

export const ContentAutoRule: SizeRule = {
  id: 'content-auto',
  phase: 'primary',
  priority: 20,
  applies: ctx => ctx.style.unit === 'content' || ctx.style.unit === 'auto',
  compute: ctx => {
    if (typeof ctx.intrinsic === 'number') {
      return { size: ctx.intrinsic, final: ctx.style.unit === 'content' };
    }
    return { size: ctx.constraints.available, final: false };
  },
};

export const StretchRule: SizeRule = {
  id: 'stretch',
  phase: 'primary',
  priority: 30,
  applies: ctx => ctx.style.unit === 'stretch',
  compute: ctx => ({ size: ctx.constraints.available, final: true }),
};

export const ClampRule: SizeRule = {
  id: 'clamp',
  phase: 'post',
  priority: 0,
  applies: () => true,
  compute: ctx => {
    let size = ctx.current ?? 0;
    if (typeof ctx.constraints.min === 'number' && size < ctx.constraints.min) size = ctx.constraints.min;
    if (typeof ctx.constraints.max === 'number' && size > ctx.constraints.max) size = ctx.constraints.max;
    return { size, final: true };
  },
};
