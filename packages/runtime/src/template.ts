// Template registry utilities

const TemplateRegistry = new Map<string, Element>();

export function registerTemplate(node: Element) {
  const key = node.getAttribute('Key') || node.getAttribute('x:Key');
  if (!key) throw new Error('<Template> needs Key');
  const root = Array.from(node.children).find(ch => ch.nodeType === 1) as Element | undefined;
  if (!root) throw new Error('<Template> must have a single root element');
  TemplateRegistry.set(key, root.cloneNode(true) as Element);
}

function subst(value: string, props: Record<string, string>): string {
  return value.replace(/\{([\w.-]+)\}/g, (_, name) => props[name] ?? '');
}

export function instantiateTemplate(
  key: string,
  props: Record<string, string>,
  slotNodes: Map<string, Element[]>
): Element {
  const tplRoot = TemplateRegistry.get(key);
  if (!tplRoot) throw new Error(`Template not found: ${key}`);
  const clone = tplRoot.cloneNode(true) as Element;

  // substitute placeholders
  const walkAttrs = (el: Element) => {
    for (const attr of Array.from(el.attributes)) attr.value = subst(attr.value, props);
    for (const ch of Array.from(el.children)) walkAttrs(ch);
  };
  walkAttrs(clone);

  // fill slots
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
    for (const ch of Array.from(el.children)) fillSlots(ch);
  };
  fillSlots(clone);

  return clone;
}

export { TemplateRegistry };
