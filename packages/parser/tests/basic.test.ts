import test from 'node:test';
import assert from 'node:assert/strict';
import { Parser } from '../src/Parser.js';
import { Grid, Text, TemplateStore } from '@noxigui/runtime';

const createRenderer = () => {
  return {
    getTexture() { return undefined; },
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
      const obj = { children: [] as any[] };
      return {
        addChild(child: any) { obj.children.push(child); },
        removeChild(child: any) {
          const i = obj.children.indexOf(child);
          if (i >= 0) obj.children.splice(i, 1);
        },
        setPosition() {},
        setSortableChildren() {},
        setMask() {},
        getDisplayObject() { return obj; },
      } as any;
    },
  } as any;
};

test('parse simple grid with text', () => {
  const renderer = createRenderer();
  const parser = new Parser(renderer, new TemplateStore());
  const { root, container } = parser.parse('<Grid><TextBlock Text="Hello"/></Grid>');
  assert.ok(root instanceof Grid);
  const grid = root as Grid;
  assert.equal(grid.children.length, 1);
  const child = grid.children[0];
  assert.ok(child instanceof Text);
  assert.ok(container.getDisplayObject().children.length >= 1);
});
