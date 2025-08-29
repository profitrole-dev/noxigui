import { StackPanel, applyGridAttachedProps, parseSizeAttrs, applyMargin } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

export class StackPanelParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'StackPanel'; }
  parse(node: Element, p: Parser) {
    const sp = new StackPanel();
    const orient = node.getAttribute('Orientation');
    if (orient === 'Horizontal' || orient === 'Vertical') sp.orientation = orient;
    const spacingAttr = node.getAttribute('Spacing');
    if (spacingAttr != null) sp.spacing = parseFloat(spacingAttr) || 0;
    parseSizeAttrs(node, sp);
    applyMargin(node, sp);
    applyGridAttachedProps(node, sp);
    for (const ch of Array.from(node.children)) {
      const u = p.parseElement(ch);
      if (u) sp.add(u);
    }
    return sp;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof StackPanel) {
      for (const ch of el.children) collect(into, ch);
      return true;
    }
    return false;
  }
}

