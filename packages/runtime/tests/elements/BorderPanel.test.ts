import test from 'node:test';
import assert from 'node:assert/strict';
import { BorderPanel } from '../../src/elements/BorderPanel.js';
import { createMockRenderer, TestElement } from '../mocks.js';

const renderer = createMockRenderer();

test('BorderPanel measures child with margin and padding', () => {
  const child = new TestElement({ width: 50, height: 30 });
  const bp = new BorderPanel(renderer, { child });
  bp.margin = { l: 1, t: 1, r: 1, b: 1 };
  bp.padding = { l: 2, t: 2, r: 2, b: 2 };

  bp.measure({ width: 100, height: 80 });

  assert.deepEqual(child.measureCalls[0], { width: 94, height: 74 });
  assert.deepEqual(bp.desired, { width: 56, height: 36 });
});

test('BorderPanel arranges child inside padding', () => {
  const child = new TestElement({ width: 50, height: 30 });
  const bp = new BorderPanel(renderer, { child });
  bp.margin = { l: 1, t: 1, r: 1, b: 1 };
  bp.padding = { l: 2, t: 2, r: 2, b: 2 };

  bp.arrange({ x: 10, y: 20, width: 100, height: 80 });

  assert.deepEqual(bp.final, { x: 11, y: 21, width: 98, height: 78 });
  // container position
  assert.equal((bp.container as any).x, 11);
  assert.equal((bp.container as any).y, 21);
  // child arrange rect
  assert.deepEqual(child.arrangeCalls[0], { x: 2, y: 2, width: 94, height: 74 });
});
