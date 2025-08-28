import * as PIXI from 'pixi.js';
import type {
  Renderer,
  RenderImage,
  RenderText,
  RenderGraphics,
  RenderContainer,
} from '@noxigui/core';

class PixiRenderImage implements RenderImage {
  sprite: PIXI.Sprite;
  constructor(tex?: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(tex ?? PIXI.Texture.WHITE);
    this.sprite.anchor.set(0, 0);
  }
  setTexture(tex?: PIXI.Texture) {
    this.sprite.texture = tex ?? PIXI.Texture.WHITE;
  }
  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }
  setScale(x: number, y: number) {
    this.sprite.scale.set(x, y);
  }
  getNaturalSize() {
    const t = this.sprite.texture;
    const w = (t as any)?.orig?.width ?? t.width ?? 0;
    const h = (t as any)?.orig?.height ?? t.height ?? 0;
    return { width: w, height: h };
  }
  getDisplayObject() {
    return this.sprite;
  }
}

class PixiRenderText implements RenderText {
  text: PIXI.Text;
  constructor(content: string, style: { fill: string; fontSize: number }) {
    this.text = new PIXI.Text(content, { fill: style.fill, fontSize: style.fontSize });
  }
  setWordWrap(width: number, align: 'left' | 'center' | 'right') {
    const style: any = this.text.style;
    if (style) {
      style.wordWrap = true;
      style.wordWrapWidth = Math.max(1, width);
      style.breakWords = true;
      style.align = align;
    }
    // @ts-ignore
    this.text.updateText?.();
  }
  getBounds() {
    const b = this.text.getLocalBounds?.() ?? { width: (this.text as any).width ?? 0, height: (this.text as any).height ?? 0 };
    return { width: b.width, height: b.height };
  }
  setPosition(x: number, y: number) {
    this.text.x = x;
    this.text.y = y;
  }
  getDisplayObject() {
    return this.text;
  }
}

class PixiRenderGraphics implements RenderGraphics {
  g: PIXI.Graphics;
  constructor() {
    this.g = new PIXI.Graphics();
  }
  clear() {
    this.g.clear();
  }
  beginFill(color: number) {
    this.g.beginFill(color);
    return this;
  }
  drawRect(x: number, y: number, w: number, h: number) {
    this.g.drawRect(x, y, w, h);
    return this;
  }
  endFill() {
    this.g.endFill();
  }
  destroy() {
    this.g.destroy();
  }
  getDisplayObject() {
    return this.g;
  }
}

class PixiRenderContainer implements RenderContainer {
  c: PIXI.Container;
  constructor() {
    this.c = new PIXI.Container();
  }
  addChild(child: any) {
    this.c.addChild(child);
  }
  removeChild(child: any) {
    this.c.removeChild(child);
  }
  setPosition(x: number, y: number) {
    this.c.position.set(x, y);
  }
  setSortableChildren(value: boolean) {
    this.c.sortableChildren = value;
  }
  setMask(mask: any | null) {
    this.c.mask = mask;
  }
  getDisplayObject() {
    return this.c;
  }
}

export function createPixiRenderer(): Renderer {
  return {
    createImage(tex?: PIXI.Texture) {
      return new PixiRenderImage(tex);
    },
    createText(content: string, style: { fill: string; fontSize: number }) {
      return new PixiRenderText(content, style);
    },
    createGraphics() {
      return new PixiRenderGraphics();
    },
    createContainer() {
      return new PixiRenderContainer();
    },
  };
}
