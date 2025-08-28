import { UIElement } from '../../../core/src/index.js';
import type { Size, Rect } from '../../../core/src/index.js';
import type { Renderer, RenderGraphics, RenderContainer } from '../renderer.js';

export class BorderPanel extends UIElement {
  bg: RenderGraphics;
  container: RenderContainer;
  child?: UIElement;
  background?: number;
  clipToBounds = false;
  private maskG: RenderGraphics | null = null;
  padding = { l: 0, t: 0, r: 0, b: 0 };
  private renderer: Renderer;

  constructor(renderer: Renderer, opts?: { background?: number; child?: UIElement }) {
    super();
    this.renderer = renderer;
    this.container = renderer.createContainer();
    this.bg = renderer.createGraphics();
    this.container.addChild(this.bg.getDisplayObject());
    this.background = opts?.background;
    this.child = opts?.child;
  }

  measure(avail: Size) {
    const inner = {
      width: Math.max(0, avail.width - this.margin.l - this.margin.r - this.padding.l - this.padding.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b - this.padding.t - this.padding.b),
    };
    let intrinsicW = this.margin.l + this.margin.r + this.padding.l + this.padding.r;
    let intrinsicH = this.margin.t + this.margin.b + this.padding.t + this.padding.b;
    if (this.child) {
      this.child.measure(inner);
      intrinsicW += this.child.desired.width;
      intrinsicH += this.child.desired.height;
    }
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const innerX = rect.x + this.margin.l;
    const innerY = rect.y + this.margin.t;
    const innerW = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: innerX, y: innerY, width: innerW, height: innerH };

    this.container.setPosition(innerX, innerY);
    this.container.setSortableChildren(true);

    this.bg.clear();
    if (this.background !== undefined) {
      this.bg.beginFill(this.background).drawRect(0, 0, innerW, innerH).endFill();
    }

    if (this.clipToBounds) {
      if (!this.maskG) {
        this.maskG = this.renderer.createGraphics();
        this.container.addChild(this.maskG.getDisplayObject());
        this.container.setMask(this.maskG.getDisplayObject());
      }
      this.maskG.clear();
      this.maskG.beginFill(0xffffff).drawRect(0, 0, innerW, innerH).endFill();
    } else if (this.maskG) {
      this.container.setMask(null);
      this.container.removeChild(this.maskG.getDisplayObject());
      this.maskG.destroy();
      this.maskG = null;
    }

    if (this.child) {
      const cx = this.padding.l;
      const cy = this.padding.t;
      const cw = Math.max(0, innerW - this.padding.l - this.padding.r);
      const ch = Math.max(0, innerH - this.padding.t - this.padding.b);
      this.child.arrange({ x: cx, y: cy, width: cw, height: ch });
    }
  }
}
