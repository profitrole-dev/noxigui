import test from 'node:test';
import assert from 'node:assert/strict';
import { getGridOverlayBounds, LayoutSelection } from '../src/layout/utils/getGridOverlayBounds.js';

class Grid {
  margin: any = { l: 0, t: 0, r: 0, b: 0 };
  final: any = { x: 0, y: 0, width: 0, height: 0 };
  children: any[] = [];
  constructor(public renderer?: any) {}
  add(ch: any) { this.children.push(ch); }
}

class BorderPanel {
  margin: any = { l: 0, t: 0, r: 0, b: 0 };
  padding: any = { l: 0, t: 0, r: 0, b: 0 };
  final: any = { x: 0, y: 0, width: 0, height: 0 };
  child?: any;
  constructor(public renderer?: any) {}
}

class ScrollViewer {
  final: any = { x: 0, y: 0, width: 0, height: 0 };
  horizontalOffset = 0;
  verticalOffset = 0;
  content?: any;
  constructor(public renderer?: any) {}
  setContent(ch: any) { this.content = ch; }
}

const getElementBounds = (root: any, id: string) => {
  const parts = id.split('.').slice(1);
  let el: any = root;
  const path: any[] = [root];
  for (const p of parts) {
    const kids: any[] = [];
    if (Array.isArray(el.children)) kids.push(...el.children);
    const child = (el as any).child;
    if (child) kids.push(child);
    const content = (el as any).content;
    if (content) kids.push(content);
    el = kids[Number(p)];
    if (!el) return null;
    path.push(el);
  }
  let x = 0;
  let y = 0;
  for (const node of path) {
    const m = node.margin ?? { l: 0, t: 0, r: 0, b: 0 };
    x += (node.final?.x ?? 0) - m.l + (node.horizontalOffset ?? 0);
    y += (node.final?.y ?? 0) - m.t + (node.verticalOffset ?? 0);
  }
  const target = path[path.length - 1];
  const margin = target.margin ?? { l: 0, t: 0, r: 0, b: 0 };
  return {
    x,
    y,
    width: (target.final?.width ?? 0) + margin.l + margin.r,
    height: (target.final?.height ?? 0) + margin.t + margin.b,
  };
};

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
  panel.final = { x: 37, y: 48, width: 120, height: 100 } as any;

  const child = new Grid(renderer);
  child.margin = { l: 3, t: 4, r: 5, b: 6 } as any;
  child.final = { x: 8, y: 10, width: 70, height: 80 } as any;

  panel.child = child;
  root.add(panel);
  const gui = { root, getElementBounds: (id: string) => getElementBounds(root, id) } as any;

  const rootSel: LayoutSelection = { id: '0', tag: 'grid', name: 'root' };
  const childSel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, rootSel), {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  assert.deepEqual(getGridOverlayBounds(gui, childSel), {
    x: 35,
    y: 46,
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
  child.final = { x: 12, y: 12, width: 50, height: 40 } as any;

  border.child = child;
  root.add(border);
  const gui = { root, getElementBounds: (id: string) => getElementBounds(root, id) } as any;

  const sel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, sel), {
    x: 12,
    y: 12,
    width: 50,
    height: 40,
  });
});


test('overlay accounts for ScrollViewer scroll offsets', () => {
  const root = new Grid(renderer);
  root.final = { x: 0, y: 0, width: 200, height: 200 } as any;

  const viewer = new ScrollViewer(renderer);
  viewer.final = { x: 0, y: 0, width: 100, height: 100 } as any;
  viewer.verticalOffset = 30;

  const child = new Grid(renderer);
  child.final = { x: 0, y: -30, width: 80, height: 60 } as any;

  viewer.setContent(child);
  root.add(viewer);

  const gui = { root, getElementBounds: (id: string) => getElementBounds(root, id) } as any;
  const sel: LayoutSelection = { id: '0.0.0', tag: 'grid', name: 'child' };

  assert.deepEqual(getGridOverlayBounds(gui, sel), {
    x: 0,
    y: 0,
    width: 80,
    height: 60,
  });
});
