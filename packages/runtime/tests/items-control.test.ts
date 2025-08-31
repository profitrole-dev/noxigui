import test from 'node:test';
import assert from 'node:assert/strict';
import { ItemsControl } from '../src/elements/ItemsControl.js';
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
      addEventListener() {},
      setEventMode() {},
      setHitArea() {},
      removeEventListener() {},
      getDisplayObject() { return obj; },
    } as any;
  },
});

class Dummy extends UIElement {
  measure() {}
  arrange() {}
}

test('items control regenerates children when source changes', () => {
  const ic = new ItemsControl(createRenderer());
  ic.itemTemplate = () => new Dummy();
  ic.itemsSource = [1, 2];
  const panel: any = ic.itemsPanel as any;
  assert.equal(panel.children.length, 2);
  assert.equal(panel.children[0].getDataContext(), 1);
  assert.equal(panel.children[1].getDataContext(), 2);

  ic.itemsSource = ['a'];
  assert.equal(panel.children.length, 1);
  assert.equal(panel.children[0].getDataContext(), 'a');
});

