import test from 'node:test';
import assert from 'node:assert/strict';
import { RuleRegistry, type Phase, type AxisBox, type MeasureCtx } from '../../src/index.js';

const box: AxisBox = {
  marginStart: 0, marginEnd: 0,
  borderStart: 0, borderEnd: 0,
  paddingStart: 0, paddingEnd: 0,
};

function makeRule(id: string, phase: Phase, priority: number) {
  return {
    id,
    phase,
    priority,
    applies: () => true,
    compute: (ctx: MeasureCtx) => {
      executed.push(id);
      return { size: (ctx.current ?? 0) + 1 };
    },
  };
}

const executed: string[] = [];

const r1 = makeRule('p2', 'primary', 20);
const r2 = makeRule('n2', 'normalize', 20);
const r3 = makeRule('post1', 'post', 0);
const r4 = makeRule('n1', 'normalize', 10);
const r5 = makeRule('p1', 'primary', 5);

const reg = new RuleRegistry();
reg.register(r1);
reg.register(r2, r3);
reg.register(r4, r5);

const ctx: MeasureCtx = {
  axis: 'x',
  box,
  style: { unit: 'px', value: 0 },
  constraints: { available: 0 },
};
const expected = ['n1', 'n2', 'p1', 'p2', 'post1'];
test('rules execute in phase and priority order', () => {
  reg.run({ ...ctx });
  assert.deepEqual(executed, expected);
});
