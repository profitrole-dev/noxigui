import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

class FakeTexture {
  orig: { width: number; height: number };
  width: number;
  height: number;
  constructor(width = 1, height = 1) {
    this.width = width;
    this.height = height;
    this.orig = { width, height };
  }
}

class FakeSprite {
  texture: any;
  anchor = { set() {} };
  scale = { set() {} };
  x = 0;
  y = 0;
  constructor(tex?: any) {
    this.texture = tex ?? fakeWhite;
  }
}

class FakeText {
  text: string;
  style: any;
  x = 0;
  y = 0;
  constructor(content: string, style: any) {
    this.text = content;
    this.style = { ...style };
  }
  updateText() {}
  getLocalBounds() {
    return { width: this.text.length * 10, height: this.style.fontSize };
  }
}

class FakeGraphics {
  clear() {}
  beginFill() { return this; }
  drawRect() { return this; }
  endFill() {}
  destroy() {}
  getDisplayObject() { return {}; }
}

class FakeContainer {
  addChild() {}
  removeChild() {}
  setPosition() {}
  setSortableChildren() {}
  setMask() {}
  getDisplayObject() { return {}; }
}

const fakeWhite = new FakeTexture();
const fakePixi = {
  Sprite: FakeSprite,
  Text: FakeText,
  Graphics: FakeGraphics,
  Container: FakeContainer,
  Texture: { WHITE: fakeWhite },
  Assets: { get: (_key: string) => undefined },
};

const indexPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../src/index.js');
let code = fs.readFileSync(indexPath, 'utf8').replace("import * as PIXI from 'pixi.js';", '');
code = code.replace('export function createPixiRenderer()', 'function createPixiRenderer()');
code += '\nmodule.exports = { createPixiRenderer };';
const module: any = { exports: {} };
vm.runInNewContext(code, { PIXI: fakePixi, module, exports: module.exports });
const { createPixiRenderer } = module.exports as { createPixiRenderer: () => any };
const renderer = createPixiRenderer();

test('renderer creates container object', () => {
  const c = renderer.createContainer();
  assert.ok(c.getDisplayObject());
});

test('text wrapping updates style', () => {
  const txt = renderer.createText('hello world', { fill: '#000', fontSize: 12 });
  txt.setWordWrap(50, 'center');
  assert.equal((txt as any).text.style.wordWrap, true);
  assert.equal((txt as any).text.style.wordWrapWidth, 50);
  assert.equal((txt as any).text.style.align, 'center');
});

test('image handling reports natural size', () => {
  const img = renderer.createImage();
  const tex = new FakeTexture(20, 30);
  img.setTexture(tex);
  const size = img.getNaturalSize();
  assert.equal(size.width, 20);
  assert.equal(size.height, 30);
});
