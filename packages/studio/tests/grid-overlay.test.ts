import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, BorderPanel, ScrollViewer } from '@noxigui/runtime';
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
      addEventListener() {},
      setEventMode() {},
      getDisplayObject() { return { addEventListener() {} }; },
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
  child.final = { x: 8, y: 10, width: 70, height: 80 } as any;

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
    x: 40,
    y: 52,
    width: 78,
    height: 90,
  });
});

test('overlay aligns with grid inside padded border', () => {
  const root = new Grid(renderer);
  root.final = { x: 0, y: 0, width: 200, height: 150 } as any;

  const border = new BorderPanel(renderer);
  border.padding = { l: 12, t: 12, r: 0, b: 0 } as any;
  border.final = { x: 0, y: 0, width: 100, height: 80 } as any;

  const child = new Grid(renderer);
  child.final = { x: 0, y: 0, width: 50, height: 40 } as any;

  border.child = child;
  root.add(border);
  const gui = { root } as any;

  const sel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, sel), {
    x: 12,
    y: 12,
    width: 50,
    height: 40,
  });
});

test('root final offsets do not affect child overlays', () => {
  const root = new Grid(renderer);
  root.final = { x: 26, y: 94, width: 600, height: 400 } as any;

  const child = new Grid(renderer);
  child.final = { x: 10, y: 345, width: 100, height: 50 } as any;

  root.add(child);
  const gui = { root } as any;

  const sel: LayoutSelection = { id: '0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, sel), {
    x: 10,
    y: 345,
    width: 100,
    height: 50,
  });
});

test('overlay accounts for ScrollViewer scroll offsets', () => {
  const root = new Grid(renderer);
  root.final = { x: 0, y: 0, width: 200, height: 200 } as any;

  const viewer = new ScrollViewer(renderer);
  viewer.final = { x: 0, y: 0, width: 100, height: 100 } as any;
  (viewer as any)._vy = 30;

  const child = new Grid(renderer);
  child.final = { x: 0, y: 30, width: 80, height: 60 } as any;

  viewer.setContent(child);
  root.add(viewer);

  const gui = { root } as any;
  const sel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, sel), {
    x: 0,
    y: 0,
    width: 80,
    height: 60,
  });
});
