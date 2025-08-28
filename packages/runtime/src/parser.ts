import * as PIXI from 'pixi.js';
import { UIElement, ContentPresenter } from './core.js';
import { BorderPanel } from './elements/BorderPanel.js';
import { PixiText } from './elements/PixiText.js';
import { PixiImage } from './elements/PixiImage.js';
import { Grid, Row, Col } from './elements/Grid.js';
import { applyGridAttachedProps, parseSizeAttrs, parseLen, parseColor, parseMargin } from './helpers.js';
import { registerTemplate, instantiateTemplate } from './template.js';

export function parseElement(node: Element): UIElement | null {
  switch (node.tagName) {
    case 'TextBlock': {
      const text = node.getAttribute('Text') ?? '';
      const fill = node.getAttribute('Foreground') ?? '#ffffff';
      const fontSize = parseFloat(node.getAttribute('FontSize') ?? '16');
      const leaf = new PixiText(new PIXI.Text(text, { fill, fontSize }));
      parseSizeAttrs(node, leaf);
      const m = node.getAttribute('Margin'); if (m) leaf.margin = parseMargin(m);
      const ha = node.getAttribute('HorizontalAlignment'); if (ha) leaf.hAlign = ha as any;
      const va = node.getAttribute('VerticalAlignment');   if (va) leaf.vAlign = va as any;
      applyGridAttachedProps(node, leaf);
      return leaf;
    }

    case 'Border': {
      const panel = new BorderPanel({ background: parseColor(node.getAttribute('Background')) });
      parseSizeAttrs(node, panel);
      const m = node.getAttribute('Margin');  if (m) panel.margin = parseMargin(m);
      const p = node.getAttribute('Padding'); if (p) panel.padding = parseMargin(p);
      const clip = node.getAttribute('ClipToBounds');
      if (clip && clip.toLowerCase() === 'true') panel.clipToBounds = true;
      applyGridAttachedProps(node, panel);

      const first = Array.from(node.children).find(ch => ch.nodeType === Node.ELEMENT_NODE) as Element|undefined;
      if (first) panel.child = parseElement(first) ?? undefined;
      return panel;
    }

    case 'Grid': {
      const g = new Grid();
      const rgAttr = node.getAttribute('RowGap');     if (rgAttr != null) g.rowGap = parseFloat(rgAttr) || 0;
      const cgAttr = node.getAttribute('ColumnGap');  if (cgAttr != null) g.colGap = parseFloat(cgAttr) || 0;
      const m = node.getAttribute('Margin');          if (m) g.margin = parseMargin(m);
      const dbg = node.getAttribute('Debug');         if (dbg && dbg.toLowerCase() === 'true') g.debug = true;
      applyGridAttachedProps(node, g);

      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Grid.RowDefinitions') {
          for (const rd of Array.from(ch.children)) {
            if (rd.tagName === 'RowDefinition') g.rows.push(new Row(parseLen(rd.getAttribute('Height'))));
          }
        } else if (ch.tagName === 'Grid.ColumnDefinitions') {
          for (const cd of Array.from(ch.children)) {
            if (cd.tagName === 'ColumnDefinition') g.cols.push(new Col(parseLen(cd.getAttribute('Width'))));
          }
        }
      }
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Grid.RowDefinitions' || ch.tagName === 'Grid.ColumnDefinitions') continue;
        const u = parseElement(ch);
        if (u) g.add(u);
      }
      return g;
    }

    case 'Image': {
      const key = node.getAttribute('Source') ?? '';
      let tex: PIXI.Texture | undefined;
      try { tex = PIXI.Assets.get(key) as PIXI.Texture | undefined; } catch {}
      const img = new PixiImage(tex);
      parseSizeAttrs(node, img);
      const m = node.getAttribute('Margin'); if (m) img.margin = parseMargin(m);
      const stretch = node.getAttribute('Stretch');
      if (stretch === 'Fill' || stretch === 'Uniform' || stretch === 'UniformToFill' || stretch === 'None') {
        img.stretch = stretch;
      }
      const ha = node.getAttribute('HorizontalAlignment'); if (ha) img.hAlign = ha as any;
      const va = node.getAttribute('VerticalAlignment');   if (va) img.vAlign = va as any;
      applyGridAttachedProps(node, img);
      return img;
    }

    case 'Resources': {
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Template') registerTemplate(ch);
      }
      return null;
    }

    case 'ContentPresenter': {
      const cp = new ContentPresenter();
      const m = node.getAttribute('Margin'); if (m) cp.margin = parseMargin(m);
      applyGridAttachedProps(node, cp);
      return cp;
    }

    case 'Use': {
      const key = node.getAttribute('Template') || '';
      const props: Record<string,string> = {};
      for (const a of Array.from(node.attributes)) if (a.name !== 'Template') props[a.name] = a.value;

      const slotMap = new Map<string, Element[]>();
      for (const ch of Array.from(node.children)) {
        if (ch.tagName === 'Slot') {
          const name = ch.getAttribute('Name') ?? '';
          const content = Array.from(ch.children).filter(n => n.nodeType === 1) as Element[];
          slotMap.set(name, content);
        }
      }
      const rootEl = instantiateTemplate(key, props, slotMap);

      const gr = node.getAttribute('Grid.Row');         if (gr)  rootEl.setAttribute('Grid.Row', gr);
      const gc = node.getAttribute('Grid.Column');      if (gc)  rootEl.setAttribute('Grid.Column', gc);
      const grs = node.getAttribute('Grid.RowSpan');    if (grs) rootEl.setAttribute('Grid.RowSpan', grs);
      const gcs = node.getAttribute('Grid.ColumnSpan'); if (gcs) rootEl.setAttribute('Grid.ColumnSpan', gcs);

      return parseElement(rootEl);
    }

    default: return null;
  }
}

export function parse(xml: string) {
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  const rootEl = dom.documentElement;
  if (rootEl.tagName !== 'Grid') throw new Error('Root must be <Grid>');

  const root = parseElement(rootEl) as Grid;

  const container = new PIXI.Container();
  container.sortableChildren = true;

  function collect(into: PIXI.Container, u: UIElement) {
    if (u instanceof ContentPresenter && (u as any).child) {
      collect(into, (u as any).child);
      return;
    }

    if (u instanceof BorderPanel) {
      const group = u.container;
      group.sortableChildren = true;
      if (!group.children.includes(u.bg)) group.addChildAt(u.bg, 0);
      into.addChild(group);
      if (u.child) collect(group, u.child);
      return;
    }

    if (u instanceof PixiText) { into.addChild(u.view); return; }

    const spr = (u as any).sprite as PIXI.Sprite | undefined;
    if (spr) { into.addChild(spr); return; }

    if (u instanceof Grid) {
      for (const ch of u.children) collect(into, ch);
      u.debugG.zIndex = 100000;
      if (u.debugG.parent !== into) {
        u.debugG.parent?.removeChild(u.debugG);
        into.addChild(u.debugG);
      }
      return;
    }
  }
  collect(container, root);

  return { root, container };
}
