import { UIElement, TemplateStore } from '@noxigui/runtime';
import { createParsers as elementParsers } from './parsers/index.js';
import type { Renderer, RenderContainer } from '@noxigui/runtime';
import { createRequire } from 'node:module';

export interface XmlParser {
  parseFromString(xml: string, type: string): Document;
}

const require = createRequire(import.meta.url);

function createDefaultXmlParser(): XmlParser {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser();
  }

  try {
    const { DOMParser: XmldomParser } = require('@xmldom/xmldom') as typeof import('@xmldom/xmldom');
    return {
      parseFromString(xml: string, type: string) {
        const doc = new XmldomParser().parseFromString(xml, type);
        const patch = (el: any) => {
          el.children = Array.from(el.childNodes || []).filter((c: any) => c.nodeType === 1);
          el.children.forEach(patch);
        };
        if (doc.documentElement) patch(doc.documentElement);
        return doc as any;
      },
    };
  } catch {
    throw new Error(
      'DOMParser is not available. Install @xmldom/xmldom or provide an XmlParser implementation.',
    );
  }
}

/**
 * Parses NoxiGUI XML markup into UI elements and a PIXI display tree.
 */
export class Parser {
  /**
   * Create a new parser.
   *
   * @param parsers - Registered element parsers. Defaults to built-in parsers.
   */
  constructor(
    public renderer: Renderer,
    public templates: TemplateStore,
    private xmlParser: XmlParser = createDefaultXmlParser(),
    private parsers = elementParsers(templates),
  ) {}

  /**
   * Parse a single DOM element using the first parser that matches it.
   *
   * @param node - DOM element to parse.
   * @returns The parsed UI element or `null` if no parser handled the node.
   */
  parseElement(node: Element): UIElement | null {
    for (const p of this.parsers) {
      if (p.test(node)) {
        return p.parse(node, this);
      }
    }
    return null;
  }

  /**
   * Parse an XML document into UI elements and assemble the renderer's container tree.
   *
   * @param xml - XML markup starting with a `<Grid>` root element.
   * @returns Object containing the root UI element and the root render container.
   */
  parse(xml: string) {
    const dom = this.xmlParser.parseFromString(xml, 'application/xml');
    const rootEl = dom.documentElement;
    if (rootEl.tagName !== 'Grid') throw new Error('Root must be <Grid>');

    const root = this.parseElement(rootEl);
    if (!root) throw new Error('Failed to parse root element');

    const container = this.renderer.createContainer();
    container.setSortableChildren(true);

    const collect = (into: RenderContainer, u: UIElement) => {
      for (const p of this.parsers) {
        if (p.collect && p.collect(into, u, collect)) return;
      }
    };
    collect(container, root);

    return { root, container };
  }
}
