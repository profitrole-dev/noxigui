import type { Renderer } from './renderer.js';
import { GuiObject, type ParserCtor } from './GuiObject.js';

export const RuntimeInstance = {
  create(xml: string, renderer: Renderer, Parser: ParserCtor) {
    return new GuiObject(xml, renderer, Parser);
  }
};
