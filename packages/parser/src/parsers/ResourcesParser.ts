import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';
import type { TemplateStore } from '@noxigui/runtime';

/** Parser for `<Resources>` blocks. */
export class ResourcesParser implements ElementParser {
  constructor(private templates: TemplateStore) {}
  test(node: Element): boolean { return node.tagName === 'Resources'; }
  parse(node: Element, _p: Parser) {
    for (const ch of Array.from(node.children)) {
      if (ch.tagName === 'Template') this.templates.register(ch);
    }
    return null;
  }
}
