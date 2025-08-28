import type { Size, Rect, Renderer, RenderText } from '@noxigui/core';
import { Text as CoreText } from '@noxigui/core';

export class Text extends CoreText {
  text: RenderText;

  constructor(renderer: Renderer, content: string, style: { fill: string; fontSize: number }) {
    super(content, style);
    this.text = renderer.createText(content, style);
  }

  protected measureText(width: number, align: 'left' | 'center' | 'right'): Size {
    this.text.setWordWrap(Math.max(1, width), align);
    return this.text.getBounds();
  }

  arrange(rect: Rect) {
    super.arrange(rect);
    this.text.setPosition(this.renderX, this.renderY);
  }
}
