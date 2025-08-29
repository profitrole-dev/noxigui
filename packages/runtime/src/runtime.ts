import { Parser } from '@noxigui/parser';
import { Grid, UIElement, type Size, type Renderer } from '@noxigui/runtime-core';

export const RuntimeInstance = {
  create(xml: string, renderer: Renderer) {
    const { root, container: rootContainer } = new Parser(renderer).parse(xml);
    const container = rootContainer.getDisplayObject();

    const visit = (u: UIElement, f: (g: Grid) => void) => {
      if (u instanceof Grid) f(u);
      const kids = (u as any).children as UIElement[] | undefined;
      if (kids) kids.forEach(k => visit(k, f));
      const child = (u as any).child as UIElement | undefined;
      if (child) visit(child, f);
    };
    const setGridDebug = (on: boolean) => visit(root, g => { g.debug = on; });

    const layout = (size: Size) => {
      root.measure(size);
      root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
    };

    const destroy = () => container.destroy({ children: true });

    return { container, layout, destroy, setGridDebug };
  }
};
