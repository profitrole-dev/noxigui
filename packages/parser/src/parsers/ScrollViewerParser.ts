import { ScrollViewer, applyGridAttachedProps, parseSizeAttrs, applyMargin } from '@noxigui/runtime';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { UIElement, RenderContainer } from '@noxigui/runtime';

export class ScrollViewerParser implements ElementParser {
  test(node: Element) {console.log("Test ScrollViewer"); return node.tagName === 'ScrollViewer'; }

  parse(node: Element, p: Parser) {
    const sv = new ScrollViewer(p.renderer);
    console.log("ScrollViewer is created")
    parseSizeAttrs(node, sv);
    applyMargin(node, sv);
    applyGridAttachedProps(node, sv);

    const hsv = node.getAttribute('HorizontalScrollBarVisibility');
    if (hsv) sv.horizontalScrollBarVisibility = hsv as any;

    const vsv = node.getAttribute('VerticalScrollBarVisibility');
    if (vsv) sv.verticalScrollBarVisibility = vsv as any;

    const ccs = node.getAttribute('CanContentScroll');
    if (ccs) sv.canContentScroll = ccs === 'True';

    const zoomMode = node.getAttribute('ZoomMode');
    if (zoomMode) (sv as any).zoomMode = zoomMode as any;

    const childEl = Array.from(node.children)[0] as Element | undefined;
    if (childEl) {
      const parsed = p.parseElement(childEl);
      if (parsed) sv.setContent(parsed);
    }

    return sv;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof ScrollViewer) {
      const group = el.container;
      into.addChild(group.getDisplayObject());
      collect(group, el.presenter);
      return true;
    }
    return false;
  }
}
