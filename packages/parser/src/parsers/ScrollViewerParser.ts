import { ScrollViewer, applyGridAttachedProps, parseSizeAttrs, applyMargin } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

export class ScrollViewerParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'ScrollViewer'; }
  parse(node: Element, p: Parser) {
    const sv = new ScrollViewer(p.renderer);
    parseSizeAttrs(node, sv);
    applyMargin(node, sv);
    applyGridAttachedProps(node, sv);
    const first = Array.from(node.children).find(ch => ch.nodeType === Node.ELEMENT_NODE) as Element | undefined;
    if (first) sv.child = p.parseElement(first) ?? undefined;
    return sv;
  }
  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof ScrollViewer) {
      const group = el.container;
      group.setSortableChildren(true);
      into.addChild(group.getDisplayObject());
      if (el.child) collect(group, el.child);
      group.addChild(el.vBar.getDisplayObject());
      return true;
    }
    return false;
  }
}
