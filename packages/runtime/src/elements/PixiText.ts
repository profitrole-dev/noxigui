import * as PIXI from 'pixi.js';
import { UIElement } from '../core.js';
import type { Size, Rect } from '../core.js';

export class PixiText extends UIElement {
  view: PIXI.Text;
  hAlign: 'Left'|'Center'|'Right' = 'Left';
  vAlign: 'Top'|'Center'|'Bottom' = 'Top';

  constructor(view: PIXI.Text) { super(); this.view = view; }

  measure(avail: Size) {
    const style: any = this.view.style;
    if (style) {
      style.wordWrap = true;
      style.wordWrapWidth = Math.max(1, avail.width);
      style.breakWords = true;
      style.align = 'left';
    }
    // @ts-ignore
    this.view.updateText?.();
    const b = this.view.getLocalBounds?.() ?? { width: (this.view as any).width ?? 0, height: (this.view as any).height ?? 0 };
    const w = Number.isFinite(b.width) && b.width > 0 ? b.width : (Number(style?.fontSize) || 16) * (this.view.text?.toString().length || 1) * 0.6;
    const h = Number.isFinite(b.height) && b.height > 0 ? b.height : (Number(style?.lineHeight) || Number(style?.fontSize) || 16);
    this.desired = { width: w + this.margin.l + this.margin.r, height: h + this.margin.t + this.margin.b };

    this.desired.width = Math.max(this.desired.width, this.minW + this.margin.l + this.margin.r);
    this.desired.height = Math.max(this.desired.height, this.minH + this.margin.t + this.margin.b);
    if (this.prefW !== undefined)
      this.desired.width = Math.max(this.desired.width, this.prefW + this.margin.l + this.margin.r);
    if (this.prefH !== undefined)
      this.desired.height = Math.max(this.desired.height, this.prefH + this.margin.t + this.margin.b);
  }

  arrange(rect: Rect) {
    const x0 = rect.x + this.margin.l, y0 = rect.y + this.margin.t;
    const w = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const h = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: x0, y: y0, width: w, height: h };

    const style: any = this.view.style;
    if (style) {
      style.wordWrap = true;
      style.wordWrapWidth = Math.max(1, w);
      style.breakWords = true;
      style.align = this.hAlign === 'Center' ? 'center' : this.hAlign === 'Right' ? 'right' : 'left';
    }
    // @ts-ignore
    this.view.updateText?.();
    const b = this.view.getLocalBounds();

    let x = x0, y = y0;
    if (this.hAlign === 'Center') x = x0 + (w - b.width) / 2;
    else if (this.hAlign === 'Right') x = x0 + (w - b.width);
    if (this.vAlign === 'Center') y = y0 + (h - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - b.height);
    this.view.x = x; this.view.y = y;
  }
}
