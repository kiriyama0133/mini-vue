//lib/runtime-dom/class.ts

import { MiniElement } from './nodeOps';

export function patchClass(el: MiniElement, newValue: string | null) {
  el.className = newValue || '';
}
