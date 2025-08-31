import { ContentPresenter, type UIElement } from '../core.js';
import { StackPanel } from './StackPanel.js';

/**
 * Renders a collection of items using a template.
 */
export class ItemsControl extends ContentPresenter {
  private _itemsSource: any[] = [];
  private _itemTemplate?: (item: any) => UIElement;
  private _itemsPanel: UIElement;

  constructor() {
    super();
    this._itemsPanel = new StackPanel();
    this.child = this._itemsPanel;
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
    kids.length = 0;
    if (panel.children === undefined) panel.children = kids as any;
    if (!this._itemTemplate) return;
    for (const item of this._itemsSource) {
      const el = this._itemTemplate(item);
      if (!el) continue;
      el.setDataContext(item);
      if (typeof panel.add === 'function') panel.add(el);
      else kids.push(el);
    }
    if (typeof panel.invalidateArrange === 'function') panel.invalidateArrange();
  }
}

