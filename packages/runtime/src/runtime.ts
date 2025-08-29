import type { Renderer } from './renderer.js';
import { GuiObject } from './GuiObject.js';

export const RuntimeInstance = {
  create(xml: string, renderer: Renderer) {
    return new GuiObject(xml, renderer);
  }
};
