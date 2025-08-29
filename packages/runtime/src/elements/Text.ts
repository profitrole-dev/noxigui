import { UIElement, type Size, type Rect } from '@noxigui/core';
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
    const inner = this.arrangeSelf(rect);

    const align = this.hAlign === 'Center' ? 'center' : this.hAlign === 'Right' ? 'right' : 'left';
    this.text.setWordWrap(Math.max(1, inner.width), align);
    const b = this.text.getBounds();

    let x = inner.x, y = inner.y;
    if (this.hAlign === 'Center') x = inner.x + (inner.width - b.width) / 2;
    else if (this.hAlign === 'Right') x = inner.x + (inner.width - b.width);
    if (this.vAlign === 'Center') y = inner.y + (inner.height - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = inner.y + (inner.height - b.height);
    this.text.setPosition(x, y);
  }
}
