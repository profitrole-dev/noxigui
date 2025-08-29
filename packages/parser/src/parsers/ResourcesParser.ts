import { registerTemplate } from '@noxigui/runtime/template.js';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';

/** Parser for `<Resources>` blocks. */
export class ResourcesParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Resources'; }
  parse(node: Element, _p: Parser) {
    for (const ch of Array.from(node.children)) {
      if (ch.tagName === 'Template') registerTemplate(ch);
    }
    return null;
  }
}
