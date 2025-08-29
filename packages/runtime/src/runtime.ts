import { Parser } from '@noxigui/parser';
import type { Renderer } from './renderer.js';
import { GuiObject } from './GuiObject.js';

export const RuntimeInstance = {
  create(xml: string, renderer: Renderer) {
    const { root, container } = new Parser(renderer).parse(xml);
    return new GuiObject(root, container);
  }
};
