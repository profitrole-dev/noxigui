import * as PIXI from 'pixi.js';
import { UIElement } from '../../runtime/src/core.js';
import { parsers as elementParsers } from './parsers/index.js';
import type { Renderer } from '../../runtime/src/renderer.js';

/**
 * Parses NoxiGUI XML markup into UI elements and a PIXI display tree.
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
   * Parse an XML document into UI elements and assemble the PIXI container tree.
   *
   * @param xml - XML markup starting with a `<Grid>` root element.
   * @returns Object containing the root UI element and the PIXI container tree.
   */
  parse(xml: string) {
    const dom = new DOMParser().parseFromString(xml, 'application/xml');
    const rootEl = dom.documentElement;
    if (rootEl.tagName !== 'Grid') throw new Error('Root must be <Grid>');

    const root = this.parseElement(rootEl);
    if (!root) throw new Error('Failed to parse root element');

    const container = new PIXI.Container();
    container.sortableChildren = true;

    const collect = (into: PIXI.Container, u: UIElement) => {
      for (const p of this.parsers) {
        if (p.collect && p.collect(into, u, collect)) return;
      }
    };
    collect(container, root);

    return { root, container };
  }
}
