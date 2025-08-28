import * as PIXI from 'pixi.js';
import { UIElement } from '../core.js';
import type { Size, Rect } from '../core.js';

export class PixiImage extends UIElement {
  sprite: PIXI.Sprite;
  hAlign: 'Left'|'Center'|'Right' = 'Left';
  vAlign: 'Top'|'Center'|'Bottom' = 'Top';
  stretch: 'None'|'Fill'|'Uniform'|'UniformToFill' = 'Uniform';
  private natW = 0;
  private natH = 0;

  constructor(tex?: PIXI.Texture) {
    super();
    this.sprite = new PIXI.Sprite(tex ?? PIXI.Texture.WHITE);
    this.sprite.anchor.set(0, 0);
    this.updateNaturalSize();
  }

  private updateNaturalSize() {
    const t = this.sprite.texture;
    const w = (t as any)?.orig?.width ?? t.width ?? 0;
    const h = (t as any)?.orig?.height ?? t.height ?? 0;
    this.natW = Math.max(0, w);
    this.natH = Math.max(0, h);
  }

  setTexture(tex?: PIXI.Texture) {
    this.sprite.texture = tex ?? PIXI.Texture.WHITE;
    this.updateNaturalSize();
  }

  measure(avail: Size) {
    const natW = this.natW || 0;
    const natH = this.natH || 0;

    const fallback = 180; // default so card doesn't collapse
    const baseW = natW > 0 ? natW : fallback;
    const baseH = natH > 0 ? natH : fallback;

    // 1) explicit Width/Height take priority
    if (this.prefW !== undefined && this.prefH !== undefined) {
      this.desired = {
        width: this.prefW + this.margin.l + this.margin.r,
        height: this.prefH + this.margin.t + this.margin.b
      };
      return;
    }

    // 2) only one side specified
    if (this.prefW !== undefined && this.prefH === undefined) {
      const h = baseH * (this.prefW / baseW);
      this.desired = { width: this.prefW + this.margin.l + this.margin.r, height: h + this.margin.t + this.margin.b };
      return;
    }
    if (this.prefH !== undefined && this.prefW === undefined) {
      const w = baseW * (this.prefH / baseH);
      this.desired = { width: w + this.margin.l + this.margin.r, height: this.prefH + this.margin.t + this.margin.b };
      return;
    }

    // 3) no explicit size -> use avail (may be Infinity)
    const hasW = Number.isFinite(avail.width);
    const hasH = Number.isFinite(avail.height);

    let drawW = baseW;
    let drawH = baseH;

    if (this.stretch === 'None') {
      // already baseW/baseH
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

    drawW = Math.max(drawW, this.minW);
    drawH = Math.max(drawH, this.minH);

    this.desired = { width: drawW + this.margin.l + this.margin.r, height: drawH + this.margin.t + this.margin.b };
  }

  arrange(rect: Rect) {
    const x0 = rect.x + this.margin.l, y0 = rect.y + this.margin.t;
    const w = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const h = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: x0, y: y0, width: w, height: h };

    const sw = this.natW || 1, sh = this.natH || 1;
    let scaleX = 1, scaleY = 1, drawW = sw, drawH = sh;

    switch (this.stretch) {
      case 'None': { scaleX = scaleY = 1; drawW = sw; drawH = sh; break; }
      case 'Fill': { scaleX = w / sw; scaleY = h / sh; drawW = w; drawH = h; break; }
      case 'Uniform': { const s = Math.min(w / sw, h / sh); scaleX = scaleY = s; drawW = sw * s; drawH = sh * s; break; }
      case 'UniformToFill': { const s = Math.max(w / sw, h / sh); scaleX = scaleY = s; drawW = sw * s; drawH = sh * s; break; }
    }

    let x = x0, y = y0;
    if (this.hAlign === 'Center') x = x0 + (w - drawW) / 2;
    else if (this.hAlign === 'Right') x = x0 + (w - drawW);
    if (this.vAlign === 'Center') y = y0 + (h - drawH) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - drawH);

    this.sprite.scale.set(scaleX, scaleY);
    this.sprite.x = x;
    this.sprite.y = y;
  }
}
