import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid } from '@noxigui/runtime';
import { getGridOverlayBounds, LayoutSelection } from '../src/layout/utils/getGridOverlayBounds.js';

const graphicsObj: any = { visible: false, clear() {}, lineStyle() {}, drawRect() {}, beginFill() {}, endFill() {}, moveTo() {}, lineTo() {} };
const gfx = { clear() {}, beginFill() { return this; }, drawRect() { return this; }, endFill() {}, destroy() {}, getDisplayObject() { return graphicsObj; } } as any;
const renderer = {
  getTexture() { return undefined; },
  createImage() { return {} as any; },
  createText() { return {} as any; },
  createGraphics() { return gfx; },
  createContainer() { return {} as any; },
} as any;

test('overlay bounds match grid finals for root and child', () => {
  const root = new Grid(renderer);
  root.final = { x: 0, y: 0, width: 200, height: 100 } as any;
  const child = new Grid(renderer);
  child.final = { x: 30, y: 40, width: 50, height: 60 } as any;
  root.add(child);
  const gui = { root } as any;
  const rootSel: LayoutSelection = { id: '0', tag: 'grid', name: 'root' };
  const childSel: LayoutSelection = { id: '0.0', tag: 'grid', name: 'child' };
  assert.deepEqual(getGridOverlayBounds(gui, rootSel), { x: 0, y: 0, width: 200, height: 100 });
  assert.deepEqual(getGridOverlayBounds(gui, childSel), { x: 30, y: 40, width: 50, height: 60 });
});
