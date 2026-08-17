//lib/runtime-dom/attr.ts

import { MiniElement } from './nodeOps';

const booleanAttributes = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
]);

export function patchAttr(el: MiniElement, key: string, value: any) {
  const isBooleanAttribute = booleanAttributes.has(key.toLowerCase());

  if (value == null || (isBooleanAttribute && value === false)) {
    el.removeAttribute(key);
  } else if (isBooleanAttribute) {
    el.setAttribute(key, '');
  } else {
    el.setAttribute(key, value);
  }
}
