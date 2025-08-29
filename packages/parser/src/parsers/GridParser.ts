import { Grid, Row, Col, applyGridAttachedProps, parseLen, applyMargin } from '@noxigui/runtime-core';
import type { UIElement, RenderContainer } from '@noxigui/runtime-core';
import type { ElementParser } from './ElementParser.js';
import type { Parser } from '../Parser.js';

/** Parser for `<Grid>` elements. */
export class GridParser implements ElementParser {
  test(node: Element): boolean { return node.tagName === 'Grid'; }
  parse(node: Element, p: Parser) {
    const g = new Grid();
    const rgAttr = node.getAttribute('RowGap'); if (rgAttr != null) g.rowGap = parseFloat(rgAttr) || 0;
    const cgAttr = node.getAttribute('ColumnGap'); if (cgAttr != null) g.colGap = parseFloat(cgAttr) || 0;
    applyMargin(node, g);
    const dbg = node.getAttribute('Debug'); if (dbg && dbg.toLowerCase() === 'true') g.debug = true;
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
      const u = p.parseElement(ch);
      if (u) g.add(u);
    }
    return g;
  }

  collect(into: RenderContainer, el: UIElement, collect: (into: RenderContainer, el: UIElement) => void) {
    if (el instanceof Grid) {
      for (const ch of el.children) collect(into, ch);
      el.debugG.zIndex = 100000;
      if ((el.debugG as any).parent !== into) {
        (el.debugG as any).parent?.removeChild(el.debugG);
        into.addChild(el.debugG);
      }
      return true;
    }
    return false;
  }
}
