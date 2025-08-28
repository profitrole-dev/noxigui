import * as PIXI from 'pixi.js';
import { UIElement } from '../core.js';
import type { Size, Rect } from '../core.js';

export class BorderPanel extends UIElement {
  bg = new PIXI.Graphics();
  container = new PIXI.Container();
  child?: UIElement;
  background?: number;
  clipToBounds = false;
  private maskG: PIXI.Graphics | null = null;
  padding = { l: 0, t: 0, r: 0, b: 0 };

  constructor(opts?: { background?: number; child?: UIElement }) {
    super();
    this.background = opts?.background;
    this.child = opts?.child;
  }

  measure(avail: Size) {
    const inner = {
      width: Math.max(0, avail.width - this.margin.l - this.margin.r - this.padding.l - this.padding.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b - this.padding.t - this.padding.b),
    };
    if (this.child) {
      this.child.measure(inner);
      this.desired = {
        width: this.child.desired.width + this.margin.l + this.margin.r + this.padding.l + this.padding.r,
        height: this.child.desired.height + this.margin.t + this.margin.b + this.padding.t + this.padding.b,
      };
    } else {
      this.desired = {
        width: this.margin.l + this.margin.r + this.padding.l + this.padding.r,
        height: this.margin.t + this.margin.b + this.padding.t + this.padding.b,
      };
    }

    this.desired.width = Math.max(this.desired.width, this.minW + this.margin.l + this.margin.r);
    this.desired.height = Math.max(this.desired.height, this.minH + this.margin.t + this.margin.b);
    if (this.prefW !== undefined)
      this.desired.width = Math.max(this.desired.width, this.prefW + this.margin.l + this.margin.r);
    if (this.prefH !== undefined)
      this.desired.height = Math.max(this.desired.height, this.prefH + this.margin.t + this.margin.b);
  }

  arrange(rect: Rect) {
    const innerX = rect.x + this.margin.l;
    const innerY = rect.y + this.margin.t;
    const innerW = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: innerX, y: innerY, width: innerW, height: innerH };

    this.container.position.set(innerX, innerY);
    this.container.sortableChildren = true;

    this.bg.clear();
    if (this.background !== undefined) {
      this.bg.beginFill(this.background).drawRect(0, 0, innerW, innerH).endFill();
    }

    if (this.clipToBounds) {
      if (!this.maskG) {
        this.maskG = new PIXI.Graphics();
        this.container.addChild(this.maskG);
        this.container.mask = this.maskG;
      }
      this.maskG.clear();
      this.maskG.beginFill(0xffffff).drawRect(0, 0, innerW, innerH).endFill();
    } else if (this.maskG) {
      this.container.mask = null;
      this.container.removeChild(this.maskG);
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
