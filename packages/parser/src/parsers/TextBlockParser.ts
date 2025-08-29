import { Text } from '@noxigui/runtime/elements/Text.js';
import { applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '@noxigui/runtime/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '@noxigui/runtime/core.js';
import type { RenderContainer } from '@noxigui/runtime/renderer.js';

/** Parser for `<TextBlock>` elements. */
export class TextBlockParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'TextBlock'; }
  parse(node: Element, p: Parser) {
    const content = node.getAttribute('Text') ?? '';
    const fill = node.getAttribute('Foreground') ?? '#ffffff';
    const fontSize = parseFloat(node.getAttribute('FontSize') ?? '16');
    const leaf = new Text(p.renderer, content, { fill, fontSize });
    parseSizeAttrs(node, leaf);
    applyMargin(node, leaf);
    applyAlignment(node, leaf);
    applyGridAttachedProps(node, leaf);
    return leaf;
  }

  collect(into: RenderContainer, el: UIElement) {
    if (el instanceof Text) {
      into.addChild(el.text.getDisplayObject());
      return true;
    }
    return false;
  }
}
