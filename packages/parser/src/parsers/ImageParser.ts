import { Image } from '../../../runtime/src/elements/Image.js';
import { applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../runtime/src/core.js';

/** Parser for `<Image>` elements. */
export class ImageParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Image'; }
  parse(node: Element, p: Parser) {
    const key = node.getAttribute('Source') ?? '';
    const tex = p.renderer.getTexture(key);
    const img = new Image(p.renderer, tex);
    parseSizeAttrs(node, img);
    applyMargin(node, img);
    const stretch = node.getAttribute('Stretch');
    if (stretch === 'Fill' || stretch === 'Uniform' || stretch === 'UniformToFill' || stretch === 'None') {
      img.stretch = stretch;
    }
    applyAlignment(node, img);
    applyGridAttachedProps(node, img);
    return img;
  }

  collect(into: any, el: UIElement) {
    if (el instanceof Image) {
      into.addChild(el.sprite.getDisplayObject());
      return true;
    }
    return false;
  }
}
