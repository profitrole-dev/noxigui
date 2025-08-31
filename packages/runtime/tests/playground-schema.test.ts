import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { Noxi, Text, Image, ItemsControl, ViewModel, type Renderer, type RenderContainer, type RenderGraphics, type RenderImage, type RenderText, type UIElement } from '../src/index.js';

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

const createdImages: any[] = [];

const imageTextures = new Map<any, any>();

const addedImages = new Set<any>();

const createRenderer = (): Renderer => {
  const createGraphics = (): RenderGraphics => ({
    clear() {},
    beginFill() { return this; },
    drawRect() { return this; },
    endFill() {},
    destroy() {},
    getDisplayObject() { return {}; },
  });


  const createImage = (tex?: any): RenderImage => {
    const obj: any = {};
    createdImages.push(obj);
    if (tex !== undefined) imageTextures.set(obj, tex);
    return {
      setTexture(tex: any) { imageTextures.set(obj, tex); },

      setPosition() {},
      setScale() {},
      getNaturalSize() { return { width: 0, height: 0 }; },
      getDisplayObject() { return obj; },
    };
  };

  const createText = (text: string): RenderText => {
    const inner = { text };
    return {
      text: inner,
      setWordWrap() {},
      getBounds() { return { width: 0, height: 0 }; },
      setPosition() {},
      getDisplayObject() { return { text: inner }; },
    } as any;
  };

  const createContainer = (): RenderContainer => {
    const obj: any = { children: [] as any[] };
    return {
      addChild(child: any) { obj.children.push(child); if (createdImages.includes(child)) addedImages.add(child); },
      removeChild(child: any) { const i = obj.children.indexOf(child); if (i >= 0) obj.children.splice(i, 1); },
      setPosition() {},
      setSortableChildren() {},
      setMask() {},
      addEventListener() {},
      setEventMode() {},
      setHitArea() {},
      removeEventListener() {},
      getDisplayObject() { return obj; },
    } as any;
  };


  const textures = new Map<any, any>();

  return {
    getTexture(name: any) {
      if (!textures.has(name)) textures.set(name, { name });
      return textures.get(name);
    },

    createImage,
    createText,
    createGraphics,
    createContainer,
  };
};

function collectDisplayObjects(node: any, acc: any[] = []): any[] {
  acc.push(node);
  const kids: any[] = node.children || [];
  for (const k of kids) collectDisplayObjects(k, acc);
  return acc;
}

function collectTexts(el: UIElement, acc: Text[] = []): Text[] {
  if (el instanceof Text) acc.push(el);
  const kids = (el as any).children as UIElement[] | undefined;
  if (kids) kids.forEach(k => collectTexts(k, acc));
  const child = (el as any).child as UIElement | undefined;
  if (child) collectTexts(child, acc);
  const content = (el as any).content as UIElement | undefined;
  if (content) collectTexts(content, acc);
  const presenterChild = (el as any).presenter?.child as UIElement | undefined;
  if (presenterChild) collectTexts(presenterChild, acc);
  return acc;
}

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
  if (child) {
    const found = findItemsControl(child);
    if (found) return found;
  }
  const content = (el as any).content as UIElement | undefined;
  if (content) {
    const found = findItemsControl(content);
    if (found) return found;
  }
  const presenterChild = (el as any).presenter?.child as UIElement | undefined;
  if (presenterChild) return findItemsControl(presenterChild);
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
  if (child) {
    const found = findImage(child);
    if (found) return found;
  }
  const content = (el as any).content as UIElement | undefined;
  if (content) {
    const found = findImage(content);
    if (found) return found;
  }
  const presenterChild = (el as any).presenter?.child as UIElement | undefined;
  if (presenterChild) return findImage(presenterChild);
  return undefined;
}

test('playground App layout parses and binds correctly', () => {
  const appTsx = fs.readFileSync(new URL('../../../playground/src/App.tsx', import.meta.url), 'utf-8');
  const match = appTsx.match(/const initialSchema = `([\s\S]*?)`;/);
  assert.ok(match, 'initialSchema not found');
  const xml = match[1];

  const renderer = createRenderer();
  const gui = Noxi.gui.create(xml, renderer);
  const vm = ViewModel({
    Stats: {
      Health: 120,
      Strength: 18,
      Agility: 14,
      Intelligence: 10,
      Stamina: 16,
      Defense: 12,
      CritChance: 7,
      MoveSpeed: 5.2,
    },
    Inventory: [
      { Title: 'Iron Ore', Source: 'iron_ore' },
      { Title: 'Copper Ore', Source: 'copper_ore' },
      { Title: 'Silver Ore', Source: 'silver_ore' },
      { Title: 'Gold Ore', Source: 'gold_ore' },
      { Title: 'Mithril Ore', Source: 'mithril_ore' },
      { Title: 'Adamantite Ore', Source: 'adamantite_ore' },
      { Title: 'Coal', Source: 'coal' },
      { Title: 'Wood Log', Source: 'wood_log' },
      { Title: 'Hardwood', Source: 'hardwood' },
      { Title: 'Fiber', Source: 'fiber' },
      { Title: 'Herbs', Source: 'herbs' },
      { Title: 'Mushrooms', Source: 'mushrooms' },
      { Title: 'Leather' },
      { Title: 'Hide' },
      { Title: 'Bone' },
      { Title: 'Cloth' },
      { Title: 'Thread' },
      { Title: 'Feather' },
      { Title: 'Crystal Shard' },
      { Title: 'Runestone' },
      { Title: 'Water Flask' },
      { Title: 'Oil' },
      { Title: 'Powder' },
      { Title: 'Gunpowder' },
      { Title: 'Gemstone' },
      { Title: 'Ruby' },
      { Title: 'Sapphire' },
      { Title: 'Emerald' },
      { Title: 'Topaz' },
      { Title: 'Diamond' },
    ],
  });

  gui.bind(vm);
  gui.layout({ width: 800, height: 600 });

  const displayRoot = gui.container.getDisplayObject();
  const allDisplay = collectDisplayObjects(displayRoot);
  assert.equal(createdImages.length, vm.Inventory.length + 1);
  assert.equal(addedImages.size, createdImages.length);
  createdImages.forEach(img => {
    assert.ok(allDisplay.includes(img), 'image not added to renderer container');
  });

  const texts = collectTexts(gui.root).map(t => String(t.text));

  const expectedStats = Object.values(vm.Stats).map(String);
  for (const val of expectedStats) {
    assert.ok(texts.includes(val), `missing stat ${val}`);
  }

  ['Hero Stats', 'Clothing', 'Resources', 'Bows', 'Swords', 'Food'].forEach(t => {
    assert.ok(texts.includes(t), `missing text ${t}`);
  });

  const ic = findItemsControl(gui.root);
  assert.ok(ic, 'ItemsControl not found');
  const panel: any = ic!.itemsPanel as any;
  assert.equal(panel.children.length, vm.Inventory.length);

  panel.children.forEach((card: any, i: number) => {
    const item = vm.Inventory[i];
    const cardTexts = collectTexts(card).map(t => String(t.text));
    assert.ok(cardTexts.includes(item.Title), `card ${i} missing text ${item.Title}`);

    const imgEl = findImage(card);
    assert.ok(imgEl, `card ${i} missing image`);
    const tex = imageTextures.get(imgEl.sprite.getDisplayObject());
    if (item.Source) {
      const expectedTex = renderer.getTexture(item.Source);
      assert.equal(tex, expectedTex, `card ${i} wrong texture`);
    }
  });

  const firstCard: any = panel.children[0];
  assert.deepEqual(firstCard.getDataContext(), vm.Inventory[0]);
});
