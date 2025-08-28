import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRegistry } from '../../src/index.js';
import type { AxisBox, MeasureCtx } from '../../src/index.js';

const box: AxisBox = {
  marginStart: 0, marginEnd: 0,
  borderStart: 0, borderEnd: 0,
  paddingStart: 0, paddingEnd: 0,
};

const registry = createDefaultRegistry();

interface Case {
  name: string;
  ctx: MeasureCtx;
  expected: number;
}

const cases: Case[] = [
  {
    name: 'fixed px',
    ctx: { axis: 'x', box, style: { unit: 'px', value: 100 }, constraints: { available: 0 } },
    expected: 100,
  },
  {
    name: 'percent',
    ctx: { axis: 'x', box, style: { unit: '%', value: 50 }, constraints: { available: 200 } },
    expected: 100,
  },
  {
    name: 'content',
    ctx: { axis: 'x', box, style: { unit: 'content' }, intrinsic: 80, constraints: { available: 200 } },
    expected: 80,
  },
  {
    name: 'stretch',
    ctx: { axis: 'x', box, style: { unit: 'stretch' }, constraints: { available: 300 } },
    expected: 300,
  },
  {
    name: 'clamp max',
    ctx: { axis: 'x', box, style: { unit: 'stretch' }, constraints: { available: 500, max: 400 } },
    expected: 400,
  },
  {
    name: 'clamp min',
    ctx: { axis: 'x', box, style: { unit: 'stretch' }, constraints: { available: 100, min: 150 } },
    expected: 150,
  },
];

for (const c of cases) {
  test(c.name, () => {
    const size = registry.run({ ...c.ctx });
    assert.equal(size, c.expected);
  });
}
