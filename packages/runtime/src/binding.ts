import type { UIElement } from '@noxigui/core';

/** Describes a binding between a view model path and an element property. */
export interface Binding {
  /** Target element whose property should be updated. */
  element: UIElement;
  /** Property on the element to update. */
  property: string;
  /** View model path used to retrieve the value. */
  path: string;
}

