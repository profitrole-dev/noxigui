# @noxigui/parser

Parses NoxiGUI XML markup into runtime UI elements and a renderer display tree.

## Installation

```bash
pnpm add @noxigui/parser pixi.js
```

## Usage

```ts
import { Parser } from '@noxigui/parser';
import { TemplateStore } from '@noxigui/runtime';

// supply a renderer, a template store and optionally an XML parser implementation
const parser = new Parser(renderer, new TemplateStore(), new DOMParser());
const { root, container } = parser.parse('<Grid></Grid>');
```

## Extending

Element handling is delegated to pluggable element parser classes.  To add
support for a custom element, implement the `ElementParser` interface and pass
it to the `Parser` constructor:

```ts
import type { ElementParser } from '@noxigui/parser';
import { Parser } from '@noxigui/parser';
import { TemplateStore } from '@noxigui/runtime';

class MyParser implements ElementParser {
  test(node: Element) { return node.tagName === 'MyElement'; }
  parse(node: Element, p: Parser) { /* ... */ return null; }
}

const parser = new Parser(renderer, new TemplateStore(), new DOMParser(), [new MyParser()]);
```

### Node.js

In Node environments, provide an XML parser such as `@xmldom/xmldom`:

```ts
import { DOMParser } from '@xmldom/xmldom';
import { Parser } from '@noxigui/parser';
import { TemplateStore } from '@noxigui/runtime';

const parser = new Parser(renderer, new TemplateStore(), new DOMParser());
```

Custom parsers can also participate in assembling the PIXI display tree by
implementing the optional `collect` hook.
