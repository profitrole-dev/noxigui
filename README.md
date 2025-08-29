# NoxiGUI

This repository is a monorepo containing:

- `@noxigui/runtime` – the core runtime implementation.
- `@noxigui/playground` – a Vite playground for experimenting with the runtime.

Run `pnpm dev` to start the playground or `pnpm build` to build all packages.

```ts
import Noxi from "noxi.js";
const gui = Noxi.gui.create(xml); // uses PIXI.js renderer by default
```

### XML Parsing

Packages such as `@noxigui/parser` rely on a `DOMParser` implementation. In
browsers the global `DOMParser` is used. When running in Node.js, install
`@xmldom/xmldom` or provide your own parser implementation so XML markup can be
processed.
