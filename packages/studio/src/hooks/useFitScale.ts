import { useLayoutEffect, useState, type RefObject } from "react";

/** Возвращает scale, чтобы вписать w×h в контейнер ref (aspect-fit) */
export function useFitScale<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  w: number,
  h: number
) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || w <= 0 || h <= 0) return;

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw > 0 && ch > 0) setScale(Math.min(cw / w, ch / h));
    };

    compute(); // первичный пересчёт
    const ro = new ResizeObserver(compute);
    ro.observe(el);

    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [containerRef, w, h]);

  return scale;
}
