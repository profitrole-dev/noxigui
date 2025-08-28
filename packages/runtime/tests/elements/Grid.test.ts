import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, Row, Col } from '../../src/elements/Grid.js';
import { TestElement } from '../mocks.js';

test('Grid measures and arranges star tracks', () => {
  const grid = new Grid();
  grid.rows = [new Row({ kind: 'star', v: 1 }), new Row({ kind: 'star', v: 1 })];
  grid.cols = [new Col({ kind: 'star', v: 1 }), new Col({ kind: 'star', v: 1 })];

  const c1 = new TestElement({ width: 10, height: 20 });
  const c2 = new TestElement({ width: 30, height: 40 });
  grid.add(c1);
  grid.add(c2);
  Grid.setRow(c2, 1);
  Grid.setCol(c2, 1);

  grid.measure({ width: 200, height: 100 });
  assert.deepEqual(grid.desired, { width: 200, height: 100 });
  assert.equal(grid.cols[0].actual, 100);
  assert.equal(grid.cols[1].actual, 100);
  assert.equal(grid.rows[0].actual, 50);
  assert.equal(grid.rows[1].actual, 50);

  grid.arrange({ x: 0, y: 0, width: 200, height: 100 });
  assert.deepEqual(c1.arrangeCalls[0], { x: 0, y: 0, width: 100, height: 50 });
  assert.deepEqual(c2.arrangeCalls[0], { x: 100, y: 50, width: 100, height: 50 });
});
