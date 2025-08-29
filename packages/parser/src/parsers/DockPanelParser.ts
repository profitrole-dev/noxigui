import { DockPanel, applyGridAttachedProps, parseSizeAttrs, applyMargin, applyDockPanelProps } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

export class DockPanelParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'DockPanel'; }
  parse(node: Element, p: Parser) {
    const panel = new DockPanel();
    const lcf = node.getAttribute('LastChildFill');
    if (lcf && lcf.toLowerCase() === 'false') panel.lastChildFill = false;
    parseSizeAttrs(node, panel);
    applyMargin(node, panel);
    applyGridAttachedProps(node, panel);
    for (const ch of Array.from(node.children)) {
      const u = p.parseElement(ch);
      if (u) {
        applyDockPanelProps(ch, u);
        panel.add(u);
      }
    }
    return panel;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof DockPanel) {
      for (const ch of el.children) collect(into, ch);
      return true;
    }
    return false;
  }
}
