import { ContentPresenter } from '../../../runtime/src/core.js';
import { applyGridAttachedProps, applyMargin } from '../../../runtime/src/helpers.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement } from '../../../runtime/src/core.js';
import type { RenderContainer } from '../../../runtime/src/renderer.js';

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
