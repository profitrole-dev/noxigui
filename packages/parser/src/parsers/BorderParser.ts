import { BorderPanel } from '../../../runtime/src/elements/BorderPanel.js';
import { applyGridAttachedProps, parseSizeAttrs, parseColor, parseMargin, applyMargin } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../runtime/src/core.js';
import type { RenderContainer } from '../../../runtime/src/renderer.js';

/** Parser for `<Border>` elements. */
export class BorderParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Border'; }
  parse(node: Element, p: Parser) {
    const panel = new BorderPanel(p.renderer, { background: parseColor(node.getAttribute('Background')) });
    parseSizeAttrs(node, panel);
    applyMargin(node, panel);
    const pad = node.getAttribute('Padding'); if (pad) panel.padding = parseMargin(pad);
    const clip = node.getAttribute('ClipToBounds');
    if (clip && clip.toLowerCase() === 'true') panel.clipToBounds = true;
    applyGridAttachedProps(node, panel);

    const first = Array.from(node.children).find(ch => ch.nodeType === Node.ELEMENT_NODE) as Element | undefined;
    if (first) panel.child = p.parseElement(first) ?? undefined;
    return panel;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof BorderPanel) {
      const group = el.container;
      group.setSortableChildren(true);
      into.addChild(group.getDisplayObject());
      if (el.child) collect(group, el.child);
      return true;
    }
    return false;
  }
}
