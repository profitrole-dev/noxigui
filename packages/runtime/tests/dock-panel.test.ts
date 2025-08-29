import test from 'node:test';
import assert from 'node:assert/strict';
import { DockPanel } from '../src/elements/DockPanel.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure dock panel', () => {
  const dp = new DockPanel();
  const a = new Dummy(20, 30); DockPanel.setDock(a, 'Left');
  const b = new Dummy(40, 10); DockPanel.setDock(b, 'Top');
  const c = new Dummy(15, 25); DockPanel.setDock(c, 'Right');
  const d = new Dummy(35, 5);  DockPanel.setDock(d, 'Bottom');
  const e = new Dummy(50, 60);
  dp.add(a); dp.add(b); dp.add(c); dp.add(d); dp.add(e);
  dp.measure({ width: 100, height: 100 });
  assert.equal(dp.desired.width, 85);
  assert.equal(dp.desired.height, 75);
});

test('arrange dock panel', () => {
  const dp = new DockPanel();
  const a = new Dummy(20, 30); DockPanel.setDock(a, 'Left');
  const b = new Dummy(40, 10); DockPanel.setDock(b, 'Top');
  const c = new Dummy(15, 25); DockPanel.setDock(c, 'Right');
  const d = new Dummy(35, 5);  DockPanel.setDock(d, 'Bottom');
  const e = new Dummy(50, 60);
  dp.add(a); dp.add(b); dp.add(c); dp.add(d); dp.add(e);
  dp.measure({ width: 100, height: 100 });
  dp.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.deepEqual(a.final, { x: 0, y: 0, width: 20, height: 100 });
  assert.deepEqual(b.final, { x: 20, y: 0, width: 80, height: 10 });
  assert.deepEqual(c.final, { x: 85, y: 10, width: 15, height: 90 });
  assert.deepEqual(d.final, { x: 20, y: 95, width: 65, height: 5 });
  assert.deepEqual(e.final, { x: 20, y: 10, width: 65, height: 85 });
});

test('lastChildFill false', () => {
  const dp = new DockPanel();
  dp.lastChildFill = false;
  const a = new Dummy(20, 20); DockPanel.setDock(a, 'Left');
  const b = new Dummy(30, 30); DockPanel.setDock(b, 'Top');
  const c = new Dummy(40, 40); DockPanel.setDock(c, 'Right');
  dp.add(a); dp.add(b); dp.add(c);
  dp.measure({ width: 100, height: 100 });
  dp.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.deepEqual(c.final, { x: 60, y: 30, width: 40, height: 70 });
});
