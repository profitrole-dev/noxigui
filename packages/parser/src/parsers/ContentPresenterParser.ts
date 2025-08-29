import { ContentPresenter, applyGridAttachedProps, applyMargin } from '@noxigui/runtime-core';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime-core';

/** Parser for `<ContentPresenter>` elements. */
export class ContentPresenterParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'ContentPresenter'; }
  parse(node: Element, _p: Parser) {
    const cp = new ContentPresenter();
    applyMargin(node, cp);
    applyGridAttachedProps(node, cp);
    return cp;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof ContentPresenter && (el as any).child) {
      collect(into, (el as any).child);
      return true;
    }
    return false;
  }
}
