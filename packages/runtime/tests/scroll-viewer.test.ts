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
  const graphics: RenderGraphics = {
    clear() {},
    beginFill() { return this; },
    drawRect() { return this; },
    endFill() {},
    destroy() {},
    getDisplayObject() { return {}; },
  };
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
    createGraphics() { return graphics; },
    createContainer() { return container(); },
  };
}

test('basic vertical scrolling', () => {
  const renderer = createStubRenderer();
  const child = new Dummy(100, 200);
  const sv = new ScrollViewer(renderer, child);
  sv.measure({ width: 50, height: 50 });
  sv.arrange({ x: 0, y: 0, width: 50, height: 50 });
  sv.scrollToVerticalOffset(30);
  assert.equal(child.final.y, -30);
  sv.scrollToVerticalOffset(500); // clamp
  assert.equal(child.final.y, -150);
});
