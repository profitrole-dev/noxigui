import { UIElement, type Size, type Rect } from '@noxigui/core';
import type { Len } from '../helpers.js';
import type { Renderer, RenderGraphics } from '../renderer.js';
import { measureGrid, arrangeGrid } from './grid/layout.js';
import { rowMap, colMap, rowSpan, colSpan } from './grid/data.js';

export class Row { actual = 0; desired = 0; constructor(public len: Len) {} }
export class Col { actual = 0; desired = 0; constructor(public len: Len) {} }

export class Grid extends UIElement {
  rows: Row[] = [];
  cols: Col[] = [];
  children: UIElement[] = [];
  rowGap = 0;
  colGap = 0;

  debug = false;
  debugG: RenderGraphics;
  debugHtml?: HTMLElement;

  constructor(renderer: Renderer) {
    super();
    this.debugG = renderer.createGraphics();
  }

  add(ch: UIElement) { this.children.push(ch); }
  static setRow(el: UIElement, i: number) { rowMap.set(el, i|0); }
  static setCol(el: UIElement, i: number) { colMap.set(el, i|0); }
  static setRowSpan(el: UIElement, n: number) { rowSpan.set(el, Math.max(1, n|0)); }
  static setColSpan(el: UIElement, n: number) { colSpan.set(el, Math.max(1, n|0)); }

  measure(avail: Size) { measureGrid(this, avail); }
  arrange(rect: Rect) { arrangeGrid(this, rect); }
}
