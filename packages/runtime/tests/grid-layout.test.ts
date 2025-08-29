import test from 'node:test';
import assert from 'node:assert/strict';
import { Grid, Row, Col } from '../src/elements/Grid.js';
import { measureGrid, arrangeGrid } from '../src/elements/grid/layout.js';
import { Px, Star } from '../src/helpers.js';
import { UIElement } from '@noxigui/core';
import type { Renderer, RenderGraphics } from '../src/renderer.js';

const graphicsObj: any = {
  visible: false,
  clear() {}, lineStyle() {}, drawRect() {}, beginFill() {}, endFill() {}, moveTo() {}, lineTo() {},
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

class Dummy extends UIElement {
  constructor(public w: number, public h: number) { super(); }
  measure() { this.desired = { width: this.w, height: this.h }; }
  arrange(rect: any) { this.final = rect; }
}

test('measure star and pixel columns', () => {
  const g = new Grid(renderer);
  g.rows = [new Row(Star(1))];
  g.cols = [new Col(Px(50)), new Col(Star(1))];
  measureGrid(g, { width: 150, height: 100 });
  assert.equal(g.cols[0].actual, 50);
  assert.equal(Math.round(g.cols[1].actual), 100);
  assert.equal(g.rows[0].actual, 100);
});

test('arrange child in second column', () => {
  const g = new Grid(renderer);
  g.rows = [new Row(Star(1))];
  g.cols = [new Col(Px(50)), new Col(Star(1))];
  const ch = new Dummy(0, 0);
  g.add(ch);
  Grid.setCol(ch, 1);
  measureGrid(g, { width: 150, height: 100 });
  arrangeGrid(g, { x: 0, y: 0, width: 150, height: 100 });
  assert.equal(ch.final.x, 50);
  assert.equal(ch.final.width, 100);
});
