import * as PIXI from 'pixi.js';
import { PixiImage } from '../../../runtime/src/elements/PixiImage.js';
import { applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../runtime/src/core.js';

/** Parser for `<Image>` elements. */
export class ImageParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Image'; }
  parse(node: Element, _p: Parser) {
    const key = node.getAttribute('Source') ?? '';
    let tex: PIXI.Texture | undefined;
    try { tex = PIXI.Assets.get(key) as PIXI.Texture | undefined; } catch {}
    const img = new PixiImage(tex);
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
    if (el instanceof PixiImage) {
      into.addChild(el.sprite);
      return true;
    }
    return false;
  }
}
