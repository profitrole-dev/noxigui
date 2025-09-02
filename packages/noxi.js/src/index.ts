import { Noxi as RuntimeNoxi, type GuiObject, type Renderer } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';

const Noxi = {
  gui: {
    /**
     * Create a GUI object from XML.
     *
     * @param xml - Markup describing the UI.
     * @param renderer - Optional renderer instance. Defaults to Pixi renderer.
     * @param resolution - Rendering resolution (device pixel ratio).
     */
    create(
      xml: string,
      renderer: Renderer = createPixiRenderer(),
      resolution?: number
    ): GuiObject {
      const res = resolution ?? renderer.resolution ?? 1;
      renderer.resolution = res;
      const gui = RuntimeNoxi.gui.create(xml, renderer);
      if (res !== 1) {
        gui.container.setScale(1 / res, 1 / res);
      }
      return gui;
    }
  }
};

export default Noxi;
