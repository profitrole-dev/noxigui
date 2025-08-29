import { UIElement, type Renderer, type RenderContainer } from '@noxigui/runtime-core';
import { parsers as elementParsers } from './parsers/index.js';

/**
 * Parses NoxiGUI XML markup into UI elements and a renderer display tree.
 */
export class Parser {
  /**
   * Create a new parser.
   *
   * @param parsers - Registered element parsers. Defaults to built-in parsers.
   */
  constructor(public renderer: Renderer, private parsers = elementParsers) {}

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
   * Parse an XML document into UI elements and assemble the renderer container tree.
   *
   * @param xml - XML markup starting with a `<Grid>` root element.
   * @returns Object containing the root UI element and the renderer container tree.
  */
  parse(xml: string): { root: UIElement; container: RenderContainer } {
    const dom = new DOMParser().parseFromString(xml, 'application/xml');
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
