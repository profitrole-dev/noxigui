import type { Size, UIElement } from '@noxigui/core';
import { Grid } from './elements/Grid.js';
import type { Renderer, RenderContainer } from './renderer.js';
import { Parser } from '@noxigui/parser';
import { TemplateStore } from './template.js';
import type { Binding } from './binding.js';
import type { ObservableObject, Change } from './viewmodel.js';

export class GuiObject {
  public root: UIElement;
  public container: RenderContainer;
  public templates: TemplateStore;
  private bindings: Binding[];

  constructor(xml: string, renderer: Renderer) {
    this.templates = new TemplateStore();
    const parsed = new Parser(renderer, this.templates).parse(xml) as any;
    this.root = parsed.root;
    this.container = parsed.container;
    this.bindings = parsed.bindings ?? [];
  }

  layout(size: Size) {
    this.root.measure(size);
    this.root.arrange({ x: 0, y: 0, width: size.width, height: size.height });
  }

  destroy() {
    const obj = this.container.getDisplayObject();
    (obj as any)?.destroy?.({ children: true });
  }

  private getPath(obj: any, path: string) {
    return path.split('.').reduce((acc: any, part: string) => acc?.[part], obj);
  }

  bind(vm: ObservableObject<any>) {
    for (const b of this.bindings) {
      const apply = () => {
        (b.element as any)[b.property] = this.getPath(vm, b.path);
      };
      const segs = b.path.split('.');
      let current: any = vm;
      let obs: any = vm.observable;
      for (const seg of segs) {
        if (obs) {
          obs.subscribe((change: Change<any>) => {
            if (change.property === seg) apply();
          });
        }
        current = current?.[seg];
        obs = current?.observable;
      }
      if (obs) {
        obs.subscribe(() => apply());
      }
      apply();
    }
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
