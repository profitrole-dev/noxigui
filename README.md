# NoxiGUI

This repository is a monorepo containing:

- `@noxigui/runtime` – the core runtime implementation.
- `@noxigui/playground` – a Vite playground for experimenting with the runtime.

Run `pnpm dev` to start the playground or `pnpm build` to build all packages.

## Debugging Grid Layouts

The runtime can render grid layout diagnostics without bundling PIXI by
default. Calling `await setGridDebug(true)` on a runtime instance lazily loads
the debug renderer and overlays track, gap, margin and padding visuals on top
of grids. Disable it with `setGridDebug(false)`.
