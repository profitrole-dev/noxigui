import { WrapPanel, applyGridAttachedProps, parseSizeAttrs, applyMargin } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

export class WrapPanelParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'WrapPanel'; }
  parse(node: Element, p: Parser) {
    const panel = new WrapPanel();
    const orient = node.getAttribute('Orientation');
    if (orient === 'Horizontal' || orient === 'Vertical') panel.orientation = orient;
    const iw = node.getAttribute('ItemWidth');
    if (iw != null) panel.itemWidth = parseFloat(iw) || 0;
    const ih = node.getAttribute('ItemHeight');
    if (ih != null) panel.itemHeight = parseFloat(ih) || 0;
    const gx = node.getAttribute('GapX');
    if (gx != null) panel.gapX = parseFloat(gx) || 0;
    const gy = node.getAttribute('GapY');
    if (gy != null) panel.gapY = parseFloat(gy) || 0;
    parseSizeAttrs(node, panel);
    applyMargin(node, panel);
    applyGridAttachedProps(node, panel);
    for (const ch of Array.from(node.children)) {
      const u = p.parseElement(ch);
      if (u) panel.add(u);
    }
    return panel;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof WrapPanel) {
      for (const ch of el.children) collect(into, ch);
      return true;
    }
    return false;
  }
}
