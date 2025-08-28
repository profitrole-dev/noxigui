import { UIElement } from '../../../core/src/index.js';
import type { Size, Rect } from '../../../core/src/index.js';
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
    const intrinsicW = b.width + this.margin.l + this.margin.r;
    const intrinsicH = b.height + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH)
    };
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
