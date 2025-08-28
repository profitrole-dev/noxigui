import { Parser } from '../../parser/src/Parser.js';
import { Grid } from './elements/Grid.js';
import { UIElement } from './core.js';
import type { Size } from './core.js';
import type { Renderer } from './renderer.js';

export const RuntimeInstance = {
  create(xml: string, renderer: Renderer) {
    const { root, container } = new Parser(renderer).parse(xml);

    const visit = (u: UIElement, f: (g: Grid) => void) => {
      if (u instanceof Grid) f(u);
      const kids = (u as any).children as UIElement[] | undefined;
      if (kids) kids.forEach(k => visit(k, f));
      const child = (u as any).child as UIElement | undefined;
      if (child) visit(child, f);
    };
    const setGridDebug = async (on: boolean) => {
      if (on) {
        const { createGridDebug } = await import('./elements/GridDebug.js');
        visit(root, g => {
          if (!g.debugLayer) {
            g.debugLayer = createGridDebug(renderer);
            container.addChild(g.debugLayer.g.getDisplayObject());
          }
          g.debug = true;
        });
      } else {
        visit(root, g => {
          g.debug = false;
          g.debugLayer?.g.setVisible?.(false);
        });
      }
    };

    const layout = (size: Size) => {
      root.measure(size);
      root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
    };

    const destroy = () => container.destroy({ children: true });

    return { container, layout, destroy, setGridDebug };
  }
};
