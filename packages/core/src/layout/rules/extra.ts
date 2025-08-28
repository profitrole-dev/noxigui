import type { SizeRule } from '../engine.js';

// Placeholder aspect ratio rule. In a full implementation this would compute a
// missing intrinsic dimension from its paired axis.
export const AspectRatioRule: SizeRule = {
  id: 'aspect',
  phase: 'primary',
  priority: 40,
  applies: () => false,
  compute: () => null,
};

// Snap rule is optional – here it simply rounds the current size.
export const SnapRule: SizeRule = {
  id: 'snap',
  phase: 'post',
  priority: 10,
  applies: () => false,
  compute: () => null,
};
