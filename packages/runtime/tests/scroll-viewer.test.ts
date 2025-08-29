import test from 'node:test';
import assert from 'node:assert/strict';
import { ScrollViewer } from '../src/elements/ScrollViewer.js';
import { UIElement } from '@noxigui/core';

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure computes extent and viewport', () => {
  const sv = new ScrollViewer();
  sv.setContent(new Dummy(200, 400));
  sv.measure({ width: 100, height: 150 });
  assert.equal(sv.extentWidth, 200);
  assert.equal(sv.extentHeight, 400);
  assert.equal(sv.viewportWidth, 100);
  assert.equal(sv.viewportHeight, 150);
  assert.equal(sv.scrollableWidth, 100);
  assert.equal(sv.scrollableHeight, 250);
});

test('scroll offsets clamp to scrollable range', () => {
  const sv = new ScrollViewer();
  const ch = new Dummy(200, 400);
  sv.setContent(ch);
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });

  sv.ScrollToVerticalOffset(50);
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, 50);
  assert.equal(ch.final.y, -50);

  sv.ScrollToVerticalOffset(1000);
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, sv.scrollableHeight);
  assert.equal(ch.final.y, -sv.scrollableHeight);
});
