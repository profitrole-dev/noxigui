import test from 'node:test';
import assert from 'node:assert/strict';
import { Noxi } from '../src/index.js';
import type { Renderer, RenderContainer } from '../src/renderer.js';
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

const gfx = {
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
  createText(content: string) {
    return {
      content,
      setWordWrap() {},
      getBounds() { return { width: 0, height: 0 }; },
      setPosition() {},
      getDisplayObject() { return { content }; },
    } as any;
  },
  createGraphics() { return gfx as any; },
  createContainer() { return containerObj as RenderContainer; },
};

test('templates are isolated between GuiObject instances', () => {
  const xmlA = '<Grid><Resources><Template Key="T"><TextBlock Text="One"/></Template></Resources><Use Template="T"/></Grid>';
  const xmlB = '<Grid><Resources><Template Key="T"><TextBlock Text="Two"/></Template></Resources><Use Template="T"/></Grid>';

  const guiA = Noxi.gui.create(xmlA, renderer);
  const guiB = Noxi.gui.create(xmlB, renderer);

  const textA = (guiA.root as any).children[0];
  const textB = (guiB.root as any).children[0];

  assert.equal(textA.text, 'One');
  assert.equal(textB.text, 'Two');
});
