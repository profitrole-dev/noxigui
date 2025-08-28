import type { Rect, Renderer, RenderImage } from '@noxigui/core';
import { Image as CoreImage } from '@noxigui/core';

export class Image extends CoreImage {
  sprite: RenderImage;

  constructor(renderer: Renderer, tex?: any) {
    super();
    this.sprite = renderer.createImage(tex);
    const size = this.sprite.getNaturalSize();
    this.setNaturalSize(size.width, size.height);
  }

  private updateNaturalSize() {
    const size = this.sprite.getNaturalSize();
    this.setNaturalSize(size.width, size.height);
  }

  setTexture(tex?: any) {
    this.sprite.setTexture(tex);
    this.updateNaturalSize();
  }

  arrange(rect: Rect) {
    super.arrange(rect);
    this.sprite.setScale(this.renderScaleX, this.renderScaleY);
    this.sprite.setPosition(this.renderX, this.renderY);
  }
}
