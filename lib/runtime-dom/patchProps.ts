// lib/runtime-dom/patchProps.ts
// patch props for dom nodes...

import { MiniElement } from './nodeOps';
import { patchEvent } from './event';
import { patchStyle } from './style';
import { patchClass } from './class';
import { patchAttr } from './attr';

export type Props = Record<string, any>;
export function patchProps(el: MiniElement, oldProps: Props, newProps: Props) {
  for (const key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) {
      patchProp(el, key, oldValue, newValue);
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      const oldValue = oldProps[key];
      patchProp(el, key, oldValue, null);
    }
  }
}
export function patchProp(el: MiniElement, key: string, oldValue: any, newValue: any) {
  if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, newValue);
    return;
  }
  switch (key) {
    case 'class':
      patchClass(el, newValue);
      break;
    case 'style':
      patchStyle(el, oldValue, newValue);
      break;
    default:
      patchAttr(el, key, newValue);
  }
}
