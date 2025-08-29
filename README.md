# NoxiGUI

This repository is a monorepo containing:

- `@noxigui/runtime` – the core runtime implementation.
- `@noxigui/playground` – a Vite playground for experimenting with the runtime.
- `noxi.js` – a convenience package exporting the runtime with the default PIXI renderer.

Run `pnpm dev` to start the playground or `pnpm build` to build all packages.
Run `pnpm -F noxi.js build` to regenerate the published output in `packages/noxi.js/dist/index.js`.

```ts
import Noxi from "noxi.js";
const gui = Noxi.gui.create(xml); // uses PIXI.js renderer by default
```
