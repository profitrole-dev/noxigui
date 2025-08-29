import type { UIElement } from '@noxigui/runtime/core.js';
import type { Parser } from '../Parser.js';
import type { RenderContainer } from '@noxigui/runtime/renderer.js';

/**
 * Converts DOM nodes into runtime UI elements.
 */
export interface ElementParser {
  /**
     * Whether this parser can handle the given DOM node.
     *
     * @param node - DOM element to check.
     */
  test(node: Element): boolean;
  /**
     * Parse the DOM node into a UI element.
     *
     * @param node - DOM element to parse.
     * @param p - The main {@link Parser} instance.
     */
  parse(node: Element, p: Parser): UIElement | null;
  /**
     * Optionally attach UI elements to the renderer display tree.
     *
     * @param into - Container to attach to.
     * @param el - Parsed UI element.
     * @param collect - Recursive helper to collect children.
     * @returns `true` if the element was collected.
     */
  collect?(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void): boolean | void;
}
