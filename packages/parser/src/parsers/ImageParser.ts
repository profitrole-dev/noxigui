import { Image, applyGridAttachedProps, parseSizeAttrs, applyMargin, applyAlignment } from '@noxigui/runtime-core';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime-core';

/** Parser for `<Image>` elements. */
export class ImageParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Image'; }
  parse(node: Element, p: Parser) {
    const key = node.getAttribute('Source') ?? '';
    let tex: any;
    try { tex = (globalThis as any).PIXI?.Assets?.get(key); } catch {}
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

  collect(into: RenderContainer, el: UIElement) {
    if (el instanceof Image) {
      into.addChild(el.sprite.getDisplayObject());
      return true;
    }
    return false;
  }
}
