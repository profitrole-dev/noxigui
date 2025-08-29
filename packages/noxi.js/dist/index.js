import { Noxi as RuntimeNoxi } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';
const Noxi = {
    gui: {
        create(xml, renderer = createPixiRenderer()) {
            return RuntimeNoxi.gui.create(xml, renderer);
        }
    }
};
export default Noxi;
