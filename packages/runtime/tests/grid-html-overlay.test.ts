import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid } from '../src/elements/Grid.js';
import { drawDebugHtml } from '../src/elements/grid/debug-html.js';
import { JSDOM } from 'jsdom';
import type { Renderer, RenderGraphics } from '../src/renderer.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
(globalThis as any).document = dom.window.document;

const graphicsObj: any = {
  visible: false,
  clear() {},
};

const gfx: RenderGraphics = {
  clear() {},
  beginFill() { return this; },
  drawRect() { return this; },
  endFill() {},
  destroy() {},
  getDisplayObject() { return graphicsObj; },
};

const renderer: Renderer = {
  getTexture() { return undefined; },
  createImage() { return {} as any; },
  createText() { return {} as any; },
  createGraphics() { return gfx; },
  createContainer() { return {} as any; },
};

test('drawDebugHtml creates overlay lines and markers', () => {
  const g = new Grid(renderer);
  g.debug = true;
  g.final = { x: 10, y: 20, width: 100, height: 80 } as any;
  drawDebugHtml(g, [0, 50, 100], [0, 40, 80]);

  const overlay = document.querySelector('.noxi-grid-html-overlay') as HTMLElement;
  assert.ok(overlay);
  assert.equal(overlay.style.left, '10px');
  assert.equal(overlay.querySelectorAll('.noxi-grid-html-overlay-col').length, 1);
  assert.equal(overlay.querySelectorAll('.noxi-grid-html-overlay-row').length, 1);

  overlay.remove();
});
