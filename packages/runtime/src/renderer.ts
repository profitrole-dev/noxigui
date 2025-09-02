
export interface RenderImage {
  setTexture(tex?: unknown): void;
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
  beginFill(color: number): RenderGraphics;
  drawRect(x: number, y: number, w: number, h: number): RenderGraphics;
  endFill(): void;
  destroy(): void;
  getDisplayObject(): any;
}

export interface RenderContainer {
  addChild(child: any): void;
  removeChild(child: any): void;
  setPosition(x: number, y: number): void;
  setScale(x: number, y: number): void;
  setSortableChildren(value: boolean): void;
  setMask(mask: any | null): void;
  /** Optional event hookup used by interactive elements */
  addEventListener(type: string, handler: (evt: any) => void): void;
  getDisplayObject(): any;
  setEventMode(mode: 'auto'|'static'|'dynamic'): void;
  setHitArea(x: number, y: number, w: number, h: number): void;
  removeEventListener(type: string, handler: (evt:any)=>void, ctx?: any):void;
}

export interface Renderer {
  /**
   * Rendering resolution. When provided, the root container will be scaled
   * by `1 / resolution` so logical units map correctly to display pixels.
   */
  resolution?: number;
  getTexture(key: string): unknown;
  createImage(tex?: unknown): RenderImage;
  createText(text: string, style: { fill: string; fontSize: number }): RenderText;
  createGraphics(): RenderGraphics;
  createContainer(): RenderContainer;
}
