// @ts-check
import { RuntimeInstance } from './packages/runtime/src/index.js';
import { Parser } from './packages/parser/src/index.js';

/**
 * Create GUI object from markup.
 * @param {string} xml - XML markup starting with <Grid> root.
 * @param {import('./packages/runtime/src/renderer.js').Renderer} renderer - Renderer implementation.
 * @returns {import('./packages/runtime/src/GuiObject.js').GuiObject}
 */
export function createGui(xml, renderer) {
  return RuntimeInstance.create(xml, renderer, Parser);
}
