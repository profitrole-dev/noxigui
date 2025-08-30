import test from 'node:test';
import assert from 'node:assert/strict';
import { WrapPanel } from '../src/elements/WrapPanel.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure horizontal wrap', () => {
  const wp = new WrapPanel();
  wp.gapX = 5; wp.gapY = 5;
  wp.add(new Dummy(30, 10));
  wp.add(new Dummy(40, 15));
  wp.add(new Dummy(50, 20));
  wp.measure({ width: 80, height: 100 });
  assert.equal(wp.desired.width, 75);
  assert.equal(wp.desired.height, 40);
});

test('arrange horizontal wrap', () => {
  const wp = new WrapPanel();
  wp.gapX = 5; wp.gapY = 5;
  const a = new Dummy(30, 10);
  const b = new Dummy(40, 15);
  const c = new Dummy(50, 20);
  wp.add(a); wp.add(b); wp.add(c);
  wp.measure({ width: 80, height: 100 });
  wp.arrange({ x: 0, y: 0, width: 80, height: 100 });
  assert.deepEqual(a.final, { x: 0, y: 0, width: 30, height: 10 });
  assert.deepEqual(b.final, { x: 35, y: 0, width: 40, height: 15 });
  assert.deepEqual(c.final, { x: 0, y: 20, width: 50, height: 20 });
});

test('arrange vertical wrap', () => {
  const wp = new WrapPanel();
  wp.orientation = 'Vertical';
  wp.gapX = 5; wp.gapY = 5;
  const a = new Dummy(20, 30);
  const b = new Dummy(40, 10);
  const c = new Dummy(15, 25);
  wp.add(a); wp.add(b); wp.add(c);
  wp.measure({ width: 100, height: 50 });
  wp.arrange({ x: 0, y: 0, width: 100, height: 50 });
  assert.equal(wp.desired.width, 60);
  assert.equal(wp.desired.height, 45);
  assert.deepEqual(a.final, { x: 0, y: 0, width: 20, height: 30 });
  assert.deepEqual(b.final, { x: 0, y: 35, width: 40, height: 10 });
  assert.deepEqual(c.final, { x: 45, y: 0, width: 15, height: 25 });
});
