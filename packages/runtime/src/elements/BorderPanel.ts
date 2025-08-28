import type { Rect } from '../../../core/src/index.js';
import { BorderPanel as CoreBorderPanel, type UIElement } from '../../../core/src/index.js';
import type { Renderer, RenderGraphics, RenderContainer } from '../renderer.js';

export class BorderPanel extends CoreBorderPanel {
  bg: RenderGraphics;
  container: RenderContainer;
  private maskG: RenderGraphics | null = null;
  private renderer: Renderer;

  constructor(renderer: Renderer, opts?: { background?: number; child?: UIElement }) {
    super(opts);
    this.renderer = renderer;
    this.container = renderer.createContainer();
    this.bg = renderer.createGraphics();
    this.container.addChild(this.bg.getDisplayObject());
  }

  arrange(rect: Rect) {
    super.arrange(rect);

    this.container.setPosition(this.final.x, this.final.y);
    this.container.setSortableChildren(true);

    this.bg.clear();
    if (this.background !== undefined) {
      this.bg.beginFill(this.background).drawRect(0, 0, this.final.width, this.final.height).endFill();
    }

    if (this.clipToBounds) {
      if (!this.maskG) {
        this.maskG = this.renderer.createGraphics();
        this.container.addChild(this.maskG.getDisplayObject());
        this.container.setMask(this.maskG.getDisplayObject());
      }
      this.maskG.clear();
      this.maskG.beginFill(0xffffff).drawRect(0, 0, this.final.width, this.final.height).endFill();
    } else if (this.maskG) {
      this.container.setMask(null);
      this.container.removeChild(this.maskG.getDisplayObject());
      this.maskG.destroy();
      this.maskG = null;
    }
  }
}
