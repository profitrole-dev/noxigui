import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { Noxi as RuntimeNoxi } from '@noxigui/runtime';
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

(globalThis as any).DOMParser = PatchedDOMParser as any;

const fakeRenderer = {
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
    return {
      addChild() {},
      removeChild() {},
      setPosition() {},
      setSortableChildren() {},
      setMask() {},
      getDisplayObject() { return {}; },
    } as any;
  },
};

let called = 0;
function createPixiRenderer() {
  called++;
  return fakeRenderer as any;
}

const indexPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../src/index.js');
let code = fs.readFileSync(indexPath, 'utf8')
  .replace("import { Noxi as RuntimeNoxi } from '@noxigui/runtime';", '')
  .replace("import { createPixiRenderer } from '@noxigui/renderer-pixi';", '')
  .replace('export default Noxi;', '');
code += '\nmodule.exports = { default: Noxi };';
const module: any = { exports: {} };
vm.runInNewContext(code, { RuntimeNoxi, createPixiRenderer, module, exports: module.exports });
const { default: Noxi } = module.exports as { default: any };

test('Noxi.gui.create uses Pixi renderer by default', () => {
  const gui = Noxi.gui.create('<Grid/>');
  assert.equal(called, 1);
  gui.destroy();
});
