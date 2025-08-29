import test from 'node:test';
import assert from 'node:assert/strict';
import { ScrollViewer } from '../src/elements/ScrollViewer.js';
import { UIElement } from '@noxigui/core';
import type { Renderer, RenderContainer, RenderGraphics } from '../src/renderer.js';

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

function createStubRenderer(): Renderer {
  const graphics = (): RenderGraphics & any => ({
    clear() {},
    beginFill() { return this; },
    drawRect() { return this; },
    endFill() {},
    destroy() {},
    visible: true,
    getDisplayObject() { return this; },
  });
  const container = () => {
    const c: RenderContainer & any = {
      mask: null,
      addChild() {},
      removeChild() {},
      setPosition() {},
      setSortableChildren() {},
      setMask(m: any) { this.mask = m; },
      getDisplayObject() { return this; },
    };
    return c;
  };
  return {
    getTexture() { return null; },
    createImage() { throw new Error('not impl'); },
    createText() { throw new Error('not impl'); },
    createGraphics() { return graphics(); },
    createContainer() { return container(); },
  };
}

test('basic vertical scrolling', () => {
  const renderer = createStubRenderer();
  const child = new Dummy(100, 200);
  const sv = new ScrollViewer(renderer, child);
  sv.measure({ width: 50, height: 50 });
  sv.arrange({ x: 0, y: 0, width: 50, height: 50 });
  assert.ok((sv.container as any).mask, 'mask should be assigned');
  assert.equal(sv.vBar.getDisplayObject().visible, true);
  sv.scrollToVerticalOffset(30);
  assert.equal(child.final.y, -30);
  sv.scrollToVerticalOffset(500); // clamp
  assert.equal(child.final.y, -150);
  assert.equal(sv.vBar.getDisplayObject().visible, true);
});

test('scroll bar hidden when content fits', () => {
  const renderer = createStubRenderer();
  const child = new Dummy(100, 40);
  const sv = new ScrollViewer(renderer, child);
  sv.measure({ width: 100, height: 100 });
  sv.arrange({ x: 0, y: 0, width: 100, height: 100 });
  assert.equal(sv.vBar.getDisplayObject().visible, false);
});
