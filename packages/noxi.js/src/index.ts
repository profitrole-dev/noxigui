import { RuntimeInstance, type GuiObject, type Renderer } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';
import { Parser } from '@noxigui/parser';

export { RuntimeInstance, createPixiRenderer, Parser };

const Noxi = {
  gui: {
    create(xml: string, renderer: Renderer = createPixiRenderer()): GuiObject {
      return RuntimeInstance.create(xml, renderer, Parser);
    }
  }
};

export default Noxi;
