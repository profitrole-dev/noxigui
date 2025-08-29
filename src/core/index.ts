export type Size = { width: number; height: number };
export type Rect = { x: number; y: number; width: number; height: number };

export abstract class UIElement {
  desired: Size = { width: 0, height: 0 };
  final: Rect = { x: 0, y: 0, width: 0, height: 0 };
  margin = { l: 0, t: 0, r: 0, b: 0 };
  minW = 0;
  minH = 0;
  prefW?: number;
  prefH?: number;

  abstract measure(avail: Size): void;
  abstract arrange(rect: Rect): void;
}
