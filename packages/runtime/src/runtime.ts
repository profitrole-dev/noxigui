import { Parser } from '@noxigui/parser';
import { UIElement, type Size } from '@noxigui/core';
import { Grid } from './elements/Grid.js';
import type { Renderer, RenderContainer } from './renderer.js';

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
    const setGridDebug = (on: boolean) => visit(root, g => { g.debug = on; });

    const layout = (size: Size) => {
      root.measure(size);
      root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
    };

    const destroy = () => {
      const obj = container.getDisplayObject();
      (obj as any)?.destroy?.({ children: true });
    };

    return { container, layout, destroy, setGridDebug } as {
      container: RenderContainer;
      layout: (size: Size) => void;
      destroy: () => void;
      setGridDebug: (on: boolean) => void;
    };
  }
};
