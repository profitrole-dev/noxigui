export type { ElementParser } from './ElementParser.js';
export { TextBlockParser } from './TextBlockParser.js';
export { BorderParser } from './BorderParser.js';
export { GridParser } from './GridParser.js';
export { ImageParser } from './ImageParser.js';
export { ResourcesParser } from './ResourcesParser.js';
export { ContentPresenterParser } from './ContentPresenterParser.js';
export { UseParser } from './UseParser.js';

import { TextBlockParser } from './TextBlockParser.js';
import { BorderParser } from './BorderParser.js';
import { GridParser } from './GridParser.js';
import { ImageParser } from './ImageParser.js';
import { ResourcesParser } from './ResourcesParser.js';
import { ContentPresenterParser } from './ContentPresenterParser.js';
import { UseParser } from './UseParser.js';
import type { ElementParser } from './ElementParser.js';
import type { TemplateStore } from '@noxigui/runtime';

export const createParsers = (templates: TemplateStore): ElementParser[] => [
  new TextBlockParser(),
  new BorderParser(),
  new GridParser(),
  new ImageParser(),
  new ResourcesParser(templates),
  new ContentPresenterParser(),
  new UseParser(templates),
];
