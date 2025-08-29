import { UIElement, type Size, type Rect } from '@noxigui/core';
import type { Renderer, RenderContainer, RenderGraphics } from '../renderer.js';

export class ScrollViewer extends UIElement {
  container: RenderContainer;
  mask: RenderGraphics;
  child?: UIElement;
  horizontalOffset = 0;
  verticalOffset = 0;
  extentWidth = 0;
  extentHeight = 0;
  viewportWidth = 0;
  viewportHeight = 0;

  constructor(renderer: Renderer, child?: UIElement) {
    super();
    this.container = renderer.createContainer();
    this.mask = renderer.createGraphics();
    this.container.addChild(this.mask.getDisplayObject());
    this.container.setMask(this.mask.getDisplayObject());
    this.child = child;
  }

  private clampOffsets() {
    const maxX = Math.max(0, this.extentWidth - this.viewportWidth);
    const maxY = Math.max(0, this.extentHeight - this.viewportHeight);
    if (this.horizontalOffset < 0) this.horizontalOffset = 0;
    else if (this.horizontalOffset > maxX) this.horizontalOffset = maxX;
    if (this.verticalOffset < 0) this.verticalOffset = 0;
    else if (this.verticalOffset > maxY) this.verticalOffset = maxY;
  }

  private updateChild() {
    if (!this.child) return;
    this.clampOffsets();
    this.child.arrange({
      x: -this.horizontalOffset,
      y: -this.verticalOffset,
      width: this.extentWidth,
      height: this.extentHeight,
    });
  }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);
    let cw = 0, ch = 0;
    if (this.child) {
      this.child.measure({ width: Infinity, height: Infinity });
      cw = this.child.desired.width;
      ch = this.child.desired.height;
    }
    this.extentWidth = cw;
    this.extentHeight = ch;
    const vw = Number.isFinite(innerW) ? Math.min(innerW, cw) : cw;
    const vh = Number.isFinite(innerH) ? Math.min(innerH, ch) : ch;
    this.viewportWidth = vw;
    this.viewportHeight = vh;
    const intrinsicW = vw + this.margin.l + this.margin.r;
    const intrinsicH = vh + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const inner = this.arrangeSelf(rect);
    this.viewportWidth = inner.width;
    this.viewportHeight = inner.height;
    this.container.setPosition(inner.x, inner.y);
    this.mask.clear();
    this.mask.beginFill(0xffffff).drawRect(0, 0, inner.width, inner.height).endFill();
    this.updateChild();
  }

  scrollToHorizontalOffset(x: number) {
    this.horizontalOffset = x;
    this.updateChild();
  }

  scrollToVerticalOffset(y: number) {
    this.verticalOffset = y;
    this.updateChild();
  }
}

