import type { AxisStyle } from '../layout/engine.js';
import { RuleRegistry } from '../layout/engine.js';
import { UIElement } from './UIElement.js';

/**
 * Leaf element whose intrinsic size is provided externally.
 */
export class LeafElement extends UIElement {
  constructor(
    registry: RuleRegistry,
    intrinsic: { width?: number; height?: number },
    style?: { x?: AxisStyle; y?: AxisStyle }
  ) {
    super(registry);
    if (intrinsic.width !== undefined) this.intrinsicWidth = intrinsic.width;
    if (intrinsic.height !== undefined) this.intrinsicHeight = intrinsic.height;
    if (style?.x) this.styleX = style.x;
    if (style?.y) this.styleY = style.y;
  }
}
