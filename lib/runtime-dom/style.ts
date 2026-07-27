//lib/runtime-dom/style.ts

import { MiniElement } from './nodeOps';

export function patchStyle(
  el: MiniElement,
  oldValue: Record<string, string | null>,
  newValue: Record<string, string> | null
) {
  const style = el.style;
  if (newValue) {
    for (const key in newValue) {
      style[key as any] = newValue[key];
    }
  }
  if (oldValue) {
    for (const key in oldValue) {
      style[key as any] = '';
    }
  }
}
