import { VNodeChild } from '../runtime-core/vnode';
export type RenderListItem = VNodeChild | VNodeChild[];
export type RenderItem = (
  value: any,
  keyOrIndex: string | number,
  index?: number
) => RenderListItem;
export declare function toDisplayString(value: unknown): string;
export declare function createTextVNode(value: unknown): import('../runtime-core/vnode').VNode;
export declare function renderList(source: unknown, renderItem: RenderItem): RenderListItem[];
