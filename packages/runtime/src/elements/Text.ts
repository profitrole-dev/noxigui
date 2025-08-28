import type { Size, Rect } from '../../../core/src/index.js';
import { Text as CoreText } from '../../../core/src/index.js';
import type { Renderer, RenderText } from '../renderer.js';

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
