import { RuntimeInstance, type GuiObject, type Renderer } from '@noxigui/runtime';

const Noxi = {
  gui: {
    create(xml: string, renderer?: Renderer): GuiObject {
      return RuntimeInstance.create(xml, renderer as Renderer);
    }
  }
};

export default Noxi;
