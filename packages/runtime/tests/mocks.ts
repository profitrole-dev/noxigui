import type { Renderer, RenderImage, RenderText, RenderGraphics, RenderContainer } from '../src/renderer.js';
import { UIElement } from '../src/core.js';
import type { Size, Rect } from '../src/core.js';

class MockRenderGraphics implements RenderGraphics {
  clear(): void {}
  beginFill(_color: number): RenderGraphics { return this; }
  drawRect(_x: number, _y: number, _w: number, _h: number): RenderGraphics { return this; }
  endFill(): void {}
  destroy(): void {}
  getDisplayObject(): any { return this; }
}

class MockRenderContainer implements RenderContainer {
  children: any[] = [];
  x = 0;
  y = 0;
  addChild(child: any): void { this.children.push(child); }
  removeChild(child: any): void { this.children = this.children.filter(c => c !== child); }
  setPosition(x: number, y: number): void { this.x = x; this.y = y; }
  setSortableChildren(_value: boolean): void {}
  setMask(_mask: any | null): void {}
  getDisplayObject(): any { return this; }
}

class MockRenderImage implements RenderImage {
  width: number;
  height: number;
  x = 0;
  y = 0;
  scaleX = 1;
  scaleY = 1;
  constructor(width = 0, height = 0) { this.width = width; this.height = height; }
  setTexture(tex?: any): void { this.width = tex?.width ?? 0; this.height = tex?.height ?? 0; }
  setPosition(x: number, y: number): void { this.x = x; this.y = y; }
  setScale(x: number, y: number): void { this.scaleX = x; this.scaleY = y; }
  getNaturalSize() { return { width: this.width, height: this.height }; }
  getDisplayObject(): any { return this; }
}

class MockRenderText implements RenderText {
  x = 0;
  y = 0;
  private wrapWidth = Infinity;
  constructor(private content: string, private style: { fill: string; fontSize: number }) {}
  setWordWrap(width: number, _align: 'left' | 'center' | 'right'): void { this.wrapWidth = width; }
  getBounds() {
    const charW = this.style.fontSize * 0.6;
    const lineH = this.style.fontSize;
    const perLine = Math.max(1, Math.floor(this.wrapWidth / charW));
    const lines = Math.max(1, Math.ceil(this.content.length / perLine));
    const width = Math.min(this.content.length, perLine) * charW;
    const height = lines * lineH;
    return { width, height };
  }
  setPosition(x: number, y: number): void { this.x = x; this.y = y; }
  getDisplayObject(): any { return this; }
}

export function createMockRenderer(): Renderer {
  return {
    createImage: (_tex?: any) => new MockRenderImage(_tex?.width, _tex?.height),
    createText: (text: string, style: { fill: string; fontSize: number }) => new MockRenderText(text, style),
    createGraphics: () => new MockRenderGraphics(),
    createContainer: () => new MockRenderContainer(),
  };
}

export class TestElement extends UIElement {
  measureCalls: Size[] = [];
  arrangeCalls: Rect[] = [];
  constructor(private desiredSize: Size) { super(); }
  measure(avail: Size): void { this.measureCalls.push(avail); this.desired = { ...this.desiredSize }; }
  arrange(rect: Rect): void { this.arrangeCalls.push(rect); this.final = { ...rect }; }
}
