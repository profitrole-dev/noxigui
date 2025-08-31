import { ContentPresenter, type UIElement } from '../core.js';
import { StackPanel } from './StackPanel.js';
import type { Renderer, RenderContainer } from '../renderer.js';

/**
 * Renders a collection of items using a template.
 */
export class ItemsControl extends ContentPresenter {
  private _itemsSource: any[] = [];
  private _itemTemplate?: (item: any) => UIElement;
  private _itemsPanel: UIElement;
  private collector?: (into: RenderContainer, el: UIElement) => void;
  private realized: any[] = [];
  container: RenderContainer;

  constructor(renderer: Renderer) {
    super();
    this.container = renderer.createContainer();
    this.container.setSortableChildren(true);
    this._itemsPanel = new StackPanel();
    this.child = this._itemsPanel;
  }

  /** Called by parser to enable collecting newly created items. */
  setCollector(fn: (into: RenderContainer, el: UIElement) => void) {
    this.collector = fn;
    // If items were already generated before the collector was supplied
    // (e.g. when bindings apply prior to collect phase), refresh to realize
    // their render objects now.
    this.refresh();
  }

  /** Panel used to layout generated item elements. */
  get itemsPanel() { return this._itemsPanel; }
  set itemsPanel(p: UIElement) {
    this._itemsPanel = p;
    this.child = p;
    this.refresh();
  }

  /** Array of data items to render. */
  get itemsSource() { return this._itemsSource; }
  set itemsSource(src: any[]) {
    this._itemsSource = src || [];
    this.refresh();
  }

  /** Template factory used to create an element for each item. */
  get itemTemplate() { return this._itemTemplate; }
  set itemTemplate(t: ((item: any) => UIElement) | undefined) {
    this._itemTemplate = t;
    this.refresh();
  }

  /** Recreate children when source, template or panel changes. */
  private refresh() {
    const panel: any = this._itemsPanel;
    if (!panel) return;
    const kids: UIElement[] = panel.children ?? [];

    // Remove previously realized visuals
    for (const obj of this.realized) this.container.removeChild(obj);
    this.realized.length = 0;

    kids.length = 0;
    if (panel.children === undefined) panel.children = kids as any;
    if (!this._itemTemplate) return;
    for (const item of this._itemsSource) {
      const el = this._itemTemplate(item);
      if (!el) continue;
      el.setDataContext(item);
      if (typeof panel.add === 'function') panel.add(el);
      else kids.push(el);

      if (this.collector) {
        this.collector(this.container, el);
        const obj = (el as any).container?.getDisplayObject?.() ??
          (el as any).sprite?.getDisplayObject?.() ??
          (el as any).render?.getDisplayObject?.();
        if (obj) this.realized.push(obj);
      }
    }
    if (typeof panel.invalidateArrange === 'function') panel.invalidateArrange();
  }
}

