import { ItemsControl, StackPanel, WrapPanel, applyGridAttachedProps, parseSizeAttrs, applyMargin } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

/** Parser for `<ItemsControl>` elements. */
export class ItemsControlParser implements ElementParser {
  test(node: Element) { return node.tagName === 'ItemsControl'; }

  parse(node: Element, p: Parser) {
    const ic = new ItemsControl(p.renderer);
    parseSizeAttrs(node, ic);
    applyMargin(node, ic);
    applyGridAttachedProps(node, ic);

    const panelAttr = node.getAttribute('ItemsPanel');
    if (panelAttr === 'WrapPanel') ic.itemsPanel = new WrapPanel();
    else if (panelAttr === 'StackPanel') ic.itemsPanel = new StackPanel();

    const tplKey = node.getAttribute('ItemTemplate');
    if (tplKey) {
      const tplRoot = p.templates.instantiate(tplKey, {}, new Map());
      ic.itemTemplate = (item: any) => {
        const clone = tplRoot.cloneNode(true) as Element;
        const before = p.bindings.length;
        const el = p.parseElement(clone)!;
        const bindings = p.bindings.slice(before);
        if ((item as any)?.observable) {
          for (const b of bindings) {
            const apply = (v: any) => { (b.element as any)[b.property] = v; };
            (item as any).observable.subscribe((chg: any) => {
              if (chg.property === b.path) apply(chg.value);
            });
            apply((item as any)[b.path]);
          }
        } else {
          for (const b of bindings) {
            (b.element as any)[b.property] = (item as any)[b.path];
          }
        }
        return el;
      };
    }

    return ic;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof ItemsControl) {
      into.addChild(el.container.getDisplayObject());
      el.setCollector(collect);
      // Mount the items panel so that any already-generated children
      // participate in rendering immediately.
      collect(el.container, el.itemsPanel);
      return true;
    }
    return false;
  }
}

