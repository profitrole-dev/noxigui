# @noxigui/parser

Parses NoxiGUI XML markup into runtime UI elements and a PIXI display tree.

## Installation

```bash
pnpm add @noxigui/parser pixi.js
```

## Usage

```ts
import { Parser } from '@noxigui/parser';

const parser = new Parser();
const { root, container } = parser.parse('<Grid></Grid>');
```

## Extending

Element handling is delegated to pluggable element parser classes.  To add
support for a custom element, implement the `ElementParser` interface and pass
it to the `Parser` constructor:

```ts
import type { ElementParser } from '@noxigui/parser';
import { Parser } from '@noxigui/parser';

class MyParser implements ElementParser {
  test(node: Element) { return node.tagName === 'MyElement'; }
  parse(node: Element, p: Parser) { /* ... */ return null; }
}

const parser = new Parser([new MyParser()]);
```

Custom parsers can also participate in assembling the PIXI display tree by
implementing the optional `collect` hook.
