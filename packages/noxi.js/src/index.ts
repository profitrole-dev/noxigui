import { Noxi as RuntimeNoxi, type GuiObject, type Renderer } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';

const Noxi = {
  gui: {
    /**
     * Create a GUI object from XML.
     *
     * @param xml - Markup describing the UI.
     * @param options - Optional settings for creation, including `renderer`
     *   and `resolution` (device pixel ratio). Defaults to Pixi renderer.
     */
    create(
      xml: string,
      options: { renderer?: Renderer; resolution?: number } = {}
    ): GuiObject {
      const renderer = options.renderer ?? createPixiRenderer();
      const res = options.resolution ?? renderer.resolution ?? 1;
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
