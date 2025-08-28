import type { SizeRule } from '../engine.js';

/**
 * Compute a missing dimension using an aspect ratio. The ratio is provided via
 * `style.value` and represents the width/height relationship. When measuring
 * the `x` axis the size is `pairedIntrinsic * ratio`. For the `y` axis the size
 * becomes `pairedIntrinsic / ratio`.
 */
export const AspectRatioRule: SizeRule = {
  id: 'aspect',
  phase: 'primary',
  priority: 40,
  applies: ctx =>
    (ctx.style.unit === 'auto' || ctx.style.unit === 'content') &&
    typeof ctx.style.value === 'number' &&
    ctx.style.value > 0 &&
    typeof ctx.pairedIntrinsic === 'number',
  compute: ctx => {
    const ratio = ctx.style.value!;
    const paired = ctx.pairedIntrinsic!;
    const size = ctx.axis === 'x' ? paired * ratio : paired / ratio;
    return { size, final: true };
  },
};

// Snap rule – rounds the current size to the nearest integer.
export const SnapRule: SizeRule = {
  id: 'snap',
  phase: 'post',
  priority: 10,
  applies: () => true,
  compute: ctx => ({ size: Math.round(ctx.current ?? 0), final: true }),
};
