export type LayoutSelection = { id: string; tag: string; name: string };

export function getGridOverlayBounds(
  gui: { root: any; getElementBounds?: (id: string) => { x: number; y: number; width: number; height: number } | null } | null,
  layoutSelection: LayoutSelection | null,
): { x: number; y: number; width: number; height: number } | null {
  if (!gui || !layoutSelection || layoutSelection.tag.toLowerCase() !== "grid") return null;
  if (typeof gui.getElementBounds === "function") {
    return gui.getElementBounds(layoutSelection.id);
  }
  return null;
}
