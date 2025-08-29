# NoxiGUI

This repository is a monorepo containing:

- `@noxigui/runtime` – the core runtime implementation.
- `@noxigui/playground` – a Vite playground for experimenting with the runtime.

Run `pnpm dev` to start the playground or `pnpm build` to build all packages.

```ts
import Noxi from "noxi.js";
const gui = Noxi.gui.create(xml); // uses PIXI.js renderer by default
```
