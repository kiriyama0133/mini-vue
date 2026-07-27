//lib/runtime-dom/attr.ts

import { MiniElement } from './nodeOps';

export function patchAttr(el: MiniElement, key: string, value: any) {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}
