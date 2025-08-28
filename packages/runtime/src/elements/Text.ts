import { UIElement } from '../core.js';
import type { Size, Rect } from '../core.js';
import type { Renderer, RenderText } from '../renderer.js';

export class Text extends UIElement {
  text: RenderText;
  hAlign: 'Left' | 'Center' | 'Right' = 'Left';
  vAlign: 'Top' | 'Center' | 'Bottom' = 'Top';

  constructor(renderer: Renderer, content: string, style: { fill: string; fontSize: number }) {
    super();
    this.text = renderer.createText(content, style);
  }

  measure(avail: Size) {
    this.text.setWordWrap(Math.max(1, avail.width), 'left');
    const b = this.text.getBounds();
    const w = b.width;
    const h = b.height;
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

    const align = this.hAlign === 'Center' ? 'center' : this.hAlign === 'Right' ? 'right' : 'left';
    this.text.setWordWrap(Math.max(1, w), align);
    const b = this.text.getBounds();

    let x = x0, y = y0;
    if (this.hAlign === 'Center') x = x0 + (w - b.width) / 2;
    else if (this.hAlign === 'Right') x = x0 + (w - b.width);
    if (this.vAlign === 'Center') y = y0 + (h - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - b.height);
    this.text.setPosition(x, y);
  }
}
