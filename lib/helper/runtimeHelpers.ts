// lib/helper/runtimeHelpers.ts

import { createVNode } from '../runtime-core/h';
import { Text, type VNodeChild } from '../runtime-core/vnode';

export type RenderListItem = VNodeChild | VNodeChild[];
export type RenderItem = (
  value: any,
  keyOrIndex: string | number,
  index?: number
) => RenderListItem;
export function toDisplayString(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function createTextVNode(value: unknown) {
  return createVNode(Text, undefined, toDisplayString(value));
}

export function renderList(source: unknown, renderItem: RenderItem): RenderListItem[] {
  const result: RenderListItem[] = [];
  if (Array.isArray(source) || typeof source === 'string') {
    for (let index = 0; index < source.length; index++) {
      result.push(renderItem(source[index], index));
    }
    return result;
  }
  return result;
}
