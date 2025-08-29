import type { UIElement } from '@noxigui/core';

export const rowMap = new WeakMap<UIElement, number>();
export const colMap = new WeakMap<UIElement, number>();
export const rowSpan = new WeakMap<UIElement, number>();
export const colSpan = new WeakMap<UIElement, number>();
