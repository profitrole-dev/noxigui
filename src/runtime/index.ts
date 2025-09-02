// runtime.ts
import * as PIXI from 'pixi.js';

// ===== Template registry (простой прототип) =====
const TemplateRegistry = new Map<string, Element>();

function registerTemplate(node: Element) {
  const key = node.getAttribute('Key') || node.getAttribute('x:Key');
  if (!key) throw new Error('<Template> needs Key');
  const root = Array.from(node.children).find(ch => ch.nodeType === 1) as Element | undefined;
  if (!root) throw new Error('<Template> must have a single root element');
  TemplateRegistry.set(key, root.cloneNode(true) as Element);
}

function subst(value: string, props: Record<string, string>): string {
  return value.replace(/\{([\w.-]+)\}/g, (_, name) => props[name] ?? '');
}

function instantiateTemplate(key: string, props: Record<string, string>, slotNodes: Map<string, Element[]>): Element {
  const tplRoot = TemplateRegistry.get(key);
  if (!tplRoot) throw new Error(`Template not found: ${key}`);
  const clone = tplRoot.cloneNode(true) as Element;

  // подстановка плейсхолдеров
  const walkAttrs = (el: Element) => {
    for (const attr of Array.from(el.attributes)) attr.value = subst(attr.value, props);
    for (const ch of Array.from(el.children)) walkAttrs(ch);
  };
  walkAttrs(clone);

  // заполнение слотов
  const fillSlots = (el: Element) => {
    if (el.tagName === 'ContentPresenter') {
      const name = el.getAttribute('Slot') ?? '';
      const provided = slotNodes.get(name);
      if (provided && provided.length) {
        const parent = el.parentElement!;
        for (const node of provided) parent.insertBefore(node.cloneNode(true), el);
        parent.removeChild(el);
        return;
      }
    }
    for (const ch of Array.from(el.children)) fillSlots(ch);
  };
  fillSlots(clone);

  return clone;
}

// ===== Виртуальное ядро =====
type Size = { width: number; height: number };
type Rect = { x: number; y: number; width: number; height: number };

abstract class UIElement {
  desired = { width: 0, height: 0 };
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };
  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0; minH = 0;        // MinWidth/MinHeight
  prefW?: number; prefH?: number; // Width/Height (желательный размер)

  abstract measure(avail: Size): void;
  abstract arrange(rect: Rect): void;
}

class ContentPresenter extends UIElement {
  child?: UIElement;
  measure(avail: Size) {
    if (this.child) {
      this.child.measure(avail);
      this.desired = {
        width:  this.child.desired.width + this.margin.l + this.margin.r,
        height: this.child.desired.height + this.margin.t + this.margin.b,
      };
    } else {
      this.desired = { width: this.margin.l + this.margin.r, height: this.margin.t + this.margin.b };
    }
  }
  arrange(rect: Rect) {
    const x = rect.x + this.margin.l, y = rect.y + this.margin.t;
    const w = Math.max(0, rect.width - this.margin.l - this.margin.r);
    const h = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x, y, width: w, height: h };
    if (this.child) this.child.arrange({ x, y, width: w, height: h });
  }
}

// ===== Элементы =====
class BorderPanel extends UIElement {
  bg = new PIXI.Graphics();
  container = new PIXI.Container();
  child?: UIElement;
  background?: number;
  clipToBounds = false;
  private maskG: PIXI.Graphics | null = null;
  padding = { l: 0, t: 0, r: 0, b: 0 };

  constructor(opts?: { background?: number; child?: UIElement }) {
    super();
    this.background = opts?.background;
    this.child = opts?.child;
  }

  measure(avail: Size) {
    const inner = {
      width:  Math.max(0, avail.width  - this.margin.l - this.margin.r - this.padding.l - this.padding.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b - this.padding.t - this.padding.b),
    };
    if (this.child) {
      this.child.measure(inner);
      this.desired = {
        width:  this.child.desired.width  + this.margin.l + this.margin.r + this.padding.l + this.padding.r,
        height: this.child.desired.height + this.margin.t + this.margin.b + this.padding.t + this.padding.b,
      };
    } else {
      this.desired = {
        width:  this.margin.l + this.margin.r + this.padding.l + this.padding.r,
        height: this.margin.t + this.margin.b + this.padding.t + this.padding.b,
      };
    }

    // после вычисления this.desired = {...}
    this.desired.width  = Math.max(this.desired.width,  this.minW + this.margin.l + this.margin.r);
    this.desired.height = Math.max(this.desired.height, this.minH + this.margin.t + this.margin.b);
    if (this.prefW !== undefined)
      this.desired.width  = Math.max(this.desired.width,  this.prefW + this.margin.l + this.margin.r);
    if (this.prefH !== undefined)
      this.desired.height = Math.max(this.desired.height, this.prefH + this.margin.t + this.margin.b);
  }

  arrange(rect: Rect) {
    const innerX = rect.x + this.margin.l;
    const innerY = rect.y + this.margin.t;
    const innerW = Math.max(0, rect.width  - this.margin.l - this.margin.r);
    const innerH = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: innerX, y: innerY, width: innerW, height: innerH };

    this.container.position.set(innerX, innerY);
    this.container.sortableChildren = true;

    this.bg.clear();
    if (this.background !== undefined) {
      this.bg.beginFill(this.background).drawRect(0, 0, innerW, innerH).endFill();
    }

    if (this.clipToBounds) {
      if (!this.maskG) {
        this.maskG = new PIXI.Graphics();
        this.container.addChild(this.maskG);
        this.container.mask = this.maskG;
      }
      this.maskG.clear();
      this.maskG.beginFill(0xffffff).drawRect(0, 0, innerW, innerH).endFill();
    } else if (this.maskG) {
      this.container.mask = null;
      this.container.removeChild(this.maskG);
      this.maskG.destroy(); this.maskG = null;
    }

    if (this.child) {
      const cx = this.padding.l;
      const cy = this.padding.t;
      const cw = Math.max(0, innerW - this.padding.l - this.padding.r);
      const ch = Math.max(0, innerH - this.padding.t - this.padding.b);
      this.child.arrange({ x: cx, y: cy, width: cw, height: ch });
    }
  }
}

class PixiImage extends UIElement {
  public sprite: PIXI.Sprite;
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
    const w = (t as any)?.orig?.width  ?? t.width  ?? 0;
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

    const fallback = 180; // дефолт, чтобы карточка не схлопывалась
    const baseW = natW > 0 ? natW : fallback;
    const baseH = natH > 0 ? natH : fallback;

    // 1) Если явно задали Width/Height — это приоритет
    if (this.prefW !== undefined && this.prefH !== undefined) {
      this.desired = {
        width:  this.prefW + this.margin.l + this.margin.r,
        height: this.prefH + this.margin.t + this.margin.b
      };
      return;
    }

    // 2) Если задана только одна сторона — сохраняем аспект
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

    // 3) Нет явных размеров → считаем от avail (могут быть Infinity)
    const hasW = Number.isFinite(avail.width);
    const hasH = Number.isFinite(avail.height);

    let drawW = baseW;
    let drawH = baseH;

    if (this.stretch === 'None') {
      // уже есть baseW/baseH
    } else if (this.stretch === 'Fill') {
      drawW = hasW ? Math.min(avail.width, baseW) : baseW;
      drawH = hasH ? Math.min(avail.height, baseH) : baseH;
    } else if (this.stretch === 'Uniform') {
      if (hasW && hasH) {
        const s = Math.min(avail.width / baseW, avail.height / baseH, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else if (hasW && !hasH) {
        const s = Math.min(avail.width / baseW, 1);
        drawW = baseW * s; drawH = baseH * s;      // КЛЮЧ: линковка от ширины
      } else if (!hasW && hasH) {
        const s = Math.min(avail.height / baseH, 1);
        drawW = baseW * s; drawH = baseH * s;
      } else {
        // бесконечная область → дефолт
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

    // учесть min-ограничения
    drawW = Math.max(drawW, this.minW);
    drawH = Math.max(drawH, this.minH);

    this.desired = { width: drawW + this.margin.l + this.margin.r, height: drawH + this.margin.t + this.margin.b };
  }

  arrange(rect: Rect) {
    const x0 = rect.x + this.margin.l, y0 = rect.y + this.margin.t;
    const w  = Math.max(0, rect.width  - this.margin.l - this.margin.r);
    const h  = Math.max(0, rect.height - this.margin.t - this.margin.b);
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
    if (this.hAlign === 'Center')      x = x0 + (w - drawW) / 2;
    else if (this.hAlign === 'Right')  x = x0 + (w - drawW);
    if (this.vAlign === 'Center')      y = y0 + (h - drawH) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - drawH);

    this.sprite.scale.set(scaleX, scaleY);
    this.sprite.x = x;
    this.sprite.y = y;
  }
}

class PixiText extends UIElement {
  public view: PIXI.Text;
  hAlign: 'Left'|'Center'|'Right' = 'Left';
  vAlign: 'Top'|'Center'|'Bottom' = 'Top';

  constructor(view: PIXI.Text) { super(); this.view = view; }

  measure(avail: Size) {
    const style: any = this.view.style;
    if (style) {
      style.wordWrap = true;
      style.wordWrapWidth = Math.max(1, avail.width);
      style.breakWords = true;
      style.align = 'left';
    }
    // @ts-ignore
    this.view.updateText?.();
    const b = this.view.getLocalBounds?.() ?? { width: (this.view as any).width ?? 0, height: (this.view as any).height ?? 0 };
    const w = Number.isFinite(b.width) && b.width > 0 ? b.width : (Number(style?.fontSize) || 16) * (this.view.text?.toString().length || 1) * 0.6;
    const h = Number.isFinite(b.height) && b.height > 0 ? b.height : (Number(style?.lineHeight) || Number(style?.fontSize) || 16);
    this.desired = { width: w + this.margin.l + this.margin.r, height: h + this.margin.t + this.margin.b };

    this.desired.width  = Math.max(this.desired.width,  this.minW + this.margin.l + this.margin.r);
    this.desired.height = Math.max(this.desired.height, this.minH + this.margin.t + this.margin.b);
    if (this.prefW !== undefined)
      this.desired.width  = Math.max(this.desired.width,  this.prefW + this.margin.l + this.margin.r);
    if (this.prefH !== undefined)
      this.desired.height = Math.max(this.desired.height, this.prefH + this.margin.t + this.margin.b);
  }

  arrange(rect: Rect) {
    const x0 = rect.x + this.margin.l, y0 = rect.y + this.margin.t;
    const w  = Math.max(0, rect.width  - this.margin.l - this.margin.r);
    const h  = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: x0, y: y0, width: w, height: h };

    const style: any = this.view.style;
    if (style) {
      style.wordWrap = true;
      style.wordWrapWidth = Math.max(1, w);
      style.breakWords = true;
      style.align = this.hAlign === 'Center' ? 'center' : this.hAlign === 'Right' ? 'right' : 'left';
    }
    // @ts-ignore
    this.view.updateText?.();
    const b = this.view.getLocalBounds();

    let x = x0, y = y0;
    if (this.hAlign === 'Center')      x = x0 + (w - b.width) / 2;
    else if (this.hAlign === 'Right')  x = x0 + (w - b.width);
    if (this.vAlign === 'Center')      y = y0 + (h - b.height) / 2;
    else if (this.vAlign === 'Bottom') y = y0 + (h - b.height);
    this.view.x = x; this.view.y = y;
  }
}

// ===== Grid =====
type Len = { kind: 'auto'|'px'|'star'; v: number };
const Auto = ():Len => ({kind:'auto', v:0});
const Px   = (n:number):Len => ({kind:'px', v:n});
const Star = (n=1):Len => ({kind:'star', v:n});

class Row {
  actual = 0;
  desired = 0;
  len: Len;
  constructor(len: Len) {
    this.len = len;
  }
}
class Col {
  actual = 0;
  desired = 0;
  len: Len;
  constructor(len: Len) {
    this.len = len;
  }
}

const rowMap = new WeakMap<UIElement, number>();
const colMap = new WeakMap<UIElement, number>();
const rowSpan = new WeakMap<UIElement, number>();
const colSpan = new WeakMap<UIElement, number>();

export class Grid extends UIElement {
  rows: Row[] = [];
  cols: Col[] = [];
  children: UIElement[] = [];
  rowGap = 0;
  colGap = 0;

  // debug overlay
  debug = false;
  debugG = new PIXI.Graphics();

  add(ch: UIElement){ this.children.push(ch); }
  static setRow(el: UIElement, i:number){ rowMap.set(el, i|0); }
  static setCol(el: UIElement, i:number){ colMap.set(el, i|0); }
  static setRowSpan(el:UIElement,n:number){ rowSpan.set(el, Math.max(1, n|0)); }
  static setColSpan(el:UIElement,n:number){ colSpan.set(el, Math.max(1, n|0)); }

  measure(avail: Size) {
    if (this.rows.length === 0) this.rows.push(new Row(Star(1)));
    if (this.cols.length === 0) this.cols.push(new Col(Star(1)));

    const innerAvail = {
      width:  Math.max(0, avail.width  - this.margin.l - this.margin.r),
      height: Math.max(0, avail.height - this.margin.t - this.margin.b),
    };

    // NEW: проверяем, конечна ли доступная сторона
    const finiteW = Number.isFinite(innerAvail.width);
    const finiteH = Number.isFinite(innerAvail.height);

    const rowCount = this.rows.length;
    const colCount = this.cols.length;

    // 1) сброс
    this.rows.forEach(r => { r.actual = r.len.kind === 'px' ? r.len.v : 0; r.desired = 0; });
    this.cols.forEach(c => { c.actual = c.len.kind === 'px' ? c.len.v : 0; c.desired = 0; });

    // 2) агрегаты
    const totalRowGaps = Math.max(0, rowCount - 1) * this.rowGap;
    const totalColGaps = Math.max(0, colCount - 1) * this.colGap;

    const pixelHAll = this.rows.filter(r => r.len.kind === 'px').reduce((s, r) => s + r.len.v, 0);
    const pixelWAll = this.cols.filter(c => c.len.kind === 'px').reduce((s, c) => s + c.len.v, 0);

    // NEW: при бесконечной стороне не считаем звёзды как лимитатор на Measure
    const starHAll = finiteH ? this.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0) : 0;
    const starWAll = finiteW ? this.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0) : 0;

    const remH0 = finiteH ? Math.max(0, innerAvail.height - pixelHAll - totalRowGaps) : 0; // NEW
    const remW0 = finiteW ? Math.max(0, innerAvail.width  - pixelWAll - totalColGaps) : 0; // NEW

    const sumPixelCols = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const c = this.cols[start + i]; if (c && c.len.kind === 'px') s += c.len.v; } return s;
    };
    const sumPixelRows = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const r = this.rows[start + i]; if (r && r.len.kind === 'px') s += r.len.v; } return s;
    };
    const sumStarCols = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const c = this.cols[start + i]; if (c && c.len.kind === 'star') s += c.len.v; } return s;
    };
    const sumStarRows = (start: number, span: number) => {
      let s = 0; for (let i = 0; i < span; i++) { const r = this.rows[start + i]; if (r && r.len.kind === 'star') s += r.len.v; } return s;
    };

    // 3) measure детей
    for (const ch of this.children) {
      let r = (rowMap.get(ch) ?? 0) | 0;
      let c = (colMap.get(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), rowCount - 1);
      c = Math.min(Math.max(0, c), colCount - 1);

      let rs = (rowSpan.get(ch) ?? 1) | 0;
      let cs = (colSpan.get(ch) ?? 1) | 0;
      rs = Math.min(Math.max(1, rs), rowCount - r);
      cs = Math.min(Math.max(1, cs), colCount - c);

      const baseW =
        sumPixelCols(c, cs) +
        (starWAll > 0 ? (sumStarCols(c, cs) / starWAll) * remW0 : 0) +
        (cs - 1) * this.colGap;

      const baseH =
        sumPixelRows(r, rs) +
        (starHAll > 0 ? (sumStarRows(r, rs) / starHAll) * remH0 : 0) +
        (rs - 1) * this.rowGap;

      // NEW: звёзды лимитируют только если сторона конечна
      const hasWidthLimiter  = (sumPixelCols(c, cs) > 0) || (finiteW && sumStarCols(c, cs) > 0);
      const hasHeightLimiter = (sumPixelRows(r, rs) > 0) || (finiteH && sumStarRows(r, rs) > 0);

      const approxW = hasWidthLimiter  ? Math.max(1, baseW) : Infinity;
      const approxH = hasHeightLimiter ? Math.max(1, baseH) : Infinity;

      ch.measure({ width: approxW, height: approxH });

      const perRow = ch.desired.height / rs;
      for (let i = 0; i < rs; i++) {
        const row = this.rows[r + i];
        if (!row) continue;
        if (row.len.kind === 'auto') row.desired = Math.max(row.desired, perRow);
        if (!finiteH && row.len.kind === 'star') row.desired = Math.max(row.desired, perRow); // NEW
      }

      const perCol = ch.desired.width / cs;
      for (let i = 0; i < cs; i++) {
        const col = this.cols[c + i];
        if (!col) continue;
        if (col.len.kind === 'auto') col.desired = Math.max(col.desired, perCol);
        if (!finiteW && col.len.kind === 'star') col.desired = Math.max(col.desired, perCol); // NEW
      }
    }

    // 4) фиксируем Auto
    for (const r of this.rows) if (r.len.kind === 'auto') r.actual = Math.ceil(r.desired);
    for (const c of this.cols) if (c.len.kind === 'auto') c.actual = Math.ceil(c.desired);

    // 5) раздаём Star
    const usedW = this.cols.reduce((s, c) => s + c.actual, 0);
    const usedH = this.rows.reduce((s, r) => s + r.actual, 0);

    const remW = finiteW ? Math.max(0, innerAvail.width  - usedW - totalColGaps) : 0; // NEW
    const remH = finiteH ? Math.max(0, innerAvail.height - usedH - totalRowGaps) : 0; // NEW

    const starWUsed = this.cols.filter(c => c.len.kind === 'star').reduce((s, c) => s + c.len.v, 0);
    const starHUsed = this.rows.filter(r => r.len.kind === 'star').reduce((s, r) => s + r.len.v, 0);

    for (const c of this.cols) {
      if (c.len.kind === 'star') {
        c.actual = finiteW ? (starWUsed ? c.len.v / starWUsed : 0) * remW
          : Math.ceil(c.desired); // NEW: size-to-content
      }
    }
    for (const r of this.rows) {
      if (r.len.kind === 'star') {
        r.actual = finiteH ? (starHUsed ? r.len.v / starHUsed : 0) * remH
          : Math.ceil(r.desired); // NEW: size-to-content
      }
    }

    // 6) desired грида
    const widthSum  = this.cols.reduce((s, c) => s + c.actual, 0) + totalColGaps;
    const heightSum = this.rows.reduce((s, r) => s + r.actual, 0) + totalRowGaps;

    this.desired = {
      width:  widthSum  + this.margin.l + this.margin.r,
      height: heightSum + this.margin.t + this.margin.b,
    };
  }

  arrange(rect: Rect) {
    const x0 = rect.x + this.margin.l;
    const y0 = rect.y + this.margin.t;
    const w0 = Math.max(0, rect.width  - this.margin.l - this.margin.r);
    const h0 = Math.max(0, rect.height - this.margin.t - this.margin.b);
    this.final = { x: x0, y: y0, width: w0, height: h0 };

    const xs = [x0];
    for (let i = 0; i < this.cols.length; i++) xs.push(xs[i] + this.cols[i].actual);

    const ys = [y0];
    for (let i = 0; i < this.rows.length; i++) ys.push(ys[i] + this.rows[i].actual);

    const rowCount = this.rows.length, colCount = this.cols.length;

    for (const ch of this.children) {
      let r = (rowMap.get(ch) ?? 0) | 0;
      let c = (colMap.get(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), Math.max(0, rowCount - 1));
      c = Math.min(Math.max(0, c), Math.max(0, colCount - 1));

      let rs = (rowSpan.get(ch) ?? 1) | 0;
      let cs = (colSpan.get(ch) ?? 1) | 0;
      rs = Math.min(Math.max(1, rs), Math.max(1, rowCount - r));
      cs = Math.min(Math.max(1, cs), Math.max(1, colCount - c));

      const x = xs[c] + c * this.colGap;
      const y = ys[r] + r * this.rowGap;

      const w = (xs[c + cs] - xs[c]) + (cs - 1) * this.colGap;
      const h = (ys[r + rs] - ys[r]) + (rs - 1) * this.rowGap;

      ch.arrange({ x, y, width: w, height: h });
    }

    this.drawDebug(xs, ys);
  }

  private drawDebug(xs: number[], ys: number[]) {
    const g = this.debugG;
    g.visible = this.debug;
    g.clear();
    if (!this.debug) return;
    if (this.final.width <= 0 || this.final.height <= 0) return;

    const x0 = this.final.x, y0 = this.final.y;
    const w0 = this.final.width, h0 = this.final.height;

    // --- стили
    const STROKE = 0x00ffff;
    const STROKE_ALPHA = 0.7;
    const GRID_LINE_ALPHA = 0.45;
    const GAP_FILL = 0xff00ff;
    const GAP_ALPHA = 0.10;
    const MARGIN_FILL = 0xff9900;
    const MARGIN_ALPHA = 0.22;
    const PADDING_FILL = 0x66ccff;
    const PADDING_ALPHA = 0.18;

    // рамка всего грида
    g.lineStyle({ width: 2, color: STROKE, alpha: STROKE_ALPHA, alignment: 0 });
    g.drawRect(x0, y0, w0, h0);

    // подсветка колонок (только трек, без gap)
    const colorForCol = (c: Col) =>
      c.len.kind === 'px' ? 0x3da5ff : c.len.kind === 'auto' ? 0x5fff7a : 0xffb347;

    for (let c = 0; c < this.cols.length; c++) {
      const cx = xs[c] + c * this.colGap;
      const trackW = (xs[c + 1] - xs[c]); // без gap справа
      g.lineStyle(0);
      g.beginFill(colorForCol(this.cols[c]), 0.06);
      g.drawRect(cx, y0, trackW, h0);
      g.endFill();
    }

    // подсветка GAP-полос
    for (let c = 0; c < this.cols.length - 1; c++) {
      const gx = xs[c + 1] + c * this.colGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(gx, y0, this.colGap, h0);
      g.endFill();
    }
    for (let r = 0; r < this.rows.length - 1; r++) {
      const gy = ys[r + 1] + r * this.rowGap;
      g.beginFill(GAP_FILL, GAP_ALPHA);
      g.drawRect(x0, gy, w0, this.rowGap);
      g.endFill();
    }

    // вертикальные и горизонтальные линии сетки (с учётом gap)
    g.lineStyle({ width: 2, color: STROKE, alpha: GRID_LINE_ALPHA, alignment: 0 });
    for (let c = 0; c <= this.cols.length; c++) {
      const bx = (c < this.cols.length)
        ? xs[c] + c * this.colGap
        : xs[c] + (c - 1) * this.colGap;
      g.moveTo(bx, y0); g.lineTo(bx, y0 + h0);
    }
    for (let r = 0; r <= this.rows.length; r++) {
      const by = (r < this.rows.length)
        ? ys[r] + r * this.rowGap
        : ys[r] + (r - 1) * this.rowGap;
      g.moveTo(x0, by); g.lineTo(x0 + w0, by);
    }

    // контуры ячеек (треки, без gap)
    for (let r = 0; r < this.rows.length; r++) {
      for (let c = 0; c < this.cols.length; c++) {
        const cx = xs[c] + c * this.colGap;
        const cy = ys[r] + r * this.rowGap;
        const cw = (xs[c + 1] - xs[c]);
        const ch = (ys[r + 1] - ys[r]);
        g.lineStyle({ width: 1, color: STROKE, alpha: 0.5, alignment: 0 });
        g.drawRect(cx, cy, cw, ch);
      }
    }

    // функции колец (margin/padding)
    const ring = (x:number,y:number,w:number,h:number,l:number,t:number,rn:number,b:number,color:number,alpha:number) => {
      if (w <= 0 || h <= 0) return;
      g.lineStyle(0);
      g.beginFill(color, alpha);
      if (t > 0) g.drawRect(x, y, w, t);
      if (b > 0) g.drawRect(x, y + h - b, w, b);
      const midH = h - t - b;
      if (midH > 0) {
        if (l > 0) g.drawRect(x, y + t, l, midH);
        if (rn > 0) g.drawRect(x + w - rn, y + t, rn, midH);
      }
      g.endFill();
    };

    // margin/padding для непосредственных детей этого грида
    for (const ch of this.children) {
      // slot прямоугольник, куда мы вызывали arrange для ребёнка
      let r = (rowMap.get(ch) ?? 0) | 0;
      let c = (colMap.get(ch) ?? 0) | 0;
      r = Math.min(Math.max(0, r), this.rows.length - 1);
      c = Math.min(Math.max(0, c), this.cols.length - 1);
      let rs = (rowSpan.get(ch) ?? 1) | 0;
      let cs = (colSpan.get(ch) ?? 1) | 0;
      rs = Math.min(Math.max(1, rs), this.rows.length - r);
      cs = Math.min(Math.max(1, cs), this.cols.length - c);

      const slotX = xs[c] + c * this.colGap;
      const slotY = ys[r] + r * this.rowGap;
      const slotW = (xs[c + cs] - xs[c]) + (cs - 1) * this.colGap;
      const slotH = (ys[r + rs] - ys[r]) + (rs - 1) * this.rowGap;

      // margin (кольцо между слотом и ch.final; считаем по значениям margin)
      const m = ch.margin;
      if (m.l || m.t || m.r || m.b) {
        ring(slotX, slotY, slotW, slotH, m.l, m.t, m.r, m.b, MARGIN_FILL, MARGIN_ALPHA);
      }

      // padding — только для BorderPanel (кольцо внутри самой панели)
      if (ch instanceof BorderPanel) {
        const pad = ch.padding;
        const bx = ch.final.x, by = ch.final.y, bw = ch.final.width, bh = ch.final.height;
        if (pad.l || pad.t || pad.r || pad.b) {
          ring(bx, by, bw, bh, pad.l, pad.t, pad.r, pad.b, PADDING_FILL, PADDING_ALPHA);
        }
      }
    }
  }
}

// ===== Хелперы =====
function applyGridAttachedProps(node: Element, el: UIElement) {
  const r  = node.getAttribute('Grid.Row');         if (r)  Grid.setRow(el, +r);
  const c  = node.getAttribute('Grid.Column');      if (c)  Grid.setCol(el, +c);
  const rs = node.getAttribute('Grid.RowSpan');     if (rs) Grid.setRowSpan(el, +rs);
  const cs = node.getAttribute('Grid.ColumnSpan');  if (cs) Grid.setColSpan(el, +cs);
}

function parseSizeAttrs(node: Element, el: UIElement) {
  const w = node.getAttribute('Width');      if (w) el.prefW = parseFloat(w);
  const h = node.getAttribute('Height');     if (h) el.prefH = parseFloat(h);
  const minW = node.getAttribute('MinWidth'); if (minW) el.minW = parseFloat(minW);
  const minH = node.getAttribute('MinHeight');if (minH) el.minH = parseFloat(minH);
}

function parseLen(s?: string|null): Len {
  if (!s || s === '*') return Star(1);
  if (s === 'Auto')   return Auto();
  if (s.endsWith('*')) return Star(parseFloat(s) || 1);
  return Px(parseFloat(s));
}

function parseColor(hex?: string|null): number|undefined {
  if (!hex) return undefined;
  if (hex.startsWith('#')) return parseInt(hex.slice(1), 16);
  const n = Number(hex);
  return Number.isFinite(n) ? n : undefined;
}

type Margin = { l: number; t: number; r: number; b: number };
export function parseMargin(s?: string | null): Margin {
  if (!s || !s.trim()) return { l: 0, t: 0, r: 0, b: 0 };
  const raw = s.trim().split(/[,\s]+/).filter(Boolean);
  const toNum = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const a = raw.map(toNum);
  if (a.length === 1) { const [m] = a; return { l: m, t: m, r: m, b: m }; }
  if (a.length === 2) { const [h, v] = a; return { l: h, t: v, r: h, b: v }; }
  if (a.length === 3) { const [l, t, r] = a; return { l, t, r, b: t }; }
  const [l, t, r, b] = a; return { l, t, r, b };
}

// ===== Парсер XML → дерево =====
function parseElement(node: Element): UIElement | null {
  switch (node.tagName) {
    case 'TextBlock': {
      const text = node.getAttribute('Text') ?? '';
      const fill = node.getAttribute('Foreground') ?? '#ffffff';
      const fontSize = parseFloat(node.getAttribute('FontSize') ?? '16');
      const leaf = new PixiText(new PIXI.Text(text, { fill, fontSize }));
      parseSizeAttrs(node, leaf);
      const m = node.getAttribute('Margin'); if (m) leaf.margin = parseMargin(m);
      const ha = node.getAttribute('HorizontalAlignment'); if (ha) leaf.hAlign = ha as any;
      const va = node.getAttribute('VerticalAlignment');   if (va) leaf.vAlign = va as any;
      applyGridAttachedProps(node, leaf);
      return leaf;
    }

    case 'Border': {
      const panel = new BorderPanel({ background: parseColor(node.getAttribute('Background')) });
      parseSizeAttrs(node, panel);
      const m = node.getAttribute('Margin');  if (m) panel.margin = parseMargin(m);
      const p = node.getAttribute('Padding'); if (p) panel.padding = parseMargin(p);
      const clip = node.getAttribute('ClipToBounds');
      if (clip && clip.toLowerCase() === 'true') panel.clipToBounds = true;
      applyGridAttachedProps(node, panel);

      const first = Array.from(node.children).find(ch => ch.nodeType === Node.ELEMENT_NODE) as Element|undefined;
      if (first) panel.child = parseElement(first) ?? undefined;
      return panel;
    }

    case 'Grid': {
      const g = new Grid();
      const rgAttr = node.getAttribute('RowGap');     if (rgAttr != null) g.rowGap = parseFloat(rgAttr) || 0;
      const cgAttr = node.getAttribute('ColumnGap');  if (cgAttr != null) g.colGap = parseFloat(cgAttr) || 0;
      const m = node.getAttribute('Margin');          if (m) g.margin = parseMargin(m);
      const dbg = node.getAttribute('Debug');         if (dbg && dbg.toLowerCase() === 'true') g.debug = true;
      applyGridAttachedProps(node, g);

      // defs
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Grid.RowDefinitions') {
          for (const rd of Array.from(ch.children)) {
            if (rd.tagName === 'RowDefinition') g.rows.push(new Row(parseLen(rd.getAttribute('Height'))));
          }
        } else if (ch.tagName === 'Grid.ColumnDefinitions') {
          for (const cd of Array.from(ch.children)) {
            if (cd.tagName === 'ColumnDefinition') g.cols.push(new Col(parseLen(cd.getAttribute('Width'))));
          }
        }
      }
      // content
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Grid.RowDefinitions' || ch.tagName === 'Grid.ColumnDefinitions') continue;
        const u = parseElement(ch);
        if (u) g.add(u);
      }
      return g;
    }

    case 'Image': {
      const key = node.getAttribute('Source') ?? '';
      let tex: PIXI.Texture | undefined;
      try { tex = PIXI.Assets.get(key) as PIXI.Texture | undefined; } catch {}
      const img = new PixiImage(tex);
      parseSizeAttrs(node, img);
      const m = node.getAttribute('Margin'); if (m) img.margin = parseMargin(m);
      const stretch = node.getAttribute('Stretch');
      if (stretch === 'Fill' || stretch === 'Uniform' || stretch === 'UniformToFill' || stretch === 'None') {
        img.stretch = stretch;
      }
      const ha = node.getAttribute('HorizontalAlignment'); if (ha) img.hAlign = ha as any;
      const va = node.getAttribute('VerticalAlignment');   if (va) img.vAlign = va as any;
      applyGridAttachedProps(node, img);
      return img;
    }

    case 'Resources': {
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Template') registerTemplate(ch);
      }
      return null;
    }

    case 'ContentPresenter': {
      const cp = new ContentPresenter();
      const m = node.getAttribute('Margin'); if (m) cp.margin = parseMargin(m);
      applyGridAttachedProps(node, cp);
      return cp;
    }

    case 'Use': {
      const key = node.getAttribute('Template') || '';
      const props: Record<string,string> = {};
      for (const a of Array.from(node.attributes)) if (a.name !== 'Template') props[a.name] = a.value;

      const slotMap = new Map<string, Element[]>();
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Slot') {
          const name = ch.getAttribute('Name') ?? '';
          const content = Array.from(ch.children).filter(n => n.nodeType === 1) as Element[];
          slotMap.set(name, content);
        }
      }
      const rootEl = instantiateTemplate(key, props, slotMap);

      // переносим Grid.* c <Use> на корень темплейта
      const gr = node.getAttribute('Grid.Row');         if (gr)  rootEl.setAttribute('Grid.Row', gr);
      const gc = node.getAttribute('Grid.Column');      if (gc)  rootEl.setAttribute('Grid.Column', gc);
      const grs = node.getAttribute('Grid.RowSpan');    if (grs) rootEl.setAttribute('Grid.RowSpan', grs);
      const gcs = node.getAttribute('Grid.ColumnSpan'); if (gcs) rootEl.setAttribute('Grid.ColumnSpan', gcs);

      return parseElement(rootEl);
    }

    default: return null;
  }
}

// ===== Сборка PIXI-иерархии =====
function parse(xml: string) {
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  const rootEl = dom.documentElement;
  if (rootEl.tagName !== 'Grid') throw new Error('Root must be <Grid>');

  const root = parseElement(rootEl) as Grid;

  const container = new PIXI.Container();
  container.sortableChildren = true;

  function collect(into: PIXI.Container, u: UIElement) {
    if (u instanceof ContentPresenter && (u as any).child) {
      collect(into, (u as any).child);
      return;
    }

    if (u instanceof BorderPanel) {
      const group = u.container;
      group.sortableChildren = true;
      if (!group.children.includes(u.bg)) group.addChildAt(u.bg, 0);
      into.addChild(group);
      if (u.child) collect(group, u.child);
      return;
    }

    if (u instanceof PixiText) { into.addChild(u.view); return; }

    const spr = (u as any).sprite as PIXI.Sprite | undefined;
    if (spr) { into.addChild(spr); return; }

    if (u instanceof Grid) {
      for (const ch of u.children) collect(into, ch);
      u.debugG.zIndex = 100000;                    // оверлей сверху
      if (u.debugG.parent !== into) {
        u.debugG.parent?.removeChild(u.debugG);
        into.addChild(u.debugG);
      }
      return;
    }
  }
  collect(container, root);

  return { root, container };
}

// ===== Публичное API =====
export const RuntimeInstance = {
  create(xml: string) {
    const { root, container } = parse(xml);

    // вкл/выкл подсветку на всех гридах
    const visit = (u: UIElement, f:(g:Grid)=>void) => {
      if (u instanceof Grid) f(u);
      const kids = (u as any).children as UIElement[]|undefined;
      if (kids) kids.forEach(k => visit(k, f));
      const child = (u as any).child as UIElement|undefined;
      if (child) visit(child, f);
    };
    const setGridDebug = (on:boolean) => visit(root, g => { g.debug = on; });

    const layout = (size: Size) => {
      root.measure(size);
      root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
    };

    const destroy = () => container.destroy({ children: true });

    return { container, layout, destroy, setGridDebug };
  }
};
