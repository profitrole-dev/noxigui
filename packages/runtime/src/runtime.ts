import type { Renderer } from './renderer.js';
import { GuiObject } from './GuiObject.js';

export const Noxi = {
  gui: {
    create(xml: string, renderer: Renderer) {
      return new GuiObject(xml, renderer);
    }
  }
};
