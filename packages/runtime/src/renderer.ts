export interface RenderImage {
  setTexture(tex?: any): void;
  setPosition(x: number, y: number): void;
  setScale(x: number, y: number): void;
  getNaturalSize(): { width: number; height: number };
  getDisplayObject(): any;
}

export interface RenderText {
  setWordWrap(width: number, align: 'left' | 'center' | 'right'): void;
  getBounds(): { width: number; height: number };
  setPosition(x: number, y: number): void;
  getDisplayObject(): any;
}

export interface RenderGraphics {
  clear(): void;
  beginFill(color: number, alpha?: number): RenderGraphics;
  drawRect(x: number, y: number, w: number, h: number): RenderGraphics;
  lineStyle?(opts: { width: number; color: number; alpha?: number }): RenderGraphics;
  moveTo?(x: number, y: number): RenderGraphics;
  lineTo?(x: number, y: number): RenderGraphics;
  endFill(): void;
  destroy(): void;
  setVisible?(v: boolean): void;
  getDisplayObject(): any;
}

export interface RenderContainer {
  addChild(child: any): void;
  removeChild(child: any): void;
  setPosition(x: number, y: number): void;
  setSortableChildren(value: boolean): void;
  setMask(mask: any | null): void;
  getDisplayObject(): any;
}

export interface Renderer {
  createImage(tex?: any): RenderImage;
  createText(text: string, style: { fill: string; fontSize: number }): RenderText;
  createGraphics(): RenderGraphics;
  createContainer(): RenderContainer;
}
