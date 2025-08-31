export function cssVarRGB(name: string, fallback = "17 17 17") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const raw = v || fallback; // формат "r g b"
  const [r, g, b] = raw.split(/\s+/).map(Number);
  return { r, g, b };
}
export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
