import type { AxisStyle } from '../layout/engine.js';
import { RuleRegistry } from '../layout/engine.js';
import { UIElement } from './UIElement.js';
import type { Size } from './UIElement.js';

/**
 * Element that proxies measurement to a single child then sizes itself using
 * the default rules against the child's desired size as intrinsic dimensions.
 */
export class SingleChildElement extends UIElement {
  constructor(
    registry: RuleRegistry,
    private child: UIElement,
    style?: { x?: AxisStyle; y?: AxisStyle }
  ) {
    super(registry);
    if (style?.x) this.styleX = style.x;
    if (style?.y) this.styleY = style.y;
  }

  measure(avail: Size): void {
    this.child.measure(avail);
    this.intrinsicWidth = this.child.desired.width;
    this.intrinsicHeight = this.child.desired.height;
    super.measure(avail);
  }
}
