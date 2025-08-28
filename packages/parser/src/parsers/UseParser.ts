import { instantiateTemplate } from '../../../runtime/src/template.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';

/** Parser for `<Use>` elements that instantiate templates. */
export class UseParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Use'; }
  parse(node: Element, p: Parser) {
    const key = node.getAttribute('Template') || '';
    const props: Record<string, string> = {};
    for (const a of Array.from(node.attributes)) if (a.name !== 'Template') props[a.name] = a.value;

    const slotMap = new Map<string, Element[]>();
    for (const ch of Array.from(node.children)) {
      if (ch.tagName === 'Slot') {
        const name = ch.getAttribute('Name') ?? '';
        const content = Array.from(ch.children).filter(n => n.nodeType === 1) as Element[];
        slotMap.set(name, content);
      }
    }
    const rootEl = instantiateTemplate(key, props, slotMap);

    const gr = node.getAttribute('Grid.Row');         if (gr)  rootEl.setAttribute('Grid.Row', gr);
    const gc = node.getAttribute('Grid.Column');      if (gc)  rootEl.setAttribute('Grid.Column', gc);
    const grs = node.getAttribute('Grid.RowSpan');    if (grs) rootEl.setAttribute('Grid.RowSpan', grs);
    const gcs = node.getAttribute('Grid.ColumnSpan'); if (gcs) rootEl.setAttribute('Grid.ColumnSpan', gcs);

    return p.parseElement(rootEl);
  }
}
