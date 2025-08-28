import { UIElement, type Size, type Rect } from './UIElement.js';

export abstract class Text extends UIElement {
  content: string;
  style: { fill: string; fontSize: number };
  hAlign: 'Left' | 'Center' | 'Right' = 'Left';
  vAlign: 'Top' | 'Center' | 'Bottom' = 'Top';
  renderX = 0;
  renderY = 0;
  renderWidth = 0;
  renderHeight = 0;

  constructor(content: string, style: { fill: string; fontSize: number }) {
    super();
    this.content = content;
    this.style = style;
  }

  protected abstract measureText(width: number, align: 'left' | 'center' | 'right'): Size;

  measure(avail: Size) {
    const b = this.measureText(Math.max(1, avail.width), 'left');
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
    const b = this.measureText(Math.max(1, w), align);

    let x = x0, y = y0;
    if (this.hAlign === 'Center') x = x0 + (w - b.width) / 2;
    else if (this.hAlign === 'Right') x = x0 + (w - b.width);
    if (this.vAlign === 'Center') y = y0 + (h - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - b.height);

    this.renderX = x;
    this.renderY = y;
    this.renderWidth = b.width;
    this.renderHeight = b.height;
  }
}
