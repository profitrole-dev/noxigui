// Template registry utilities

function subst(value: string, props: Record<string, string>): string {
  return value.replace(/\{([\w.-]+)\}/g, (_, name) => props[name] ?? '');
}

function childrenOf(el: Element): Element[] {
  const kids = (el as any).children as Element[] | undefined;
  return kids ? Array.from(kids) : Array.from((el.childNodes || [])).filter((c: any) => c.nodeType === 1) as Element[];
}

export class TemplateStore {
  private registry = new Map<string, Element>();

  register(node: Element) {
    const key = node.getAttribute('Key') || node.getAttribute('x:Key');
    if (!key) throw new Error('<Template> needs Key');
    const root = childrenOf(node).find(ch => ch.nodeType === 1);
    if (!root) throw new Error('<Template> must have a single root element');
    this.registry.set(key, root.cloneNode(true) as Element);
  }

  instantiate(key: string, props: Record<string, string>, slotNodes: Map<string, Element[]>): Element {
    const tplRoot = this.registry.get(key);
    if (!tplRoot) throw new Error(`Template not found: ${key}`);
    const clone = tplRoot.cloneNode(true) as Element;

    const walkAttrs = (el: Element) => {
      for (const attr of Array.from(el.attributes)) attr.value = subst(attr.value, props);
      for (const ch of childrenOf(el)) walkAttrs(ch);
    };
    walkAttrs(clone);

    const fillSlots = (el: Element) => {
      if (el.tagName === 'ContentPresenter') {
        const name = el.getAttribute('Slot') ?? '';
        const provided = slotNodes.get(name);
        if (provided && provided.length) {
          const parent = el.parentElement!;
          for (const node of provided) parent.insertBefore(node.cloneNode(true), el);
          parent.removeChild(el);
          return;
        }
      }
      for (const ch of childrenOf(el)) fillSlots(ch);
    };
    fillSlots(clone);

    return clone;
  }

  clear() {
    this.registry.clear();
  }
}
