import { UIElement, type Size, type Rect } from '@noxigui/core';
import type { Renderer, RenderText } from '../renderer.js';

export class Text extends UIElement {
  /** Underlying render object. */
  render: RenderText;
  private _text = '';
  hAlign: 'Left' | 'Center' | 'Right' = 'Left';
  vAlign: 'Top' | 'Center' | 'Bottom' = 'Top';

  constructor(renderer: Renderer, content: string, style: { fill: string; fontSize: number }) {
    super();
    this.render = renderer.createText(content, style);
    this._text = content;
  }

  get text() {
    return this._text;
  }
  set text(v: string) {
    this._text = v ?? '';
    // Update underlying render text implementation
    (this.render as any).text.text = this._text;
    this.invalidateArrange();
  }

  /** Alias to support bindings with capitalized attribute. */
  get Text() { return this.text; }
  set Text(v: string) { this.text = v; }

  measure(avail: Size) {
    this.render.setWordWrap(Math.max(1, avail.width), 'left');
    const b = this.render.getBounds();
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
    this.render.setWordWrap(Math.max(1, inner.width), align);
    const b = this.render.getBounds();

    let x = inner.x, y = inner.y;
    if (this.hAlign === 'Center') x = inner.x + (inner.width - b.width) / 2;
    else if (this.hAlign === 'Right') x = inner.x + (inner.width - b.width);
    if (this.vAlign === 'Center') y = inner.y + (inner.height - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = inner.y + (inner.height - b.height);
    this.render.setPosition(x, y);
  }
}
