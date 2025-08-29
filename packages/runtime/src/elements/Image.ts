import { UIElement, type Size, type Rect } from '@noxigui/core';
import type { Renderer, RenderImage } from '../renderer.js';

export class Image extends UIElement {
  sprite: RenderImage;
  hAlign: 'Left'|'Center'|'Right' = 'Left';
  vAlign: 'Top'|'Center'|'Bottom' = 'Top';
  stretch: 'None'|'Fill'|'Uniform'|'UniformToFill' = 'Uniform';
  private natW = 0;
  private natH = 0;

  constructor(renderer: Renderer, tex?: unknown) {
    super();
    this.sprite = renderer.createImage(tex);
    this.updateNaturalSize();
  }

  private updateNaturalSize() {
    const size = this.sprite.getNaturalSize();
    this.natW = Math.max(0, size.width);
    this.natH = Math.max(0, size.height);
  }

  setTexture(tex?: unknown) {
    this.sprite.setTexture(tex);
    this.updateNaturalSize();
  }

  measure(avail: Size) {
    const natW = this.natW || 0;
    const natH = this.natH || 0;

    const fallback = 180; // default so card doesn't collapse
    const baseW = natW > 0 ? natW : fallback;
    const baseH = natH > 0 ? natH : fallback;

    if (this.prefW !== undefined && this.prefH !== undefined) {
      const intrinsicW = this.prefW + this.margin.l + this.margin.r;
      const intrinsicH = this.prefH + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH)
      };
      return;
    }

    if (this.prefW !== undefined && this.prefH === undefined) {
      const h = baseH * (this.prefW / baseW);
      const intrinsicW = this.prefW + this.margin.l + this.margin.r;
      const intrinsicH = h + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH)
      };
      return;
    }
    if (this.prefH !== undefined && this.prefW === undefined) {
      const w = baseW * (this.prefH / baseH);
      const intrinsicW = w + this.margin.l + this.margin.r;
      const intrinsicH = this.prefH + this.margin.t + this.margin.b;
      this.desired = {
        width: this.measureAxis('x', avail.width, intrinsicW),
        height: this.measureAxis('y', avail.height, intrinsicH)
      };
      return;
    }

    const hasW = Number.isFinite(avail.width);
    const hasH = Number.isFinite(avail.height);

    let drawW = baseW;
    let drawH = baseH;

    if (this.stretch === 'None') {
    } else if (this.stretch === 'Fill') {
      drawW = hasW ? Math.min(avail.width, baseW) : baseW;
      drawH = hasH ? Math.min(avail.height, baseH) : baseH;
    } else if (this.stretch === 'Uniform') {
      if (hasW && hasH) {
        const s = Math.min(avail.width / baseW, avail.height / baseH, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else if (hasW && !hasH) {
        const s = Math.min(avail.width / baseW, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else if (!hasW && hasH) {
        const s = Math.min(avail.height / baseH, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else {
        drawW = baseW; drawH = baseH;
      }
    } else if (this.stretch === 'UniformToFill') {
      if (hasW && hasH) {
        const s = Math.min(Math.max(avail.width / baseW, avail.height / baseH), 1);
        drawW = baseW * s; drawH = baseH * s;
      } else if (hasW && !hasH) {
        const s = Math.min(avail.width / baseW, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else if (!hasW && hasH) {
        const s = Math.min(avail.height / baseH, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else {
        drawW = baseW; drawH = baseH;
      }
    }

    const intrinsicW = drawW + this.margin.l + this.margin.r;
    const intrinsicH = drawH + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH)
    };
  }

  arrange(rect: Rect) {
    const inner = this.arrangeSelf(rect);
    const w = inner.width, h = inner.height;

    const sw = this.natW || 1, sh = this.natH || 1;
    let scaleX = 1, scaleY = 1, drawW = sw, drawH = sh;

    switch (this.stretch) {
      case 'None': { scaleX = scaleY = 1; drawW = sw; drawH = sh; break; }
      case 'Fill': { scaleX = w / sw; scaleY = h / sh; drawW = w; drawH = h; break; }
      case 'Uniform': { const s = Math.min(w / sw, h / sh); scaleX = scaleY = s; drawW = sw * s; drawH = sh * s; break; }
      case 'UniformToFill': { const s = Math.max(w / sw, h / sh); scaleX = scaleY = s; drawW = sw * s; drawH = sh * s; break; }
    }

    let x = inner.x, y = inner.y;
    if (this.hAlign === 'Center') x = inner.x + (inner.width - drawW) / 2;
    else if (this.hAlign === 'Right') x = inner.x + (inner.width - drawW);
    if (this.vAlign === 'Center') y = inner.y + (inner.height - drawH) / 2;
    else if (this.vAlign === 'Bottom') y = inner.y + (inner.height - drawH);

    this.sprite.setScale(scaleX, scaleY);
    this.sprite.setPosition(x, y);
  }
}
