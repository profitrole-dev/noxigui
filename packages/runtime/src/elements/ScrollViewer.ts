import { UIElement, type Size, type Rect } from '@noxigui/core';
import { ContentPresenter } from '../core.js';
import type { Renderer, RenderContainer, RenderGraphics } from '../renderer.js';

export type ScrollBarVisibility = 'Disabled'|'Hidden'|'Auto'|'Visible';

export interface ScrollChangedArgs {
  horizontalOffset: number;
  verticalOffset: number;
  extentWidth: number;
  extentHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface IScrollInfo {
  canHorizontallyScroll: boolean;
  canVerticallyScroll: boolean;
  extentWidth: number; extentHeight: number;
  viewportWidth: number; viewportHeight: number;
  horizontalOffset: number; verticalOffset: number;
  lineUp(): void; lineDown(): void; lineLeft(): void; lineRight(): void;
  pageUp(): void; pageDown(): void; pageLeft(): void; pageRight(): void;
  setHorizontalOffset(x: number): void;
  setVerticalOffset(y: number): void;
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
  computedHorizontalScrollBarVisibility: 'Disabled'|'Hidden'|'Visible' = 'Hidden';
  computedVerticalScrollBarVisibility: 'Disabled'|'Hidden'|'Visible' = 'Hidden';
  panningMode: 'None'|'Both'|'HorizontalOnly'|'VerticalOnly' = 'None';

  // visuals
  presenter = new ContentPresenter();
  container: RenderContainer;
  private maskG: RenderGraphics | null = null;
  private renderer: Renderer;
  private scrollInfo?: IScrollInfo;

  // internal
  private presenterAttached = false;
  private arrangedOnce = false;

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

  constructor(renderer: Renderer) {
    super();
    this.renderer = renderer;
    this.container = renderer.createContainer();

    // Make the container participate in hit testing if adapter exposes methods
    this.container.setEventMode('static');

    // Mount presenter's display object into this container once
    const childDO =
      (this.presenter as any).container?.getDisplayObject?.() ??
      (this.presenter as any).getDisplayObject?.();
    if (childDO) {
      this.container.addChild(childDO);
      this.presenterAttached = true;
    }

    // Subscribe to wheel (prefer adapter's API; fallback to raw display object if needed)
    this.container.addEventListener?.('wheel', (evt: any) => this.onWheel(evt));
    this.container.getDisplayObject?.().addEventListener?.('wheel', (evt: any) => this.onWheel(evt));
  }

  setContent(ch: UIElement) {
    this.presenter.child = ch;
    const maybe = ch as any as Partial<IScrollInfo>;
    this.scrollInfo = this.canContentScroll && typeof maybe.setHorizontalOffset === 'function'
      ? (ch as any as IScrollInfo)
      : undefined;
  }
  get content() { return this.presenter.child; }

  private clampOffsets() {
    if (this.scrollInfo) {
      const si = this.scrollInfo;
      if (si.horizontalOffset < 0) si.setHorizontalOffset(0);
      if (si.verticalOffset < 0) si.setVerticalOffset(0);
      const maxH = Math.max(0, si.extentWidth - si.viewportWidth);
      const maxV = Math.max(0, si.extentHeight - si.viewportHeight);
      if (si.horizontalOffset > maxH) si.setHorizontalOffset(maxH);
      if (si.verticalOffset > maxV) si.setVerticalOffset(maxV);
      this._hx = si.horizontalOffset;
      this._vy = si.verticalOffset;
    } else {
      if (this._hx < 0) this._hx = 0;
      if (this._vy < 0) this._vy = 0;
      if (this._hx > this.scrollableWidth) this._hx = this.scrollableWidth;
      if (this._vy > this.scrollableHeight) this._vy = this.scrollableHeight;
    }
  }

  private computeVisibilities() {
    const resolve = (mode: ScrollBarVisibility, need: boolean): 'Disabled'|'Hidden'|'Visible' => {
      if (mode === 'Auto') return need ? 'Visible' : 'Hidden';
      if (mode === 'Disabled') return 'Disabled';
      return mode; // Hidden | Visible
    };
    const needH = this.extentWidth > this.viewportWidth;
    const needV = this.extentHeight > this.viewportHeight;
    this.computedHorizontalScrollBarVisibility = resolve(this.horizontalScrollBarVisibility, needH);
    this.computedVerticalScrollBarVisibility   = resolve(this.verticalScrollBarVisibility, needV);
  }

  measure(avail: Size) {
    const innerW = Math.max(0, avail.width - this.margin.l - this.margin.r);
    const innerH = Math.max(0, avail.height - this.margin.t - this.margin.b);

    const ch = this.presenter.child;
    if (ch) {
      ch.measure({ width: Infinity, height: Infinity });
      if (this.scrollInfo) {
        const si = this.scrollInfo;
        this.extentWidth = si.extentWidth;
        this.extentHeight = si.extentHeight;
      } else {
        this.extentWidth = ch.desired.width;
        this.extentHeight = ch.desired.height;
      }
      // viewport decided by available size
      this.viewportWidth = Math.min(innerW, this.extentWidth);
      this.viewportHeight = Math.min(innerH, this.extentHeight);
    } else {
      this.extentWidth = this.extentHeight = 0;
      this.viewportWidth = Math.min(innerW, 0);
      this.viewportHeight = Math.min(innerH, 0);
    }

    // visibilities (two-pass, bars occupy 0 for now)
    this.computeVisibilities();
    const hBar = this.computedHorizontalScrollBarVisibility === 'Visible' ? 0 : 0;
    const vBar = this.computedVerticalScrollBarVisibility   === 'Visible' ? 0 : 0;

    this.viewportWidth  = Math.min(Math.max(0, innerW - vBar), this.extentWidth);
    this.viewportHeight = Math.min(Math.max(0, innerH - hBar), this.extentHeight);

    this.computeVisibilities();

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

    // viewport = arranged size
    this.viewportWidth = inner.width;
    this.viewportHeight = inner.height;

    this.scrollableWidth = Math.max(0, this.extentWidth - this.viewportWidth);
    this.scrollableHeight = Math.max(0, this.extentHeight - this.viewportHeight);
    this.clampOffsets();

    // ensure visuals are in our container
    if (!this.presenterAttached) {
      const childDO =
        (this.presenter as any).container?.getDisplayObject?.() ??
        (this.presenter as any).getDisplayObject?.();
      if (childDO) {
        this.container.addChild(childDO);
        this.presenterAttached = true;
      }
    }

    // position, hitArea, mask
    this.container.setPosition(inner.x, inner.y);
    (this.container as any).setHitArea?.(0, 0, this.viewportWidth, this.viewportHeight);

    if (!this.maskG) {
      this.maskG = this.renderer.createGraphics();
      this.container.addChild(this.maskG.getDisplayObject());
      this.container.setMask(this.maskG.getDisplayObject());
    }
    this.maskG.clear();
    this.maskG.beginFill(0xffffff).drawRect(0, 0, this.viewportWidth, this.viewportHeight).endFill();

    // translate content by offsets
    this.presenter.arrange({
      x: -this._hx,
      y: -this._vy,
      width: this.extentWidth,
      height: this.extentHeight,
    });

    this.arrangedOnce = true;

    // raise ScrollChanged if something updated
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

  // immediate re-apply of the scroll transform (no global layout req.)
  private applyScrollTransformNow() {
    if (!this.arrangedOnce) return;
    this.presenter.arrange({
      x: -this._hx,
      y: -this._vy,
      width: this.extentWidth,
      height: this.extentHeight,
    });
  }

  // scrolling APIs
  ScrollToHorizontalOffset(v: number) {
    if (this.scrollInfo) this.scrollInfo.setHorizontalOffset(v);
    else this._hx = v;
    this.clampOffsets();
    // this.invalidateArrange?.();
    this.applyScrollTransformNow();
  }
  ScrollToVerticalOffset(v: number) {
    if (this.scrollInfo) this.scrollInfo.setVerticalOffset(v);
    else this._vy = v;
    this.clampOffsets();
    // this.invalidateArrange?.();
    this.applyScrollTransformNow();
  }
  LineUp()    { if (this.scrollInfo) this.scrollInfo.lineUp();    else this.ScrollToVerticalOffset(this._vy - 16); }
  LineDown()  { if (this.scrollInfo) this.scrollInfo.lineDown();  else this.ScrollToVerticalOffset(this._vy + 16); }
  LineLeft()  { if (this.scrollInfo) this.scrollInfo.lineLeft();  else this.ScrollToHorizontalOffset(this._hx - 16); }
  LineRight() { if (this.scrollInfo) this.scrollInfo.lineRight(); else this.ScrollToHorizontalOffset(this._hx + 16); }
  PageUp()    { if (this.scrollInfo) this.scrollInfo.pageUp();    else this.ScrollToVerticalOffset(this._vy - this.viewportHeight); }
  PageDown()  { if (this.scrollInfo) this.scrollInfo.pageDown();  else this.ScrollToVerticalOffset(this._vy + this.viewportHeight); }
  PageLeft()  { if (this.scrollInfo) this.scrollInfo.pageLeft();  else this.ScrollToHorizontalOffset(this._hx - this.viewportWidth); }
  PageRight() { if (this.scrollInfo) this.scrollInfo.pageRight(); else this.ScrollToHorizontalOffset(this._hx + this.viewportWidth); }
  MouseWheelUp()   { this.ScrollToVerticalOffset(this._vy - 48); }
  MouseWheelDown() { this.ScrollToVerticalOffset(this._vy + 48); }

  // Pixi v7 FederatedWheelEvent compatible
  onWheel(evt: { deltaX?: number; deltaY: number; deltaMode?: number; shiftKey?: boolean }) {
    // normalize: 0=pixel, 1=line(~16px), 2=page(viewport)
    const unit = evt.deltaMode === 1 ? 16 : evt.deltaMode === 2 ? this.viewportHeight : 1;
    const dx = (evt.deltaX ?? 0) * unit;
    const dy = (evt.deltaY ?? 0) * unit;

    if (evt.shiftKey) this.ScrollToHorizontalOffset(this._hx + (dy || dx));
    else this.ScrollToVerticalOffset(this._vy + dy);
  }

  onKeyDown(key: string) {
    switch (key) {
      case 'ArrowUp': this.LineUp(); break;
      case 'ArrowDown': this.LineDown(); break;
      case 'ArrowLeft': this.LineLeft(); break;
      case 'ArrowRight': this.LineRight(); break;
      case 'PageUp': this.PageUp(); break;
      case 'PageDown': this.PageDown(); break;
      case 'Home': this.ScrollToVerticalOffset(0); break;
      case 'End': this.ScrollToVerticalOffset(this.scrollableHeight); break;
    }
  }

  ChangeView(h?: number|null, v?: number|null, _zoom?: number|null, _disableAnimation = false): boolean {
    if (h != null) {
      if (this.scrollInfo) this.scrollInfo.setHorizontalOffset(h);
      else this._hx = h;
    }
    if (v != null) {
      if (this.scrollInfo) this.scrollInfo.setVerticalOffset(v);
      else this._vy = v;
    }
    this.clampOffsets();
    // this.invalidateArrange?.();
    this.applyScrollTransformNow();
    return true;
  }
}
