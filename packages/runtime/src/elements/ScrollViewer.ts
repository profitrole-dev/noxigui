import { UIElement, type Size, type Rect } from '@noxigui/core';
import { ContentPresenter } from '../core.js';

export type ScrollBarVisibility = 'Disabled'|'Hidden'|'Auto'|'Visible';
export interface ScrollChangedArgs {
  horizontalOffset: number;
  verticalOffset: number;
  extentWidth: number;
  extentHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export class ScrollViewer extends UIElement {
  // sizes
  extentWidth = 0; extentHeight = 0;
  viewportWidth = 0; viewportHeight = 0;
  scrollableWidth = 0; scrollableHeight = 0;

  // offsets
  private _hx = 0; private _vy = 0;
  get horizontalOffset() { return this._hx; }
  get verticalOffset() { return this._vy; }

  // flags
  canContentScroll = false;
  horizontalScrollBarVisibility: ScrollBarVisibility = 'Auto';
  verticalScrollBarVisibility: ScrollBarVisibility = 'Auto';

  // content
  private presenter = new ContentPresenter();

  // events
  readonly scrollChanged = new Set<(e: ScrollChangedArgs) => void>();
  private lastArgs: ScrollChangedArgs = {
    horizontalOffset: -1,
    verticalOffset: -1,
    extentWidth: -1,
    extentHeight: -1,
    viewportWidth: -1,
    viewportHeight: -1,
  };

  setContent(ch: UIElement) { this.presenter.child = ch; }
  get content() { return this.presenter.child; }

  private clampOffsets() {
    if (this._hx < 0) this._hx = 0;
    if (this._vy < 0) this._vy = 0;
    if (this._hx > this.scrollableWidth) this._hx = this.scrollableWidth;
    if (this._vy > this.scrollableHeight) this._vy = this.scrollableHeight;
  }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);

    const ch = this.presenter.child;
    if (ch) {
      ch.measure({ width: Infinity, height: Infinity });
      this.extentWidth = ch.desired.width;
      this.extentHeight = ch.desired.height;
    } else {
      this.extentWidth = this.extentHeight = 0;
    }

    this.viewportWidth = Math.min(innerW, this.extentWidth);
    this.viewportHeight = Math.min(innerH, this.extentHeight);
    this.scrollableWidth = Math.max(0, this.extentWidth - this.viewportWidth);
    this.scrollableHeight = Math.max(0, this.extentHeight - this.viewportHeight);

    const intrinsicW = this.viewportWidth + this.margin.l + this.margin.r;
    const intrinsicH = this.viewportHeight + this.margin.t + this.margin.b;
    this.desired = {
      width: this.measureAxis('x', avail.width, intrinsicW),
      height: this.measureAxis('y', avail.height, intrinsicH),
    };
  }

  arrange(rect: Rect) {
    const inner = this.arrangeSelf(rect);
    this.viewportWidth = inner.width;
    this.viewportHeight = inner.height;
    this.scrollableWidth = Math.max(0, this.extentWidth - this.viewportWidth);
    this.scrollableHeight = Math.max(0, this.extentHeight - this.viewportHeight);
    this.clampOffsets();
    this.presenter.arrange({
      x: inner.x - this._hx,
      y: inner.y - this._vy,
      width: this.extentWidth,
      height: this.extentHeight,
    });

    const args: ScrollChangedArgs = {
      horizontalOffset: this._hx,
      verticalOffset: this._vy,
      extentWidth: this.extentWidth,
      extentHeight: this.extentHeight,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };
    const last = this.lastArgs;
    const changed =
      args.horizontalOffset !== last.horizontalOffset ||
      args.verticalOffset !== last.verticalOffset ||
      args.extentWidth !== last.extentWidth ||
      args.extentHeight !== last.extentHeight ||
      args.viewportWidth !== last.viewportWidth ||
      args.viewportHeight !== last.viewportHeight;
    if (changed) {
      this.lastArgs = { ...args };
      for (const fn of this.scrollChanged) fn(args);
    }
  }

  // scrolling APIs
  ScrollToHorizontalOffset(v: number) { this._hx = v; this.clampOffsets(); }
  ScrollToVerticalOffset(v: number) { this._vy = v; this.clampOffsets(); }
  LineUp() { this.ScrollToVerticalOffset(this._vy - 16); }
  LineDown() { this.ScrollToVerticalOffset(this._vy + 16); }
  LineLeft() { this.ScrollToHorizontalOffset(this._hx - 16); }
  LineRight() { this.ScrollToHorizontalOffset(this._hx + 16); }
  PageUp() { this.ScrollToVerticalOffset(this._vy - this.viewportHeight); }
  PageDown() { this.ScrollToVerticalOffset(this._vy + this.viewportHeight); }
  PageLeft() { this.ScrollToHorizontalOffset(this._hx - this.viewportWidth); }
  PageRight() { this.ScrollToHorizontalOffset(this._hx + this.viewportWidth); }
  MouseWheelUp() { this.ScrollToVerticalOffset(this._vy - 48); }
  MouseWheelDown() { this.ScrollToVerticalOffset(this._vy + 48); }

  ChangeView(h?: number|null, v?: number|null, _zoom?: number|null, _disableAnimation = false): boolean {
    if (h != null) this._hx = h;
    if (v != null) this._vy = v;
    this.clampOffsets();
    return true;
  }
}

