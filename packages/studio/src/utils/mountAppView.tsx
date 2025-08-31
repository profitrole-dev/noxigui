import React from "react";
import { createRoot } from "react-dom/client";

/** Универсально монтирует window.app.view внутрь container.
 *  Поддерживает:
 *  - HTMLElement
 *  - ReactElement
 *  - функцию (container) => HTMLElement | void | (() => void)
 *  Возвращает cleanup.
 */
export function mountAppView(container: HTMLElement): () => void {
  const appAny = (globalThis as any).app;
  const view = appAny?.view;
  if (!view) return () => {};

  // 1) Готовый DOM-узел
  if (view instanceof HTMLElement) {
    container.innerHTML = "";
    container.appendChild(view);
    return () => {
      if (view.parentElement === container) container.removeChild(view);
    };
  }

  // 2) React элемент
  if (React.isValidElement(view)) {
    const root = createRoot(container);
    root.render(view);
    return () => root.unmount();
  }

  // 3) Функция-рендерер
  if (typeof view === "function") {
    const maybe = view(container);
    // если вернули DOM-узел — прикрепим
    if (maybe instanceof HTMLElement) {
      container.innerHTML = "";
      container.appendChild(maybe);
      return () => {
        if (maybe.parentElement === container) container.removeChild(maybe);
      };
    }
    // если вернули cleanup
    if (typeof maybe === "function") {
      return () => {
        try { maybe(); } catch {}
      };
    }
    // если ничего не вернули — просто считаем, что функция сама всё смонтировала в container
    return () => {
      // оставляем как есть
    };
  }

  // fallback: ничего не делаем
  return () => {};
}
