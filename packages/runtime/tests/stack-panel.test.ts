import test from 'node:test';
import assert from 'node:assert/strict';
import { StackPanel } from '../src/elements/StackPanel.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure vertical stack', () => {
  const sp = new StackPanel();
  sp.spacing = 5;
  sp.add(new Dummy(50, 20));
  sp.add(new Dummy(80, 30));
  sp.measure({ width: 100, height: 100 });
  assert.equal(sp.desired.width, 80);
  assert.equal(sp.desired.height, 55);
});

test('arrange vertical stack', () => {
  const sp = new StackPanel();
  sp.spacing = 5;
  const a = new Dummy(50, 20);
  const b = new Dummy(80, 30);
  sp.add(a); sp.add(b);
  sp.measure({ width: 200, height: 200 });
  sp.arrange({ x: 0, y: 0, width: 200, height: 200 });
  assert.deepEqual(a.final, { x: 0, y: 0, width: 200, height: 20 });
  assert.deepEqual(b.final, { x: 0, y: 25, width: 200, height: 30 });
});

test('arrange horizontal stack', () => {
  const sp = new StackPanel();
  sp.orientation = 'Horizontal';
  sp.spacing = 10;
  const a = new Dummy(10, 40);
  const b = new Dummy(20, 50);
  sp.add(a); sp.add(b);
  sp.measure({ width: 100, height: 100 });
  sp.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.deepEqual(a.final, { x: 0, y: 0, width: 10, height: 100 });
  assert.deepEqual(b.final, { x: 20, y: 0, width: 20, height: 100 });
});
