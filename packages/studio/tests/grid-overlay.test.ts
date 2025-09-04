import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, BorderPanel } from '@noxigui/runtime';
import { getGridOverlayBounds, LayoutSelection } from '../src/layout/utils/getGridOverlayBounds.js';

const graphicsObj: any = { visible: false, clear() {}, lineStyle() {}, drawRect() {}, beginFill() {}, endFill() {}, moveTo() {}, lineTo() {} };
const gfx = { clear() {}, beginFill() { return this; }, drawRect() { return this; }, endFill() {}, destroy() {}, getDisplayObject() { return graphicsObj; } } as any;
const renderer = {
  getTexture() { return undefined; },
  createImage() { return {} as any; },
  createText() { return {} as any; },
  createGraphics() { return gfx; },
  createContainer() {
    return {
      addChild() {},
      removeChild() {},
      destroy() {},
      setMask() {},
      setPosition() {},
      setSortableChildren() {},
      getDisplayObject() { return {}; },
    } as any;
  },
} as any;

test('overlay bounds include margins and paddings along element path', () => {
  const root = new Grid(renderer);
  root.margin = { l: 10, t: 20, r: 10, b: 20 } as any;
  root.final = { x: 10, y: 20, width: 180, height: 160 } as any;

  const panel = new BorderPanel(renderer);
  panel.margin = { l: 7, t: 8, r: 9, b: 10 } as any;
  panel.padding = { l: 5, t: 6, r: 7, b: 8 } as any;
  panel.final = { x: 30, y: 40, width: 120, height: 100 } as any;

  const child = new Grid(renderer);
  child.margin = { l: 3, t: 4, r: 5, b: 6 } as any;
  child.final = { x: 50, y: 60, width: 70, height: 80 } as any;

  panel.child = child;
  root.add(panel);
  const gui = { root } as any;

  const rootSel: LayoutSelection = { id: '0', tag: 'grid', name: 'root' };
  const childSel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, rootSel), {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  assert.deepEqual(getGridOverlayBounds(gui, childSel), {
    x: 92,
    y: 122,
    width: 78,
    height: 90,
  });
});
