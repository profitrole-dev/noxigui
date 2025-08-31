import test from 'node:test';
import assert from 'node:assert/strict';
import { ScrollViewer, type IScrollInfo } from '../src/elements/ScrollViewer.js';
import { UIElement } from '@noxigui/core';
import type { Renderer } from '../src/renderer.js';

const createRenderer = (): Renderer => ({
  getTexture() { return undefined as any; },
  createImage() { return {} as any; },
  createText() {
    return {
      setWordWrap() {},
      getBounds() { return { width: 0, height: 0 }; },
      setPosition() {},
      getDisplayObject() { return {}; },
    } as any;
  },
  createGraphics() {
    return {
      clear() {},
      beginFill() { return this; },
      drawRect() { return this; },
      endFill() {},
      destroy() {},
      getDisplayObject() { return {}; },
    } as any;
  },
  createContainer() {
    const obj = {
      children: [] as any[],
      handlers: {} as Record<string, (e: any) => void>,
      addEventListener(type: string, cb: (e: any) => void) {
        (this as any).handlers[type] = cb;
      },
    };
    return {
      addChild(child: any) { obj.children.push(child); },
      removeChild(child: any) { const i = obj.children.indexOf(child); if (i >= 0) obj.children.splice(i,1); },
      setPosition() {},
      setSortableChildren() {},
      setMask() {},
      addEventListener(type: string, cb: (e: any) => void) { obj.handlers[type] = cb; },
      setEventMode() {},
      getDisplayObject() { return obj; },
    } as any;
  },
});

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure computes extent and viewport', () => {
  const sv = new ScrollViewer(createRenderer());
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
  const sv = new ScrollViewer(createRenderer());
  const ch = new Dummy(200, 400);
  sv.setContent(ch);
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });

  sv.scrollToVerticalOffset(50);
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, 50);
  assert.equal(ch.final.y, -50);

  sv.scrollToVerticalOffset(1000);
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, sv.scrollableHeight);
  assert.equal(ch.final.y, -sv.scrollableHeight);
});

test('ScrollTo applies immediately', () => {
  const sv = new ScrollViewer(createRenderer());
  sv.setContent(new Dummy(100, 200));
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  sv.scrollToVerticalOffset(10);
  assert.equal(sv.verticalOffset, 10);
  assert.equal(sv.arrangeDirty, false);
});

test('computed scrollbar visibility', () => {
  const sv = new ScrollViewer(createRenderer());
  sv.setContent(new Dummy(50, 200));
  sv.measure({ width: 100, height: 100 });
  assert.equal(sv.computedVerticalScrollBarVisibility, 'Visible');
  assert.equal(sv.computedHorizontalScrollBarVisibility, 'Hidden');
});

class DummySI extends UIElement implements IScrollInfo {
  canHorizontallyScroll = false;
  canVerticallyScroll = true;
  extentWidth = 1; extentHeight = 10;
  viewportWidth = 1; viewportHeight = 4;
  horizontalOffset = 0; verticalOffset = 0;
  measure() { this.desired = { width: 0, height: 0 }; }
  arrange(rect: any) { this.final = rect; }
  lineUp() { this.verticalOffset = Math.max(0, this.verticalOffset - 1); }
  lineDown() { this.verticalOffset = Math.min(this.extentHeight - this.viewportHeight, this.verticalOffset + 1); }
  lineLeft() {}
  lineRight() {}
  pageUp() { this.verticalOffset = Math.max(0, this.verticalOffset - this.viewportHeight); }
  pageDown() { this.verticalOffset = Math.min(this.extentHeight - this.viewportHeight, this.verticalOffset + this.viewportHeight); }
  pageLeft() {}
  pageRight() {}
  setHorizontalOffset(x: number) { this.horizontalOffset = x; }
  setVerticalOffset(y: number) { this.verticalOffset = y; }
}

test('CanContentScroll with IScrollInfo child', () => {
  const sv = new ScrollViewer(createRenderer());
  sv.canContentScroll = true;
  const si = new DummySI();
  sv.setContent(si);
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.extentHeight, 10);
  assert.equal(sv.viewportHeight, 100);
  sv.lineDown();
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, 1);
  assert.equal(si.verticalOffset, 1);
});

test('wheel events scroll automatically', () => {
  const sv = new ScrollViewer(createRenderer());
  sv.setContent(new Dummy(100, 300));
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  const obj: any = sv.container.getDisplayObject();
  obj.handlers['wheel']({ deltaY: 20 });
  // apply arrange pass after event
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.verticalOffset, 20);
});
