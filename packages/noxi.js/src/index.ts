import { Noxi as RuntimeNoxi, type GuiObject, type Renderer } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';

const Noxi = {
  gui: {
    create(xml: string, renderer: Renderer = createPixiRenderer()): GuiObject {
      return RuntimeNoxi.gui.create(xml, renderer);
    }
  }
};

export default Noxi;
