import test from 'node:test';
import assert from 'node:assert/strict';
import { RuleRegistry, FixedPxRule, AspectRatioRule, SnapRule } from '../../src/index.js';
import type { AxisBox, MeasureCtx } from '../../src/index.js';

const box: AxisBox = {
  marginStart: 0, marginEnd: 0,
  borderStart: 0, borderEnd: 0,
  paddingStart: 0, paddingEnd: 0,
};

test('aspect ratio width from height', () => {
  const reg = new RuleRegistry([AspectRatioRule]);
  const ctx: MeasureCtx = {
    axis: 'x',
    box,
    style: { unit: 'auto', value: 2 },
    constraints: { available: 0 },
    pairedIntrinsic: 50,
  };
  const size = reg.run({ ...ctx });
  assert.equal(size, 100);
});

test('aspect ratio height from width', () => {
  const reg = new RuleRegistry([AspectRatioRule]);
  const ctx: MeasureCtx = {
    axis: 'y',
    box,
    style: { unit: 'auto', value: 2 },
    constraints: { available: 0 },
    pairedIntrinsic: 100,
  };
  const size = reg.run({ ...ctx });
  assert.equal(size, 50);
});

test('snap rounds to nearest integer', () => {
  const reg = new RuleRegistry([FixedPxRule, SnapRule]);
  const ctx: MeasureCtx = {
    axis: 'x',
    box,
    style: { unit: 'px', value: 3.6 },
    constraints: { available: 0 },
  };
  const size = reg.run({ ...ctx });
  assert.equal(size, 4);
});
