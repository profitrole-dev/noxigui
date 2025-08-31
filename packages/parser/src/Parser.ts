import { UIElement, TemplateStore } from '@noxigui/runtime';
import { createParsers as elementParsers } from './parsers/index.js';
import type { Renderer, RenderContainer, Binding } from '@noxigui/runtime';

export interface XmlParser {
  parseFromString(xml: string, type: string): Document;
}

/**
 * Parses NoxiGUI XML markup into UI elements and a PIXI display tree.
 */
export class Parser {
  bindings: Binding[] = [];
  /**
   * Create a new parser.
   *
   * @param parsers - Registered element parsers. Defaults to built-in parsers.
   */
  constructor(
    public renderer: Renderer,
    public templates: TemplateStore,
    private xmlParser: XmlParser = new DOMParser(),
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
        const el = p.parse(node, this);
        if (el) this.parseBindings(node, el);
        return el;
      }
    }
    return null;
  }

  private parseBindings(node: Element, el: UIElement) {
    for (const attr of Array.from(node.attributes)) {
      const val = attr.value.trim();
      if (val.startsWith('{') && val.endsWith('}')) {
        const inner = val.slice(1, -1).trim();
        let path: string | null = null;
        if (inner.startsWith('Binding')) {
          const rest = inner.slice('Binding'.length).trim();
          if (rest.startsWith('Path')) {
            const m = rest.match(/Path\s*=\s*(.+)/);
            path = m ? m[1].trim() : null;
          } else {
            path = rest;
          }
        } else {
          path = inner;
        }
        if (path) {
          const prop = attr.name[0].toLowerCase() + attr.name.slice(1);
          this.bindings.push({ element: el, property: prop, path });
        }
      }
    }
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

    return { root, container, bindings: this.bindings };
  }
}
