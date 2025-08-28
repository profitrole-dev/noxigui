import * as PIXI from 'pixi.js';
import { Image } from '../../../runtime/src/elements/Image.js';
import { applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../core/src/index.js';

/** Parser for `<Image>` elements. */
export class ImageParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Image'; }
  parse(node: Element, p: Parser) {
    const key = node.getAttribute('Source') ?? '';
    let tex: PIXI.Texture | undefined;
    try { tex = PIXI.Assets.get(key) as PIXI.Texture | undefined; } catch {}
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

  collect(into: PIXI.Container, el: UIElement) {
    if (el instanceof Image) {
      into.addChild(el.sprite.getDisplayObject());
      return true;
    }
    return false;
  }
}
