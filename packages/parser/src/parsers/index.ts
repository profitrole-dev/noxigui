export type { ElementParser } from './ElementParser.js';
export { TextBlockParser } from './TextBlockParser.js';
export { BorderParser } from './BorderParser.js';
export { StackPanelParser } from './StackPanelParser.js';
export { DockPanelParser } from './DockPanelParser.js';
export { WrapPanelParser } from './WrapPanelParser.js';
export { GridParser } from './GridParser.js';
export { ImageParser } from './ImageParser.js';
export { ResourcesParser } from './ResourcesParser.js';
export { ContentPresenterParser } from './ContentPresenterParser.js';
export { UseParser } from './UseParser.js';
export { ScrollViewerParser } from './ScrollViewerParser.js';
export { ItemsControlParser } from './ItemsControlParser.js';

import { TextBlockParser } from './TextBlockParser.js';
import { BorderParser } from './BorderParser.js';
import { StackPanelParser } from './StackPanelParser.js';
import { DockPanelParser } from './DockPanelParser.js';
import { WrapPanelParser } from './WrapPanelParser.js';
import { GridParser } from './GridParser.js';
import { ImageParser } from './ImageParser.js';
import { ResourcesParser } from './ResourcesParser.js';
import { ContentPresenterParser } from './ContentPresenterParser.js';
import { UseParser } from './UseParser.js';
import { ScrollViewerParser } from './ScrollViewerParser.js';
import { ItemsControlParser } from './ItemsControlParser.js';
import type { ElementParser } from './ElementParser.js';
import type { TemplateStore } from '@noxigui/runtime';

export const createParsers = (templates: TemplateStore): ElementParser[] => [
  new TextBlockParser(),
  new BorderParser(),
  new StackPanelParser(),
  new DockPanelParser(),
  new WrapPanelParser(),
  new GridParser(),
  new ImageParser(),
  new ResourcesParser(templates),
  new ContentPresenterParser(),
  new ScrollViewerParser(),
  new ItemsControlParser(),
  new UseParser(templates),
];
