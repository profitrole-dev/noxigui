# DSL Rules

The layout engine in v0.2.0 is rule driven. Elements describe their sizing
preferences per axis with an `AxisStyle`:

- `px` – fixed pixel size.
- `%` – percentage of the available space.
- `content`/`auto` – intrinsic content size.
- `stretch` – fill remaining space.

Each axis is processed by a `RuleRegistry` which applies rules in phases:

1. **primary** – determines the raw size.
2. **post** – applies clamping and snapping.

The default registry registers `FixedPxRule`, `PercentRule`,
`ContentAutoRule`, `StretchRule` and `ClampRule`.
