# NoxiGUI

NoxiGUI is a monorepo of packages for building declarative GUIs on top of [PIXI.js](https://pixijs.com/) using a custom XML DSL.

## Repository structure

| Package | Purpose |
| ------- | ------- |
| `@noxigui/core` | foundational types and layout system |
| `@noxigui/runtime` | XML DSL runtime and widget management |
| `@noxigui/parser` | DSL parser |
| `@noxigui/renderer-pixi` | renderer backed by PIXI.js |
| `noxi.js` | wrapper bundling the runtime and PIXI renderer |
| `@noxigui/playground` | Vite-powered sandbox for experiments |

## Quick start

```bash
pnpm install       # install dependencies
pnpm dev           # build packages and start the playground
pnpm build         # build all packages
pnpm test          # run tests
```

To generate the `noxi.js` distribution:

```bash
pnpm -F noxi.js build
```

## Example

```ts
import Noxi from 'noxi.js';

const gui = Noxi.gui.create(xml, undefined, window.devicePixelRatio); // uses the PIXI.js renderer by default
```

### Data binding

Elements support bindings using the `{Binding ...}` syntax. Collections can be
rendered with `ItemsControl`:

```xml
<ItemsControl ItemsPanel="WrapPanel"
              ItemsSource="{Binding Inventory}"
              ItemTemplate="Card"/>
```

Templates can bind to item properties directly:

```xml
<Image Source="{Source}"/>
<TextBlock Text="{Title}"/>
<TextBlock Text="{Binding Stats.Health}"/>
```

## Documentation

Additional materials can be found in the [`docs/`](docs) directory.

## License

[MIT](LICENSE)

