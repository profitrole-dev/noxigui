import * as PIXI from 'pixi.js';
import { PixiText } from '../../../runtime/src/elements/PixiText.js';
import { applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../runtime/src/core.js';

/** Parser for `<TextBlock>` elements. */
export class TextBlockParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'TextBlock'; }
  parse(node: Element, _p: Parser) {
    const text = node.getAttribute('Text') ?? '';
    const fill = node.getAttribute('Foreground') ?? '#ffffff';
    const fontSize = parseFloat(node.getAttribute('FontSize') ?? '16');
    const leaf = new PixiText(new PIXI.Text(text, { fill, fontSize }));
    parseSizeAttrs(node, leaf);
    applyMargin(node, leaf);
    applyAlignment(node, leaf);
    applyGridAttachedProps(node, leaf);
    return leaf;
  }

  collect(into: PIXI.Container, el: UIElement) {
    if (el instanceof PixiText) {
      into.addChild(el.view);
      return true;
    }
    return false;
  }
}
