import { UIElement, type Size, type Rect } from '@noxigui/core';

export type Dock = 'Left' | 'Top' | 'Right' | 'Bottom';
const dockMap = new WeakMap<UIElement, Dock>();

export class DockPanel extends UIElement {
  children: UIElement[] = [];
  lastChildFill = true;

  add(ch: UIElement) { this.children.push(ch); }
  static setDock(el: UIElement, d: Dock) { dockMap.set(el, d); }
  static getDock(el: UIElement): Dock { return dockMap.get(el) || 'Left'; }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);
    let lrW = 0, tbH = 0, maxW = 0, maxH = 0, lastW = 0, lastH = 0;
    const count = this.children.length;
    for (let i = 0; i < count; i++) {
      const ch = this.children[i];
      const dock = DockPanel.getDock(ch);
      const availW = Math.max(0, innerW - lrW);
      const availH = Math.max(0, innerH - tbH);
      ch.measure({ width: availW, height: availH });
      const isLastFill = this.lastChildFill && i === count - 1;
      if (isLastFill) {
        lastW = ch.desired.width;
        lastH = ch.desired.height;
      } else if (dock === 'Left' || dock === 'Right') {
        lrW += ch.desired.width;
        if (ch.desired.height > maxH) maxH = ch.desired.height;
      } else {
        tbH += ch.desired.height;
        if (ch.desired.width > maxW) maxW = ch.desired.width;
      }
    }
    const intrinsicW = lrW + Math.max(maxW, lastW) + this.margin.l + this.margin.r;
    const intrinsicH = tbH + Math.max(maxH, lastH) + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const inner = this.arrangeSelf(rect);
    let x = inner.x, y = inner.y;
    let w = inner.width, h = inner.height;
    const count = this.children.length;
    for (let i = 0; i < count; i++) {
      const ch = this.children[i];
      const dock = DockPanel.getDock(ch);
      const isLastFill = this.lastChildFill && i === count - 1;
      if (isLastFill) {
        ch.arrange({ x, y, width: w, height: h });
        break;
      }
      const cw = ch.desired.width;
      const chh = ch.desired.height;
      if (dock === 'Left') {
        ch.arrange({ x, y, width: cw, height: h });
        x += cw;
        w = Math.max(0, w - cw);
      } else if (dock === 'Right') {
        ch.arrange({ x: x + w - cw, y, width: cw, height: h });
        w = Math.max(0, w - cw);
      } else if (dock === 'Top') {
        ch.arrange({ x, y, width: w, height: chh });
        y += chh;
        h = Math.max(0, h - chh);
      } else { // Bottom
        ch.arrange({ x, y: y + h - chh, width: w, height: chh });
        h = Math.max(0, h - chh);
      }
    }
  }
}

