import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, Row, Col } from '../src/elements/Grid.js';
import { Star } from '../src/helpers.js';
import { drawDebug } from '../src/elements/grid/debug.js';
import type { Renderer, RenderGraphics } from '../src/renderer.js';

const graphicsObj: any = {
  visible: false,
  clear() { this.cleared = true; },
  lineStyle() {}, drawRect() {}, beginFill() {}, endFill() {}, moveTo() {}, lineTo() {},
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

test('drawDebug toggles visibility', () => {
  const g = new Grid(renderer);
  g.debug = true;
  g.rows = [new Row(Star(1))];
  g.cols = [new Col(Star(1))];
  g.final = { x:0, y:0, width:100, height:100 } as any;
  drawDebug(g, [0,100], [0,100]);
  assert.equal(graphicsObj.visible, true);
});
