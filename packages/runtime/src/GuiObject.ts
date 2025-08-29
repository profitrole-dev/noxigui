import type { Size, UIElement } from '@noxigui/core';
import { Grid } from './elements/Grid.js';
import type { RenderContainer } from './renderer.js';

export class GuiObject {
  constructor(private root: UIElement, public container: RenderContainer) {}

  layout(size: Size) {
    this.root.measure(size);
    this.root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
  }

  destroy() {
    const obj = this.container.getDisplayObject();
    (obj as any)?.destroy?.({ children: true });
  }

  setGridDebug(on: boolean) {
    const visit = (u: UIElement, f: (g: Grid) => void) => {
      if (u instanceof Grid) f(u);
      const kids = (u as any).children as UIElement[] | undefined;
      if (kids) kids.forEach(k => visit(k, f));
      const child = (u as any).child as UIElement | undefined;
      if (child) visit(child, f);
    };
    visit(this.root, g => { g.debug = on; });
  }
}
