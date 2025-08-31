import test from 'node:test';
import assert from 'node:assert/strict';
import { Parser } from '../src/Parser.js';
import { Grid, Text, ItemsControl, TemplateStore } from '@noxigui/runtime';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';

class PatchedDOMParser extends XmldomParser {
  parseFromString(str: string, type: string) {
    const doc = super.parseFromString(str, type);
    const patch = (el: any) => {
      el.children = Array.from(el.childNodes || []).filter((c: any) => c.nodeType === 1);
      el.children.forEach(patch);
    };
    patch(doc.documentElement);
    return doc;
  }
}

const createRenderer = () => {
  return {
    getTexture() { return undefined; },
    createImage() { return {} as any; },
    createText() {
      const obj = { text: { text: '' } };
      return {
        text: obj.text,
        setWordWrap() {},
        getBounds() { return { width: 0, height: 0 }; },
        setPosition() {},
        getDisplayObject() { return obj; },
      } as any;
    },
    createGraphics() {
      return {
        clear() {},
        beginFill() { return this; },
        drawRect() { return this; },
        endFill() {},
        destroy() {},
        getDisplayObject() { return {}; },
      } as any;
    },
    createContainer() {
      const obj = { children: [] as any[] };
      return {
        addChild(child: any) { obj.children.push(child); },
        removeChild(child: any) {
          const i = obj.children.indexOf(child);
          if (i >= 0) obj.children.splice(i, 1);
        },
        setPosition() {},
        setSortableChildren() {},
        setMask() {},
        addEventListener() {},
        setEventMode() {},
        setHitArea() {},
        removeEventListener() {},
        getDisplayObject() { return obj; },
      } as any;
    },
  } as any;
};

test('parse items control with data-generated texts', () => {
  const renderer = createRenderer();
  const templates = new TemplateStore();
  const xmlParser = new PatchedDOMParser();

  const tpl = xmlParser.parseFromString('<Template Key="ItemTpl"><TextBlock Text="{Binding text}"/></Template>', 'application/xml');
  templates.register(tpl.documentElement);

  const parser = new Parser(renderer, templates, xmlParser);
  const { root, bindings } = parser.parse('<Grid><ItemsControl ItemsSource="{Binding items}" ItemTemplate="ItemTpl"/></Grid>');

  const data = { items: Array.from({ length: 10 }, (_, i) => ({ text: `Item ${i}` })) };
  for (const b of [...bindings]) {
    (b.element as any)[b.property] = (data as any)[b.path];
  }

  assert.ok(root instanceof Grid);
  const grid = root as Grid;
  assert.equal(grid.children.length, 1);
  const ic = grid.children[0] as ItemsControl;
  const panel: any = ic.itemsPanel;
  assert.equal(panel.children.length, 10);
  for (let i = 0; i < 10; i++) {
    const child = panel.children[i];
    assert.ok(child instanceof Text);
    assert.equal(child.text, `Item ${i}`);
    assert.equal((child as any).render.getDisplayObject().text.text, `Item ${i}`);
  }
});

