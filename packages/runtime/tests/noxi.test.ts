import test from 'node:test';
import assert from 'node:assert/strict';
import { Noxi, type GuiObject } from '../src/index.js';
import type { Renderer, RenderGraphics, RenderContainer } from '../src/renderer.js';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';

class PatchedDOMParser extends XmldomParser {
  parseFromString(str: string, type: string) {
    const doc = super.parseFromString(str, type);
    const patch = (el: any) => {
      el.children = Array.from(el.childNodes || []).filter((c: any) => c.nodeType === 1);
      el.children.forEach(patch);
    };
    patch(doc.documentElement);
    return doc;
  }
}

(globalThis as any).DOMParser = PatchedDOMParser;

const graphicsObj: any = {
  visible: false,
  clear() {},
  lineStyle() {},
  drawRect() {},
  beginFill() {},
  endFill() {},
  moveTo() {},
  lineTo() {},
};

const gfx: RenderGraphics = {
  clear() {},
  beginFill() { return this; },
  drawRect() { return this; },
  endFill() {},
  destroy() {},
  getDisplayObject() { return graphicsObj; },
};

const containerObj: any = {
  addChild() {},
  removeChild() {},
  setPosition() {},
  setSortableChildren() {},
  setMask() {},
  destroy() { this.destroyed = true; },
  getDisplayObject() { return this; },
};

const renderer: Renderer = {
  getTexture() { return undefined; },
  createImage() { return {} as any; },
  createText() { return {} as any; },
  createGraphics() { return gfx; },
  createContainer() { return containerObj as RenderContainer; },
};

test('Noxi.gui.create returns GuiObject', () => {
  const xml = '<Grid />';
  const gui: GuiObject = Noxi.gui.create(xml, renderer);
  assert.equal(gui.container, containerObj);
  gui.layout({ width: 100, height: 100 });
  gui.setGridDebug(true);
  gui.destroy();
  assert.equal(containerObj.destroyed, true);
});
