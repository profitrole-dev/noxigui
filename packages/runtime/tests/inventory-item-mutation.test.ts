import test from 'node:test';
import assert from 'node:assert/strict';
import { Noxi, Image, ItemsControl, ViewModel, type UIElement } from '../src/index.js';
import { DOMParser as XmldomParser } from '@xmldom/xmldom';

class PatchedDOMParser extends XmldomParser {
  parseFromString(str: string, type: string) {
    const doc = super.parseFromString(str, type);
    const patch = (el: any) => {
      el.children = Array.from(el.childNodes || []).filter((c: any) => c.nodeType === 1);
      const orig = el.cloneNode;
      el.cloneNode = function(deep?: boolean) {
        const cloned = orig.call(this, deep);
        patch(cloned);
        return cloned;
      };
      el.children.forEach(patch);
    };
    patch(doc.documentElement);
    return doc;
  }
}
(globalThis as any).DOMParser = PatchedDOMParser as any;
(globalThis as any).Node = { ELEMENT_NODE: 1 } as any;

const createRenderer = () => {
  const imageTextures = new Map<any, any>();
  const textures = new Map<any, any>();
  return {
    getTexture(name: any) {
      if (!textures.has(name)) textures.set(name, { name });
      return textures.get(name);
    },
    createImage(tex?: any) {
      const obj: any = {};
      if (tex !== undefined) imageTextures.set(obj, tex);
      return {
        sprite: undefined,
        setTexture(tex: any) { imageTextures.set(obj, tex); },
        setPosition() {},
        setScale() {},
        getNaturalSize() { return { width: 0, height: 0 }; },
        getDisplayObject() { return obj; },
      } as any;
    },
    createText() { return { setWordWrap(){}, getBounds(){return {width:0,height:0};}, setPosition(){}, getDisplayObject(){return {}} } as any; },
    createGraphics() { return { clear(){}, beginFill(){return this;}, drawRect(){return this;}, endFill(){}, destroy(){}, getDisplayObject(){return {};}}; },
    createContainer() {
      const obj: any = { children: [] };
      return {
        addChild(c: any){ obj.children.push(c); },
        removeChild(c: any){ const i = obj.children.indexOf(c); if (i >= 0) obj.children.splice(i, 1); },
        setPosition(){}, setSortableChildren(){}, setMask(){}, addEventListener(){}, setEventMode(){}, setHitArea(){}, removeEventListener(){}, getDisplayObject(){ return obj; }
      } as any;
    },
    _imageTextures: imageTextures,
  };
};

function findItemsControl(el: UIElement): ItemsControl | undefined {
  if (el instanceof ItemsControl) return el;
  const kids = (el as any).children as UIElement[] | undefined;
  if (kids) {
    for (const k of kids) {
      const found = findItemsControl(k);
      if (found) return found;
    }
  }
  const child = (el as any).child as UIElement | undefined;
  if (child) return findItemsControl(child);
  return undefined;
}

function findImage(el: UIElement): Image | undefined {
  if (el instanceof Image) return el;
  const kids = (el as any).children as UIElement[] | undefined;
  if (kids) {
    for (const k of kids) {
      const found = findImage(k);
      if (found) return found;
    }
  }
  const child = (el as any).child as UIElement | undefined;
  if (child) return findImage(child);
  return undefined;
}

test('item property change updates bound image', () => {
  const xml = `\n<Grid>\n  <Resources>\n    <Template Key="Card">\n      <Image Source="{Source}"/>\n    </Template>\n  </Resources>\n  <ItemsControl ItemsSource="{Binding Inventory}" ItemTemplate="Card"/>\n</Grid>`;
  const renderer = createRenderer();
  const gui = Noxi.gui.create(xml, renderer);
  const vm = ViewModel({ Inventory: [ { Source: 'iron_ore' } ] });
  gui.bind(vm);
  gui.layout({ width: 100, height: 100 });

  const ic = findItemsControl(gui.root)!;
  const panel: any = ic.itemsPanel;
  const card = panel.children[0];
  const img = findImage(card)!;
  const texBefore = renderer.getTexture('iron_ore');
  assert.equal(renderer._imageTextures.get(img.sprite.getDisplayObject()), texBefore);

  vm.Inventory[0].Source = 'herbs';
  gui.layout({ width: 100, height: 100 });
  const texAfter = renderer.getTexture('herbs');
  assert.equal(renderer._imageTextures.get(img.sprite.getDisplayObject()), texAfter);
});

test('removing and adding inventory items rebuilds layout and updates bindings', () => {
  const xml = `\n<Grid>\n  <Resources>\n    <Template Key="Card">\n      <Image Source="{Source}"/>\n    </Template>\n  </Resources>\n  <ItemsControl ItemsSource="{Binding Inventory}" ItemTemplate="Card"/>\n</Grid>`;
  const renderer = createRenderer();
  const gui = Noxi.gui.create(xml, renderer);
  const vm = ViewModel({ Inventory: [ { Source: 'iron_ore' }, { Source: 'herbs' } ] });
  gui.bind(vm);
  gui.layout({ width: 100, height: 100 });

  const ic = findItemsControl(gui.root)!;
  const panel: any = ic.itemsPanel;
  assert.equal(panel.children.length, vm.Inventory.length);

  vm.Inventory.shift();
  gui.layout({ width: 100, height: 100 });
  assert.equal(panel.children.length, vm.Inventory.length);
  const remainingCard: any = panel.children[0];
  assert.deepEqual(remainingCard.getDataContext(), vm.Inventory[0]);
  const remainingImg = findImage(remainingCard)!;
  const remainingTex = renderer.getTexture(vm.Inventory[0].Source);
  assert.equal(renderer._imageTextures.get(remainingImg.sprite.getDisplayObject()), remainingTex);

  const newItem = { Source: 'gold_ore' };
  vm.Inventory.push(newItem);
  gui.layout({ width: 100, height: 100 });
  assert.equal(panel.children.length, vm.Inventory.length);
  const addedCard: any = panel.children[1];
  assert.deepEqual(addedCard.getDataContext(), newItem);
  const addedImg = findImage(addedCard)!;
  const addedTex = renderer.getTexture(newItem.Source);
  assert.equal(renderer._imageTextures.get(addedImg.sprite.getDisplayObject()), addedTex);
});

