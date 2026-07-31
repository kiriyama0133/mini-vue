import { MiniElement } from '../runtime-dom/nodeOps';

//lib/runtime-core/vnode.ts
export interface VNode {
  type: any;
  __v_isVnode: boolean;
  props: VNodeProps | null;
  children: VNodeChildren;
  el: MiniElement | null;
  key: string | number | null;
  shapeFlag: number;
}
export type VNodeChildren = VNodeChild | VNodeChild[];
export type VNodeChild = VNode | string | number | null | boolean;
export type VNodeProps = {
  key?: string | number;
  [key: string]: any;
};
export type VNodeOptions = {
  type: VNodeType;
  props?: VNodeProps;
  children?: VNodeChildren;
};
export type RendererNode = Node;
export type RendererElement = Element;
export type VNodeType = string | Symbol;
export type Container = Element & {
  _vnode?: VNode | null;
};
export function isVNode(vnode: any): vnode is VNode {
  return vnode.__v_isVnode;
}
export function isSameVNode(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key;
}
